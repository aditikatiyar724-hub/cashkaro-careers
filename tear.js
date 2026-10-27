// Why CashKaro: the bottom of the store photo burns away like the hero's torn paper. The white below the torn
// edge climbs into the photo as the section scrolls up, and the edge burns forward unevenly as it moves
// (same edge, burn fronts and #tear-burn glow as paper.js). Runs before paper.js so it copies the untouched edge.
(function () {
  var why = document.querySelector(".why");
  var tear = why && why.querySelector(".why__tear");
  var heroEdge = document.querySelector(".paper__body");
  if (!tear || !heroEdge) return;

  var root = document.documentElement;
  var body = tear.querySelector(".why__tear-body");
  var glow = tear.querySelector("#why-tear-path");

  // The hero tear's edge points ([x, y] pairs), its closing corners dropped
  var nums = heroEdge.getAttribute("d").match(/-?[\d.]+/g).map(Number);
  var edge = [];
  for (var i = 0; i < nums.length; i += 2) if (nums[i + 1] < 200) edge.push(nums[i], nums[i + 1]);

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Where the edge starts (down the 440px svg) and how far (design px) it climbs as the photo crosses the viewport
  var OFFSET = 270;
  var RISE = still ? 0 : 200;
  // Svg height; the white closes 40px below it (clipped off) so the glow only runs along the tear
  var HEIGHT = 440;

  // How far (design px) each point has burned ahead at travel t (matches paper.js)
  function burnLift(x, t) {
    var lead = (1 + Math.sin(t / 380)) / 2;
    var fromRight = (1 + Math.sin(x / 230 + t / 70)) * lead;
    var fromLeft = (1 + Math.sin(x / 310 - t / 95)) * (1 - lead);
    var flicker = Math.sin(x / 70 + t / 60) * Math.sin(x / 140 - t / 90);
    return 16 * (fromRight + fromLeft) + 3 * flicker;
  }

  function draw(rise, t) {
    var d = "M-20 " + (HEIGHT + 40);
    for (var i = 0; i < edge.length; i += 2) {
      var y = edge[i + 1] + OFFSET - rise * RISE - (still ? 0 : Math.max(0, burnLift(edge[i], t)));
      d += " L" + edge[i] + " " + y.toFixed(1);
    }
    d += " L1460 " + (HEIGHT + 40) + " Z";
    body.setAttribute("d", d);
    glow.setAttribute("d", d);
  }

  var ticking = false;
  var burnT = null;

  function render() {
    ticking = false;
    var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
    // Bottom of the photo in the viewport (design px): rise goes 0 → 1 as it travels from the bottom of the screen to the top
    var bottom = why.getBoundingClientRect().bottom / scale;
    var viewHeight = window.innerHeight / scale;
    var rise = Math.min(1, Math.max(0, 1 - bottom / viewHeight));

    // Ease the burn toward the scroll position so wheel steps glide instead of jumping
    burnT = burnT === null ? bottom : burnT + (bottom - burnT) * 0.08;
    if (Math.abs(bottom - burnT) > 0.1) update();
    else burnT = bottom;
    draw(rise, burnT);
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
