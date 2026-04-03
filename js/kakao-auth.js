/**
 * config.js의 HATVIT_KAKAO_JS_KEY가 있을 때만 카카오 SDK 초기화 및 버튼 연결
 */
(function () {
  function getRedirect() {
    var p = new URLSearchParams(window.location.search);
    return p.get("next") || "board.html";
  }

  function wireKakao() {
    var key = window.HATVIT_KAKAO_JS_KEY;
    var btn = document.getElementById("kakao-login-btn");
    var hint = document.getElementById("kakao-key-hint");
    if (!btn || !window.HatvitStorage) return;

    if (!key || !key.trim()) {
      if (hint) {
        hint.textContent =
          "js/config.js 파일에서 HATVIT_KAKAO_JS_KEY에 JavaScript 키를 입력하면 카카오 로그인을 사용할 수 있습니다.";
      }
      btn.disabled = true;
      btn.type = "button";
      return;
    }

    btn.addEventListener("click", function () {
      if (typeof Kakao === "undefined") {
        alert("카카오 SDK를 불러오지 못했습니다. 네트워크를 확인해 주세요.");
        return;
      }
      try {
        if (typeof Kakao.isInitialized === "function" && !Kakao.isInitialized()) {
          Kakao.init(key.trim());
        } else if (typeof Kakao.isInitialized !== "function") {
          Kakao.init(key.trim());
        }
      } catch (err) {
        Kakao.init(key.trim());
      }
      Kakao.Auth.login({
        success: function () {
          Kakao.API.request({
            url: "/v2/user/me",
            success: function (res) {
              var kid = res.id;
              var nick =
                (res.kakao_account &&
                  res.kakao_account.profile &&
                  res.kakao_account.profile.nickname) ||
                "카카오사용자";
              var email =
                (res.kakao_account && res.kakao_account.email) || "";
              HatvitStorage.registerKakaoProfile(kid, {
                nickname: nick,
                email: email,
              });
              window.location.href = getRedirect();
            },
            fail: function () {
              alert("카카오 프로필을 가져오지 못했습니다.");
            },
          });
        },
        fail: function () {
          alert("카카오 로그인이 취소되었거나 실패했습니다.");
        },
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireKakao);
  } else {
    wireKakao();
  }
})();
