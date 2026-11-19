CREATE TYPE "CourseTrack" AS ENUM ('SCRATCH', 'PYTHON', 'INFORMATICS');

CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "track" "CourseTrack" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "classId" TEXT,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseClass" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "track" "CourseTrack" NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startsAt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CourseClass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TuitionInvoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "studentId" TEXT NOT NULL,
    CONSTRAINT "TuitionInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TuitionPayment" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "note" TEXT,
    "invoiceId" TEXT NOT NULL,
    CONSTRAINT "TuitionPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TuitionInvoice_number_key" ON "TuitionInvoice"("number");
CREATE UNIQUE INDEX "TuitionPayment_receiptNumber_key" ON "TuitionPayment"("receiptNumber");
CREATE INDEX "Student_childName_idx" ON "Student"("childName");
CREATE INDEX "Student_phone_idx" ON "Student"("phone");
CREATE INDEX "Student_track_status_idx" ON "Student"("track", "status");
CREATE INDEX "Student_classId_idx" ON "Student"("classId");
CREATE INDEX "CourseClass_weekday_startsAt_idx" ON "CourseClass"("weekday", "startsAt");
CREATE INDEX "CourseClass_active_idx" ON "CourseClass"("active");
CREATE INDEX "TuitionInvoice_createdAt_idx" ON "TuitionInvoice"("createdAt");
CREATE INDEX "TuitionInvoice_studentId_createdAt_idx" ON "TuitionInvoice"("studentId", "createdAt");
CREATE INDEX "TuitionPayment_receivedAt_idx" ON "TuitionPayment"("receivedAt");
CREATE INDEX "TuitionPayment_invoiceId_receivedAt_idx" ON "TuitionPayment"("invoiceId", "receivedAt");

ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey"
FOREIGN KEY ("classId") REFERENCES "CourseClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TuitionInvoice" ADD CONSTRAINT "TuitionInvoice_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TuitionPayment" ADD CONSTRAINT "TuitionPayment_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "TuitionInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
