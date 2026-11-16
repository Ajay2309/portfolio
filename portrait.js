/* Interactive particle portrait.
   The photo is rebuilt from thousands of tiny pixels. Moving the mouse (or touching)
   scatters them; they spring back into the face. Scrolling bursts them apart. */
(function () {
  "use strict";

  var canvas = document.getElementById("portrait");
  var photo = document.querySelector(".photo");
  if (!canvas || !photo || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var VW = 0, VH = 0;

  function resize() {
    VW = window.innerWidth;
    VH = window.innerHeight;
    canvas.width = Math.round(VW * dpr);
    canvas.height = Math.round(VH * dpr);
    canvas.style.width = VW + "px";
    canvas.style.height = VH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---- pointer state ---- */
  var mx = -9999, my = -9999, active = false, speed = 0, lastX = 0, lastY = 0;
  function onMove(e) {
    var x = e.clientX, y = e.clientY;
    speed = speed * 0.6 + Math.min(Math.hypot(x - lastX, y - lastY), 80) * 0.4;
    lastX = x; lastY = y; mx = x; my = y; active = true;
  }
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("mouseleave", function () { active = false; });
  window.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") active = false; });

  /* ---- particle data ---- */
  var N = 0, hx, hy, dx, dy, vx, vy, sz, bs = [0, 0, 0, 0, 0, 0, 0];
  var iw = 1, ih = 1;
  var COLORS = [
    "rgba(110,140,158,0.55)",
    "rgba(150,182,200,0.70)",
    "rgba(190,218,232,0.82)",
    "rgba(222,240,248,0.92)",
    "rgba(255,255,255,1)",
    "rgba(61,245,196,0.95)"
  ];

  function build() {
    var P = window.AV_PARTICLES;
    if (!P || !P.d) return;
    iw = P.w; ih = P.h;
    var bin = atob(P.d);
    var stride = VW < 700 ? 2 : 1;                                // lighter on phones

    // count what we keep per bucket
    var counts = [0, 0, 0, 0, 0, 0], src = 0, b, j;
    for (b = 0; b < 6; b++) {
      for (j = 0; j < P.c[b]; j++) { if (j % stride === 0) counts[b]++; }
    }
    N = counts[0] + counts[1] + counts[2] + counts[3] + counts[4] + counts[5];
    hx = new Float32Array(N); hy = new Float32Array(N);
    dx = new Float32Array(N); dy = new Float32Array(N);
    vx = new Float32Array(N); vy = new Float32Array(N);
    sz = new Float32Array(N);
    bs = [0, 0, 0, 0, 0, 0, 0];

    var k = 0;
    for (b = 0; b < 6; b++) {
      bs[b] = k;
      for (j = 0; j < P.c[b]; j++, src += 5) {
        if (j % stride !== 0) continue;
        hx[k] = (bin.charCodeAt(src) | (bin.charCodeAt(src + 1) << 8)) / 65535;
        hy[k] = (bin.charCodeAt(src + 2) | (bin.charCodeAt(src + 3) << 8)) / 65535;
        sz[k] = 1.2 + bin.charCodeAt(src + 4) / 10 + (stride > 1 ? 0.5 : 0);
        if (!reduce) {                                            // start scattered, then assemble
          dx[k] = (Math.random() - 0.5) * 1100;
          dy[k] = (Math.random() - 0.5) * 800;
        }
        k++;
      }
    }
    bs[6] = N;

    document.documentElement.classList.add("particles-on");
    requestAnimationFrame(frame);
  }

  /* ---- scroll burst ---- */
  var lastScroll = window.pageYOffset;
  window.addEventListener("scroll", function () {
    var d = Math.abs(window.pageYOffset - lastScroll);
    lastScroll = window.pageYOffset;
    if (reduce || !N || d < 2) return;
    var power = Math.min(d, 90) * 0.22;
    for (var i = 0; i < N; i++) {
      vx[i] += (Math.random() - 0.5) * power;
      vy[i] += (Math.random() - 0.5) * power;
    }
  }, { passive: true });

  /* tap / click: radial burst */
  window.addEventListener("pointerdown", function (e) {
    if (reduce || !N) return;
    var rect = photo.getBoundingClientRect();
    var s = rect.width / iw, par = window.AV_PARALLAX || { x: 0, y: 0 };
    var ox = rect.left + par.x * 12, oy = rect.top + par.y * 12;
    var R = 170;
    for (var i = 0; i < N; i++) {
      var px = ox + hx[i] * iw * s + dx[i] - e.clientX;
      var py = oy + hy[i] * ih * s + dy[i] - e.clientY;
      var d = Math.hypot(px, py);
      if (d < R) {
        var f = (1 - d / R) * 22 / (d || 1);
        vx[i] += px * f; vy[i] += py * f;
      }
    }
  }, { passive: true });

  /* ---- render loop ---- */
  var K = 0.035, DAMP = 0.9;
  function frame() {
    var rect = photo.getBoundingClientRect();
    if (rect.bottom < -300 || rect.top > VH + 300) {              // off-screen: skip work
      ctx.clearRect(0, 0, VW, VH);
      requestAnimationFrame(frame);
      return;
    }
    var s = rect.width / iw;
    var par = window.AV_PARALLAX || { x: 0, y: 0 };
    var ox = rect.left + par.x * 12, oy = rect.top + par.y * 12;
    var R = VW < 700 ? 85 : 125, R2 = R * R;
    var push = reduce ? 0 : 5 + Math.min(speed, 40) * 0.5;
    speed *= 0.93;

    ctx.clearRect(0, 0, VW, VH);
    var sw = iw * s, sh = ih * s;

    for (var b = 0; b < 6; b++) {
      ctx.fillStyle = COLORS[b];
      for (var i = bs[b], end = bs[b + 1]; i < end; i++) {
        var px = ox + hx[i] * sw + dx[i];
        var py = oy + hy[i] * sh + dy[i];

        if (active && !reduce) {
          var ex = px - mx, ey = py - my, d2 = ex * ex + ey * ey;
          if (d2 < R2) {
            var d = Math.sqrt(d2) || 1;
            var f = 1 - d / R; f = f * f * push * (0.6 + Math.random() * 0.8);
            vx[i] += ex / d * f; vy[i] += ey / d * f;
          }
        }
        if (!reduce) {
          vx[i] = (vx[i] - dx[i] * K) * DAMP;
          vy[i] = (vy[i] - dy[i] * K) * DAMP;
          dx[i] += vx[i]; dy[i] += vy[i];
        }
        var sx = ox + hx[i] * sw + dx[i], sy = oy + hy[i] * sh + dy[i];
        if (sx < -10 || sx > VW + 10 || sy < -10 || sy > VH + 10) continue;
        ctx.fillRect(Math.round(sx), Math.round(sy), sz[i], sz[i]);
      }
    }
    requestAnimationFrame(frame);
  }

  build();
})();
