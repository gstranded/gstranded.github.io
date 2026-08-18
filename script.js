/* ============================================================
   高海圳个人主页 — 交互脚本 v2
   ------------------------------------------------------------
   模块：
   1. 基础：页脚年份
   2. 中英双语切换（localStorage 记忆）
   3. 吸顶头部滚动状态 + 返回顶部
   4. 导航滚动高亮（IntersectionObserver）
   5. 滚动显现动画（尊重 prefers-reduced-motion）
   6. GitHub Stars 动态加载（缓存 6 小时）
   ============================================================ */

(() => {
  "use strict";

  /* ---------- 1. 基础 ---------- */

  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ---------- 2. 中英双语切换 ---------- */

  const LANGUAGE_KEY = "homepage-language";
  const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
  const translatableNodes = Array.from(document.querySelectorAll("[data-en]"));

  // 以页面标记的中文为默认文案，缓存到 dataset.zh
  translatableNodes.forEach((node) => {
    if (!node.dataset.zh) {
      node.dataset.zh = node.textContent.trim();
    }
  });

  const getSavedLanguage = () => {
    try {
      return localStorage.getItem(LANGUAGE_KEY);
    } catch {
      return null;
    }
  };

  const setSavedLanguage = (lang) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // 静态页面预览等受限环境下可能禁止存储，忽略即可。
    }
  };

  const applyLanguage = (lang) => {
    const nextLang = lang === "en" ? "en" : "zh";
    document.documentElement.lang = nextLang === "en" ? "en" : "zh-CN";

    translatableNodes.forEach((node) => {
      node.textContent = nextLang === "en" ? node.dataset.en : node.dataset.zh;
    });

    languageButtons.forEach((button) => {
      const active = button.dataset.lang === nextLang;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    setSavedLanguage(nextLang);
  };

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  /* ---------- 3. 吸顶头部滚动状态 + 返回顶部 ---------- */

  const header = document.querySelector(".site-header");
  const backToTop = document.querySelector(".back-to-top");

  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    header?.classList.toggle("scrolled", scrolled);
    if (backToTop) {
      backToTop.hidden = window.scrollY < 600;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 4. 导航滚动高亮 ---------- */

  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  };

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveLink(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -65% 0px",
        threshold: [0.12, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
  } else if (sections[0]?.id) {
    setActiveLink(sections[0].id);
  }

  /* ---------- 5. 滚动显现动画 ---------- */

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll(".section-block > *");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    revealTargets.forEach((target, index) => {
      target.classList.add("reveal");
      // 同一板块内的元素按顺序交错显现（最多错开 3 档）
      target.style.setProperty(
        "--reveal-delay",
        `${Math.min(index % 4, 3) * 70}ms`,
      );
      observer.observe(target);
    });
  }

  /* ---------- 6. GitHub Stars 动态加载 ---------- */

  const projectCards = Array.from(document.querySelectorAll(".project-entry[data-repo]"));

  const STAR_CACHE_KEY = "github-portfolio-stars";
  const STAR_CACHE_TTL = 6 * 60 * 60 * 1000;

  const readCachedStars = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(STAR_CACHE_KEY));
      const cacheIsFresh = Date.now() - cached.updatedAt < STAR_CACHE_TTL;
      return cacheIsFresh && cached.stars ? cached.stars : null;
    } catch {
      return null;
    }
  };

  const writeCachedStars = (stars) => {
    try {
      localStorage.setItem(
        STAR_CACHE_KEY,
        JSON.stringify({ updatedAt: Date.now(), stars }),
      );
    } catch {
      // 存储不可用时仍展示静态兜底值。
    }
  };

  const applyPortfolioStars = (stars) => {
    // 只更新 star 数字，保持页面中人工编排的项目顺序
    projectCards.forEach((card) => {
      const repoName = card.dataset.repo;
      const liveCount = Number(stars[repoName.toLowerCase()]);
      const fallbackCount = Number(card.dataset.stars);
      const count = Number.isFinite(liveCount) ? liveCount : fallbackCount;
      const starLabel = card.querySelector(".project-stars");

      card.dataset.stars = String(count);

      if (starLabel) {
        const formattedCount = count.toLocaleString("en-US");
        starLabel.textContent = `★ ${formattedCount}`;
        starLabel.setAttribute("aria-label", `GitHub Stars: ${formattedCount}`);
      }
    });
  };

  const loadPortfolioStars = async () => {
    const cachedStars = readCachedStars();

    if (cachedStars) {
      applyPortfolioStars(cachedStars);
      return;
    }

    try {
      const response = await fetch(
        "https://api.github.com/users/gstranded/repos?per_page=100&type=owner",
        { headers: { Accept: "application/vnd.github+json" } },
      );

      if (!response.ok) {
        return;
      }

      const repositories = await response.json();
      const stars = Object.fromEntries(
        repositories.map((repo) => [repo.name.toLowerCase(), repo.stargazers_count]),
      );

      applyPortfolioStars(stars);
      writeCachedStars(stars);
    } catch {
      // GitHub 不可用时保持当前值与顺序。
    }
  };

  /* ---------- 启动 ---------- */

  applyLanguage(getSavedLanguage() || "zh");
  loadPortfolioStars();
})();
