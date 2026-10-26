(function () {
  "use strict";
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = document.querySelector(".scroll-progress span");

  if (!reduce && progress) {
    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.35 }
    });
  }

  if (reduce) {
    document.documentElement.classList.add("motion-reduced");
    return;
  }

  var intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro.fromTo(".sp-hero-bg-image", { scale: 1.13, autoAlpha: 0.45 }, { scale: 1.03, autoAlpha: 1, duration: 2.2, ease: "power2.out" })
    .from(".sp-hero-content .kicker", { autoAlpha: 0, x: -24, duration: 0.65 }, "-=1.6")
    .from(".sp-title-line > span", { yPercent: 118, rotateX: -14, autoAlpha: 0, transformOrigin: "left bottom", duration: 1.1, stagger: 0.14, ease: "expo.out" }, "-=1.25")
    .from(".sp-hero-content .lead, .sp-hero-content .hero-actions, .sp-hero-note", { autoAlpha: 0, y: 24, filter: "blur(7px)", duration: 0.75, stagger: 0.12, clearProps: "filter" }, "-=0.62")
    .from(".sp-hero-scroll", { autoAlpha: 0, y: -12, duration: 0.65 }, "-=0.3");
  intro.call(function () { gsap.to(".sp-hero-bg-image", { scale: 1.1, duration: 18, ease: "sine.inOut", yoyo: true, repeat: -1 }); });
  var hero = document.querySelector(".sp-hero");
  var heroImage = document.querySelector(".sp-hero-bg-image");
  if (hero && heroImage) {
    gsap.to(heroImage, { yPercent: 7, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.7 } });
  }

  // Section headings arrive as a soft focus-to-sharp reveal, then content follows in a short cascade.
  gsap.utils.toArray("[data-motion-section]:not([data-motion-section='hero'])").forEach(function (section) {
    var title = section.querySelector("h2");
    var kicker = section.querySelector(".kicker");
    var introCopy = section.querySelector(":scope > .wrap > p:not(.kicker), .sp-story-heading > p:not(.kicker), .sp-impact-intro > p:not(.kicker), .sp-programs-head > p:not(.kicker), .sp-resources-heading > p:not(.kicker), .sp-team-intro > p:not(.kicker), .sp-involved-heading > p:not(.kicker), .sp-contact-inner > p:not(.kicker), .sp-story-deck, .sp-mission-intro");
    var targets = [kicker, title, introCopy].filter(Boolean);
    if (targets.length) {
      gsap.fromTo(targets,
        { autoAlpha: 0, y: 34, filter: "blur(10px)", clipPath: "inset(0 0 14% 0)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 1, stagger: 0.12, ease: "power3.out", clearProps: "clipPath,filter", scrollTrigger: { trigger: section, start: "top 76%", once: true } }
      );
    }

    var groups = section.querySelectorAll(".sp-timeline article, .sp-impact-stats article, .sp-program-grid article, .sp-training-points article, .sp-team-cards article, .sp-action-list > a, .sp-resource-list > a, .sp-mission-pillars article");
    if (groups.length) {
      gsap.fromTo(groups,
        { autoAlpha: 0, y: 46, rotateX: 8, transformPerspective: 850, transformOrigin: "50% 100%", filter: "blur(6px)" },
        { autoAlpha: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 0.95, stagger: { each: 0.11, from: "start" }, ease: "back.out(1.15)", clearProps: "filter", scrollTrigger: { trigger: groups[0], start: "top 82%", once: true } }
      );
    }

    var visual = section.querySelector("[data-motion='parallax'] img, .sp-grow-grid img");
    if (visual) {
      gsap.fromTo(visual, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.02, ease: "none", scrollTrigger: { trigger: visual.closest("figure") || section, start: "top bottom", end: "bottom top", scrub: 0.7 } });
    }
  });

  gsap.utils.toArray('[data-motion="rise"]').forEach(function (item) {
    gsap.fromTo(item, { autoAlpha: 0, y: 30, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", clearProps: "filter", scrollTrigger: { trigger: item, start: "top 78%", once: true } });
  });

  // A line draws through the story timeline in sync with the reader's scroll.
  var timeline = document.querySelector(".sp-timeline");
  if (timeline) {
    gsap.fromTo(timeline, { "--timeline-progress": 0 }, { "--timeline-progress": 1, ease: "none", scrollTrigger: { trigger: timeline, start: "top 72%", end: "bottom 44%", scrub: 0.6 } });
  }

  // The impact figures count up once as the metrics enter view.
  gsap.utils.toArray(".sp-impact-stats strong").forEach(function (node) {
    var target = Number(node.textContent.replace(/[^0-9]/g, ""));
    var counter = { value: 0 };
    gsap.to(counter, { value: target, duration: 1.8, ease: "power2.out", snap: { value: 1 }, scrollTrigger: { trigger: node, start: "top 88%", once: true }, onUpdate: function () { node.textContent = Math.round(counter.value).toLocaleString("en-US"); } });
  });

  // Pointer-driven magnetic lift and controlled 3D tilt for interactive cards.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    gsap.utils.toArray(".sp-program-grid article, .sp-action-list > a, .sp-team-cards article").forEach(function (card) {
      card.style.transformStyle = "preserve-3d";
      card.addEventListener("pointermove", function (event) {
        var bounds = card.getBoundingClientRect();
        var px = (event.clientX - bounds.left) / bounds.width - 0.5;
        var py = (event.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(card, { rotationY: px * 6, rotationX: py * -5, y: -5, scale: 1.012, duration: 0.45, ease: "power2.out", overwrite: "auto" });
      });
      card.addEventListener("pointerleave", function () {
        gsap.to(card, { rotationY: 0, rotationX: 0, y: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.55)", overwrite: "auto" });
      });
    });

    gsap.utils.toArray(".btn, .sp-resource-list > a, .sp-contact-link").forEach(function (link) {
      link.addEventListener("pointermove", function (event) {
        var box = link.getBoundingClientRect();
        gsap.to(link, { x: ((event.clientX - box.left) / box.width - 0.5) * 9, y: ((event.clientY - box.top) / box.height - 0.5) * 6, duration: 0.28, ease: "power3.out", overwrite: "auto" });
      });
      link.addEventListener("pointerleave", function () { gsap.to(link, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1, 0.45)", overwrite: "auto" }); });
    });

    gsap.utils.toArray(".sp-mission-visual").forEach(function (figure) {
      var image = figure.querySelector("img");
      if (!image) return;
      figure.addEventListener("pointermove", function (event) {
        var rect = figure.getBoundingClientRect();
        gsap.to(image, { x: ((event.clientX - rect.left) / rect.width - 0.5) * -10, y: ((event.clientY - rect.top) / rect.height - 0.5) * -8, scale: 1.04, duration: 0.7, ease: "power2.out", overwrite: "auto" });
      });
      figure.addEventListener("pointerleave", function () { gsap.to(image, { x: 0, y: 0, scale: 1, duration: 1, ease: "power3.out", overwrite: "auto" }); });
    });
  }

  window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
})();
