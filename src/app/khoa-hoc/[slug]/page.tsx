import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES, COURSE_COLORS, STARS_PER_LESSON, getCourse } from "@/lib/courses";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: course.title, description: course.summary };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const c = COURSE_COLORS[course.color];

  return (
    <div className="container-page py-12">
      <Link href="/khoa-hoc" className="font-display font-bold text-scratch-600 hover:underline">← Tất cả khóa học</Link>

      <header className={`mt-4 rounded-[2rem] p-8 ${c.bg}`}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white text-6xl shadow-pop">{course.emoji}</div>
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className={`chip ${c.chip}`}>{course.level}</span>
              <span className="chip bg-white text-ink/70">{course.ageMin}-{course.ageMax} tuổi</span>
              <span className="chip bg-white text-ink/70">{course.lessons.length} buổi học</span>
            </div>
            <h1 className="text-3xl sm:text-4xl">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink/80">{course.summary}</p>
          </div>
          <Link href={`/dang-ky-hoc?khoa=${course.slug}&hoc-thu=1`} className="btn-primary text-xl">Đăng ký học thử 0đ</Link>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-1">
          <section className="card">
            <h2 className="text-2xl">Mục tiêu</h2>
            <ul className="mt-3 space-y-2 text-base">
              {course.goals.map((g) => (
                <li key={g} className="flex gap-2"><span aria-hidden>✅</span>{g}</li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="text-2xl">Sản phẩm đầu ra</h2>
            <ul className="mt-3 space-y-2 text-base">
              {course.outputs.map((o) => (
                <li key={o} className="flex gap-2"><span aria-hidden>🎯</span>{o}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section id="hoc-thu" className="card">
            <h2 className="text-2xl">Bài học thử</h2>
            {course.trialVideoEmbed ? (
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl">
                <iframe src={course.trialVideoEmbed} title={`Học thử: ${course.title}`} className="h-full w-full" allowFullScreen loading="lazy" />
              </div>
            ) : (
              <div className="mt-4 grid aspect-video place-items-center rounded-2xl bg-scratch-50 p-6 text-center">
                <div>
                  <div className="text-5xl">▶️</div>
                  <p className="mt-2 text-base text-ink/70">
                    Video học thử đang được cập nhật. Đăng ký học thử 0đ để bé trải nghiệm cùng giáo viên.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="text-2xl">Nội dung từng buổi</h2>
            <p className="mt-1 text-base text-ink/60">Hoàn thành mỗi bài nhận {STARS_PER_LESSON} ⭐ để đổi quà.</p>
            <ol className="mt-4 divide-y divide-ink/10">
              {course.lessons.map((l) => (
                <li key={l.no} className="flex items-center gap-4 py-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-bold ${c.chip}`}>{l.no}</span>
                  <span className="text-lg">{l.title}</span>
                  {l.no === 1 && <span className="chip ml-auto bg-brand-100 text-brand-700">Học thử</span>}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
