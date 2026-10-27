// Chalk scribble for the hero headline.
// 1. Write-on: each letter is revealed by a fast diagonal zig-zag stroke, one after another.
// 2. Boil: the chalk hatching inside the letters is redrawn continuously, like stop-motion chalk.
(function () {
  var root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Letter column ranges in the headline PNGs' natural pixels (2x export)
  var LINES = {
    "headline__line--1": {
      mask: "assets/headline-mask-1.png",
      letters: [
        [0, 186], [195, 317], [325, 457], [466, 582],
        [633, 788], [796, 919], [928, 1049], [1056, 1164]
      ]
    },
    "headline__line--2": {
      mask: "assets/headline-mask-2.png",
      letters: [
        [0, 163], [169, 355], [362, 492], [500, 550], [558, 674], [684, 734], [741, 866],
        [876, 1000], [1010, 1106], [1158, 1310], [1317, 1441], [1452, 1583], [1594, 1722], [1732, 1853], [1859, 1983]
      ]
    }
  };

  // Write-on timing
  var START_DELAY = 500; // ms, lets the light start rising first
  var LETTER_DURATION = 300; // ms to scribble one letter
  var LETTER_STAGGER = 95; // ms between letter starts
  var REVEAL_WIDTH = 26; // reveal stroke width in natural pixels
  var REVEAL_STEP = 15; // horizontal advance per zig-zag

  // Boil
  var BOIL_FPS = 8.96; // stop-motion rate of the redrawn hatching
  var BOIL_VARIANTS = 8; // pre-rendered hatch frames per line

  // Hatching style, sampled from the Figma chalk artwork
  var HATCH_ANGLE = 58; // degrees from horizontal, strokes lean "/"
  var HATCH_DENSITY = 190; // one stroke per N square pixels

  var seed = 7;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function between(a, b) {
    return a + (b - a) * rand();
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function makeCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function slash(ctx, cx, cy, angle, len) {
    var dx = (Math.cos(angle) * len) / 2;
    var dy = (Math.sin(angle) * len) / 2;
    ctx.beginPath();
    ctx.moveTo(cx - dx, cy + dy);
    ctx.lineTo(cx + dx, cy - dy);
    ctx.stroke();
  }

  // Thin chalk outline along the letter edges: mask minus a slightly eroded mask
  function renderRim(mask, w, h) {
    var eroded = makeCanvas(w, h);
    var ectx = eroded.getContext("2d");
    var r = 3;
    ectx.drawImage(mask, 0, 0, w, h);
    ectx.globalCompositeOperation = "destination-in";
    [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]].forEach(function (d) {
      ectx.drawImage(mask, d[0], d[1], w, h);
    });

    var rim = makeCanvas(w, h);
    var rctx = rim.getContext("2d");
    rctx.drawImage(mask, 0, 0, w, h);
    rctx.globalCompositeOperation = "destination-out";
    rctx.drawImage(eroded, 0, 0);
    return rim;
  }

  // One frame of chalk hatching clipped to the solid letter shapes
  function renderHatch(mask, rim, w, h) {
    var canvas = makeCanvas(w, h);
    var ctx = canvas.getContext("2d");
    var rad = (HATCH_ANGLE * Math.PI) / 180;
    var count = Math.round((w * h) / HATCH_DENSITY);

    // Pale chalk dust underneath the strokes
    ctx.fillStyle = "rgba(200, 211, 255, 0.5)";
    ctx.fillRect(0, 0, w, h);

    ctx.lineCap = "round";
    for (var i = 0; i < count; i++) {
      ctx.lineWidth = between(1.75, 4.2);
      ctx.strokeStyle = "rgba(" + Math.round(between(228, 255)) + "," + Math.round(between(232, 255)) + ",255," + between(0.5, 0.95).toFixed(2) + ")";
      slash(ctx, between(-20, w + 20), between(-20, h + 20), rad + between(-0.08, 0.08), between(28, 150));
    }

    ctx.globalAlpha = 0.7;
    ctx.drawImage(rim, 0, 0);
    ctx.globalAlpha = 1;

    // Thin gaps where the chalk skipped
    ctx.globalCompositeOperation = "destination-out";
    for (var j = 0; j < count / 3; j++) {
      ctx.lineWidth = between(1.05, 2.45);
      ctx.strokeStyle = "rgba(0,0,0," + between(0.4, 0.85).toFixed(2) + ")";
      slash(ctx, between(0, w), between(0, h), rad + between(-0.06, 0.06), between(30, 120));
    }

    // Keep only what falls inside the letters
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0, w, h);
    return canvas;
  }

  function buildReveal(x0, x1, height) {
    var pad = REVEAL_WIDTH;
    var shift = (height + pad * 2) / Math.tan((HATCH_ANGLE * Math.PI) / 180);
    var points = [];
    var top = true;
    for (var x = x0 - shift; x <= x1 + REVEAL_STEP; x += REVEAL_STEP) {
      var j = (rand() - 0.5) * 8;
      points.push(top ? [x + shift + j, -pad] : [x + j, height + pad]);
      top = !top;
    }
    var lengths = [0];
    for (var i = 1; i < points.length; i++) {
      var dx = points[i][0] - points[i - 1][0];
      var dy = points[i][1] - points[i - 1][1];
      lengths.push(lengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    return { points: points, lengths: lengths, total: lengths[lengths.length - 1] };
  }

  function strokePartial(ctx, path, progress) {
    var target = path.total * progress;
    var pts = path.points;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      if (path.lengths[i] <= target) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      } else {
        var segStart = path.lengths[i - 1];
        var t = (target - segStart) / (path.lengths[i] - segStart);
        ctx.lineTo(
          pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
          pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t
        );
        break;
      }
    }
    ctx.stroke();
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 2);
  }

  // Fall back to the static Figma artwork
  function showStatic() {
    root.classList.remove("is-scribbling", "is-boiling");
  }

  var images = Array.prototype.slice.call(document.querySelectorAll("img.headline__line"));
  if (!images.length) return showStatic();

  Promise.all(images.map(function (img) {
    var key = Object.keys(LINES).filter(function (k) { return img.classList.contains(k); })[0];
    var decoded = img.decode ? img.decode() : Promise.resolve();
    return Promise.all([decoded, loadImage(LINES[key].mask)]).then(function (res) {
      return { img: img, key: key, mask: res[1] };
    });
  })).then(function (loaded) {
    var lines = [];
    var letterIndex = 0;

    loaded.forEach(function (item) {
      var img = item.img;
      var w = img.naturalWidth;
      var h = img.naturalHeight;

      var canvas = makeCanvas(w, h);
      canvas.className = img.className;
      canvas.setAttribute("aria-hidden", "true");
      img.after(canvas);

      var rim = renderRim(item.mask, w, h);
      var variants = [];
      for (var v = 0; v < BOIL_VARIANTS; v++) variants.push(renderHatch(item.mask, rim, w, h));

      var writeMask = makeCanvas(w, h);
      var writeCtx = writeMask.getContext("2d");
      writeCtx.lineWidth = REVEAL_WIDTH;
      writeCtx.lineCap = "round";
      writeCtx.lineJoin = "round";
      writeCtx.strokeStyle = "#000";

      var letters = LINES[item.key].letters.map(function (range) {
        var letter = {
          x0: range[0],
          x1: range[1],
          start: START_DELAY + letterIndex * LETTER_STAGGER,
          path: buildReveal(range[0], range[1], h),
          done: false
        };
        letterIndex++;
        return letter;
      });

      lines.push({
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        variants: variants,
        variant: 0,
        writeMask: writeMask,
        writeCtx: writeCtx,
        letters: letters,
        written: false
      });
    });

    // The canvases now stand in for the static artwork
    root.classList.add("is-boiling");

    var startTime = null;
    var lastBoil = -Infinity;

    function frame(now) {
      if (startTime === null) startTime = now;
      var elapsed = now - startTime;
      var boil = now - lastBoil >= 1000 / BOIL_FPS;
      if (boil) lastBoil = now;
      var allWritten = true;

      lines.forEach(function (line) {
        var writing = false;

        if (!line.written) {
          var lineDone = true;
          line.letters.forEach(function (letter) {
            if (letter.done) return;
            var t = (elapsed - letter.start) / LETTER_DURATION;
            if (t >= 1) {
              // Seal the letter so no hairline gaps remain
              line.writeCtx.fillRect(letter.x0 - 4, 0, letter.x1 - letter.x0 + 8, line.writeMask.height);
              letter.done = true;
              writing = true;
              return;
            }
            lineDone = false;
            if (t > 0) {
              strokePartial(line.writeCtx, letter.path, easeOut(t));
              writing = true;
            }
          });
          line.written = lineDone;
        }
        if (!line.written) allWritten = false;

        if (boil) {
          var next = Math.floor(rand() * (line.variants.length - 1));
          line.variant = next >= line.variant ? next + 1 : next;
        }
        if (!boil && !writing) return;

        var ctx = line.ctx;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, line.canvas.width, line.canvas.height);
        if (line.written) {
          ctx.drawImage(line.variants[line.variant], 0, 0);
        } else {
          ctx.drawImage(line.writeMask, 0, 0);
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(line.variants[line.variant], 0, 0);
        }
      });

      // Headline fully written: let the glow fade in
      if (allWritten) root.classList.remove("is-scribbling");
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }).catch(showStatic);
})();
