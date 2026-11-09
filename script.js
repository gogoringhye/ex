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
const projects = Array.from(document.querySelectorAll(".project[data-category]"));
const filterStatus = document.querySelector("#filter-status");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    projects.forEach((project) => {
      const isVisible = filter === "all" || project.dataset.category === filter;
      project.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (filterStatus) filterStatus.textContent = `프로젝트 ${visibleCount}개를 표시합니다.`;
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".project__visual[aria-controls]").forEach((visual) => {
  const details = document.getElementById(visual.getAttribute("aria-controls"));
  const summary = details?.querySelector("summary");
  if (!details || !summary) return;

  visual.addEventListener("click", (event) => {
    event.preventDefault();
    details.open = true;
    summary.focus({ preventScroll: true });
    summary.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  });

  details.addEventListener("toggle", () => {
    visual.setAttribute("aria-expanded", String(details.open));
  });
});

if ("IntersectionObserver" in window && !reduceMotion) {
  document.documentElement.classList.add("has-reveal");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => {
    const siblings = Array.from(element.parentElement.children).filter((sibling) => sibling.classList.contains("reveal"));
    element.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(element), 4) * 85}ms`);
    revealObserver.observe(element);
  });
}

const root = document.documentElement;
let scrollFrame = 0;

const updateScrollProgress = () => {
  scrollFrame = 0;
  const scrollableHeight = root.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  root.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));
};

const requestScrollUpdate = () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollProgress);
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollProgress();

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1000px)");

if (hero && heroVisual && finePointer.matches && !reduceMotion) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroVisual.style.setProperty("--parallax-x", `${offsetX * -12}px`);
    heroVisual.style.setProperty("--parallax-y", `${offsetY * -12}px`);
  });

  hero.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--parallax-x", "0px");
    heroVisual.style.setProperty("--parallax-y", "0px");
  });
}

const cursor = document.querySelector(".custom-cursor");

if (cursor && finePointer.matches && !reduceMotion) {
  const cursorLabel = cursor.querySelector("span");
  let pointerX = 0;
  let pointerY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let cursorFrame = 0;

  const moveCursor = () => {
    cursorX += (pointerX - cursorX) * 0.22;
    cursorY += (pointerY - cursorY) * 0.22;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    if (Math.abs(pointerX - cursorX) > 0.1 || Math.abs(pointerY - cursorY) > 0.1) {
      cursorFrame = window.requestAnimationFrame(moveCursor);
    } else {
      cursorFrame = 0;
    }
  };

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (document.elementFromPoint(pointerX, pointerY)?.closest(".site-nav")) {
      cursor.classList.remove("is-visible", "is-active");
      return;
    }
    cursor.classList.add("is-visible");
    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(moveCursor);
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest(".site-nav")) {
      cursor.classList.remove("is-visible", "is-active");
      return;
    }
    const target = event.target.closest("a, button, summary");
    cursor.classList.toggle("is-active", Boolean(target));
    if (!cursorLabel) return;
    cursorLabel.textContent = target?.matches(".project__visual") ? "VIEW PROJECT" : "OPEN";
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) cursor.classList.remove("is-visible", "is-active");
  });
}
