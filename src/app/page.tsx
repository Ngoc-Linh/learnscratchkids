import { Suspense } from "react";
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
  VALUE_PROPS,
} from "@/lib/site";
import CourseCard from "@/components/CourseCard";
import ProjectCard from "@/components/ProjectCard";
import HomeHeroCarousel from "@/components/HomeHeroCarousel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Học lập trình Scratch cho trẻ em 6-15 tuổi",
  description:
    "Khóa học Scratch và Python cho trẻ 6-15 tuổi: học từ cơ bản, nâng cao đến luyện thi Tin học trẻ. Bé tự tạo game qua từng dự án thực hành.",
  alternates: { canonical: "/" },
};

type HomeProjects = Awaited<ReturnType<typeof listProjects>>;

function ShowcaseSection({ projects, loggedIn }: { projects: HomeProjects; loggedIn: boolean }) {
  return (
    <section className="showcase-section bg-scratch-50 py-20 sm:py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Sản phẩm của học viên</h2>
          <Link href="/san-pham" className="font-display font-bold text-scratch-600 hover:underline">Vào Showroom →</Link>
        </div>
        {projects.length > 0 ? (
          <div className="stagger-children mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} loggedIn={loggedIn} />
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
  );
}

async function ShowcaseProjects() {
  const user = await getUser();
  const projects = isDatabaseConfigured()
    ? await safe(() => listProjects({ userId: user?.id, take: 6 }), [])
    : [];

  return <ShowcaseSection projects={projects} loggedIn={!!user} />;
}

export default function HomePage() {
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
      <section className="home-hero relative isolate overflow-hidden">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="container-page hero-layout relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14 lg:py-24">
          <div className="hero-copy-enter relative z-10">
            <span className="hero-eyebrow">
              <span className="hero-eyebrow-dot" aria-hidden="true" />
              STUDIO LẬP TRÌNH SÁNG TẠO · 6–15 TUỔI
            </span>
            <h1 className="hero-title mt-6 max-w-2xl">
              Học <span className="hero-title-scratch">Scratch.</span>
              <br />
              Tạo nên thế giới
              <br />
              <span className="hero-title-accent">của riêng con.</span>
            </h1>
            <p className="hero-description mt-6 max-w-xl text-lg leading-8 sm:text-xl">
              {SITE.slogan}. Bé khám phá Scratch và Python bằng cách tự tay biến ý tưởng thành trò chơi, hoạt hình và dự án của riêng mình.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dang-ky-hoc?hoc-thu=1" className="btn-primary hero-primary-cta rounded-full px-7 text-lg sm:text-xl">Đăng ký học thử <span aria-hidden="true">→</span></Link>
              <Link href="/khoa-hoc" className="btn-ghost hero-secondary-cta rounded-full px-6 text-lg sm:text-xl">Khám phá khóa học</Link>
            </div>
            <div className="hero-learning-path mt-8" aria-label="Lộ trình học">
              <span>Scratch</span>
              <span className="hero-path-arrow" aria-hidden="true">↗</span>
              <span>Dự án thật</span>
              <span className="hero-path-arrow" aria-hidden="true">↗</span>
              <span>Python</span>
            </div>
          </div>

          <HomeHeroCarousel videoEmbed={SITE.heroVideoEmbed} />
        </div>
        <div className="container-page hero-bottomline">
          <span>Ý TƯỞNG <i aria-hidden="true">/</i> MÃ LỆNH <i aria-hidden="true">/</i> TRÒ CHƠI</span>
          <Link href="#value-props">Cuộn để khám phá <span aria-hidden="true">↓</span></Link>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section id="value-props" className="container-page py-20 sm:py-24">
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
      <Suspense fallback={<ShowcaseSection projects={[]} loggedIn={false} />}>
        <ShowcaseProjects />
      </Suspense>

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

      {/* BUILD */}
      <section className="build-section py-12 sm:py-20">
        <div className="container-page">
          <div className="build-panel">
            <div className="build-copy">
              <span className="build-eyebrow"><i aria-hidden="true" /> SCRATCHKIDS STUDIO · SẴN SÀNG SÁNG TẠO</span>
              <h2 className="build-title">
                Bắt đầu xây dựng
                <span> thế giới của con.</span>
              </h2>
              <p>Ý tưởng đầu tiên có thể trở thành trò chơi mà con tự hào chia sẻ. Hãy bắt đầu bằng một buổi học thử miễn phí.</p>
              <div className="build-actions">
                <Link href="/dang-ky-hoc?hoc-thu=1" className="build-primary-link">
                  Bắt đầu học thử <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/khoa-hoc" className="build-secondary-link">Khám phá khóa học</Link>
              </div>
            </div>

            <div className="build-scene" aria-hidden="true">
              <span className="build-scene-orbit" />
              <span className="build-scene-spark build-scene-spark-one">✦</span>
              <span className="build-scene-spark build-scene-spark-two">✳</span>
              <div className="build-token build-game-token" data-scroll-parallax="38">
                <span className="build-token-icon">🎮</span>
                <span className="build-token-label">DỰ ÁN 01</span>
                <strong>Trò chơi đầu tiên</strong>
                <small>Scratch · Lên cấp!</small>
              </div>
              <div className="build-token build-code-token" data-scroll-parallax="52">
                <div className="build-code-header">
                  <span><i /><i /><i /></span>
                  <b>my_first_game</b>
                  <span className="build-code-status">● ĐANG CHẠY</span>
                </div>
                <div className="build-code-lines">
                  <span className="build-code-line is-gold"><i>01</i> khi bấm cờ xanh</span>
                  <span className="build-code-line is-blue"><i>02</i> di chuyển 10 bước</span>
                  <span className="build-code-line is-purple"><i>03</i> phát nhạc chiến thắng</span>
                </div>
              </div>
              <div className="build-token build-python-token" data-scroll-parallax="30">
                <span className="build-token-icon">🐍</span>
                <strong>Lên cấp</strong>
                <small>Tiếp theo: Python</small>
                <span className="build-python-spark">✦</span>
              </div>
            </div>

            <div className="build-footerline">
              <span>Ý TƯỞNG <i>→</i> MÃ LỆNH <i>→</i> TRÒ CHƠI</span>
              <span>Mỗi dự án là một thế giới mới.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
