"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function ProductTabs({
  scratch,
  python,
}: {
  scratch: ReactNode;
  python: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"scratch" | "python">("scratch");

  useEffect(() => {
    if (window.location.hash === "#python") setActiveTab("python");
  }, []);

  function selectTab(tab: "scratch" | "python") {
    setActiveTab(tab);
    window.history.replaceState(null, "", tab === "python" ? "#python" : "#scratch");
  }

  return (
    <div className="mt-8">
      <div className="flex gap-2 rounded-2xl bg-ink/5 p-2" role="tablist" aria-label="Loại sản phẩm">
        <button
          id="scratch-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "scratch"}
          aria-controls="scratch-panel"
          onClick={() => selectTab("scratch")}
          className={`flex-1 rounded-xl px-4 py-3 font-display font-bold transition ${
            activeTab === "scratch" ? "bg-white text-scratch-700 shadow-sm" : "text-ink/60 hover:bg-white/60"
          }`}
        >
          🎮 Scratch
        </button>
        <button
          id="python-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "python"}
          aria-controls="python-panel"
          onClick={() => selectTab("python")}
          className={`flex-1 rounded-xl px-4 py-3 font-display font-bold transition ${
            activeTab === "python" ? "bg-white text-scratch-700 shadow-sm" : "text-ink/60 hover:bg-white/60"
          }`}
        >
          🐍 Python
        </button>
      </div>
      <section
        id="scratch-panel"
        role="tabpanel"
        aria-labelledby="scratch-tab"
        hidden={activeTab !== "scratch"}
        className="pt-6"
      >
        {scratch}
      </section>
      <section
        id="python-panel"
        role="tabpanel"
        aria-labelledby="python-tab"
        hidden={activeTab !== "python"}
        className="pt-6"
      >
        {python}
      </section>
    </div>
  );
}
