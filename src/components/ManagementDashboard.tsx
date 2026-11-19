"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDate, sendJson } from "@/lib/client";

type Track = "SCRATCH" | "PYTHON" | "INFORMATICS";
type PaymentMethod = "CASH" | "TRANSFER";
type TrackOption = { value: Track; label: string; color: string };

const TRACKS: TrackOption[] = [
  { value: "SCRATCH", label: "Scratch", color: "#f97316" },
  { value: "PYTHON", label: "Python", color: "#3b82f6" },
  { value: "INFORMATICS", label: "Tin học", color: "#8b5cf6" },
];
const WEEKDAYS = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

type Student = {
  id: string;
  childName: string;
  parentName: string;
  phone: string;
  age: number;
  track: Track;
  status: "ACTIVE" | "PAUSED" | "LEFT";
  outstanding: number;
  class: { id: string; name: string; weekday: number; startsAt: string } | null;
};

type CourseClass = {
  id: string;
  name: string;
  track: Track;
  weekday: number;
  startsAt: string;
  active: boolean;
  _count: { students: number };
};

type Payment = {
  id: string;
  receiptNumber: string;
  receivedAt: string;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  invoice?: {
    number: string;
    description: string;
    student: Pick<Student, "childName" | "parentName" | "phone" | "track">;
  };
};

type Invoice = {
  id: string;
  number: string;
  createdAt: string;
  description: string;
  amount: number;
  dueDate: string | null;
  student: Pick<Student, "childName" | "parentName" | "phone" | "track">;
  payments: Payment[];
  paidAmount: number;
};

type DashboardData = {
  students: Student[];
  classes: CourseClass[];
  invoices: Invoice[];
  summary: {
    studentCount: number;
    collected: number;
    outstanding: number;
    courseMix: Record<Track, number>;
  };
  monthly: { key: string; label: string; invoiced: number; collected: number }[];
};

type Receipt = {
  receiptNumber: string;
  receivedAt: string;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  invoiceNumber: string;
  description: string;
  student: Pick<Student, "childName" | "parentName" | "phone" | "track">;
};

const money = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

