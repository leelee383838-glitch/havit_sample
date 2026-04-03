(function () {
  function inPagesFolder() {
    return /\/pages\//.test(window.location.pathname);
  }

  function build() {
    var pages = inPagesFolder();
    var root = pages ? "" : "pages/";
    var qa = root + "qa.html";
    var board = root + "board.html";
    var reserve = root + "reservation.html";

    var kakaoUrl = window.HATVIT_KAKAO_CHANNEL_URL;
    if (!kakaoUrl || !String(kakaoUrl).trim()) {
      kakaoUrl = "https://pf.kakao.com/";
    }

    var items = [
      { href: kakaoUrl, label: "카카오톡 상담하기", short: "카톡", cls: "floating-dock__orb--kakao", external: true },
      { href: qa, label: "Q&A", short: "Q&A", cls: "", external: false },
      { href: board, label: "게시판", short: "게시", cls: "", external: false },
      { href: reserve, label: "예약하기", short: "예약", cls: "floating-dock__orb--accent", external: false },
    ];

    var aside = document.createElement("aside");
    aside.className = "floating-dock";
    aside.setAttribute("aria-label", "빠른 메뉴");

    var panel = document.createElement("div");
    panel.className = "floating-dock__panel";
    panel.id = "floating-dock-menu";
    panel.setAttribute("role", "group");

    items.forEach(function (it) {
      var a = document.createElement("a");
      a.className = "floating-dock__orb " + it.cls;
      a.href = it.href;
      a.setAttribute("title", it.label);
      a.setAttribute("aria-label", it.label);
      a.textContent = it.short;
      if (it.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      panel.appendChild(a);
    });

    var fab = document.createElement("button");
    fab.className = "floating-dock__fab";
    fab.type = "button";
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "floating-dock-menu");
    fab.setAttribute("aria-label", "빠른 메뉴 펼치기");
    fab.innerHTML =
      '<span class="floating-dock__fab-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>';

    aside.appendChild(panel);
    aside.appendChild(fab);

    function setOpen(open) {
      aside.classList.toggle("is-open", open);
      fab.setAttribute("aria-expanded", open ? "true" : "false");
    }

    fab.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!aside.classList.contains("is-open"));
    });

    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (!aside.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    document.body.appendChild(aside);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
