(function () {
  function run() {
    var form = document.getElementById("register-form");
    if (!form || !window.HatvitStorage) return;

    if (HatvitStorage.getCurrentUser()) {
      window.location.href = "board.html";
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var userId = document.getElementById("reg-userid");
      var pw = document.getElementById("reg-password");
      var pw2 = document.getElementById("reg-password2");
      var name = document.getElementById("reg-name");
      var phone = document.getElementById("reg-phone");
      var email = document.getElementById("reg-email");
      if (!userId || !pw || !pw2 || !name) return;

      if (pw.value !== pw2.value) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      if (pw.value.length < 6) {
        alert("비밀번호는 6자 이상으로 설정해 주세요.");
        return;
      }

      var r = await HatvitStorage.register({
        userId: userId.value,
        password: pw.value,
        name: name.value,
        phone: phone ? phone.value : "",
        email: email ? email.value : "",
      });
      if (!r.ok) {
        alert(r.error || "회원가입에 실패했습니다.");
        return;
      }
      window.location.href = "board.html";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
