// Floating hero photos: hold and drag a photo (with its pin) to reposition it.
(function () {
  var root = document.documentElement;

  ["right", "left"].forEach(function (side) {
    var parts = [
      document.querySelector(".photo--" + side),
      document.querySelector(".photo-clip--" + side)
    ];

    parts.forEach(function (handle) {
      handle.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);

        // The page is fitted with CSS zoom, so convert screen px to design px
        var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
        var startX = e.clientX;
        var startY = e.clientY;
        var origins = parts.map(function (el) {
          el.classList.add("is-dragging");
          var style = getComputedStyle(el);
          return { left: parseFloat(style.left), top: parseFloat(style.top) };
        });

        function move(ev) {
          var dx = (ev.clientX - startX) / scale;
          var dy = (ev.clientY - startY) / scale;
          parts.forEach(function (el, i) {
            el.style.left = origins[i].left + dx + "px";
            el.style.top = origins[i].top + dy + "px";
          });
        }

        function end() {
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", end);
          handle.removeEventListener("pointercancel", end);
          parts.forEach(function (el) { el.classList.remove("is-dragging"); });
        }

        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", end);
        handle.addEventListener("pointercancel", end);
      });
    });
  });
})();
