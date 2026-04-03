(function () {
  function run() {
    var form = document.getElementById("login-form");
    if (!form || !window.HatvitStorage) return;

    var params = new URLSearchParams(window.location.search);
    var nextUrl = params.get("next") || "board.html";

    if (HatvitStorage.getCurrentUser()) {
      window.location.href = nextUrl;
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var uid = document.getElementById("login-userid");
      var pw = document.getElementById("login-password");
      if (!uid || !pw) return;
      var r = await HatvitStorage.login(uid.value.trim(), pw.value);
      if (!r.ok) {
        alert(r.error || "로그인에 실패했습니다.");
        return;
      }
      window.location.href = nextUrl;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
