import Link from "next/link";
import { getUser } from "@/lib/auth";
import { safe } from "@/lib/db";
import { listProjects } from "@/lib/queries";
import { COURSES } from "@/lib/courses";
import {
  ROADMAP,
  SAMPLE_SHOWCASE,
  SITE,
  TESTIMONIALS,
  TESTIMONIALS_ARE_SAMPLE,
  VALUE_PROPS,
} from "@/lib/site";
import CourseCard from "@/components/CourseCard";
import ProjectCard from "@/components/ProjectCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUser();
  const projects = await safe(() => listProjects({ userId: user?.id, take: 6 }), []);

  return (
    <>
      {/* HERO */}
      <section className="overflow-hidden bg-gradient-to-br from-brand-100 via-white to-scratch-100">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="hero-copy-enter">
            <span className="chip bg-white text-brand-700 shadow-pop">Dành cho bé 6-15 tuổi</span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
              {SITE.slogan.split(" - ")[0]} <span className="text-brand-500">-</span>{" "}
              <span className="text-scratch-500">{SITE.slogan.split(" - ")[1]}</span>
            </h1>
            <p className="mt-5 max-w-xl text-xl text-ink/80">
              Bé học lập trình Scratch bằng cách tự tay làm ra những trò chơi của riêng mình, thay vì chỉ ngồi chơi game.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary text-xl">Đăng ký học thử 0đ</Link>
              <Link href="/khoa-hoc" className="btn-ghost text-xl">Khám phá khóa học</Link>
            </div>
          </div>

          <div className="relative hero-visual-enter">
            <div className="aspect-video overflow-hidden rounded-3xl bg-ink shadow-soft ring-4 ring-white">
              {SITE.heroVideoEmbed ? (
                <iframe
                  src={SITE.heroVideoEmbed}
                  title="Video giới thiệu các game do học viên tự làm"
                  className="h-full w-full"
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full grid-cols-3 gap-3 bg-gradient-to-br from-scratch-500 to-scratch-700 p-6 text-center text-white">
                  {SAMPLE_SHOWCASE.slice(0, 6).map((s) => (
                    <div key={s.title} className="grid place-items-center rounded-2xl bg-white/15">
                      <div>
                        <div className="text-4xl sm:text-5xl">{s.emoji}</div>
                        <div className="mt-1 font-display text-sm font-bold sm:text-base">{s.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-3 text-center text-sm text-ink/60">Các game do học viên tự thiết kế</p>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="container-page py-16">
        <h2 className="section-title text-center">Con nhận được gì?</h2>
        <div className="stagger-children mt-10 grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="card text-center">
              <div className="text-5xl">{v.emoji}</div>
              <h3 className="mt-3 text-xl">{v.title}</h3>
              <p className="mt-2 text-base text-ink/70">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="section-title text-center">Lộ trình học tập</h2>
          <p className="mt-2 text-center text-ink/70">Từ những khối lệnh đầu tiên đến việc gõ lệnh thật</p>
          <ol className="stagger-children mt-10 grid gap-4 md:grid-cols-4">
            {ROADMAP.map((r, i) => (
              <li key={r.step} className="relative rounded-3xl bg-brand-50 p-6 text-center ring-2 ring-brand-100">
                <span className="absolute -top-4 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-brand-500 font-display font-bold text-white">
                  {r.step}
                </span>
                <div className="mt-2 text-5xl">{r.emoji}</div>
                <h3 className="mt-2 text-xl">{r.title}</h3>
                <p className="text-base text-ink/70">{r.age}</p>
                {i < ROADMAP.length - 1 && (
                  <span aria-hidden className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-3xl text-brand-400 md:block">
                    ›
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COURSES */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Các khóa học</h2>
          <Link href="/khoa-hoc" className="font-display font-bold text-scratch-600 hover:underline">Xem tất cả →</Link>
        </div>
        <div className="stagger-children mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="bg-scratch-50 py-16">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">Sản phẩm của học viên</h2>
            <Link href="/san-pham" className="font-display font-bold text-scratch-600 hover:underline">Vào Showroom →</Link>
          </div>
          {projects.length > 0 ? (
            <div className="stagger-children mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} loggedIn={!!user} />
              ))}
            </div>
          ) : (
            <div className="stagger-children mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {SAMPLE_SHOWCASE.map((s) => (
                <div key={s.title} className="card text-center !p-4">
                  <div className="text-5xl">{s.emoji}</div>
                  <h3 className="mt-2 text-lg">{s.title}</h3>
                  <span className="chip mt-1 bg-scratch-100 text-scratch-700">{s.tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {TESTIMONIALS.length > 0 && (
        <section className="container-page py-16">
          <h2 className="section-title text-center">Cảm nhận từ phụ huynh & học viên</h2>
          {TESTIMONIALS_ARE_SAMPLE && (
            <p className="mt-2 text-center text-sm font-semibold text-brand-700">(Nội dung mẫu - cần thay bằng phản hồi thật trong src/lib/site.ts)</p>
          )}
          <div className="stagger-children mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.text} className="card">
                <blockquote className="text-lg">“{t.text}”</blockquote>
                <figcaption className="mt-4 font-display font-bold text-scratch-700">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-brand-500 to-brand-400 p-10 text-center text-white shadow-soft">
          <h2 className="text-3xl sm:text-4xl">Cho bé thử một buổi học miễn phí?</h2>
          <p className="mt-2 text-xl text-white/90">Đăng ký trong 1 phút, chúng tôi sẽ liên hệ phụ huynh.</p>
          <Link href="/dang-ky-hoc?hoc-thu=1" className="btn mt-6 bg-white text-brand-700 shadow-pop hover:bg-brand-50 text-xl">
            Đăng ký học thử 0đ
          </Link>
        </div>
      </section>
    </>
  );
}
