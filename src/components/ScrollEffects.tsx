"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ScrollEffects() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const main = document.querySelector("main");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let revealObserver: IntersectionObserver | undefined;
    let imageObserver: IntersectionObserver | undefined;
    let motionObserver: IntersectionObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let scrollImages: HTMLImageElement[] = [];
    let parallaxElements: HTMLElement[] = [];

    if (main && !reduceMotion && "IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute("data-reveal", "visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.setAttribute("data-scroll-image", "visible");
            imageObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
      );
      motionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.setAttribute("data-motion", entry.isIntersecting ? "active" : "paused");
          });
        },
        { rootMargin: "100px 0px" },
      );
      main.querySelectorAll<HTMLElement>(".home-hero").forEach((element) => motionObserver?.observe(element));

      const observeContent = () => {
        main.querySelectorAll<HTMLElement>("article.card, .stagger-children > *, .build-copy, .build-token").forEach((element, index) => {
          if (element.hasAttribute("data-reveal")) return;
          const isVisible = element.getBoundingClientRect().top < window.innerHeight * 0.9;
          element.setAttribute("data-reveal", isVisible ? "visible" : "hidden");
          if (!isVisible) {
            const staggerParent = element.parentElement?.classList.contains("stagger-children");
            const buildParent = element.parentElement?.classList.contains("build-scene");
            if (staggerParent) {
              element.style.setProperty("--reveal-delay", `${(index % 6) * 55}ms`);
            } else if (buildParent) {
              const buildTokens = element.parentElement?.querySelectorAll(".build-token");
              const tokenIndex = buildTokens ? Array.from(buildTokens).indexOf(element) : 0;
              element.style.setProperty("--reveal-delay", `${tokenIndex * 130}ms`);
            }
            revealObserver?.observe(element);
          }
        });

        scrollImages = Array.from(main.querySelectorAll<HTMLImageElement>("img:not([data-scroll-static])"));
        scrollImages.forEach((image) => {
          if (image.hasAttribute("data-scroll-image")) return;
          const isVisible = image.getBoundingClientRect().top < window.innerHeight * 1.05;
          image.setAttribute("data-scroll-image", isVisible ? "visible" : "hidden");
          if (!isVisible) imageObserver?.observe(image);
        });
        parallaxElements = Array.from(main.querySelectorAll<HTMLElement>("[data-scroll-parallax]"));
      };

      observeContent();
      mutationObserver = new MutationObserver(observeContent);
      mutationObserver.observe(main, { childList: true, subtree: true });
    }

    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollableHeight > 0 ? Math.min(100, (window.scrollY / scrollableHeight) * 100) : 0);

        scrollImages.forEach((image) => {
          const bounds = image.getBoundingClientRect();
          const progress =
            (bounds.top + bounds.height / 2 - window.innerHeight / 2) /
            (window.innerHeight / 2 + bounds.height / 2);
          const offset = Math.max(-1, Math.min(1, progress)) * -18;
          image.style.setProperty("--scroll-image-offset", `${offset}px`);
        });
        const isMobile = window.innerWidth <= 640;
        parallaxElements.forEach((element) => {
          const bounds = element.getBoundingClientRect();
          const progress = (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight;
          const configuredDepth = Number(element.dataset.scrollParallax) || 22;
          const depth = isMobile ? Math.min(configuredDepth, 16) : configuredDepth;
          const offset = Math.max(-1, Math.min(1, progress)) * -depth;
          element.style.setProperty("--scroll-depth-offset", `${offset}px`);
        });
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      revealObserver?.disconnect();
      imageObserver?.disconnect();
      motionObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} aria-hidden="true" />
      {scrollProgress > 18 && (
        <button
          type="button"
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Cuộn lên đầu trang"
        >
          ↑
        </button>
      )}
    </>
  );
}
