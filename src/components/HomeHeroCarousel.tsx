"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSlide = {
  label: string;
  title: string;
  description: string;
  icons: string[];
  colors: string;
  code: string[];
  video?: string;
};

const SLIDES: HeroSlide[] = [
  {
    label: "LỚP SCRATCH",
    title: "Từ ý tưởng đến game của riêng con",
    description: "Học lập trình trực quan, tự thiết kế nhân vật và tạo trò chơi sinh động.",
    icons: ["🎮", "🎨", "🚀"],
    colors: "from-orange-400 via-amber-400 to-yellow-300",
    code: ["khi bấm cờ xanh", "di chuyển 10 bước", "nói Xin chào!"],
  },
  {
    label: "LỚP PYTHON",
    title: "Bắt đầu hành trình lập trình Python",
    description: "Làm quen với câu lệnh, tư duy logic và từng bước viết chương trình đầu tiên.",
    icons: ["🐍", "💻", "✨"],
    colors: "from-sky-500 via-blue-500 to-indigo-500",
    code: ["for y_tuong in projects:", "    tao_game(y_tuong)", "    chia_se()"],
  },
  {
    label: "KHAI GIẢNG THÁNG 12",
    title: "Lịch học linh hoạt cho cả tuần",
    description: "Chọn lớp Scratch hoặc Python, học buổi tối trong tuần hoặc ban ngày cuối tuần.",
    icons: ["📅", "🌙", "⭐"],
    colors: "from-violet-500 via-fuchsia-500 to-pink-400",
    code: ["chon_lich_hoc()", "gap_ban_moi()", "bat_dau_sang_tao()"],
  },
];

export default function HomeHeroCarousel({ videoEmbed }: { videoEmbed?: string }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = videoEmbed
    ? [
        ...SLIDES,
        {
          label: "SẢN PHẨM HỌC VIÊN",
          title: "Khám phá những trò chơi do các bạn nhỏ tự làm",
          description: "Mỗi dự án là một ý tưởng sáng tạo được hiện thực hóa bằng lập trình.",
          icons: [],
          colors: "from-indigo-500 via-blue-500 to-cyan-400",
          code: [],
          video: videoEmbed,
        },
      ]
    : SLIDES;

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  function showSlide(index: number) {
    setActiveSlide((index + slides.length) % slides.length);
  }

  return (
    <section
      aria-label="Khám phá lớp học ScratchKids"
      aria-roledescription="carousel"
      className="hero-visual-enter hero-carousel-frame relative"
      data-scroll-parallax
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={(event) => {
        setPaused(false);
        event.currentTarget.style.setProperty("--spot-x", "50%");
        event.currentTarget.style.setProperty("--spot-y", "50%");
      }}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        event.currentTarget.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
        event.currentTarget.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
      }}
    >
      <div className="hero-stage-topline">
        <span className="hero-stage-brand"><span aria-hidden="true">S</span> SCRATCHKIDS STUDIO</span>
        <span className="hero-stage-live"><i aria-hidden="true" /> ĐANG MỞ ĐĂNG KÝ</span>
      </div>
      <div className="hero-slide-window">
        <div
          className="hero-slide-track"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          aria-live="off"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.label}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}: ${slide.label}`}
              aria-hidden={activeSlide !== index}
              className={`hero-slide relative w-full shrink-0 overflow-hidden bg-gradient-to-br ${slide.colors} text-white`}
            >
              <div className="hero-slide-copy">
                <span className="hero-slide-label">{slide.label}</span>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                <Link
                  href="/dang-ky-hoc?hoc-thu=1"
                  tabIndex={activeSlide === index ? 0 : -1}
                  className="hero-slide-cta"
                >
                  Khám phá lớp học <span aria-hidden="true">↗</span>
                </Link>
              </div>
              {slide.video ? (
                <div className="hero-video-wrap">
                  <iframe
                    src={slide.video}
                    title="Video giới thiệu sản phẩm do học viên tự thiết kế"
                    className="h-full w-full rounded-[1.25rem] border border-white/30 bg-black"
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    tabIndex={activeSlide === index ? 0 : -1}
                  />
                </div>
              ) : (
                <div className="hero-slide-art" aria-hidden="true">
                  <div className="hero-art-grid" />
                  <div className="hero-art-orbit" />
                  <span className="hero-art-spark hero-art-spark-one">✦</span>
                  <span className="hero-art-spark hero-art-spark-two">✳</span>
                  <span className="hero-art-icon hero-art-icon-main">{slide.icons[0]}</span>
                  <span className="hero-art-icon hero-art-icon-small">{slide.icons[1]}</span>
                  <span className="hero-art-icon hero-art-icon-top">{slide.icons[2]}</span>
                  <div className="hero-code-card">
                    <div className="hero-code-heading">
                      <span><i /><i /><i /></span>
                      <b>{index === 1 ? "my_first_project.py" : "my_first_game"}</b>
                    </div>
                    <code>
                      {slide.code.map((line, lineIndex) => (
                        <span key={line}>
                          <i>{String(lineIndex + 1).padStart(2, "0")}</i>{line}
                        </span>
                      ))}
                    </code>
                  </div>
                  <div className="hero-art-sticker">
                    <span>✦</span> MADE BY KIDS
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="hero-schedule">
        <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
          <span className="hero-schedule-icon" aria-hidden="true">☾</span>
          <p><span>Thứ 2–6</span><strong>18:00–22:00</strong></p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-scratch-50 px-4 py-3 ring-1 ring-scratch-100">
          <span className="hero-schedule-icon" aria-hidden="true">☼</span>
          <p><span>Thứ 7 &amp; Chủ nhật</span><strong>08:00–17:00</strong></p>
        </div>
      </div>

      <div className="hero-carousel-controls">
        <div className="hero-carousel-pagination" aria-label={`Trang ${activeSlide + 1} trên ${slides.length}`}>
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              aria-label={`Xem slide ${index + 1}: ${slide.label}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => showSlide(index)}
              className={activeSlide === index ? "is-active" : ""}
            />
          ))}
        </div>
        <div className="hero-carousel-arrows">
          <span>{String(activeSlide + 1).padStart(2, "0")} <i>/</i> {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => showSlide(activeSlide - 1)} aria-label="Slide trước">←</button>
          <button type="button" onClick={() => showSlide(activeSlide + 1)} aria-label="Slide tiếp theo">→</button>
        </div>
      </div>
    </section>
  );
}
