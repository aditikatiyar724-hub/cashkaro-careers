// Why CashKaro (core values): once the frame pins to the top of the screen, scrolling down slides the heading and
// value cards sideways together until the last card lines up with the right margin, with a short hold before and after.
(function () {
  var values = document.querySelector(".values");
  var pin = values && values.querySelector(".values__pin");
  var row = values && values.querySelector(".values__row");
  if (!pin || !row) return;

  var root = document.documentElement;

  // Scroll (design px) the pin holds still before the slide, and the slide itself (matches .values)
  var HOLD = 150;
  var RANGE = 1298.6;

  var ticking = false;

  function render() {
    ticking = false;
    var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
    // How far the pin has slid down inside .values while stuck to the top
    var stuck = (pin.getBoundingClientRect().top - values.getBoundingClientRect().top) / scale;
    var slide = Math.min(1, Math.max(0, (stuck - HOLD) / RANGE));
    row.style.setProperty("--slide", slide.toFixed(4));
  }

  function update() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  // Entrance: the heading and cards play in once its top is 40% up the screen
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      values.classList.add("is-shown");
      observer.disconnect();
    }, { rootMargin: "0px 0px -40% 0px" });
    observer.observe(values);
  } else {
    values.classList.add("is-shown");
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  render();
})();
