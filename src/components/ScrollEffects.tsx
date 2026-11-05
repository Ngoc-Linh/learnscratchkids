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
    let mutationObserver: MutationObserver | undefined;

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

      const observeContent = () => {
        main.querySelectorAll<HTMLElement>("section, article.card, .stagger-children > *").forEach((element, index) => {
          if (element.hasAttribute("data-reveal")) return;
          const isVisible = element.getBoundingClientRect().top < window.innerHeight * 0.9;
          element.setAttribute("data-reveal", isVisible ? "visible" : "hidden");
          if (!isVisible) {
            const staggerParent = element.parentElement?.classList.contains("stagger-children");
            if (staggerParent) {
              element.style.setProperty("--reveal-delay", `${(index % 6) * 55}ms`);
            }
            revealObserver?.observe(element);
          }
        });
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
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      revealObserver?.disconnect();
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
