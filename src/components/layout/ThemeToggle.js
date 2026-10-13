"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";

// Light/dark switch. The starting theme is set by a tiny script in layout.js
// (saved choice, or the device setting), so here we only read it and flip it.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or storage blocked: the theme still changes for this visit.
    }
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1 text-muted transition hover:border-line-strong"
    >
      <span className={`grid h-7 w-7 place-items-center rounded-full transition ${!isDark && theme ? "bg-primary-soft text-primary-text" : ""}`}>
        <Icon name="sun" size={16} />
      </span>
      <span className={`grid h-7 w-7 place-items-center rounded-full transition ${isDark ? "bg-primary-soft text-primary-text" : ""}`}>
        <Icon name="moon" size={16} />
      </span>
    </button>
  );
}
