(function () {
  function goLogin() {
    window.location.href = "login.html?next=" + encodeURIComponent("board-write.html");
  }

  function run() {
    if (!window.HatvitStorage) return;
    var u = HatvitStorage.getCurrentUser();
    if (!u) {
      goLogin();
      return;
    }
    var nameEl = document.getElementById("write-author");
    if (nameEl) nameEl.textContent = u.name || u.userId;

    var form = document.getElementById("board-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = document.getElementById("post-title");
      var body = document.getElementById("post-body");
      if (!title || !body) return;
      if (!title.value.trim()) {
        alert("제목을 입력해 주세요.");
        return;
      }
      if (!body.value.trim()) {
        alert("내용을 입력해 주세요.");
        return;
      }
      var post = HatvitStorage.addPost(u, title.value, body.value);
      window.location.href = "board-view.html?id=" + encodeURIComponent(post.id);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
