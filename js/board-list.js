(function () {
  function fmt(d) {
    try {
      var x = new Date(d);
      return (
        x.getFullYear() +
        "." +
        String(x.getMonth() + 1).padStart(2, "0") +
        "." +
        String(x.getDate()).padStart(2, "0")
      );
    } catch (e) {
      return d;
    }
  }

  function render() {
    var tbody = document.getElementById("board-tbody");
    var empty = document.getElementById("board-empty");
    if (!tbody) return;
    var posts = window.HatvitStorage ? HatvitStorage.loadPosts() : [];
    tbody.innerHTML = "";
    if (!posts.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    posts.forEach(function (p, i) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        (posts.length - i) +
        "</td>" +
        '<td class="board-title"><a href="board-view.html?id=' +
        encodeURIComponent(p.id) +
        '">' +
        escapeHtml(p.title) +
        "</a></td>" +
        "<td>" +
        escapeHtml(p.authorName) +
        "</td>" +
        "<td>" +
        fmt(p.createdAt) +
        "</td>";
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
