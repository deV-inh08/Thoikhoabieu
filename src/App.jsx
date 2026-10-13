import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Printer, MapPin, User, Clock } from "lucide-react";

// ---------- Raw data ----------
const periodTimes = {
  1: ["7h00", "7h50"], 2: ["7h55", "8h45"], 3: ["8h50", "9h40"],
  4: ["9h50", "10h40"], 5: ["10h45", "11h35"], 6: ["13h00", "13h50"],
  7: ["13h55", "14h45"], 8: ["14h55", "15h45"], 9: ["15h50", "16h40"],
  10: ["16h45", "17h35"], 11: ["18h00", "18h50"], 12: ["18h55", "19h45"],
  13: ["19h55", "20h45"], 14: ["20h50", "21h40"],
};
const TOTAL_PERIODS = 14;

function tietRange(tiet) {
  const [start, end] = tiet.split("->").map(Number);
  return { start, end, label: `${periodTimes[start][0]} - ${periodTimes[end][1]}` };
}

const GROUP_COLORS = {
  NNA: { bar: "#4C2E70", bg: "#F2ECFB", label: "Cả lớp (NNA)" },
  N_1: { bar: "#D46FA6", bg: "#FDECF4", label: "Nhóm 1 (N_1)" },
  N_2: { bar: "#8C5AC4", bg: "#F0E7FB", label: "Nhóm 2 (N_2)" },
};

const raw = [
  { lop: "Kỹ năng Đọc - Viết 1", nhom: "NNA", thu: 2, tiet: "1->5", phong: "P502C2", bd: "07/09/2026", kt: "17/10/2026", gv: "Phạm Thị Bích Trâm" },
  { lop: "Kỹ năng Đọc - Viết 1", nhom: "N_1", thu: 2, tiet: "1->5", phong: "P502C2", bd: "19/10/2026", kt: "07/11/2026", gv: "Phạm Thị Bích Trâm" },
  { lop: "Kỹ năng Đọc - Viết 1", nhom: "N_1", thu: 2, tiet: "1->5", phong: "P203C2", bd: "09/11/2026", kt: "28/11/2026", gv: "Phạm Thị Bích Trâm" },
  { lop: "Kỹ năng Đọc - Viết 1", nhom: "N_2", thu: 2, tiet: "6->10", phong: "P403C2", bd: "19/10/2026", kt: "28/11/2026", gv: "Phạm Thị Bích Trâm" },
  { lop: "Nhập môn ngành NN Anh", nhom: "NNA", thu: 3, tiet: "1->5", phong: "301DN", bd: "07/09/2026", kt: "17/10/2026", gv: "Thái Thị Xuân Hà" },
  { lop: "Nhập môn ngành NN Anh", nhom: "N_1", thu: 3, tiet: "1->5", phong: "P203C2", bd: "19/10/2026", kt: "28/11/2026", gv: "Thái Thị Xuân Hà" },
  { lop: "Kỹ năng Nghe - Nói 1", nhom: "NNA", thu: 4, tiet: "1->5", phong: "P402C2", bd: "07/09/2026", kt: "17/10/2026", gv: "Tuấn Anh Hoàng" },
  { lop: "Kỹ năng Nghe - Nói 1", nhom: "N_1", thu: 4, tiet: "1->5", phong: "P402C2", bd: "19/10/2026", kt: "28/11/2026", gv: "Tuấn Anh Hoàng" },
  { lop: "Ngữ âm thực hành", nhom: "N_2", thu: 4, tiet: "6->10", phong: "P203C2", bd: "28/09/2026", kt: "07/11/2026", gv: "Nguyễn Kim Vũ Bảo" },
  { lop: "Ngữ pháp tiếng Anh", nhom: "N_2", thu: 5, tiet: "6->10", phong: "P502C2", bd: "19/10/2026", kt: "28/11/2026", gv: "Huỳnh Thị Thảo Vy" },
  { lop: "Ngữ âm thực hành", nhom: "NNA", thu: 5, tiet: "1->5", phong: "P403C2", bd: "07/09/2026", kt: "26/09/2026", gv: "Nguyễn Kim Vũ Bảo" },
  { lop: "Ngữ âm thực hành", nhom: "N_1", thu: 5, tiet: "1->5", phong: "P203C2", bd: "28/09/2026", kt: "07/11/2026", gv: "Nguyễn Kim Vũ Bảo" },
  { lop: "Ngữ pháp tiếng Anh", nhom: "NNA", thu: 6, tiet: "6->10", phong: "P402C2", bd: "07/09/2026", kt: "17/10/2026", gv: "Huỳnh Thị Thảo Vy" },
  { lop: "Ngữ pháp tiếng Anh", nhom: "N_1", thu: 6, tiet: "6->10", phong: "P402C2", bd: "19/10/2026", kt: "28/11/2026", gv: "Huỳnh Thị Thảo Vy" },
  { lop: "Nhập môn ngành NN Anh", nhom: "N_2", thu: 6, tiet: "1->5", phong: "203DN", bd: "19/10/2026", kt: "28/11/2026", gv: "Thái Thị Xuân Hà" },
  { lop: "Giáo dục thể chất F1", nhom: "NNA", thu: 7, tiet: "7->10", phong: "Sân tập", bd: "07/09/2026", kt: "31/10/2026", gv: "Nguyễn Phi Yến" },
  { lop: "Kỹ năng Nghe - Nói 1", nhom: "N_2", thu: 7, tiet: "1->5", phong: "P402C2", bd: "19/10/2026", kt: "28/11/2026", gv: "Tuấn Anh Hoàng" },
].map((r) => ({ ...r, range: tietRange(r.tiet) }));

