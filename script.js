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
    if (window.ScrollTrigger) ScrollTrigger.refresh();
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

  if (window.gsap && window.ScrollTrigger) {
    document.documentElement.classList.add("has-gsap");
    gsap.registerPlugin(ScrollTrigger);

    const heroCopy = document.querySelector(".hero__copy");
    const heroVisual = document.querySelector(".hero-visual");
    const heroLines = gsap.utils.toArray(".hero__line");
    const revealItems = gsap.utils.toArray(".reveal").filter(
      (element) => element !== heroCopy && element !== heroVisual
    );

    if (heroCopy) {
      gsap.fromTo(heroCopy, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    if (heroLines.length) {
      gsap.fromTo(heroLines, { yPercent: 110, autoAlpha: 0 }, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.12,
        ease: "power4.out",
      });
    }

    if (heroVisual) {
      gsap.fromTo(heroVisual, { autoAlpha: 0, y: 30, scale: 0.98 }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1,
        delay: 0.18,
        ease: "power3.out",
      });

      const heroImage = heroVisual.querySelector("img");
      if (heroImage) {
        gsap.fromTo(heroImage, { yPercent: -4 }, {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: heroVisual,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }
    }

    revealItems.forEach((element) => {
      gsap.fromTo(element, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      });
    });
  } else {
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
}

const root = document.documentElement;
const backToTop = document.querySelector(".back-to-top");
let scrollFrame = 0;

const updateScrollProgress = () => {
  scrollFrame = 0;
  const scrollableHeight = root.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  root.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));

  if (backToTop) {
    const isVisible = window.scrollY > 480;
    backToTop.classList.toggle("is-visible", isVisible);
    backToTop.setAttribute("aria-hidden", String(!isVisible));
    backToTop.tabIndex = isVisible ? 0 : -1;
  }
};

const requestScrollUpdate = () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollProgress);
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollProgress();

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1000px)");

if (hero && heroVisual && finePointer.matches && !reduceMotion) {
  const moveX = window.gsap ? gsap.quickTo(heroVisual, "x", { duration: 0.6, ease: "power3.out" }) : null;
  const moveY = window.gsap ? gsap.quickTo(heroVisual, "y", { duration: 0.6, ease: "power3.out" }) : null;

  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (moveX && moveY) {
      moveX(offsetX * -12);
      moveY(offsetY * -12);
    } else {
      heroVisual.style.setProperty("--parallax-x", `${offsetX * -12}px`);
      heroVisual.style.setProperty("--parallax-y", `${offsetY * -12}px`);
    }
  });

  hero.addEventListener("pointerleave", () => {
    if (moveX && moveY) {
      moveX(0);
      moveY(0);
    } else {
      heroVisual.style.setProperty("--parallax-x", "0px");
      heroVisual.style.setProperty("--parallax-y", "0px");
    }
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
    if (!event.target.closest("#work")) {
      cursor.classList.remove("is-active");
      if (cursorLabel) cursorLabel.textContent = "";
      return;
    }
    if (event.target.closest(".filter-button")) {
      cursor.classList.remove("is-active");
      if (cursorLabel) cursorLabel.textContent = "";
      return;
    }

    const target = event.target.closest(".project__visual, .project__details summary");
    cursor.classList.toggle("is-active", Boolean(target));
    if (!cursorLabel) return;
    cursorLabel.textContent = target
      ? target.matches(".project__visual") ? "VIEW PROJECT" : "OPEN"
      : "";
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) cursor.classList.remove("is-visible", "is-active");
  });
}
