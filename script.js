document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader = document.querySelector("#loader");
if (loader) {
  const rootElement = document.documentElement;
  const progressFill = loader.querySelector("#loaderFill");
  const progressLabel = loader.querySelector("#loaderPercent");
  const progressStatus = loader.querySelector("#loaderStatus");
  const progressStartedAt = performance.now();
  let progress = 0;
  let countdownStarted = false;

  const renderProgress = (value) => {
    progress = Math.max(progress, Math.min(100, Math.round(value)));
    progressFill.style.transform = `scaleX(${progress / 100})`;
    progressLabel.textContent = `${String(progress).padStart(2, "0")}%`;
  };

  renderProgress(progress);
  const progressTimer = window.setInterval(() => {
    const elapsed = Math.min((performance.now() - progressStartedAt) / 2600, 1);
    renderProgress(Math.min(90, elapsed * 90));
  }, 80);

  const startLoaderCountdown = () => {
    if (countdownStarted) return;
    countdownStarted = true;
    window.clearInterval(progressTimer);

    const progressAtReady = progress;

    if (reduceMotion) {
      renderProgress(100);
      loader.classList.add("is-ready");
      progressStatus.textContent = "PORTFOLIO READY";
    } else {
      const progressReadyAt = performance.now();
      const readyProgressTimer = window.setInterval(() => {
        const completion = Math.min((performance.now() - progressReadyAt) / 1400, 1);
        renderProgress(progressAtReady + (100 - progressAtReady) * completion);
        if (completion === 1) {
          window.clearInterval(readyProgressTimer);
          loader.classList.add("is-ready");
          progressStatus.textContent = "PORTFOLIO READY";
        }
      }, 80);
    }

    window.setTimeout(() => {
      if (reduceMotion) {
        loader.remove();
        rootElement.classList.remove("is-loading");
        return;
      }

      loader.classList.add("is-exiting");
      window.setTimeout(() => {
        loader.remove();
        rootElement.classList.remove("is-loading");
      }, 850);
    }, reduceMotion ? 1400 : 2000);
  };

  rootElement.classList.add("is-loading");
  const fallbackTimer = window.setTimeout(startLoaderCountdown, 2600);
  if (document.readyState === "complete") {
    window.clearTimeout(fallbackTimer);
    startLoaderCountdown();
  } else {
    window.addEventListener("load", () => {
      window.clearTimeout(fallbackTimer);
      startLoaderCountdown();
    }, { once: true });
  }
}

const menuButton = document.querySelector(".nav-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuButton && navigation) {
  const closeMenu = (returnFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    if (returnFocus) menuButton.focus();
  };

  const syncMenuState = () => {
    const isMobile = window.matchMedia("(max-width: 960px)").matches;
    if (!isMobile) {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    }
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = navigation.contains(event.target) || menuButton.contains(event.target);
    if (!clickedInsideMenu) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  window.addEventListener("resize", syncMenuState);
  syncMenuState();
}

const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const projects = Array.from(document.querySelectorAll(".work-card[data-category]"));
const filterStatus = document.querySelector("#filter-status");
const projectPreview = document.querySelector(".work-preview");
const projectPreviewImage = projectPreview?.querySelector("img");

projects.forEach((project) => {
  const cover = project.querySelector(".work-card__cover");
  const title = project.querySelector("h3")?.textContent.trim();
  if (!cover || !title) return;

  const arrowLink = document.createElement("a");
  const arrow = document.createElement("span");
  arrowLink.className = "work-card__arrow";
  arrowLink.href = cover.href;
  arrowLink.target = cover.target;
  arrowLink.rel = cover.rel;
  arrowLink.setAttribute("aria-label", `${title} 프로젝트 열기`);
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  arrowLink.appendChild(arrow);
  project.appendChild(arrowLink);
});

if (projectPreview && projectPreviewImage && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const positionPreview = (event) => {
    const halfWidth = projectPreview.offsetWidth / 2;
    const halfHeight = projectPreview.offsetHeight / 2;
    const x = Math.min(Math.max(event.clientX, halfWidth + 12), window.innerWidth - halfWidth - 12);
    const y = Math.min(Math.max(event.clientY, halfHeight + 12), window.innerHeight - halfHeight - 12);
    projectPreview.style.left = `${x}px`;
    projectPreview.style.top = `${y}px`;
  };

  projects.forEach((project) => {
    project.addEventListener("pointerenter", (event) => {
      const source = project.querySelector(".work-card__image")?.getAttribute("src");
      if (!source) return;
      projectPreviewImage.src = source;
      projectPreview.classList.add("is-visible");
      positionPreview(event);
    });
    project.addEventListener("pointermove", positionPreview);
    project.addEventListener("pointerleave", () => projectPreview.classList.remove("is-visible"));
    project.addEventListener("focusin", () => {
      const source = project.querySelector(".work-card__image")?.getAttribute("src");
      if (!source) return;
      projectPreviewImage.src = source;
      projectPreview.classList.add("is-visible");
      const bounds = project.getBoundingClientRect();
      positionPreview({ clientX: window.innerWidth * 0.72, clientY: bounds.top + bounds.height / 2 });
    });
    project.addEventListener("focusout", (event) => {
      if (!project.contains(event.relatedTarget)) projectPreview.classList.remove("is-visible");
    });
  });
}

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

    if (filterStatus) {
      const filterLabel = button.childNodes[0].textContent.trim();
      filterStatus.textContent = `${filterLabel} 프로젝트 ${visibleCount}개를 표시합니다.`;
    }
  });
});

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
const currentSectionLabel = document.querySelector("[data-current-section]");
const scrollIndex = document.querySelector(".scroll-index");
const trackedSections = Array.from(document.querySelectorAll("main > section[id]:not(#top), footer[id]"));
const sectionNavigationLinks = Array.from(document.querySelectorAll(".site-nav a[href^=\"#\"], .contact__nav a[href^=\"#\"]"));
let scrollFrame = 0;

