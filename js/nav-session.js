(function () {
  function run() {
    var link = document.getElementById("nav-login-link");
    if (!link || !window.HatvitStorage) return;
    var u = HatvitStorage.getCurrentUser();
    if (!u) return;
    link.textContent = (u.name || u.userId) + "님";
    var base = link.getAttribute("href");
    if (base && base.indexOf("login") !== -1) {
      link.setAttribute("href", "#");
      link.setAttribute("aria-label", "로그아웃 후 새로고침");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        HatvitStorage.logout();
        window.location.reload();
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
