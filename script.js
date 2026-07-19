const year = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
const translatableNodes = Array.from(document.querySelectorAll("[data-en]"));

if (year) {
  year.textContent = new Date().getFullYear();
}

translatableNodes.forEach((node) => {
  if (!node.dataset.zh) {
    node.dataset.zh = node.textContent.trim();
  }
});

const getSavedLanguage = () => {
  try {
    return localStorage.getItem("homepage-language");
  } catch {
    return null;
  }
};

const setSavedLanguage = (lang) => {
  try {
    localStorage.setItem("homepage-language", lang);
  } catch {
    // Static file previews may restrict storage in some browser settings.
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

applyLanguage(getSavedLanguage() || "zh");
