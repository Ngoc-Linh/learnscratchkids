import type { Metadata } from "next";
import { COURSES, LEARN_MODES } from "@/lib/courses";
import CourseExplorer from "@/components/CourseExplorer";

export const metadata: Metadata = {
  title: "Khóa học Scratch và Python cho trẻ em",
  description:
    "Khám phá khóa học Scratch cơ bản, Scratch nâng cao, luyện thi Tin học trẻ và Python cho trẻ em. Xem độ tuổi, kiến thức đầu vào và nội dung từng buổi.",
  alternates: { canonical: "/khoa-hoc" },
};

export default function CoursesPage() {
  return (
    <div>
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-[#fff5e9] via-white to-[#eaf4ff]">
        <div className="container-page py-14 sm:py-20">
          <span className="chip bg-white text-brand-700 shadow-soft ring-1 ring-brand-100">LỘ TRÌNH HỌC SCRATCHKIDS</span>
          <h1 className="mt-4 max-w-3xl text-4xl sm:text-5xl">Từ khối lệnh đầu tiên đến tự viết chương trình</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70 sm:text-xl">
            Chọn hướng học phù hợp với mục tiêu của bé: bắt đầu với Scratch, phát triển dự án nâng cao, ôn luyện Tin học trẻ hoặc bước tiếp sang Python.
          </p>
          <a href="#danh-sach-khoa-hoc" className="btn-primary mt-7 rounded-full">
            Khám phá 4 khóa học <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <section id="danh-sach-khoa-hoc" className="container-page scroll-mt-24 py-10 sm:py-14">
        <CourseExplorer courses={COURSES} />
      </section>

      <section className="bg-scratch-50 py-14 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 className="section-title">Học theo cách phù hợp với gia đình</h2>
            <p className="mt-2 text-base text-ink/65 sm:text-lg">Chọn hình thức học và trao đổi với ScratchKids để được gợi ý lộ trình.</p>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {LEARN_MODES.map((m) => (
              <div key={m.value} className="card">
                <h3 className="text-xl">{m.title}</h3>
                <p className="mt-2 text-base text-ink/70">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-base text-ink/60">Vui lòng liên hệ để được tư vấn học phí phù hợp.</p>
        </div>
      </section>
    </div>
  );
}
