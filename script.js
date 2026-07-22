const year = document.querySelector("#year");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
const translatableNodes = Array.from(document.querySelectorAll("[data-en]"));
const portfolioGrid = document.querySelector(".portfolio-grid");
const projectCards = Array.from(document.querySelectorAll(".project-card[data-repo]"));

const STAR_CACHE_KEY = "github-portfolio-stars";
const STAR_CACHE_TTL = 6 * 60 * 60 * 1000;

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
    // The live values still work when storage is unavailable.
  }
};

const applyPortfolioStars = (stars) => {
  projectCards.forEach((card, index) => {
    const repoName = card.dataset.repo;
    const liveCount = Number(stars[repoName.toLowerCase()]);
    const fallbackCount = Number(card.dataset.stars);
    const count = Number.isFinite(liveCount) ? liveCount : fallbackCount;
    const starLabel = card.querySelector(".project-stars");

    card.dataset.stars = String(count);
    card.dataset.originalOrder ??= String(index);

    if (starLabel) {
      const formattedCount = count.toLocaleString("en-US");
      starLabel.textContent = `★ ${formattedCount}`;
      starLabel.setAttribute("aria-label", `GitHub Stars: ${formattedCount}`);
    }
  });

  projectCards
    .sort(
      (a, b) =>
        Number(b.dataset.stars) - Number(a.dataset.stars) ||
        Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder),
    )
    .forEach((card) => portfolioGrid?.append(card));
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
    // Keep the current values and order when GitHub is unavailable.
  }
};

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
loadPortfolioStars();
