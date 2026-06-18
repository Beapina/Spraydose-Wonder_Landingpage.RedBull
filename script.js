window.addEventListener("DOMContentLoaded", () => {
  startVideos();
  initAccessorySlider();
  initWorkshopSlider();
  initMobileMenu();
  initStorySlider();

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const stage = document.querySelector("#canStage");
  const heroStart = document.querySelector("#heroStart");
  const redBox = document.querySelector("#redBox");
  const featureCopy = document.querySelector(".feature-copy");
  const featureSteps = gsap.utils.toArray(".feature-step");

  if (!stage || !heroStart || !redBox || !featureCopy) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    let mainST;

    const rect = (el) => el.getBoundingClientRect();
    const stageWidth = () => rect(stage).width || stage.offsetWidth || 1;
    const stageHeight = () => rect(stage).height || stage.offsetHeight || 1;

    function axisX() {
      const r = rect(redBox);
      return r.left + r.width / 2 - stageWidth() / 2;
    }

    function startY() {
      return rect(heroStart).top;
    }

    function targetY() {
      return window.innerHeight / 2 - stageHeight() / 2 + 60;
    }

    function exitY() {
      return -stageHeight() - 90;
    }

    function prepare() {
      gsap.set(stage, {
        autoAlpha: 1,
        display: "block",
        x: () => axisX(),
        y: () => startY(),
        scale: 1,
        rotation: 0,
        transformOrigin: "center top"
      });

      gsap.set(redBox, {
        y: () => window.innerHeight * 0.58,
        scaleX: 0.95,
        scaleY: 0.95,
        height: "var(--red-box-closed-height)",
        opacity: 1,
        visibility: "visible",
        transformOrigin: "center center"
      });

      // Wichtig: Text und Rahmen werden am Ende NICHT künstlich nach oben geschoben.
      // Das verhindert die schwarze Lücke. Sie verschwinden normal mit dem Ende der Sticky-Section.
      gsap.set(featureCopy, { clearProps: "transform" });
      gsap.set(featureSteps, { opacity: 0.28, y: 18 });
      featureSteps.forEach((step) => step.classList.remove("is-visible"));
    }

    prepare();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#features",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(stage, { autoAlpha: 1, display: "block" }),
        onEnterBack: () => gsap.set(stage, { autoAlpha: 1, display: "block" }),
        onLeave: () => gsap.set(stage, { autoAlpha: 0 }),
        onEnterBack: () => gsap.set(stage, { autoAlpha: 1, display: "block" }),
        onRefreshInit: prepare,
        onRefresh: prepare
      }
    });

    mainST = tl.scrollTrigger;

    // 1) Dose fährt in die Mitte, roter Rahmen kommt nur hoch und bleibt noch geschlossen.
    tl.to(stage, {
      x: () => axisX(),
      y: () => targetY(),
      scale: 0.92,
      ease: "none",
      duration: 0.34
    }, 0);

    tl.to(redBox, {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      ease: "none",
      duration: 0.34
    }, 0);

    // 2) Kurzer geschlossener Hold: Dose ist drin, Box geht noch NICHT auf.
    tl.to({}, { duration: 0.24 });

    // 3) Erst jetzt öffnet sich der rote Kasten langsamer.
    tl.to(redBox, {
      height: "var(--red-box-open-height)",
      scaleX: 1.18,
      scaleY: 1.12,
      ease: "none",
      duration: 0.52
    });

    // 4) Eigenschaften nacheinander; Dose + Rahmen bleiben dabei stehen.
    featureSteps.forEach((step) => {
      tl.to(step, {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: 0.28,
        onStart: () => step.classList.add("is-visible")
      });
      tl.to({}, { duration: 0.22 });
    });

    // 5) Nach dem letzten Text noch kurz stehen lassen.
    tl.to({}, { duration: 0.18 });

    // 6) Nur die fixed Dose fährt am Ende raus.
    // Rahmen + Eigenschaften werden nicht manuell weggezogen: dadurch kommt Accessories direkt danach, ohne schwarzes Loch.
    tl.to(stage, {
      x: () => axisX(),
      y: () => exitY(),
      scale: 0.92,
      ease: "none",
      duration: 0.45
    });

    const refresh = () => {
      prepare();
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      if (mainST) mainST.kill();
    };
  });

 mm.add("(max-width: 900px)", () => {
  gsap.set(stage, { display: "none" });
  gsap.set(redBox, { display: "none" });
  gsap.set(featureCopy, { clearProps: "all" });

  gsap.set(featureSteps, {
    opacity: 0,
    y: 58,
    rotation: 1.5
  });
  featureSteps.forEach((step) => step.classList.remove("is-visible"));

  const mobileTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#features",
      start: "top top+=62",
      end: "bottom bottom",
      scrub: 0.85,
      invalidateOnRefresh: true
    }
  });

  mobileTl.fromTo(featureCopy.querySelector("h2"),
    { y: 64, opacity: 0, rotation: 1.5 },
    { y: 0, opacity: 1, rotation: 0, ease: "none", duration: 0.36 }
  );

  featureSteps.forEach((step) => {
    mobileTl.to(step, {
      opacity: 1,
      y: 0,
      rotation: 0,
      ease: "none",
      duration: 0.42,
      onStart: () => step.classList.add("is-visible"),
      onReverseComplete: () => step.classList.remove("is-visible")
    });

    // Kurzer Hold: Der Text bleibt sichtbar, während der nächste reinrollt.
    mobileTl.to({}, { duration: 0.18 });
  });

  // Am Ende bleiben alle Eigenschaften stehen, statt wieder rauszufaden.
  mobileTl.to({}, { duration: 0.45 });

  return () => {
    if (mobileTl.scrollTrigger) mobileTl.scrollTrigger.kill();
    mobileTl.kill();
  };
});

  gsap.utils.toArray(".gallery-grid img, .event-card, .product-card").forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });
});

