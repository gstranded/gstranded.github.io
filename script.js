const year = document.querySelector("#year");
const particleCanvas = document.querySelector("#particle-canvas");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
const translatableNodes = Array.from(document.querySelectorAll("[data-en]"));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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

const setupParticleField = () => {
  if (!particleCanvas) return;

  const context = particleCanvas.getContext("2d", { alpha: true });
  if (!context) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;

  const palette = [
    "rgba(202, 160, 90, ",
    "rgba(126, 166, 156, ",
    "rgba(240, 239, 237, ",
  ];

  const particleCount = () => {
    const area = window.innerWidth * window.innerHeight;
    return Math.max(42, Math.min(110, Math.floor(area / 12000)));
  };

  const createParticle = () => {
    const speed = 0.12 + Math.random() * 0.34;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.1 + Math.random() * 1.8,
      alpha: 0.34 + Math.random() * 0.38,
      color: palette[Math.floor(Math.random() * palette.length)],
    };
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = Math.floor(width * ratio);
    particleCanvas.height = Math.floor(height * ratio);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: particleCount() }, createParticle);
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `${particle.color}${particle.alpha})`;
      context.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const first = particles[i];
        const second = particles[j];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 126) {
          const alpha = (1 - distance / 126) * 0.18;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.strokeStyle = `rgba(202, 160, 90, ${alpha})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }
    }

    animationFrame = window.requestAnimationFrame(draw);
  };

  const start = () => {
    window.cancelAnimationFrame(animationFrame);
    resize();
    if (!reducedMotionQuery.matches) {
      draw();
    } else {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `${particle.color}${particle.alpha})`;
        context.fill();
      });
    }
  };

  window.addEventListener("resize", start);

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", start);
  }

  start();
};

window.addEventListener("scroll", setActiveLink, { passive: true });
setupParticleField();
applyLanguage(getSavedLanguage() || "zh");
setActiveLink();
