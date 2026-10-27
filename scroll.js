// Scroll transition: the background stays pinned while the content scrolls normally over it.
// As the cards scroll up, the label becomes the chalk heading.
(function () {
  var root = document.documentElement;
  var track = document.querySelector(".hero-track");

  // Scroll distance (design px) that brings the card grid to its Figma position (matches .hero-track)
  var SCROLL_RANGE = 506.9;

  var ticking = false;
  // Once the transition has completed it stays completed; scrolling back up doesn't reverse it
  var spread = false;

  function clamp(v) {
    return Math.min(1, Math.max(0, v));
  }

  // Progress through a sub-range of the scroll, eased in and out
  function segment(p, from, to) {
    var t = clamp((p - from) / (to - from));
    return t * t * (3 - 2 * t);
  }

  function render() {
    ticking = false;
    var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
    var p = clamp(window.scrollY / (SCROLL_RANGE * scale));
    if (p >= 1) spread = true;
    if (spread) p = 1;

    track.style.setProperty("--move", segment(p, 0, 1));
    track.style.setProperty("--swap", segment(p, 0.35, 0.85));
  }

  function update() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  render();
})();