function startVideos() {
  document.querySelectorAll("video").forEach((video) => {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");

    const playVideo = () => video.play().catch(() => {});
    if (video.readyState >= 2) playVideo();
    video.addEventListener("canplay", playVideo, { once: true });
    window.addEventListener("click", playVideo, { once: true });
    window.addEventListener("touchstart", playVideo, { once: true });
  });
}

function initAccessorySlider() {
  const row = document.querySelector(".card-row");
  const prev = document.querySelector(".acc-prev");
  const next = document.querySelector(".acc-next");
  const more = document.querySelector(".acc-more");
  if (!row) return;
  if (prev) prev.addEventListener("click", () => row.scrollBy({ left: -330, behavior: "smooth" }));
  if (next) next.addEventListener("click", () => row.scrollBy({ left: 330, behavior: "smooth" }));
  if (more) more.addEventListener("click", () => row.scrollBy({ left: Math.min(row.clientWidth * 0.9, 330), behavior: "smooth" }));
}

function initWorkshopSlider() {
  const row = document.querySelector(".workshop-row");
  const prev = document.querySelector(".workshop-prev");
  const next = document.querySelector(".workshop-next");
  const more = document.querySelector(".workshop-more");
  if (!row) return;
  if (prev) prev.addEventListener("click", () => row.scrollBy({ left: -330, behavior: "smooth" }));
  if (next) next.addEventListener("click", () => row.scrollBy({ left: 330, behavior: "smooth" }));
  if (more) more.addEventListener("click", () => row.scrollBy({ left: Math.min(row.clientWidth * 0.9, 330), behavior: "smooth" }));
}


function initMobileMenu() {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.querySelector("#mobileMenu");
  const mobileClose = document.querySelector(".mobile-close");
  const mobileLinks = document.querySelectorAll(".mobile-menu a");

  if (!burger || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  burger.addEventListener("click", openMenu);
  if (mobileClose) mobileClose.addEventListener("click", closeMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}


function initStorySlider() {
  const slides = document.querySelectorAll(".story-slide");
  if (!slides.length) return;

  let current = 0;

  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, 4200);
}