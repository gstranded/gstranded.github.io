const year = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
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

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 120;
  let activeId = sections[0]?.id;

  for (const section of sections) {
    if (section.offsetTop <= scrollPosition) {
      activeId = section.id;
    }
  }

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
};

window.addEventListener("scroll", setActiveLink, { passive: true });
applyLanguage(getSavedLanguage() || "zh");
setActiveLink();