// ---------- Date helpers ----------
const pad = (n) => String(n).padStart(2, "0");
const parseDMY = (s) => {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
const fmtDM = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
const fmtDMY = (date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const TERM_START = parseDMY("07/09/2026"); // Monday, Tuần 1
const TOTAL_WEEKS = 12;
const weekMondays = Array.from({ length: TOTAL_WEEKS }, (_, i) => addDays(TERM_START, i * 7));

const getCurrentWeekIndex = (now = new Date()) => {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((todayStart - TERM_START) / (1000 * 60 * 60 * 24));
  const idx = Math.floor(diffDays / 7);
  return Math.min( TOTAL_WEEKS - 1, Math.max(0, idx));
};

const DAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

// ---------- Original cute "little devil" mascot (not any licensed character) ----------
function DevilFace({ size = 22, mood = "wink" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ears */}
      <path d="M9 14 C4 8 4 2 8 1 C10 6 12 9 15 12 Z" fill="#2E1F44" />
      <path d="M31 14 C36 8 36 2 32 1 C30 6 28 9 25 12 Z" fill="#2E1F44" />
      <path d="M9.5 12.5 C6.5 8.5 6.8 4.5 8.8 3.5 C10 7 11.5 9.3 13.5 11.3 Z" fill="#C084E0" />
      <path d="M30.5 12.5 C33.5 8.5 33.2 4.5 31.2 3.5 C30 7 28.5 9.3 26.5 11.3 Z" fill="#C084E0" />
      {/* head */}
      <circle cx="20" cy="22" r="13.5" fill="#3B2158" />
      <circle cx="20" cy="22" r="13.5" fill="url(#devilGrad)" fillOpacity="0.35" />
      {/* bow */}
      <path d="M20 10.5 L23.5 8 L23 11.5 L26.5 10.5 L24.5 13.5 L26.5 16.5 L23 15.5 L23.5 19 L20 16.5 L16.5 19 L17 15.5 L13.5 16.5 L15.5 13.5 L13.5 10.5 L17 11.5 L16.5 8 Z" fill="#D46FA6" />
      <circle cx="20" cy="13.5" r="2" fill="#F6D9E8" />
      {/* face */}
      {mood === "wink" ? (
        <>
          <path d="M14.5 22.5 Q16.5 20.5 18.5 22.5" stroke="#FDF6FF" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <circle cx="24.5" cy="22" r="1.7" fill="#FDF6FF" />
        </>
      ) : (
        <>
          <circle cx="15.5" cy="22" r="1.7" fill="#FDF6FF" />
          <circle cx="24.5" cy="22" r="1.7" fill="#FDF6FF" />
        </>
      )}
      <path d="M17 27 Q20 29.5 23 27" stroke="#FDF6FF" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="12.5" cy="25.5" r="2" fill="#F49AC1" fillOpacity="0.7" />
      <circle cx="27.5" cy="25.5" r="2" fill="#F49AC1" fillOpacity="0.7" />
      <defs>
        <radialGradient id="devilGrad" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0%" stopColor="#8C5AC4" />
          <stop offset="100%" stopColor="#3B2158" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function RibbonBadge({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L14.5 1.5 L14 5.5 L18 4.5 L15.5 8 L18 11.5 L14 10.5 L14.5 14.5 L12 12 L9.5 14.5 L10 10.5 L6 11.5 L8.5 8 L6 4.5 L10 5.5 L9.5 1.5 Z" fill="#D46FA6" />
      <circle cx="12" cy="8" r="2.2" fill="#F6D9E8" />
    </svg>
  );
}

function PolkaDots({ style }) {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }} xmlns="http://www.w3.org/2000/svg">
      <circle cx="6%" cy="30%" r="3" fill="#C084E0" fillOpacity="0.5" />
      <circle cx="14%" cy="70%" r="2" fill="#D46FA6" fillOpacity="0.5" />
      <circle cx="92%" cy="25%" r="2.5" fill="#D46FA6" fillOpacity="0.5" />
      <circle cx="86%" cy="65%" r="2" fill="#C084E0" fillOpacity="0.5" />
      <circle cx="97%" cy="80%" r="3" fill="#8C5AC4" fillOpacity="0.4" />
    </svg>
  );
}

