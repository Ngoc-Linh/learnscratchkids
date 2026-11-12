"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HeroSlide = {
  label: string;
  title: string;
  description: string;
  icons: string[];
  colors: string;
  video?: string;
};

const SLIDES: HeroSlide[] = [
  {
    label: "LỚP SCRATCH",
    title: "Từ ý tưởng đến game của riêng con",
    description: "Học lập trình trực quan, tự thiết kế nhân vật và tạo trò chơi sinh động.",
    icons: ["🎮", "🎨", "🚀"],
    colors: "from-orange-400 via-amber-400 to-yellow-300",
  },
  {
    label: "LỚP PYTHON",
    title: "Bắt đầu hành trình lập trình Python",
    description: "Làm quen với câu lệnh, tư duy logic và từng bước viết chương trình đầu tiên.",
    icons: ["🐍", "💻", "✨"],
    colors: "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    label: "KHAI GIẢNG THÁNG 12",
    title: "Lịch học linh hoạt cho cả tuần",
    description: "Chọn lớp Scratch hoặc Python, học buổi tối trong tuần hoặc ban ngày cuối tuần.",
    icons: ["📅", "🌙", "⭐"],
    colors: "from-violet-500 via-fuchsia-500 to-pink-400",
  },
];

export default function HomeHeroCarousel({ videoEmbed }: { videoEmbed?: string }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const lastWheelTime = useRef(0);
  const slides = videoEmbed
    ? [
        ...SLIDES,
        {
          label: "SẢN PHẨM HỌC VIÊN",
          title: "Khám phá những trò chơi do các bạn nhỏ tự làm",
          description: "Mỗi dự án là một ý tưởng sáng tạo được hiện thực hóa bằng lập trình.",
          icons: [],
          colors: "from-indigo-500 via-blue-500 to-cyan-400",
          video: videoEmbed,
        },
      ]
    : SLIDES;

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  function showSlide(index: number) {
    setActiveSlide((index + slides.length) % slides.length);
  }

  return (
    <section
      aria-label="Thông tin khai giảng tháng 12"
      aria-roledescription="carousel"
      className="hero-visual-enter relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_28px_70px_-30px_rgba(30,42,74,0.5)] ring-1 ring-white/80 sm:p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onWheel={(event) => {
        const now = Date.now();
        if (now - lastWheelTime.current < 700 || Math.abs(event.deltaY) < 20) return;
        event.preventDefault();
        lastWheelTime.current = now;
        showSlide(activeSlide + (event.deltaY > 0 ? 1 : -1));
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="font-display text-lg font-extrabold text-brand-700 sm:text-xl">
          🎉 Khai giảng tháng 12
        </span>
        <span className="rounded-full bg-scratch-50 px-3 py-1 text-sm font-bold text-scratch-700">
          Lớp Scratch &amp; Python
        </span>
      </div>
      <div className="relative min-h-[250px] overflow-hidden rounded-[1.5rem] sm:min-h-[280px]">
        <div
          className="flex h-full min-h-[250px] transition-transform duration-700 ease-in-out sm:min-h-[280px] motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.label}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}: ${slide.label}`}
              aria-hidden={activeSlide !== index}
              className={`relative flex w-full shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br ${slide.colors} p-6 text-white sm:p-8`}
            >
              <span className="absolute -right-10 -top-14 h-48 w-48 rounded-full border-[24px] border-white/10" aria-hidden="true" />
              <span className="absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-white/10 blur-sm" aria-hidden="true" />
              <div className="relative z-10">
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold tracking-widest ring-1 ring-white/30">
                  {slide.label}
                </span>
                <h2 className="mt-4 max-w-md font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                  {slide.title}
                </h2>
                <p className="mt-2 max-w-md text-base font-semibold leading-6 text-white/90 sm:text-lg">
                  {slide.description}
                </p>
              </div>
              <div className="relative z-10 mt-4 flex items-end justify-between gap-3">
                {slide.video ? (
                  <iframe
                    src={slide.video}
                    title="Video giới thiệu sản phẩm do học viên tự thiết kế"
                    className="aspect-video min-w-0 flex-1 rounded-xl border-2 border-white/40 bg-black"
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    tabIndex={activeSlide === index ? 0 : -1}
                  />
                ) : (
                  <div className="flex gap-2 sm:gap-3" aria-hidden="true">
                    {slide.icons.map((icon, iconIndex) => (
                      <span
                        key={icon}
                        className={`grid h-14 w-14 place-items-center rounded-2xl border border-white/30 bg-white/20 text-3xl shadow-lg backdrop-blur-sm sm:h-16 sm:w-16 sm:text-4xl ${
                          iconIndex === 1 ? "-translate-y-3 rotate-3" : iconIndex === 2 ? "rotate-6" : "-rotate-3"
                        }`}
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href="/dang-ky-hoc?hoc-thu=1"
                  tabIndex={activeSlide === index ? 0 : -1}
                  className="rounded-full bg-white px-4 py-2 font-display text-sm font-extrabold text-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-50 sm:px-5 sm:text-base"
                >
                  Đăng ký học thử <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2 py-3 sm:grid-cols-2 sm:gap-3 sm:py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm" aria-hidden="true">🌙</span>
          <p className="text-sm font-bold leading-5 text-ink sm:text-base">
            Thứ 2–6 <span className="block text-brand-700">18:00–22:00</span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-scratch-50 px-4 py-3 ring-1 ring-scratch-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm" aria-hidden="true">☀️</span>
          <p className="text-sm font-bold leading-5 text-ink sm:text-base">
            Thứ 7 &amp; Chủ nhật <span className="block text-scratch-700">08:00–17:00</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink/5 pt-3">
        <div className="flex items-center gap-2" aria-label={`Trang ${activeSlide + 1} trên ${slides.length}`}>
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              aria-label={`Xem slide ${index + 1}: ${slide.label}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => showSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-7 bg-brand-500" : "w-2.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-ink/50">Cuộn chuột để xem thêm</span>
      </div>
    </section>
  );
}
