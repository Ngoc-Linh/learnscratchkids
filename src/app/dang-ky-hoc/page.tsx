import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { COURSES } from "@/lib/courses";
import EnrollForm from "@/components/EnrollForm";

export const metadata: Metadata = {
  title: "Đăng ký khóa học",
  description: "Đăng ký học thử miễn phí hoặc đăng ký khóa học Scratch cho bé.",
};
export const dynamic = "force-dynamic";

type SP = { khoa?: string; "hoc-thu"?: string };

export default async function EnrollPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await getUser();
  const course = COURSES.find((c) => c.slug === sp.khoa)?.slug;

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-4xl sm:text-5xl">Đăng ký khóa học</h1>
      <p className="mt-2 mb-8 text-xl text-ink/70">Điền thông tin, chúng tôi sẽ liên hệ phụ huynh để tư vấn lịch học phù hợp.</p>
      <EnrollForm
        defaultCourse={course}
        defaultTrial={sp["hoc-thu"] !== "0"}
        defaultName={user?.name}
      />
    </div>
  );
}
