// About CashKaro: once the frame pins to the top of the screen, scrolling down slides the timeline sideways
// from card 1 ("Started in 2015") to card 2 ("CashKaro is now"), with a short hold before and after, while
// the timeline line draws itself from dot 1 to dot 2. The cards hang from their top edge like clothes on a
// line and swing as the line moves, rocking to rest when the scroll stops.
(function () {
  var about = document.querySelector(".about");
  var pin = about && about.querySelector(".about__pin");
  var track = about && about.querySelector(".about-track");
  if (!pin || !track) return;

  var root = document.documentElement;

  // Scroll (design px) the pin holds still before and after the slide, and the slide itself (matches .about)
  var HOLD = 150;
  var RANGE = 1011;

  var stuck = 0;
  var ticking = false;

  function render() {
    ticking = false;
    var scale = parseFloat(getComputedStyle(root).getPropertyValue("--page-scale")) || 1;
    // How far the pin has slid down inside .about while stuck to the top
    stuck = (pin.getBoundingClientRect().top - about.getBoundingClientRect().top) / scale;
    var slide = Math.min(1, Math.max(0, (stuck - HOLD) / RANGE));
    track.style.setProperty("--slide", slide.toFixed(4));
    // The line draws from the first scroll after pinning and reaches dot 2 as the slide ends
    var draw = Math.min(1, Math.max(0, stuck / (HOLD + RANGE)));
    track.style.setProperty("--draw", draw.toFixed(4));
    drawLine(stuck);
    wake();
  }

  // Pencil line: a low wave with a few sharp turns that ripples along as the user scrolls. The ends stay
  // pinned to the dots; the wave travels between them with the scroll.
  var linePath = document.getElementById("about-track-path");
  var LINE_W = 1015;
  var LINE_Y = 48;
  var WAVE = 14; // height of the wave either side of the dots (svg px)
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawLine(scroll) {
    if (!linePath) return;
    var phase = still ? 0 : scroll * 0.012;
    var d = "";
    for (var i = 0; i <= 120; i++) {
      var t = i / 120;
      var a = t * Math.PI * 7 - phase;
      // Mostly sine, with a touch of triangle wave for the pencil's sharper turns
      var tri = (2 / Math.PI) * Math.asin(Math.sin(a));
      var y = LINE_Y + Math.sin(t * Math.PI) * WAVE * (0.6 * Math.sin(a) + 0.4 * tri);
      d += (i ? " L" : "M") + (t * LINE_W).toFixed(1) + " " + y.toFixed(2);
    }
    linePath.setAttribute("d", d);
  }

  function update() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  // Jiggle: each card hangs from its top edge like clothes pegged on a line, and the line is the track. When
  // the track speeds up or slows down, the card swings the other way as a damped pendulum, then rocks back
  // and forth a few times as it settles. It never slides along the line, it only swings about its peg.
  // Each card has its own swing period and damping so the two never move in step.
  var cards = Array.prototype.map.call(track.querySelectorAll(".about-card"), function (el, i) {
    return {
      el: el,
      angle: 0, spin: 0, // rad, rad/s
      omega: (2 * Math.PI) / (i ? 1.45 : 1.25), // natural swing: one full rock every ~1.3s
      friction: i ? 1.9 : 2.2, // per second
    };
  });
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HANG = 181; // peg to the card's middle (design px)
  var PUSH = 0.16; // how strongly the line's acceleration swings the cards
  var MAX_SWING = (6 * Math.PI) / 180;
  var lineX = null;
  var lineSpeed = 0;
  var lastTime = null;
  var running = false;

  function step(now) {
    var dt = lastTime === null ? 1 / 60 : Math.min(1 / 30, (now - lastTime) / 1000);
    lastTime = now;

    // Where the line is (design px) and how fast it moves: scroll arrives in steps, so the speed is
    // smoothed before its change (the acceleration) pushes the cards
    var x = -Math.min(1, Math.max(0, (stuck - HOLD) / RANGE)) * RANGE;
    var raw = lineX === null ? 0 : (x - lineX) / dt;
    lineX = x;
    var prevSpeed = lineSpeed;
    lineSpeed += (raw - lineSpeed) * Math.min(1, dt * 10);
    var accel = (lineSpeed - prevSpeed) / dt;

    var moving = Math.abs(lineSpeed) > 1;
    cards.forEach(function (c) {
      var torque = -c.omega * c.omega * Math.sin(c.angle) - c.friction * c.spin - (accel / HANG) * PUSH;
      c.spin += torque * dt;
      c.angle = Math.max(-MAX_SWING, Math.min(MAX_SWING, c.angle + c.spin * dt));
      c.el.style.rotate = ((c.angle * 180) / Math.PI).toFixed(3) + "deg";
      if (Math.abs(c.angle) > 0.0002 || Math.abs(c.spin) > 0.0005) moving = true;
    });

    if (moving) requestAnimationFrame(step);
    else {
      running = false;
      lastTime = null;
    }
  }

  function wake() {
    if (still || running || !cards.length) return;
    running = true;
    requestAnimationFrame(step);
  }

  // Entrance: the heading and timeline play in once its top is 40% up the screen
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      about.classList.add("is-shown");
      observer.disconnect();
    }, { rootMargin: "0px 0px -40% 0px" });
    observer.observe(about);
  } else {
    about.classList.add("is-shown");
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  render();
})();
