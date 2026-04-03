-- 햇빛병원 데모 사이트용 DB 스키마 (서버 연동 시 참고)
-- 로컬 데모는 브라우저 localStorage/sessionStorage로 동일 구조를 흉내 냅니다.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(64)  NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(30),
  email         VARCHAR(255),
  kakao_id      VARCHAR(50) UNIQUE,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_kakao ON users (kakao_id);

CREATE TABLE IF NOT EXISTS board_posts (
  id         TEXT PRIMARY KEY,
  user_id    VARCHAR(50) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON board_posts (created_at DESC);

-- 의사(분과별), 실시간 외래 예약(1시간 단위 슬롯)
CREATE TABLE IF NOT EXISTS doctors (
  id         VARCHAR(32) PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  dept_id    VARCHAR(32)  NOT NULL,
  dept_label VARCHAR(50)  NOT NULL,
  active     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_doctors_dept ON doctors (dept_id);

CREATE TABLE IF NOT EXISTS reservations (
  id           TEXT PRIMARY KEY,
  doctor_id    VARCHAR(32) NOT NULL,
  user_id      VARCHAR(50)  NOT NULL,
  patient_name VARCHAR(100) NOT NULL,
  phone        VARCHAR(30)  NOT NULL,
  reserve_date TEXT NOT NULL,
  slot_hour    INTEGER NOT NULL,
  memo         TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE (doctor_id, reserve_date, slot_hour)
);

CREATE INDEX IF NOT EXISTS idx_res_date ON reservations (reserve_date);
CREATE INDEX IF NOT EXISTS idx_res_user ON reservations (user_id);
