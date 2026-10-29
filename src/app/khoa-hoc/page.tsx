import type { Metadata } from "next";
import { COURSES, LEARN_MODES } from "@/lib/courses";
import CourseExplorer from "@/components/CourseExplorer";

export const metadata: Metadata = {
  title: "Khóa học Scratch",
  description: "4 khóa học Scratch cho trẻ 6-15 tuổi, từ Mầm Chồi đến Game Master và chuyển tiếp sang Python.",
};

export default function CoursesPage() {
  return (
    <div className="container-page py-12">
      <h1 className="text-4xl sm:text-5xl">Khóa học</h1>
      <p className="mt-2 max-w-2xl text-xl text-ink/70">Chọn khóa học theo độ tuổi và trình độ của bé.</p>

      <div className="mt-8">
        <CourseExplorer courses={COURSES} />
      </div>

      <section className="mt-16">
        <h2 className="section-title">Hình thức học</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {LEARN_MODES.map((m) => (
            <div key={m.value} className="card">
              <h3 className="text-xl">{m.title}</h3>
              <p className="mt-2 text-base text-ink/70">{m.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-base text-ink/60">Vui lòng liên hệ để được tư vấn học phí phù hợp.</p>
      </section>
    </div>
  );
}
