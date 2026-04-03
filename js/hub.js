(function () {
  var gate = document.getElementById("hub-gate");
  var tilt = document.getElementById("hub-bg-tilt");
  var body = document.body;

  if (gate) {
    var zones = gate.querySelectorAll(".hub-zone[data-hub-side]");
    function setHover(side) {
      if (side) gate.setAttribute("data-hover", side);
      else gate.removeAttribute("data-hover");
    }

    zones.forEach(function (z) {
      var side = z.getAttribute("data-hub-side") || "";
      z.addEventListener("mouseenter", function () {
        setHover(side);
      });
      z.addEventListener("mouseleave", function () {
        setHover("");
      });
      z.addEventListener("focus", function () {
        setHover(side);
      });
      z.addEventListener("blur", function () {
        setHover("");
      });
    });

    gate.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape") setHover("");
      },
      true
    );
  }

  /* 배경 동일 이미지 2겹: 마우스 → rotateY / rotateX 로 깊이 패럴랙스 */
  if (!tilt) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    body.classList.add("hub-bg-tilt--off");
    return;
  }

  var target = { rx: 0, ry: 0 };
  var cur = { rx: 0, ry: 0 };
  var raf = 0;

  function setTargetFromClient(clientX, clientY) {
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    var nx = clientX / w;
    var ny = clientY / h;
    /* 가로: 0→1 을 -180°~+180° 로 매핑 (한 바퀴 분량의 회전 체감) */
    target.ry = (nx - 0.5) * 360;
    /* 세로: 살짝 기울임 */
    target.rx = (ny - 0.5) * -42;
  }

  function tick() {
    raf = 0;
    var k = 0.12;
    cur.rx += (target.rx - cur.rx) * k;
    cur.ry += (target.ry - cur.ry) * k;
    tilt.style.transform =
      "rotateX(" + cur.rx.toFixed(2) + "deg) rotateY(" + cur.ry.toFixed(2) + "deg)";
    if (
      Math.abs(target.rx - cur.rx) > 0.02 ||
      Math.abs(target.ry - cur.ry) > 0.02
    ) {
      raf = requestAnimationFrame(tick);
    }
  }

  function queue() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  window.addEventListener(
    "mousemove",
    function (e) {
      setTargetFromClient(e.clientX, e.clientY);
      queue();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    function (e) {
      if (!e.touches || !e.touches[0]) return;
      setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
      queue();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    function (e) {
      if (!e.touches || !e.touches[0]) return;
      setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
      queue();
    },
    { passive: true }
  );

  /* 초기 중앙 */
  setTargetFromClient(window.innerWidth * 0.5, window.innerHeight * 0.5);
  queue();
})();
