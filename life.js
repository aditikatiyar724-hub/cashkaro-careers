// Life at CashKaro: follows Why CashKaro, then the pinned strip slides sideways (left end of the design
// to the right end) as the user scrolls. Each piece soft-appears once it is on screen. The black text starts faint and inks in
// word by word as the strip slides. Every piece also drifts at its own depth (parallax): ahead of or behind
// the strip as it slides, and up into place while the section scrolls into view.
(function () {
  var section = document.querySelector(".life");
  var strip = document.querySelector(".life__strip");
  if (!section || !strip) return;

  var root = document.documentElement;
  var pending = Array.prototype.slice.call(section.querySelectorAll(".life-reveal"));

  // Scroll into the section (design px) where the strip starts sliding (as soon as it pins) and how far it
  // then scrolls to slide through: 1:1 with the strip's overflow (3324 - 1440, matches .life__strip)
  var START = 0;
  var RANGE = 3324 - 1440;

  // Text ink: each block darkens from 50% to full black over INK_SPAN px of scroll, starting once the
  // strip has slid its left edge to INK_FROM of the screen width (the first block starts straight away)
  var INK_SPAN = 600;
  var INK_FROM = 0.6;

  // A piece's left edge within the strip (design px), through its parallax layer and group
  function stripLeft(el) {
    var x = 0;
    for (; el && el !== strip; el = el.offsetParent) x += el.offsetLeft;
    return x;
  }
  var inks = Array.prototype.map.call(strip.querySelectorAll(".life__text"), function (block) {
    var words = [];
    var parts = block.textContent.split(/(\s+)/);
    block.textContent = "";
    parts.forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        block.appendChild(document.createTextNode(part));
        return;
      }
      var word = document.createElement("span");
      word.className = "life__word";
      word.textContent = part;
      block.appendChild(word);
      words.push(word);
    });
    return { words: words, offset: Math.max(0, stripLeft(block) - INK_FROM * 1440), last: -1 };
  });

  // Parallax: each layer shifts by its depth × how far its piece has travelled past its resting spot on
  // screen, so it sits exactly where Figma puts it at rest. Pieces on the first screen rest where they
  // start; later ones rest as they come in at the right edge. Positive depth drifts ahead (nearer), negative lags.
  // While the section scrolls up into view (ENTER px), each layer also rises into place by its depth × DRIFT_Y.
  var DRIFT_Y = 400;
  var ENTER = 900;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Layers outside the strip (the title) stay put sideways and only rise into place.
  var layers = still ? [] : Array.prototype.map.call(section.querySelectorAll(".life-layer"), function (layer) {
    var piece = layer.firstElementChild;
    var fixed = !strip.contains(layer);
    var centre = fixed ? 0 : stripLeft(piece) + piece.offsetWidth / 2;
    return { el: layer, depth: parseFloat(layer.dataset.depth) || 0, centre: centre, rest: Math.min(centre, 1440), fixed: fixed };
  });

  var ticking = false;

  function render() {
    ticking = false;
    var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
    var into = -section.getBoundingClientRect().top / scale;
    var slide = Math.min(1, Math.max(0, (into - START) / RANGE));
    strip.style.setProperty("--slide", slide);

    var shift = slide * RANGE;
    var rise = Math.min(1, Math.max(0, -into / ENTER));
    layers.forEach(function (layer) {
      var travelled = layer.fixed ? 0 : layer.centre - shift - layer.rest;
      layer.el.style.setProperty("--px", (layer.depth * travelled).toFixed(2));
      layer.el.style.setProperty("--py", (Math.abs(layer.depth) * DRIFT_Y * rise).toFixed(2));
    });

    // Ink sweeps through the words: each word fades from 50% to black just after the one before it
    inks.forEach(function (ink) {
      var p = Math.min(1, Math.max(0, (into - START - ink.offset) / INK_SPAN));
      if (p === ink.last) return;
      ink.last = p;
      var n = ink.words.length;
      for (var i = 0; i < n; i++) {
        var t = Math.min(1, Math.max(0, p * (n + 3) - i) / 4);
        ink.words[i].style.setProperty("--ink", (0.5 + 0.5 * t).toFixed(3));
      }
    });

    if (!pending.length) return;
    var viewWidth = window.innerWidth / scale;
    var viewHeight = window.innerHeight / scale;
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      var middle = (r.top + r.bottom) / 2 / scale;
      var left = r.left / scale;
      var right = r.right / scale;
      // Far enough onto the screen to be noticed
      if (middle < viewHeight * 0.85 && left < viewWidth * 0.85 && right > 0) {
        el.classList.add("is-shown");
        return false;
      }
      return true;
    });
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