const updateScrollState = () => {
  scrollFrame = 0;
  const scrollableHeight = root.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  root.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 24);
  scrollIndex?.classList.toggle("is-visible", hero && window.scrollY > hero.offsetHeight * 0.65);

  const markerLine = window.innerHeight * 0.46;
  const activeSection = trackedSections.find((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= markerLine && bounds.bottom > markerLine;
  });
  if (activeSection) {
    const sectionIndex = trackedSections.indexOf(activeSection);
    if (currentSectionLabel) currentSectionLabel.textContent = String(sectionIndex + 1).padStart(2, "0");
    sectionNavigationLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${activeSection.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

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

const aboutPanel = document.querySelector("[data-about-panel]");
const contactSection = document.querySelector(".contact");
const contactPanel = contactSection?.querySelector(".contact__aside");
if (finePointer.matches && !reduceMotion) {
  const setTilt = (element, event, maxAngle) => {
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.setProperty("--tilt-x", `${x * maxAngle}deg`);
    element.style.setProperty("--tilt-y", `${-y * maxAngle}deg`);
  };
  const resetTilt = (element) => {
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
  };

  aboutPanel?.addEventListener("pointermove", (event) => setTilt(aboutPanel, event, 4));
  aboutPanel?.addEventListener("pointerleave", () => resetTilt(aboutPanel));

  contactSection?.addEventListener("pointermove", (event) => {
    const bounds = contactSection.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    contactSection.style.setProperty("--footer-x", `${Math.round(x * 100)}%`);
    contactSection.style.setProperty("--footer-y", `${Math.round(y * 100)}%`);
    if (contactPanel) {
      const panelBounds = contactPanel.getBoundingClientRect();
      const panelX = (event.clientX - panelBounds.left) / panelBounds.width - 0.5;
      const panelY = (event.clientY - panelBounds.top) / panelBounds.height - 0.5;
      const insidePanel = panelX >= -0.5 && panelX <= 0.5 && panelY >= -0.5 && panelY <= 0.5;
      contactPanel.style.setProperty("--aside-x", `${insidePanel ? panelX * 8 : 0}px`);
      contactPanel.style.setProperty("--aside-y", `${insidePanel ? panelY * 8 : 0}px`);
    }
  }, { passive: true });

  contactSection?.addEventListener("pointerleave", () => {
    contactSection.style.setProperty("--footer-x", "82%");
    contactSection.style.setProperty("--footer-y", "45%");
    contactPanel?.style.setProperty("--aside-x", "0px");
    contactPanel?.style.setProperty("--aside-y", "0px");
  });
}