export default function ThoiKhoaBieu() {
  const today = new Date();
  const currentWeekIdx = getCurrentWeekIndex(today);
  const [weekIndex, setWeekIndex] = useState(() => getCurrentWeekIndex());

  const monday = weekMondays[weekIndex];
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);
  const sunday = weekDates[6];

  // For each day, the list of items active during this specific week, sorted by start period.
  const dayItems = useMemo(() => {
    return weekDates.map((date, dayIdx) => {
      const thu = dayIdx === 6 ? 8 : dayIdx + 2; // 2..7, 8 = CN (unused in data)
      return raw
        .filter((item) => {
          if (item.thu !== thu) return false;
          const bd = parseDMY(item.bd);
          const kt = parseDMY(item.kt);
          return date >= bd && date <= kt;
        })
        .sort((a, b) => a.range.start - b.range.start);
    });
  }, [weekDates]);

  // Build the list of grid cells (single-period blanks + multi-period class blocks) per day.
  const dayCells = useMemo(() => {
    return dayItems.map((items) => {
      const cells = [];
      let cursor = 1;
      for (const item of items) {
        if (item.range.start > cursor) {
          cells.push({ type: "blank", start: cursor, end: item.range.start - 1 });
        }
        cells.push({ type: "class", start: item.range.start, end: item.range.end, item });
        cursor = item.range.end + 1;
      }
      if (cursor <= TOTAL_PERIODS) {
        cells.push({ type: "blank", start: cursor, end: TOTAL_PERIODS });
      }
      return cells;
    });
  }, [dayItems]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #EDE3F8 0%, #E4D6F3 100%)",
        fontFamily: "'Quicksand', sans-serif",
        color: "#2E1F44",
        padding: "20px 20px 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#3B2158",
            margin: "0 0 16px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <DevilFace size={34} mood="wink" />
          Thời Khóa Biểu · Ngôn ngữ Anh K67
          <DevilFace size={34} mood="blink" />
        </h1>

        {/* Top selects row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <FakeSelect text="Học kỳ 1 - Năm học 2026 - 2027" />
          <FakeSelect text="Thời khóa biểu Ngôn ngữ Anh K67" />
        </div>

        {/* Week selector row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 320px" }}>
            <NavButton
              disabled={weekIndex === 0}
              onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft size={18} />
            </NavButton>

            <div
              style={{
                flex: 1,
                position: "relative",
                background: "#FFFFFF",
                border: "1px solid #D9C4EE",
                borderRadius: 12,
                padding: "10px 16px",
                fontWeight: 600,
                color: "#3B2352",
                fontSize: 14.5,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <PolkaDots />
              <RibbonBadge size={17} />
              <span>
                Tuần {weekIndex + 1}{" "}
                <span style={{ color: "#8C6FA8", fontWeight: 500 }}>
                  [từ ngày {fmtDMY(monday)} đến ngày {fmtDMY(sunday)}]
                </span>
              </span>
            </div>

            <NavButton
              disabled={weekIndex === TOTAL_WEEKS - 1}
              onClick={() => setWeekIndex((i) => Math.min(TOTAL_WEEKS - 1, i + 1))}
            >
              <ChevronRight size={18} />
            </NavButton>

            <button
              className="no-print"
              onClick={() => setWeekIndex(currentWeekIdx)}
              disabled={weekIndex === currentWeekIdx}
              style={{
                background: weekIndex === currentWeekIdx ? "#F3ECFB" : "#5B3286",
                border: "1px solid #D9C4EE",
                color: weekIndex === currentWeekIdx ? "#9078AC" : "#FFFFFF",
                fontWeight: 600,
                borderRadius: 10,
                padding: "9px 14px",
                cursor: weekIndex === currentWeekIdx ? "default" : "pointer",
                fontSize: 13.5,
                flexShrink: 0,
              }}
            >
              Hôm nay
            </button>
          </div>

          <button
            className="no-print"
            onClick={() => window.print()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#FFFFFF",
              border: "1.5px solid #3FAE6B",
              color: "#3FAE6B",
              fontWeight: 700,
              borderRadius: 10,
              padding: "9px 18px",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <Printer size={16} /> In
          </button>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            {Object.entries(GROUP_COLORS).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#4A3565" }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: val.bar, display: "inline-block" }} />
                {val.label}
              </div>
            ))}
          </div>
        </div>

        {/* Timetable grid — per-period rows, desktop layout */}
        <div style={{ overflowX: "auto", borderRadius: 18, boxShadow: "0 10px 28px rgba(80,40,120,0.15)" }}>
          <div
            style={{
              minWidth: 1040,
              background: "#FFFFFF",
              borderRadius: 18,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "84px repeat(7, 1fr)",
              gridTemplateRows: `64px repeat(${TOTAL_PERIODS}, minmax(46px, auto))`,
            }}
          >
            {/* Corner */}
            <div style={{ gridColumn: 1, gridRow: 1, background: "#2A1A3D" }} />

            {/* Day headers */}
            {DAY_LABELS.map((label, i) => {
              const isToday = sameDay(weekDates[i], today);
              return (
                <div
                  key={label}
                  style={{
                    gridColumn: i + 2,
                    gridRow: 1,
                    background: isToday ? "#5B3286" : "#2A1A3D",
                    color: "#FFFFFF",
                    textAlign: "center",
                    padding: "10px 6px",
                    fontFamily: "'Fredoka', sans-serif",
                    fontWeight: 600,
                    fontSize: 14.5,
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {label}
                  <div style={{ fontWeight: 500, fontSize: 12.5, color: "#D9B9EE", marginTop: 2 }}>
                    ({fmtDM(weekDates[i])})
                  </div>
                </div>
              );
            })}

            {/* Period label column */}
            {Array.from({ length: TOTAL_PERIODS }, (_, i) => {
              const p = i + 1;
              return (
                <div
                  key={p}
                  style={{
                    gridColumn: 1,
                    gridRow: p + 1,
                    background: "#F3ECFB",
                    color: "#5A3D80",
                    borderTop: "1px solid #EADCF7",
                    padding: "6px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>Tiết {p}</div>
                  <div style={{ fontWeight: 500, fontSize: 10.5, color: "#9078AC" }}>{periodTimes[p][0]}</div>
                </div>
              );
            })}

            {/* Day columns: blank filler rows + class blocks spanning their period range */}
            {dayCells.map((cells, dayIdx) =>
              cells.map((cell, cellIdx) => {
                const commonStyle = {
                  gridColumn: dayIdx + 2,
                  gridRow: `${cell.start + 1} / ${cell.end + 2}`,
                  borderTop: "1px solid #EADCF7",
                  borderLeft: "1px solid #F1E7FA",
                };
                if (cell.type === "blank") {
                  return <div key={cellIdx} style={commonStyle} />;
                }
                const item = cell.item;
                const c = GROUP_COLORS[item.nhom];
                return (
                  <div
                    key={cellIdx}
                    style={{
                      ...commonStyle,
                      padding: 5,
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        position: "relative",
                        background: c.bg,
                        borderLeft: `4px solid ${c.bar}`,
                        borderRadius: 8,
                        padding: "7px 9px",
                        fontSize: 12.2,
                        color: "#3B2352",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", top: 4, right: 4, opacity: 0.9 }}>
                        <DevilFace size={16} mood={cellIdx % 2 === 0 ? "wink" : "blink"} />
                      </div>
                      <div style={{ fontWeight: 700, lineHeight: 1.25, paddingRight: 16 }}>{item.lop}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#5A4470" }}>
                        <Clock size={11} /> Tiết {item.tiet.replace("->", "–")} · {item.range.label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#5A4470" }}>
                        <MapPin size={11} /> {item.phong}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#5A4470" }}>
                        <User size={11} /> {item.gv}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeSelect({ text }) {
  return (
    <div
      style={{
        flex: "1 1 260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#FFFFFF",
        border: "1px solid #D9C4EE",
        borderRadius: 12,
        padding: "10px 14px",
        color: "#3B2352",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {text}
      <ChevronDown size={16} color="#8C6FA8" />
    </div>
  );
}

function NavButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        border: "1px solid #D9C4EE",
        background: disabled ? "#F3ECFB" : "#FFFFFF",
        color: disabled ? "#C9B4E0" : "#5A3D80",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
