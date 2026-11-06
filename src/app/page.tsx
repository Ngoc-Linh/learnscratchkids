import Link from "next/link";
import { getUser } from "@/lib/auth";
import { isDatabaseConfigured, safe } from "@/lib/db";
import { listProjects } from "@/lib/queries";
import { COURSES } from "@/lib/courses";
import type { Metadata } from "next";
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
export const metadata: Metadata = {
  title: "Học lập trình Scratch cho trẻ em 6-15 tuổi",
  description:
    "Khóa học Scratch và Python cho trẻ 6-15 tuổi: học từ cơ bản, nâng cao đến luyện thi Tin học trẻ. Bé tự tạo game qua từng dự án thực hành.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const user = await getUser();
  const projects = isDatabaseConfigured()
    ? await safe(() => listProjects({ userId: user?.id, take: 6 }), [])
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Học lập trình Scratch cho trẻ em 6-15 tuổi",
            description: SITE.description,
            url: SITE.url,
            inLanguage: "vi-VN",
            isPartOf: { "@id": `${SITE.url}/#website` },
          }).replace(/</g, "\\u003c"),
        }}
      />
      {/* HERO */}
      <section className="home-hero relative isolate overflow-hidden bg-gradient-to-br from-[#fff5e9] via-white to-[#eaf4ff]">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div className="hero-copy-enter relative z-10">
            <span className="chip rounded-full bg-white px-4 py-2 text-brand-700 shadow-soft ring-1 ring-brand-100">Dành cho bé 6-15 tuổi</span>
            <h1 className="mt-5 max-w-2xl text-4xl sm:text-5xl lg:text-[4.25rem] lg:leading-[1.05]">
              Học lập trình <span className="text-brand-500">Scratch</span>{" "}
              <span className="text-scratch-500">cho trẻ em</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/75 sm:text-xl">
              {SITE.slogan}. Bé học lập trình bằng cách tự tay làm ra những trò chơi của riêng mình, thay vì chỉ ngồi chơi game.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary rounded-full px-7 text-lg sm:text-xl">Đăng ký học thử <span aria-hidden="true">→</span></Link>
              <Link href="/khoa-hoc" className="btn-ghost rounded-full border-white/80 bg-white/80 text-lg shadow-soft sm:text-xl">Khám phá khóa học</Link>
            </div>
          </div>

          <div className="relative hero-visual-enter">
            <div className="hero-media-frame aspect-video overflow-hidden rounded-[2rem] bg-ink shadow-[0_28px_70px_-30px_rgba(30,42,74,0.5)] ring-8 ring-white">
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
                <div className="grid h-full grid-cols-3 gap-3 bg-gradient-to-br from-scratch-400 via-scratch-500 to-scratch-700 p-4 text-center text-white sm:gap-4 sm:p-6">
                  {SAMPLE_SHOWCASE.slice(0, 6).map((s) => (
                    <div key={s.title} className="showcase-tile grid place-items-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
                      <div>
                        <div className="text-3xl sm:text-5xl">{s.emoji}</div>
                        <div className="mt-1 font-display text-xs font-bold sm:text-base">{s.title}</div>
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
      <section className="container-page py-20 sm:py-24">
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
      <section className="roadmap-section bg-white py-20 sm:py-24">
        <div className="container-page">
          <h2 className="section-title text-center">4 hướng học theo mục tiêu</h2>
          <p className="mt-2 text-center text-ink/70">Chọn khóa học phù hợp với độ tuổi và kiến thức hiện tại của bé.</p>
          <ol className="stagger-children mt-10 grid gap-4 md:grid-cols-4">
            {ROADMAP.map((r) => (
              <li key={r.step} className="relative rounded-3xl bg-brand-50 p-6 text-center ring-2 ring-brand-100">
                <span className="absolute -top-4 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-brand-500 font-display font-bold text-white">
                  {r.step}
                </span>
                <div className="mt-2 text-5xl">{r.emoji}</div>
                <h3 className="mt-2 text-xl">{r.title}</h3>
                <p className="text-base text-ink/70">{r.age}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COURSES */}
      <section className="container-page py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Các khóa học</h2>
          <Link href="/khoa-hoc" className="font-display font-bold text-scratch-600 hover:underline">Xem tất cả →</Link>
        </div>
        <div className="stagger-children mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="showcase-section bg-scratch-50 py-20 sm:py-24">
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
        <section className="container-page py-20 sm:py-24">
          <h2 className="section-title text-center">Cảm nhận từ phụ huynh & học viên</h2>
          
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
            Đăng ký học thử
          </Link>
        </div>
      </section>
    </>
  );
}
