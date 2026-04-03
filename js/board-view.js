(function () {
  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function fmt(d) {
    try {
      var x = new Date(d);
      return (
        x.getFullYear() +
        "년 " +
        (x.getMonth() + 1) +
        "월 " +
        x.getDate() +
        "일 " +
        String(x.getHours()).padStart(2, "0") +
        ":" +
        String(x.getMinutes()).padStart(2, "0")
      );
    } catch (e) {
      return d;
    }
  }

  function run() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var root = document.getElementById("board-view-root");
    if (!id || !root || !window.HatvitStorage) {
      if (root) root.innerHTML = "<p>잘못된 접근입니다.</p>";
      return;
    }
    var posts = HatvitStorage.loadPosts();
    var post = posts.find(function (p) {
      return p.id === id;
    });
    if (!post) {
      root.innerHTML = "<p>삭제되었거나 찾을 수 없는 글입니다.</p>";
      return;
    }
    document.title = post.title + " — 상담게시판 — 햇빛병원";
    root.innerHTML =
      '<header class="board-view__head">' +
      "<h1>" +
      escapeHtml(post.title) +
      "</h1>" +
      '<p class="board-view__meta">' +
      escapeHtml(post.authorName) +
      " · " +
      fmt(post.createdAt) +
      "</p>" +
      "</header>" +
      '<div class="board-view__body">' +
      escapeHtml(post.body).replace(/\n/g, "<br />") +
      "</div>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
