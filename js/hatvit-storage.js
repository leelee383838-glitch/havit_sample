(function (global) {
  var USERS_KEY = "hatvit_users";
  var POSTS_KEY = "hatvit_posts";
  var SESSION_KEY = "hatvit_session";
  var RESERVATIONS_KEY = "hatvit_reservations";

  var HATVIT_DOCTORS = [
    { id: "d_ob_1", name: "한현신", dept: "obstetrics", deptLabel: "산과" },
    { id: "d_ob_2", name: "이민정", dept: "obstetrics", deptLabel: "산과" },
    { id: "d_gy_1", name: "최지영", dept: "gynecology", deptLabel: "부인과" },
    { id: "d_gy_2", name: "박서연", dept: "gynecology", deptLabel: "부인과" },
    { id: "d_pe_1", name: "김건우", dept: "pediatrics", deptLabel: "소아청소년과" },
    { id: "d_pe_2", name: "송유진", dept: "pediatrics", deptLabel: "소아청소년과" },
    { id: "d_in_1", name: "정대호", dept: "internal", deptLabel: "내과" },
    { id: "d_in_2", name: "오윤석", dept: "internal", deptLabel: "내과" },
  ];

  var RESERVATION_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  function persistSession(payload) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  }

  function readSessionRaw() {
    var s = localStorage.getItem(SESSION_KEY);
    if (s) return s;
    var legacy = sessionStorage.getItem(SESSION_KEY);
    if (legacy) {
      localStorage.setItem(SESSION_KEY, legacy);
      sessionStorage.removeItem(SESSION_KEY);
    }
    return localStorage.getItem(SESSION_KEY);
  }

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function loadPostsRaw() {
    try {
      return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  async function sha256Hex(text) {
    var buf = new TextEncoder().encode(text);
    var hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  var HatvitStorage = {
    sha256Hex: sha256Hex,

    findUser: function (userId) {
      return loadUsers().find(function (u) {
        return u.userId === userId;
      });
    },

    findByKakaoId: function (kakaoId) {
      return loadUsers().find(function (u) {
        return u.kakaoId === String(kakaoId);
      });
    },

    register: async function (data) {
      var users = loadUsers();
      if (users.some(function (u) { return u.userId === data.userId; })) {
        return { ok: false, error: "이미 사용 중인 아이디입니다." };
      }
      var entry = {
        userId: data.userId.trim(),
        name: data.name.trim(),
        phone: (data.phone || "").trim(),
        email: (data.email || "").trim(),
        kakaoId: data.kakaoId ? String(data.kakaoId) : null,
        passwordHash: await sha256Hex(data.password),
        createdAt: new Date().toISOString(),
      };
      users.push(entry);
      saveUsers(users);
      persistSession({ userId: entry.userId });
      return { ok: true, user: entry };
    },

    registerKakaoProfile: async function (kakaoId, profile) {
      var existing = this.findByKakaoId(kakaoId);
      if (existing) {
        persistSession({ userId: existing.userId });
        return { ok: true, user: existing, isNew: false };
      }
      var userId = "kakao_" + kakaoId;
      var n = (profile && profile.nickname) || "카카오사용자";
      var email = (profile && profile.email) || "";
      var rnd = await sha256Hex(String(kakaoId) + Date.now() + Math.random());
      var entry = {
        userId: userId,
        name: n,
        phone: "",
        email: email,
        kakaoId: String(kakaoId),
        passwordHash: rnd,
        createdAt: new Date().toISOString(),
      };
      var users = loadUsers();
      users.push(entry);
      saveUsers(users);
      persistSession({ userId: entry.userId });
      return { ok: true, user: entry, isNew: true };
    },

    login: async function (userId, password) {
      var u = this.findUser(userId);
      if (!u) return { ok: false, error: "아이디를 찾을 수 없습니다." };
      var h = await sha256Hex(password);
      if (u.passwordHash !== h) return { ok: false, error: "비밀번호가 일치하지 않습니다." };
      persistSession({ userId: u.userId });
      return { ok: true, user: u };
    },

    logout: function () {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    },

    getSession: function () {
      try {
        var s = readSessionRaw();
        return s ? JSON.parse(s) : null;
      } catch (e) {
        return null;
      }
    },

    getCurrentUser: function () {
      var s = this.getSession();
      if (!s || !s.userId) return null;
      return this.findUser(s.userId) || null;
    },

    loadPosts: function () {
      return loadPostsRaw().sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },

    addPost: function (user, title, body) {
      var posts = loadPostsRaw();
      var post = {
        id: crypto.randomUUID(),
        userId: user.userId,
        authorName: user.name || user.userId,
        title: title.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };
      posts.unshift(post);
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
      return post;
    },

    getDepartments: function () {
      return [
        { id: "obstetrics", label: "산과" },
        { id: "gynecology", label: "부인과" },
        { id: "pediatrics", label: "소아청소년과" },
        { id: "internal", label: "내과" },
      ];
    },

    getAllDoctors: function () {
      return HATVIT_DOCTORS.slice();
    },

    getDoctorsByDept: function (deptId) {
      return HATVIT_DOCTORS.filter(function (d) {
        return d.dept === deptId;
      });
    },

    getDoctorById: function (id) {
      return HATVIT_DOCTORS.find(function (d) {
        return d.id === id;
      });
    },

    getReservationHours: function () {
      return RESERVATION_HOURS.slice();
    },

    formatSlotLabel: function (hour) {
      return String(hour).padStart(2, "0") + ":00 – " + String(hour + 1).padStart(2, "0") + ":00";
    },

    loadReservationsRaw: function () {
      try {
        return JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || "[]");
      } catch (e) {
        return [];
      }
    },

    saveReservations: function (rows) {
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(rows));
    },

    getBookedHoursForSlot: function (doctorId, dateStr) {
      var booked = {};
      this.loadReservationsRaw().forEach(function (r) {
        if (r.doctorId === doctorId && r.reserveDate === dateStr && r.status === "confirmed") {
          booked[r.slotHour] = true;
        }
      });
      return booked;
    },

    createReservation: function (payload) {
      var rows = this.loadReservationsRaw();
      var clash = rows.some(function (r) {
        return (
          r.doctorId === payload.doctorId &&
          r.reserveDate === payload.reserveDate &&
          r.slotHour === payload.slotHour &&
          r.status === "confirmed"
        );
      });
      if (clash) {
        return { ok: false, error: "이미 예약된 시간입니다. 다른 시간을 선택해 주세요." };
      }
      var doc = this.getDoctorById(payload.doctorId);
      if (!doc) return { ok: false, error: "의료진 정보를 찾을 수 없습니다." };
      var rec = {
        id: crypto.randomUUID(),
        doctorId: payload.doctorId,
        doctorName: doc.name,
        deptId: doc.dept,
        deptLabel: doc.deptLabel,
        userId: payload.userId,
        patientName: payload.patientName.trim(),
        phone: payload.phone.trim(),
        reserveDate: payload.reserveDate,
        slotHour: payload.slotHour,
        memo: (payload.memo || "").trim(),
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      rows.push(rec);
      this.saveReservations(rows);
      return { ok: true, reservation: rec };
    },

    getReservationsByUser: function (userId) {
      return this.loadReservationsRaw()
        .filter(function (r) {
          return r.userId === userId && r.status === "confirmed";
        })
        .sort(function (a, b) {
          var da = a.reserveDate + String(a.slotHour).padStart(2, "0");
          var db = b.reserveDate + String(b.slotHour).padStart(2, "0");
          return db.localeCompare(da);
        });
    },

    cancelReservation: function (reservationId, userId) {
      var rows = this.loadReservationsRaw();
      var idx = rows.findIndex(function (r) {
        return r.id === reservationId && r.userId === userId;
      });
      if (idx < 0) return { ok: false, error: "예약을 찾을 수 없습니다." };
      rows[idx].status = "cancelled";
      this.saveReservations(rows);
      return { ok: true };
    },
  };

  global.HatvitStorage = HatvitStorage;
})(window);
