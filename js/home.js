(function () {
  var root = document.getElementById("hero-mega");
  if (root) {
    var slides = root.querySelectorAll(".hero-mega__slide");
    var dots = root.querySelectorAll(".hero-mega__dot");
    var expandBtn = root.querySelector(".hero-mega__expand");
    var labelEl = expandBtn ? expandBtn.querySelector(".hero-mega__expand-label") : null;
    var idx = 0;
    var timer = null;
    var intervalMs = 5500;

    function goTo(i) {
      if (!slides.length) return;
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (el, j) {
        var on = j === idx;
        el.classList.toggle("is-active", on);
        if (on) {
          el.removeAttribute("hidden");
          el.style.animation = "none";
          requestAnimationFrame(function () {
            el.style.animation = "";
          });
        } else {
          el.setAttribute("hidden", "");
        }
      });
      dots.forEach(function (d, j) {
        d.classList.toggle("is-active", j === idx);
        d.setAttribute("aria-selected", j === idx ? "true" : "false");
      });
    }

    function next() {
      goTo(idx + 1);
    }

    function armTimer() {
      if (timer) clearInterval(timer);
      if (slides.length > 1) timer = setInterval(next, intervalMs);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        armTimer();
      });
    });

    armTimer();

    function syncExpandUi() {
      if (!expandBtn) return;
      var expanded = root.getAttribute("data-expanded") === "true";
      expandBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (labelEl) {
        labelEl.textContent = expanded ? "배너 접기" : "배너 펼치기";
      }
    }

    syncExpandUi();

    if (expandBtn) {
      expandBtn.addEventListener("click", function () {
        var expanded = root.getAttribute("data-expanded") === "true";
        expanded = !expanded;
        root.setAttribute("data-expanded", expanded ? "true" : "false");
        syncExpandUi();
      });
    }
  }

  var reveal = document.querySelectorAll(".reveal");
  if (reveal.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveal.forEach(function (el) {
      io.observe(el);
    });
  }

  function initInvertCardGrid(container) {
    if (!container) return;
    var cards = container.querySelectorAll(".card");

    function setHovered(card, on) {
      card.classList.toggle("is-hovered", on);
    }

    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        setHovered(card, true);
      });
      card.addEventListener("mouseleave", function () {
        setHovered(card, false);
      });
    });

    container.addEventListener(
      "focusin",
      function (e) {
        var card = e.target.closest(".card");
        if (card && container.contains(card)) setHovered(card, true);
      },
      true
    );

    container.addEventListener(
      "focusout",
      function (e) {
        var card = e.target.closest(".card");
        if (!card || !container.contains(card)) return;
        requestAnimationFrame(function () {
          if (!card.contains(document.activeElement)) setHovered(card, false);
        });
      },
      true
    );
  }

  initInvertCardGrid(document.getElementById("clinical-cards-grid"));
  initInvertCardGrid(document.getElementById("quick-menu-grid"));

  function initInfoHub() {
    var hub = document.getElementById("info-hub");
    if (!hub) return;

    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      hub.classList.add("info-hub--visible");
    } else if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              hub.classList.add("info-hub--visible");
              obs.disconnect();
            }
          });
        },
        { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.12 }
      );
      obs.observe(hub);
    } else {
      hub.classList.add("info-hub--visible");
    }

    hub.querySelectorAll(".info-hub__copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy");
        if (!text) return;
        var prev = btn.textContent;
        function done(ok) {
          btn.classList.toggle("is-done", ok);
          btn.textContent = ok ? "복사됨" : "복사 실패";
          window.setTimeout(function () {
            btn.textContent = prev;
            btn.classList.remove("is-done");
          }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(false); });
        } else {
          done(false);
        }
      });
    });

    if (reduceMotion) return;

    hub.querySelectorAll(".info-hub__tile").forEach(function (tile) {
      var inner = tile.querySelector(".info-hub__inner");
      if (!inner) return;
      tile.addEventListener("mousemove", function (e) {
        var r = tile.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform =
          "perspective(720px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg)";
      });
      tile.addEventListener("mouseleave", function () {
        inner.style.transform = "";
      });
    });
  }

  initInfoHub();
})();
