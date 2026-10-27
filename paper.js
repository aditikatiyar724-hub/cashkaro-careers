// Torn paper: rises faster than the scroll (parallax) so the burning edge eats into the background,
// drifts the edge flecks so they flicker, and burns the torn edge forward unevenly as the paper moves.
(function () {
  var paper = document.querySelector(".paper");
  if (!paper) return;

  var root = document.documentElement;
  var bg = document.querySelector(".hero__bg");
  var drift = paper.querySelector(".paper__burn-drift");

  // Extra distance (design px) the tear climbs as it crosses the viewport (matches the translate in .paper)
  var RISE = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400;

  // Torn edge points ([x, y] pairs from the path) so the burn front can advance unevenly
  var body = paper.querySelector(".paper__body");
  var edge = body.getAttribute("d").match(/-?[\d.]+/g).map(Number);

  // The sheet is clipped to the edge too (bounding-box units; the tear's y is the sheet's y), straight along the bottom
  var sheetEdge = paper.querySelector(".paper__sheet-edge");
  var SHEET_HEIGHT = 4046.8;
  var burnMotion = RISE > 0;

  // How far (design px) each point of the edge has burned ahead at travel t: two fronts sweep in
  // opposite directions and take turns leading, so the burn creeps in from the right, then the left
  function burnLift(x, t) {
    var lead = (1 + Math.sin(t / 380)) / 2;
    var fromRight = (1 + Math.sin(x / 230 + t / 70)) * lead;
    var fromLeft = (1 + Math.sin(x / 310 - t / 95)) * (1 - lead);
    var flicker = Math.sin(x / 70 + t / 60) * Math.sin(x / 140 - t / 90);
    return 16 * (fromRight + fromLeft) + 3 * flicker;
  }

  // Edge points burned to travel t (the closing corners below the tear are left alone)
  function burnPoints(t) {
    var points = [];
    for (var i = 0; i < edge.length; i += 2) {
      var x = edge[i];
      var y = edge[i + 1];
      if (y < 200) y -= Math.max(0, burnLift(x, t));
      points.push(x, y);
    }
    return points;
  }

  function burnEdge(t) {
    var p = burnPoints(t);
    var d = "M" + p[0] + " " + p[1];
    var clip = "";
    for (var i = 0; i < p.length; i += 2) {
      if (i) d += " L" + p[i] + " " + p[i + 1].toFixed(1);
      if (p[i + 1] < 200) clip += " L" + (p[i] / 1440).toFixed(5) + " " + (p[i + 1] / SHEET_HEIGHT).toFixed(5);
    }
    body.setAttribute("d", d + " Z");
    sheetEdge.setAttribute("d", "M" + clip.slice(2) + " L1 1 L0 1 Z");
  }

  var ticking = false;
  var burnT = null;

  function render() {
    ticking = false;
    var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
    // Rise progress from the untranslated position (design px): 0 when the tear enters at the bottom, 1 at the top
    var rise = parseFloat(paper.style.getPropertyValue("--rise")) || 0;
    var viewTop = paper.getBoundingClientRect().top / scale + rise * RISE;
    var viewHeight = window.innerHeight / scale;
    rise = Math.min(1, Math.max(0, 1 - viewTop / viewHeight));
    paper.style.setProperty("--rise", rise);

    var top = paper.getBoundingClientRect().top;

    // Shift the fleck noise by how far the paper has moved against the background (wrapped to stay small)
    var d = bg ? (bg.getBoundingClientRect().top - top) / scale : 0;
    drift.setAttribute("dy", ((d * 0.6) % 40).toFixed(1));

    if (burnMotion) {
      // Ease the burn toward the scroll position so wheel steps glide instead of jumping
      burnT = burnT === null ? d : burnT + (d - burnT) * 0.08;
      if (Math.abs(d - burnT) > 0.1) update();
      else burnT = d;
      burnEdge(burnT);
    }
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