const trackLabel = (track: Track) => TRACKS.find((item) => item.value === track)?.label ?? track;
const trackColor = (track: Track) => TRACKS.find((item) => item.value === track)?.color ?? "#64748b";

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-widest text-scratch-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function ManagementDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [debtFilter, setDebtFilter] = useState("");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [newStudentTrack, setNewStudentTrack] = useState<Track>("SCRATCH");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceStudentId, setInvoiceStudentId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("Học phí khóa học");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [initialPayment, setInitialPayment] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TRANSFER");
  const [paymentNote, setPaymentNote] = useState("");
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [formError, setFormError] = useState("");
  const [formBusy, setFormBusy] = useState(false);

  async function reload() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/management", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không thể tải dữ liệu quản lý");
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể tải dữ liệu quản lý");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLocaleLowerCase("vi");
    return data.students.filter((student) => {
      const matchesSearch = !query || [student.childName, student.parentName, student.phone]
        .some((value) => value.toLocaleLowerCase("vi").includes(query));
      const matchesTrack = !trackFilter || student.track === trackFilter;
      const matchesClass = !classFilter || student.class?.id === classFilter;
      const matchesDebt = !debtFilter || (debtFilter === "DEBT" ? student.outstanding > 0 : student.outstanding === 0);
      return matchesSearch && matchesTrack && matchesClass && matchesDebt;
    });
  }, [data, search, trackFilter, classFilter, debtFilter]);

  const maxMonthly = Math.max(1, ...(data?.monthly.map((month) => Math.max(month.invoiced, month.collected)) ?? []));
  const totalMix = data ? TRACKS.reduce((sum, item) => sum + data.summary.courseMix[item.value], 0) : 0;
  const donutStops = data && totalMix
    ? TRACKS.reduce<{ stops: string[]; offset: number }>((state, item) => {
        const nextOffset = state.offset + (data.summary.courseMix[item.value] / totalMix) * 100;
        state.stops.push(`${item.color} ${state.offset}% ${nextOffset}%`);
        state.offset = nextOffset;
        return state;
      }, { stops: [], offset: 0 }).stops.join(", ")
    : "#e2e8f0 0% 100%";

  async function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setFormBusy(true);
    setFormError("");
    const form = new FormData(formElement);
    const result = await sendJson("/api/admin/students", "POST", {
      childName: form.get("childName"),
      parentName: form.get("parentName"),
      phone: form.get("phone"),
      age: form.get("age"),
      track: form.get("track"),
      classId: form.get("classId") || null,
    });
    setFormBusy(false);
    if (!result.ok) {
      setFormError(result.data?.error ?? "Không thể thêm học viên");
      return;
    }
    setShowStudentForm(false);
    formElement.reset();
    setNewStudentTrack("SCRATCH");
    await reload();
  }

  async function saveClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setFormBusy(true);
    setFormError("");
    const form = new FormData(formElement);
    const result = await sendJson("/api/admin/classes", "POST", {
      name: form.get("name"),
      track: form.get("track"),
      weekday: form.get("weekday"),
      startsAt: form.get("startsAt"),
    });
    setFormBusy(false);
    if (!result.ok) {
      setFormError(result.data?.error ?? "Không thể tạo lớp học");
      return;
    }
    setShowClassForm(false);
    formElement.reset();
    await reload();
  }

  async function updateStudentStatus(student: Student, status: Student["status"]) {
    const result = await sendJson(`/api/admin/students/${student.id}`, "PATCH", { status });
    if (!result.ok) {
      setError(result.data?.error ?? "Không thể cập nhật trạng thái học viên");
      return;
    }
    await reload();
  }

  async function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormBusy(true);
    setFormError("");
    const result = await sendJson("/api/admin/invoices", "POST", {
      studentId: invoiceStudentId,
      description: invoiceDescription,
      amount: invoiceAmount,
      dueDate: invoiceDueDate || null,
      receivedAmount: initialPayment,
      method: paymentMethod,
      note: paymentNote,
    });
    setFormBusy(false);
    if (!result.ok) {
      setFormError(result.data?.error ?? "Không thể tạo phiếu thu");
      return;
    }

    const invoice = result.data.invoice as Invoice;
    if (invoice.payments[0]) {
      setReceipt({
        receiptNumber: invoice.payments[0].receiptNumber,
        receivedAt: invoice.payments[0].receivedAt,
        amount: invoice.payments[0].amount,
        method: invoice.payments[0].method,
        note: invoice.payments[0].note,
        invoiceNumber: invoice.number,
        description: invoice.description,
        student: invoice.student,
      });
    }
    setInvoiceAmount("");
    setInvoiceDueDate("");
    setInitialPayment("0");
    setPaymentNote("");
    setPayingInvoice(null);
    setShowInvoiceForm(false);
    await reload();
  }

  async function collectPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payingInvoice) return;
    setFormBusy(true);
    setFormError("");
    const result = await sendJson(`/api/admin/invoices/${payingInvoice.id}/payments`, "POST", {
      amount: paymentAmount,
      method: paymentMethod,
      note: paymentNote,
    });
    setFormBusy(false);
    if (!result.ok) {
      setFormError(result.data?.error ?? "Không thể ghi nhận thanh toán");
      return;
    }
    const payment = result.data.payment as Payment;
    const invoice = payment.invoice;
    if (invoice) {
      setReceipt({
        receiptNumber: payment.receiptNumber,
        receivedAt: payment.receivedAt,
        amount: payment.amount,
        method: payment.method,
        note: payment.note,
        invoiceNumber: invoice.number,
        description: invoice.description,
        student: invoice.student,
      });
    }
    setPayingInvoice(null);
    setPaymentAmount("");
    setPaymentNote("");
    await reload();
  }

  return (
    <div className="space-y-10">
      <section id="financial-dashboard" className="scroll-mt-28">
        <SectionHeading eyebrow="Tổng quan tài chính" title="Báo cáo học phí" />
        {error && <p className="alert-error mb-4" role="alert">{error}</p>}
        {busy && !data ? (
          <div className="card py-12 text-center text-ink/60" role="status">Đang tải dữ liệu quản lý...</div>
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="card border-l-4 border-l-emerald-500 !p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Thực thu toàn thời gian</p>
                <p className="mt-2 font-display text-2xl font-extrabold">{money(data.summary.collected)}</p>
                <p className="mt-1 text-sm text-ink/55">Từ các phiếu thu đã ghi nhận</p>
              </article>
              <article className="card border-l-4 border-l-rose-400 !p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Công nợ học phí</p>
                <p className="mt-2 font-display text-2xl font-extrabold">{money(data.summary.outstanding)}</p>
                <p className="mt-1 text-sm text-ink/55">Còn lại trên các hóa đơn</p>
              </article>
              <article className="card border-l-4 border-l-scratch-400 !p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Học viên</p>
                <p className="mt-2 font-display text-4xl font-extrabold">{data.summary.studentCount}</p>
                <a className="mt-1 inline-block text-sm font-bold text-scratch-700 underline" href="#student-list">Mở danh sách học viên</a>
              </article>
              <article className="card border-l-4 border-l-blue-400 !p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-ink/50">Lịch lớp đang quản lý</p>
                <p className="mt-2 font-display text-4xl font-extrabold">{data.classes.filter((item) => item.active).length}</p>
                <a className="mt-1 inline-block text-sm font-bold text-scratch-700 underline" href="#class-schedule">Xem lịch hàng tuần</a>
              </article>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
              <div className="card !p-5 sm:!p-6">
                <h3 className="text-xl">Học phí theo tháng</h3>
                <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-ink/70">
                  <span><i className="mr-2 inline-block h-3 w-3 rounded-sm bg-brand-400" />Đã lập hóa đơn</span>
                  <span><i className="mr-2 inline-block h-3 w-3 rounded-sm bg-emerald-500" />Thực thu</span>
                </div>
                <div className="management-bars mt-4" role="img" aria-label="Biểu đồ hóa đơn và thực thu sáu tháng gần nhất">
                  {data.monthly.map((month) => (
                    <div className="management-bar-month" key={month.key}>
                      <div className="management-bar-pair">
                        <div
                          className="management-bar management-bar-invoiced"
                          style={{ height: month.invoiced ? `${Math.max(3, (month.invoiced / maxMonthly) * 100)}%` : "0%" }}
                          title={`Hóa đơn: ${money(month.invoiced)}`}
                        />
                        <div
                          className="management-bar management-bar-collected"
                          style={{ height: month.collected ? `${Math.max(3, (month.collected / maxMonthly) * 100)}%` : "0%" }}
                          title={`Thực thu: ${money(month.collected)}`}
                        />
                      </div>
                      <span>{month.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card !p-5 sm:!p-6">
                <h3 className="text-xl">Tỷ lệ khóa học</h3>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
                  <div
                    className="management-donut"
                    style={{ background: `conic-gradient(${donutStops})` }}
                    role="img"
                    aria-label="Biểu đồ tỷ lệ học viên theo khóa học"
                  >
                    <span>{totalMix}<small>học viên</small></span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {TRACKS.map((item) => (
                      <li key={item.value} className="flex items-center gap-2">
                        <i className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                        <span>{item.label}</span>
                        <b className="ml-auto pl-2">{data.summary.courseMix[item.value]}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section id="student-list" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Quản lý học viên"
          title={`Danh sách học viên${data ? ` (${data.students.length})` : ""}`}
          action={<button type="button" className="btn-primary btn-sm" onClick={() => { setShowStudentForm((value) => !value); setFormError(""); }}>＋ Thêm học viên</button>}
        />
        {showStudentForm && (
          <form onSubmit={saveStudent} className="card mb-4 grid gap-3 bg-scratch-50 !p-4 sm:grid-cols-2 xl:grid-cols-4">
            <input name="childName" required maxLength={60} placeholder="Tên học viên" className="input !text-base" />
            <input name="parentName" required minLength={2} maxLength={60} placeholder="Tên phụ huynh" className="input !text-base" />
            <input name="phone" type="tel" required placeholder="Số điện thoại" className="input !text-base" />
            <input name="age" type="number" min={5} max={16} required placeholder="Tuổi" className="input !text-base" />
            <select name="track" className="input !text-base" value={newStudentTrack} onChange={(event) => setNewStudentTrack(event.target.value as Track)}>
              {TRACKS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select name="classId" className="input !text-base" defaultValue="">
              <option value="">Chưa xếp lớp</option>
              {(data?.classes ?? []).filter((item) => item.active && item.track === newStudentTrack).map((item) => (
                <option key={item.id} value={item.id}>{item.name} · {WEEKDAYS[item.weekday]}</option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-2 xl:col-span-4">
              <button type="submit" disabled={formBusy} className="btn-primary btn-sm">{formBusy ? "Đang lưu..." : "Lưu học viên"}</button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setShowStudentForm(false)}>Hủy</button>
            </div>
            {formError && <p className="alert-error sm:col-span-2 xl:col-span-4" role="alert">{formError}</p>}
          </form>
        )}
        {data && (
          <div className="card overflow-hidden !p-0">
            <div className="grid gap-2 border-b border-ink/10 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên học viên, phụ huynh, SĐT" className="input !py-2 !text-base" />
              <select value={trackFilter} onChange={(event) => setTrackFilter(event.target.value)} className="input !py-2 !text-base" aria-label="Lọc khóa học">
                <option value="">Tất cả khóa học</option>
                {TRACKS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="input !py-2 !text-base" aria-label="Lọc lớp học">
                <option value="">Tất cả lớp</option>
                {data.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <select value={debtFilter} onChange={(event) => setDebtFilter(event.target.value)} className="input !py-2 !text-base" aria-label="Lọc công nợ">
                <option value="">Mọi trạng thái học phí</option>
                <option value="DEBT">Còn công nợ</option>
                <option value="CLEAR">Đã thanh toán</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[70rem] text-left text-sm">
                <thead className="bg-ink/5 font-display">
                  <tr><th className="p-3">Học viên</th><th className="p-3">Phụ huynh / SĐT</th><th className="p-3">Khóa / Lớp</th><th className="p-3">Công nợ tự động</th><th className="p-3">Trạng thái</th></tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t border-ink/10">
                      <td className="p-3"><b>{student.childName}</b><span className="ml-1 text-ink/55">({student.age} tuổi)</span></td>
                      <td className="p-3">{student.parentName}<br /><a className="text-scratch-700 underline" href={`tel:${student.phone}`}>{student.phone}</a></td>
                      <td className="p-3">{trackLabel(student.track)}<br /><span className="text-ink/55">{student.class?.name ?? "Chưa xếp lớp"}</span></td>
                      <td className="p-3"><span className={`chip ${student.outstanding > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{student.outstanding > 0 ? money(student.outstanding) : "Đã thanh toán"}</span></td>
                      <td className="p-3">
                        <select value={student.status} onChange={(event) => void updateStudentStatus(student, event.target.value as Student["status"])} className="input !w-auto !py-1 !text-sm" aria-label={`Trạng thái ${student.childName}`}>
                          <option value="ACTIVE">Đang học</option><option value="PAUSED">Tạm nghỉ</option><option value="LEFT">Đã nghỉ</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-ink/55">Không tìm thấy học viên phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section id="class-schedule" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Quản lý lớp & lịch học"
          title="Lịch dạy hàng tuần · 90 phút/buổi"
          action={<button type="button" className="btn-primary btn-sm" onClick={() => { setShowClassForm((value) => !value); setFormError(""); }}>＋ Tạo lớp / lịch</button>}
        />
        {showClassForm && (
          <form onSubmit={saveClass} className="card mb-4 grid gap-3 bg-scratch-50 !p-4 sm:grid-cols-2 xl:grid-cols-4">
            <input name="name" required minLength={2} maxLength={80} placeholder="Tên lớp" className="input !text-base" />
            <select name="track" className="input !text-base" defaultValue="SCRATCH">{TRACKS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            <select name="weekday" className="input !text-base" defaultValue="1">{WEEKDAYS.slice(1).map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select>
            <input name="startsAt" type="time" required className="input !text-base" aria-label="Giờ bắt đầu" />
            <div className="flex gap-2 sm:col-span-2 xl:col-span-4">
              <button type="submit" disabled={formBusy} className="btn-primary btn-sm">{formBusy ? "Đang lưu..." : "Lưu lịch lớp"}</button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setShowClassForm(false)}>Hủy</button>
            </div>
            {formError && <p className="alert-error sm:col-span-2 xl:col-span-4" role="alert">{formError}</p>}
          </form>
        )}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data?.classes ?? []).filter((item) => item.active).map((item) => (
            <article key={item.id} className="card flex items-center gap-4 !p-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-scratch-50 font-display text-center font-extrabold text-scratch-700">
                <span>{WEEKDAYS[item.weekday]?.replace("Thứ ", "T") ?? "CN"}</span>
                <span className="text-xs">{item.startsAt}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg">{item.name}</h3>
                <p className="text-sm text-ink/60">{trackLabel(item.track)} · 90 phút · {item._count.students} học viên</p>
              </div>
            </article>
          ))}
          {data?.classes.filter((item) => item.active).length === 0 && <p className="card text-ink/55 md:col-span-2 xl:col-span-3">Chưa có lịch lớp. Tạo lớp đầu tiên để bắt đầu sắp xếp học viên.</p>}
        </div>
      </section>

      <section id="tuition-invoices" className="scroll-mt-28">
        <SectionHeading
          eyebrow="Phiếu thu học phí"
          title="Hóa đơn & thanh toán"
          action={<button type="button" disabled={!data?.students.length} className="btn-primary btn-sm" onClick={() => { setInvoiceStudentId(data?.students[0]?.id ?? ""); setFormError(""); setPayingInvoice(null); setReceipt(null); setInvoiceAmount(""); setShowInvoiceForm(true); }}>＋ Tạo phiếu thu</button>}
        />
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="bg-ink/5 font-display"><tr><th className="p-3">Phiếu / Ngày</th><th className="p-3">Học viên</th><th className="p-3">Nội dung</th><th className="p-3">Tổng học phí</th><th className="p-3">Đã thu</th><th className="p-3">Còn nợ</th><th className="p-3">Thao tác</th></tr></thead>
            <tbody>
              {(data?.invoices ?? []).map((invoice) => {
                const balance = Math.max(0, invoice.amount - invoice.paidAmount);
                return (
                  <tr key={invoice.id} className="border-t border-ink/10 align-top">
                    <td className="p-3 whitespace-nowrap"><b>{invoice.number}</b><br /><span className="text-ink/55">{formatDate(invoice.createdAt)}</span></td>
                    <td className="p-3">{invoice.student.childName}<br /><span className="text-ink/55">{invoice.student.parentName} · {invoice.student.phone}</span></td>
                    <td className="p-3">{invoice.description}</td>
                    <td className="p-3 whitespace-nowrap">{money(invoice.amount)}</td>
                    <td className="p-3 whitespace-nowrap text-emerald-700">{money(invoice.paidAmount)}</td>
                    <td className="p-3 whitespace-nowrap font-bold text-rose-700">{money(balance)}</td>
                    <td className="p-3">
                      {balance > 0 && <button type="button" className="btn-secondary btn-sm whitespace-nowrap" onClick={() => { setPayingInvoice(invoice); setPaymentAmount(String(balance)); setPaymentNote(""); setFormError(""); setReceipt(null); }}>Thu tiền</button>}
                      {invoice.payments[0] && <button type="button" className="mt-1 block whitespace-nowrap text-xs font-bold text-scratch-700 underline" onClick={() => {
                        const payment = invoice.payments[0];
                        setReceipt({ receiptNumber: payment.receiptNumber, receivedAt: payment.receivedAt, amount: payment.amount, method: payment.method, note: payment.note, invoiceNumber: invoice.number, description: invoice.description, student: invoice.student });
                      }}>Xem phiếu gần nhất</button>}
                    </td>
                  </tr>
                );
              })}
              {data?.invoices.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-ink/55">Chưa có hóa đơn học phí.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {receipt && (
        <div className="management-modal receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <div className="management-modal-panel">
            <div className="no-print mb-4 flex items-center justify-between gap-3">
              <h2 id="receipt-title" className="text-2xl">Xem trước phiếu thu</h2>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setReceipt(null)}>Đóng</button>
            </div>
            <div className="receipt-print-only rounded-2xl border border-slate-300 bg-white p-8 text-slate-900">
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
                <div><p className="text-sm font-extrabold uppercase tracking-widest text-scratch-700">ScratchKids</p><p className="mt-1 text-sm">Trung tâm học lập trình sáng tạo</p></div>
                <div className="text-right"><h2 className="text-2xl font-extrabold">PHIẾU THU</h2><p className="text-sm">{receipt.receiptNumber}</p></div>
              </div>
              <p className="mt-5 text-right text-sm">Ngày thu: {formatDate(receipt.receivedAt)}</p>
              <div className="mt-5 space-y-3 text-base">
                <p><b>Học viên:</b> {receipt.student.childName}</p>
                <p><b>Phụ huynh:</b> {receipt.student.parentName}</p>
                <p><b>Số điện thoại:</b> {receipt.student.phone}</p>
                <p><b>Nội dung:</b> {receipt.description}</p>
                <p><b>Mã hóa đơn:</b> {receipt.invoiceNumber}</p>
                <p><b>Phương thức:</b> {receipt.method === "CASH" ? "Tiền mặt" : "Chuyển khoản"}</p>
                {receipt.note && <p><b>Ghi chú:</b> {receipt.note}</p>}
              </div>
              <div className="mt-6 border-y border-slate-300 py-4 text-right text-xl font-extrabold">Số tiền đã thu: {money(receipt.amount)}</div>
              <div className="mt-12 grid grid-cols-2 gap-10 text-center text-sm"><p>Người nộp tiền<br /><span className="text-slate-500">(Ký, ghi rõ họ tên)</span></p><p>Người thu tiền<br /><span className="text-slate-500">(Ký, ghi rõ họ tên)</span></p></div>
              <p className="mt-8 text-center text-xs text-slate-500">Cảm ơn gia đình đã đồng hành cùng ScratchKids.</p>
            </div>
            <div className="no-print mt-4 flex justify-end">
              <button type="button" className="btn-primary" onClick={() => window.print()}>In / Lưu PDF</button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceForm && (
        <div className="management-modal no-print" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
          <div className="management-modal-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="invoice-title" className="text-2xl">Tạo hóa đơn học phí</h2>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setShowInvoiceForm(false)}>Đóng</button>
            </div>
            <form onSubmit={createInvoice} className="grid gap-3 sm:grid-cols-2">
              <label className="label sm:col-span-2">Học viên
                <select required value={invoiceStudentId} onChange={(event) => setInvoiceStudentId(event.target.value)} className="input mt-1 !text-base">
                  {(data?.students ?? []).map((student) => <option key={student.id} value={student.id}>{student.childName} · {student.parentName}</option>)}
                </select>
              </label>
              <label className="label sm:col-span-2">Nội dung học phí<input required minLength={2} maxLength={120} value={invoiceDescription} onChange={(event) => setInvoiceDescription(event.target.value)} className="input mt-1 !text-base" /></label>
              <label className="label">Tổng học phí (VND)<input required type="number" min={1} value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} className="input mt-1 !text-base" /></label>
              <label className="label">Hạn thanh toán<input type="date" value={invoiceDueDate} onChange={(event) => setInvoiceDueDate(event.target.value)} className="input mt-1 !text-base" /></label>
              <label className="label">Thu ngay (VND)<input required type="number" min={0} value={initialPayment} onChange={(event) => setInitialPayment(event.target.value)} className="input mt-1 !text-base" /></label>
              <label className="label">Phương thức<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="input mt-1 !text-base"><option value="TRANSFER">Chuyển khoản</option><option value="CASH">Tiền mặt</option></select></label>
              <label className="label sm:col-span-2">Ghi chú<input maxLength={250} value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} className="input mt-1 !text-base" /></label>
              {formError && <p className="alert-error sm:col-span-2" role="alert">{formError}</p>}
              <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost btn-sm" onClick={() => setShowInvoiceForm(false)}>Hủy</button><button type="submit" disabled={formBusy || !data?.students.length} className="btn-primary btn-sm">{formBusy ? "Đang lưu..." : "Lưu hóa đơn"}</button></div>
            </form>
          </div>
        </div>
      )}

      {payingInvoice && (
        <div className="management-modal no-print" role="dialog" aria-modal="true" aria-labelledby="payment-title">
          <div className="management-modal-panel">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 id="payment-title" className="text-2xl">Ghi nhận thanh toán</h2><button type="button" className="btn-ghost btn-sm" onClick={() => setPayingInvoice(null)}>Đóng</button></div>
            <p className="mb-4 text-ink/65">{payingInvoice.student.childName} · {payingInvoice.number} · Còn nợ {money(Math.max(0, payingInvoice.amount - payingInvoice.paidAmount))}</p>
            <form onSubmit={collectPayment} className="grid gap-3 sm:grid-cols-2">
              <label className="label">Số tiền thu (VND)<input required type="number" min={1} max={Math.max(0, payingInvoice.amount - payingInvoice.paidAmount)} value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className="input mt-1 !text-base" /></label>
              <label className="label">Phương thức<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="input mt-1 !text-base"><option value="TRANSFER">Chuyển khoản</option><option value="CASH">Tiền mặt</option></select></label>
              <label className="label sm:col-span-2">Ghi chú<input maxLength={250} value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} className="input mt-1 !text-base" /></label>
              {formError && <p className="alert-error sm:col-span-2" role="alert">{formError}</p>}
              <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost btn-sm" onClick={() => setPayingInvoice(null)}>Hủy</button><button type="submit" disabled={formBusy} className="btn-primary btn-sm">{formBusy ? "Đang lưu..." : "Ghi nhận & xem phiếu"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
