document.documentElement.classList.add("js");

const menuButton = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuButton && navigation) {
  const closeMenu = (returnFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    if (returnFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });
}

const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const projects = Array.from(document.querySelectorAll(".work-card[data-category]"));
const filterStatus = document.querySelector("#filter-status");

const countProjects = (filter) => projects.filter((project) => (
  filter === "all" || project.dataset.category.split(/\s+/).includes(filter)
)).length;

filterButtons.forEach((button) => {
  const count = button.querySelector("span");
  if (count) count.textContent = String(countProjects(button.dataset.filter)).padStart(2, "0");

  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    const visibleCount = countProjects(filter);

    filterButtons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    projects.forEach((project) => {
      const isVisible = filter === "all" || project.dataset.category.split(/\s+/).includes(filter);
      project.hidden = !isVisible;
    });

    if (filterStatus) filterStatus.textContent = `프로젝트 ${visibleCount}개를 표시합니다.`;
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hero = document.querySelector(".hero");
const heroVisual = hero?.querySelector(".hero-visual");
if (hero) {
  window.requestAnimationFrame(() => hero.classList.add("is-entered"));
}

if ("IntersectionObserver" in window && !reduceMotion) {
  document.documentElement.classList.add("has-reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}

const root = document.documentElement;
const backToTop = document.querySelector(".back-to-top");
const siteHeader = document.querySelector(".site-header");
let scrollFrame = 0;

const updateScrollState = () => {
  scrollFrame = 0;
  const scrollableHeight = root.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  root.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);

  if (hero && heroVisual && !reduceMotion) {
    const heroProgress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    heroVisual.style.setProperty("--scroll-shift", `${-heroProgress * 24}px`);
    heroVisual.style.setProperty("--scroll-scale", String(1 - heroProgress * 0.025));
    hero.querySelector(".hero__copy")?.style.setProperty("--text-shift", `${-heroProgress * 14}px`);
  }

  if (backToTop) {
    const isVisible = window.scrollY > 480;
    backToTop.classList.toggle("is-visible", isVisible);
    backToTop.setAttribute("aria-hidden", String(!isVisible));
    backToTop.tabIndex = isVisible ? 0 : -1;
  }
};

const requestScrollUpdate = () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
};

const refreshScrollState = () => {
  window.requestAnimationFrame(() => window.requestAnimationFrame(updateScrollState));
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
window.addEventListener("pageshow", refreshScrollState);
window.addEventListener("hashchange", refreshScrollState);
window.addEventListener("load", refreshScrollState, { once: true });
updateScrollState();

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
if (hero && heroVisual && finePointer.matches && !reduceMotion) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroVisual.style.setProperty("--pointer-x", `${offsetX * 8}px`);
    heroVisual.style.setProperty("--pointer-y", `${offsetY * 8}px`);
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--pointer-x", "0px");
    heroVisual.style.setProperty("--pointer-y", "0px");
  });
}
