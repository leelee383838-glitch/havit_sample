(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function goLogin() {
    window.location.href = "login.html?next=" + encodeURIComponent("reservation.html");
  }

  function renderSlots() {
    var doctorId = $("rs-doctor").value;
    var date = $("rs-date").value;
    var grid = $("rs-slots");
    if (!grid || !doctorId || !date) return;

    grid.innerHTML = "";
    if (!window.HatvitStorage) return;

    var booked = HatvitStorage.getBookedHoursForSlot(doctorId, date);
    var hours = HatvitStorage.getReservationHours();

    hours.forEach(function (h) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-btn";
      btn.textContent = HatvitStorage.formatSlotLabel(h);
      if (booked[h]) {
        btn.disabled = true;
        btn.classList.add("slot-btn--taken");
        btn.textContent += " (마감)";
      } else {
        btn.dataset.hour = String(h);
        btn.addEventListener("click", function () {
          grid.querySelectorAll(".slot-btn--picked").forEach(function (b) {
            b.classList.remove("slot-btn--picked");
          });
          btn.classList.add("slot-btn--picked");
          $("rs-slot-hour").value = h;
        });
      }
      grid.appendChild(btn);
    });
  }

  function renderMyList(user) {
    var box = $("rs-my-list");
    if (!box || !user) return;
    var list = HatvitStorage.getReservationsByUser(user.userId);
    if (!list.length) {
      box.innerHTML = "<p class=\"rs-empty\">예약 내역이 없습니다.</p>";
      return;
    }
    box.innerHTML = list
      .map(function (r) {
        return (
          '<article class="rs-card">' +
          "<p><strong>" +
          r.reserveDate +
          "</strong> " +
          HatvitStorage.formatSlotLabel(r.slotHour) +
          "</p>" +
          "<p>" +
          r.deptLabel +
          " · " +
          r.doctorName +
          "</p>" +
          '<button type="button" class="btn btn--ghost btn--small rs-cancel" data-id="' +
          r.id +
          '">취소</button>' +
          "</article>"
        );
      })
      .join("");

    box.querySelectorAll(".rs-cancel").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("예약을 취소할까요?")) return;
        var id = btn.getAttribute("data-id");
        var res = HatvitStorage.cancelReservation(id, user.userId);
        if (res.ok) {
          renderMyList(user);
          renderSlots();
        } else {
          alert(res.error || "취소에 실패했습니다.");
        }
      });
    });
  }

  function run() {
    if (!window.HatvitStorage) return;
    var user = HatvitStorage.getCurrentUser();
    var gate = $("rs-gate");
    var app = $("rs-app");

    if (!user) {
      if (gate) gate.removeAttribute("hidden");
      if (app) app.hidden = true;
      var gl = $("rs-go-login");
      if (gl) gl.addEventListener("click", goLogin);
      return;
    }

    if (gate) gate.hidden = true;
    if (app) app.removeAttribute("hidden");

    var deptSel = $("rs-dept");
    var docSel = $("rs-doctor");
    if (deptSel) {
      HatvitStorage.getDepartments().forEach(function (d) {
        var o = document.createElement("option");
        o.value = d.id;
        o.textContent = d.label;
        deptSel.appendChild(o);
      });
      deptSel.addEventListener("change", function () {
        docSel.innerHTML = '<option value="">의료진 선택</option>';
        HatvitStorage.getDoctorsByDept(deptSel.value).forEach(function (doc) {
          var o = document.createElement("option");
          o.value = doc.id;
          o.textContent = doc.name;
          docSel.appendChild(o);
        });
        if (docSel.options.length > 1) {
          docSel.selectedIndex = 1;
        }
        $("rs-slot-hour").value = "";
        renderSlots();
      });
    }

    if (docSel) {
      docSel.addEventListener("change", function () {
        $("rs-slot-hour").value = "";
        renderSlots();
      });
    }

    var dateEl = $("rs-date");
    if (dateEl) {
      var t = new Date();
      dateEl.min = t.toISOString().slice(0, 10);
      var max = new Date(t.getTime() + 30 * 24 * 60 * 60 * 1000);
      dateEl.max = max.toISOString().slice(0, 10);
      dateEl.value = t.toISOString().slice(0, 10);
      dateEl.addEventListener("change", function () {
        $("rs-slot-hour").value = "";
        renderSlots();
      });
    }

    if (deptSel && deptSel.options.length) {
      deptSel.selectedIndex = 0;
      deptSel.dispatchEvent(new Event("change"));
    }

    var form = $("rs-form");
    if (form) {
      $("rs-patient").value = user.name || "";
      $("rs-phone").value = user.phone || "";

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var hour = parseInt($("rs-slot-hour").value, 10);
        if (isNaN(hour)) {
          alert("시간대를 선택해 주세요.");
          return;
        }
        var doctorId = $("rs-doctor").value;
        if (!doctorId) {
          alert("의료진을 선택해 주세요.");
          return;
        }
        var r = HatvitStorage.createReservation({
          doctorId: doctorId,
          reserveDate: $("rs-date").value,
          slotHour: hour,
          userId: user.userId,
          patientName: $("rs-patient").value,
          phone: $("rs-phone").value,
          memo: $("rs-memo").value,
        });
        if (!r.ok) {
          alert(r.error || "예약에 실패했습니다.");
          return;
        }
        alert("예약이 완료되었습니다.");
        $("rs-memo").value = "";
        $("rs-slot-hour").value = "";
        renderMyList(user);
        renderSlots();
      });
    }

    renderMyList(user);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
