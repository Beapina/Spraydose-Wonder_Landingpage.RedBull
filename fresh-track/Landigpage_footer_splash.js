window.addEventListener("DOMContentLoaded", () => {
startVideos();
initAccessorySlider();
initWorkshopSlider();

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const stage = document.querySelector("#canStage");
  const heroStart = document.querySelector("#heroStart");
  const redBox = document.querySelector("#redBox");
  const blackMask = document.querySelector("#blackMask");
  const featureSteps = gsap.utils.toArray(".feature-step");

  if (!stage || !heroStart || !redBox) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    /*
      Saubere Version:
      - Es gibt nur eine Dose: #canStage
      - Die Dose bewegt sich nur auf der Y-Achse
      - Nach dem Einparken bleibt die Dose stehen
      - Der rote Kasten wächst dahinter weiter
      - Kein boxCan, kein blackCutMask, kein autoAlpha-Handoff
    */

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
      // Ziel: Dose bleibt mittig im sichtbaren Eigenschaften-Bereich stehen.
      return window.innerHeight / 2 - stageHeight() / 2+60;
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
        scaleX: 0.92,
        scaleY: 0.92,
        height: "var(--red-box-closed-height)",
        opacity: 1,
        visibility: "visible",
        transformOrigin: "center center"
      });

      if (blackMask) {
        gsap.set(blackMask, {
          y: 0,
          autoAlpha: 1
        });
      }
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
        onRefreshInit: prepare,
        onRefresh: prepare
      }
    });

    mainST = tl.scrollTrigger;

    // Phase 1: Dose fährt NUR nach unten. X bleibt immer die rote-Kasten-Achse.
    tl.to(stage, {
  x: () => axisX(),
  y: () => targetY(),
  scale: 0.92,
  ease: "none",
  duration: 0.38
}, 0);

    // Roter Kasten kommt gleichzeitig von unten hoch.
    tl.to(redBox, {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      ease: "none",
      duration: 0.38
    }, 0);

    // Phase 2: Dose bleibt stehen. Nur der rote Kasten wächst.
    tl.to(redBox, {
      height: "var(--red-box-open-height)",
      scaleX: 1.18,
      scaleY: 1.12,
      ease: "none",
      duration: 0.42
    }, 0.38);

    if (blackMask) {
      tl.to(blackMask, {
        y: -70,
        ease: "none",
        duration: 0.42
      }, 0.38);
    }

    // Phase 3: Hold. Dose bleibt sichtbar und unverändert.
    tl.to({}, { duration: 0.20 });

    featureSteps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: "#features",
        start: () => `top+=${window.innerHeight * (0.70 + index * 0.5)} center`,
        end: () => `top+=${window.innerHeight * (1.16 + index * 0.5)} center`,
        onEnter: () => step.classList.add("is-visible"),
        onEnterBack: () => step.classList.add("is-visible"),
        onLeaveBack: () => step.classList.remove("is-visible")
      });
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
    gsap.set(stage, { clearProps: "all" });
    gsap.set(redBox, { clearProps: "transform,height,opacity,visibility" });
    featureSteps.forEach((step) => step.classList.add("is-visible"));
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
  if (!row || !prev || !next) return;
  prev.addEventListener("click", () => row.scrollBy({ left: -330, behavior: "smooth" }));
  next.addEventListener("click", () => row.scrollBy({ left: 330, behavior: "smooth" }));
}
function initWorkshopSlider() {
  const row = document.querySelector(".workshop-row");
  const prev = document.querySelector(".workshop-prev");
  const next = document.querySelector(".workshop-next");

  if (!row || !prev || !next) return;

  prev.addEventListener("click", () => {
    row.scrollBy({ left: -330, behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    row.scrollBy({ left: 330, behavior: "smooth" });
  });
}