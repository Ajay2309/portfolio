(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Mobile menu */
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
  function closeMenu() {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* Typing effect */
  var typedEl = document.getElementById("typed");
  var phrases = [
    "Cybersecurity Enthusiast",
    "Python Developer",
    "Generative AI Learner",
    "B.Tech CSE · 2027"
  ];
  if (reduce) {
    typedEl.textContent = phrases[0];
  } else {
    var pi = 0, ci = 0, deleting = false;
    (function tick() {
      var word = phrases[pi];
      typedEl.textContent = word.slice(0, ci);
      var delay = deleting ? 35 : 75;
      if (!deleting && ci === word.length) { deleting = true; delay = 1600; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
      ci += deleting ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal:not(.hero .reveal)");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Count-up stats */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce) { el.textContent = target; return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 500);
  });

  /* Active nav link + progress bar */
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-link]"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var bar = document.getElementById("progress");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    var pos = h.scrollTop + 140, cur = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle("active", i === cur); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Copy email */
  var copyBtn = document.getElementById("copyEmail");
  copyBtn.addEventListener("click", function () {
    var email = "ajayvishwakarma9711@gmail.com";
    function done() {
      copyBtn.textContent = "Copied ✓";
      copyBtn.classList.add("done");
      setTimeout(function () { copyBtn.textContent = "Copy email"; copyBtn.classList.remove("done"); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () { window.location.href = "mailto:" + email; });
    } else {
      window.location.href = "mailto:" + email;
    }
  });

  /* HUD ruler ticks on the photo */
  var ticks = document.querySelector(".hud .ticks");
  if (ticks) {
    var ns = "http://www.w3.org/2000/svg", html = "";
    for (var t = 0; t <= 115; t += 5) {
      var major = t % 25 === 0;
      html += '<line class="' + (major ? "major" : "") + '" x1="0" y1="' + t + '" x2="' + (major ? 4 : 2) + '" y2="' + t + '"/>';
    }
    for (var u = 0; u <= 100; u += 5) {
      var maj2 = u % 25 === 0;
      html += '<line class="' + (maj2 ? "major" : "") + '" x1="' + u + '" y1="115" x2="' + u + '" y2="' + (maj2 ? 111 : 113) + '"/>';
    }
    ticks.innerHTML = html;
  }

  /* Mouse parallax: layers move by data-depth, ID card tilts in 3D */
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && !reduce) {
    var layers = Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    window.AV_PARALLAX = { x: 0, y: 0 };
    function frame() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach(function (el) {
        var d = parseFloat(el.getAttribute("data-depth")) || 0;
        el.style.translate = (cx * d).toFixed(2) + "px " + (cy * d).toFixed(2) + "px";
      });
      window.AV_PARALLAX.x = cx; window.AV_PARALLAX.y = cy;
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        requestAnimationFrame(frame);
      } else { running = false; }
    }
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 … 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      tx = 0; ty = 0;
      if (!running) { running = true; requestAnimationFrame(frame); }
    });
  }

  /* Binary / hex rain background (subtle, technical) */
  var canvas = document.getElementById("bg");
  if (canvas && !reduce) {
    var ctx = canvas.getContext("2d");
    var cols, drops, size = 16, glyphs = "01{}[]<>/\\;=+*#$%ABCDEF".split("");
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / size);
      drops = new Array(cols).fill(0).map(function () { return Math.random() * -50; });
    }
    resize();
    window.addEventListener("resize", resize);
    var last = 0;
    function draw(ts) {
      if (ts - last > 70) {
        last = ts;
        ctx.fillStyle = "rgba(7, 9, 13, 0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#3df5c4";
        ctx.font = size - 3 + "px 'JetBrains Mono', monospace";
        for (var i = 0; i < cols; i++) {
          if (Math.random() > 0.35) continue;
          var ch = glyphs[(Math.random() * glyphs.length) | 0];
          ctx.fillText(ch, i * size, drops[i] * size);
          if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
})();
