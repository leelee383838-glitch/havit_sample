(function () {
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.getElementById("site-nav");
  var backdrop = document.querySelector(".nav-backdrop");
  if (!toggle || !panel) return;

  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    if (backdrop) backdrop.setAttribute("aria-hidden", open ? "false" : "true");
  }

  toggle.addEventListener("click", function () {
    setOpen(!document.body.classList.contains("nav-open"));
  });

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
  }

  panel.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setOpen(false);
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
})();
