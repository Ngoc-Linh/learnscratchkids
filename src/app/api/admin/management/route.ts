import { db } from "@/lib/db";
import { handler, json, requireAdmin } from "@/lib/api";

type Track = "SCRATCH" | "PYTHON" | "INFORMATICS";

function monthKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function monthStart(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1) - 7 * 60 * 60 * 1000);
}

export const GET = handler(async () => {
  await requireAdmin();

  const now = new Date();
  const currentMonth = monthKey(now);
  const [year, month] = currentMonth.split("-").map(Number);
  const chartStart = monthStart(year, month - 1 - 5);

  const [students, classes, invoices, monthlyInvoices, monthlyPayments, collected] = await Promise.all([
    db.student.findMany({
      orderBy: { childName: "asc" },
      include: {
        class: { select: { id: true, name: true, weekday: true, startsAt: true } },
        invoices: { select: { amount: true, payments: { select: { amount: true } } } },
      },
    }),
    db.courseClass.findMany({
      orderBy: [{ weekday: "asc" }, { startsAt: "asc" }],
      include: { _count: { select: { students: true } } },
    }),
    db.tuitionInvoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        student: { select: { childName: true, parentName: true, phone: true, track: true } },
        payments: { orderBy: { receivedAt: "desc" } },
      },
    }),
    db.tuitionInvoice.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { amount: true, createdAt: true },
    }),
    db.tuitionPayment.findMany({
      where: { receivedAt: { gte: chartStart } },
      select: { amount: true, receivedAt: true },
    }),
    db.tuitionPayment.aggregate({ _sum: { amount: true } }),
  ]);

  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - 5 + index, 1, 7));
    const key = monthKey(date);
    return {
      key,
      label: new Intl.DateTimeFormat("vi-VN", { month: "short", timeZone: "Asia/Bangkok" }).format(date),
      invoiced: monthlyInvoices
        .filter((invoice) => monthKey(invoice.createdAt) === key)
        .reduce((sum, invoice) => sum + invoice.amount, 0),
      collected: monthlyPayments
        .filter((payment) => monthKey(payment.receivedAt) === key)
        .reduce((sum, payment) => sum + payment.amount, 0),
    };
  });

  const courseMix: Record<Track, number> = { SCRATCH: 0, PYTHON: 0, INFORMATICS: 0 };
  let outstanding = 0;
  for (const student of students) {
    courseMix[student.track] += 1;
    for (const invoice of student.invoices) {
      const paid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      outstanding += Math.max(0, invoice.amount - paid);
    }
  }

  return json({
    students: students.map(({ invoices: studentInvoices, ...student }) => ({
      ...student,
      outstanding: studentInvoices.reduce(
        (sum, invoice) =>
          sum + Math.max(0, invoice.amount - invoice.payments.reduce((paid, payment) => paid + payment.amount, 0)),
        0,
      ),
    })),
    classes,
    invoices: invoices.map((invoice) => ({
      ...invoice,
      paidAmount: invoice.payments.reduce((sum, payment) => sum + payment.amount, 0),
    })),
    summary: {
      studentCount: students.length,
      collected: collected._sum.amount ?? 0,
      outstanding,
      courseMix,
    },
    monthly,
  });
});
