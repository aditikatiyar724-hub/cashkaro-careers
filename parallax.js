// Mouse parallax for the hero: writes an eased cursor offset that the layers translate by.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var track = document.querySelector(".hero-track");

  var EASE = 0.07; // fraction of the remaining distance covered each frame

  var target = { x: 0, y: 0 };
  var current = { x: 0, y: 0 };
  var running = false;

  function tick() {
    current.x += (target.x - current.x) * EASE;
    current.y += (target.y - current.y) * EASE;

    if (Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001) {
      current.x = target.x;
      current.y = target.y;
      running = false;
    }

    track.style.setProperty("--px", current.x.toFixed(4));
    track.style.setProperty("--py", current.y.toFixed(4));
    if (running) requestAnimationFrame(tick);
  }

  function aim(x, y) {
    target.x = x;
    target.y = y;
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    // Hold still while a photo is dragged so it stays under the cursor
    if (document.querySelector(".is-dragging")) return;
    aim(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1
    );
  }, { passive: true });

  // Drift back to centre when the cursor leaves the window
  document.documentElement.addEventListener("mouseleave", function () {
    aim(0, 0);
  });
})();
