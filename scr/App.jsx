import { useState, useEffect, useCallback } from “react”;

// ─── Config ───────────────────────────────────────────────────
const STUDIO_PHONE   = “90301779”;
const STUDIO_ADDRESS = “11-р хороолол, Diamond Entertainment Lounge-ын хойд хаалга”;
const BANK_NAME      = “Хаан банк”;
const BANK_ACCOUNT   = “290005005070318300”;
const ADMIN_EMAIL    = “cakely1.mn@gmail.com”;
const ADMIN_PASS     = “Cakely@2024”;
const TIME_SLOTS     = [“10:00”,“12:00”,“14:00”,“16:00”,“18:00”,“20:00”];
const MAX_SLOT       = 6;

const PACKAGES = [
{
id: “solo”,
name: “Нэг хүний багц”,
price: 45000,
emoji: “🎂”,
colorLight: “#fce7f3”,
colorBorder: “#f9a8d4”,
colorDark: “#be185d”,
items: [“Бялууны кекс 1 ширхэг”, “Крем + чимэглэл”, “Уух зүйл 1 ширхэг”, “Заавар зөвлөгөө”],
},
{
id: “duo”,
name: “Хоёр хүний багц”,
price: 80000,
emoji: “🎉”,
colorLight: “#ede9fe”,
colorBorder: “#c4b5fd”,
colorDark: “#5b21b6”,
items: [“Бялууны кекс 2 ширхэг”, “Крем + чимэглэл”, “Уух зүйл 2 ширхэг”, “Заавар зөвлөгөө”],
},
];

const STATUS_COLOR = { pending: “#f59e0b”, confirmed: “#10b981”, cancelled: “#ef4444” };
const STATUS_LABEL = { pending: “Хүлээгдэж буй”, confirmed: “Баталгаажсан”, cancelled: “Цуцлагдсан” };

const fmt      = 👎 => n.toLocaleString() + “₮”;
const makeId   = () => Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── DB layer (localStorage) ──────────────────────────────────
const DB = {
get(key) {
try {
const r = localStorage.getItem(key);
return r ? JSON.parse(r) : null;
} catch {
return null;
}
},
set(key, val) {
try {
localStorage.setItem(key, JSON.stringify(val));
} catch (e) {
console.error(“DB error”, e);
}
},
getBookings()    { return DB.get(“ck:bookings”)  || []; },
setBookings(v)   { DB.set(“ck:bookings”, v); },
getHolidays()    { return DB.get(“ck:holidays”)  || []; },
setHolidays(v)   { DB.set(“ck:holidays”, v); },
};

// ─── Global CSS ───────────────────────────────────────────────
function GlobalCSS() {
return (
<style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } html { scroll-behavior: smooth; } body { font-family: 'DM Sans', sans-serif; background: #fffaf7; color: #1a1a1a; } .serif { font-family: 'Cormorant Garamond', serif; } input, select, textarea { font-family: 'DM Sans', sans-serif; outline: none; border: 1.5px solid #e8ddd5; border-radius: 10px; padding: 11px 15px; font-size: 14px; background: #fff; width: 100%; transition: border-color .2s, box-shadow .2s; } input:focus, select:focus, textarea:focus { border-color: #c084a8; box-shadow: 0 0 0 3px rgba(192,132,168,.13); } button { cursor: pointer; font-family: 'DM Sans', sans-serif; } @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to   { opacity: 1; transform: translateY(0); } } .f1 { animation: fadeUp .5s ease both; } .f2 { animation: fadeUp .5s .1s ease both; } .f3 { animation: fadeUp .5s .2s ease both; } .f4 { animation: fadeUp .5s .3s ease both; } @keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin .7s linear infinite; display: inline-block; }`}</style>
);
}

// ─── Shared UI components ─────────────────────────────────────
function Blob({ top, right, bottom, left, size, color }) {
return (
<div style={{
position: “absolute”,
top: top, right: right, bottom: bottom, left: left,
width: size, height: size,
borderRadius: “50%”,
background: color,
pointerEvents: “none”,
}} />
);
}

function PrimaryBtn({ children, onClick, disabled, fullWidth }) {
return (
<button
onClick={onClick}
disabled={disabled}
style={{
background: disabled ? “#e5e7eb” : “#1a1a1a”,
color: disabled ? “#9ca3af” : “#fff”,
border: “none”,
borderRadius: 13,
padding: “14px 36px”,
fontSize: 15,
fontWeight: 600,
letterSpacing: “.2px”,
boxShadow: disabled ? “none” : “0 6px 24px rgba(0,0,0,.16)”,
transition: “transform .18s, box-shadow .18s”,
cursor: disabled ? “not-allowed” : “pointer”,
width: fullWidth ? “100%” : undefined,
}}
onMouseEnter={(e) => {
if (!disabled) {
e.currentTarget.style.transform = “translateY(-2px)”;
e.currentTarget.style.boxShadow = “0 10px 32px rgba(0,0,0,.22)”;
}
}}
onMouseLeave={(e) => {
e.currentTarget.style.transform = “”;
e.currentTarget.style.boxShadow = disabled ? “none” : “0 6px 24px rgba(0,0,0,.16)”;
}}

{children}
</button>
);
}

function FieldLabel({ children }) {
return (
<label style={{ display: “block”, marginBottom: 7, fontSize: 13, fontWeight: 600, color: “#555” }}>
{children}
</label>
);
}

function FieldError({ msg }) {
if (!msg) return null;
return <p style={{ fontSize: 12, color: “#ef4444”, marginTop: 4 }}>{msg}</p>;
}

function BackBtn({ onClick }) {
return (
<button
onClick={onClick}
style={{
background: “none”, border: “none”, color: “#999”,
fontSize: 13, marginBottom: 22,
display: “flex”, alignItems: “center”, gap: 5,
}}

← Буцах
</button>
);
}

function YellowAlert({ children }) {
return (
<div style={{
background: “#fef3c7”, border: “1px solid #fcd34d”,
borderRadius: 10, padding: “12px 16px”,
marginBottom: 20, fontSize: 13, color: “#92400e”, lineHeight: 1.6,
}}>
{children}
</div>
);
}

function SectionHead({ sub, title }) {
return (
<div style={{ textAlign: “center”, marginBottom: 52 }}>
<p style={{ fontSize: 10, fontWeight: 700, letterSpacing: “2.5px”, textTransform: “uppercase”, color: “#c084a8”, marginBottom: 10 }}>{sub}</p>
<h2 className=“serif” style={{ fontSize: 42, fontWeight: 400, color: “#1a1a1a” }}>{title}</h2>
</div>
);
}

// ─── Nav ─────────────────────────────────────────────────────
function Nav({ activePage, setPage }) {
return (
<nav style={{
position: “sticky”, top: 0, zIndex: 200, height: 62,
background: “rgba(255,250,247,.93)”, backdropFilter: “blur(14px)”,
borderBottom: “1px solid #f0e6de”,
display: “flex”, alignItems: “center”, justifyContent: “space-between”,
padding: “0 clamp(16px,4vw,44px)”,
}}>
<button
onClick={() => setPage(“home”)}
style={{ background: “none”, border: “none”, display: “flex”, alignItems: “center”, gap: 8 }}

<span style={{ fontSize: 22 }}>🎂</span>
<span className=“serif” style={{ fontSize: 21, fontWeight: 600, color: “#1a1a1a”, letterSpacing: “.4px” }}>
Cakely Studio
</span>
</button>
<div style={{ display: “flex”, gap: 6, alignItems: “center” }}>
{[[“home”,“Нүүр”], [“book”,“Захиалах”]].map(([k, l]) => (
<button
key={k}
onClick={() => setPage(k)}
style={{
background: activePage === k ? “#1a1a1a” : “transparent”,
color: activePage === k ? “#fff” : “#555”,
border: “none”, borderRadius: 8, padding: “7px 16px”,
fontSize: 13, fontWeight: 500, transition: “all .18s”,
}}

{l}
</button>
))}
<button
onClick={() => setPage(“admin”)}
style={{
background: “transparent”, color: “#bbb”,
border: “1px solid #e8ddd5”, borderRadius: 8,
padding: “7px 13px”, fontSize: 12, marginLeft: 4,
}}

⚙
</button>
</div>
</nav>
);
}

// ═══════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
const [page,     setPage]          = useState(“home”);
const [bookings, setBookingsState] = useState([]);
const [holidays, setHolidaysState] = useState([]);
const [lastBook, setLastBook]      = useState(null);

// Load from localStorage on mount
useEffect(() => {
setBookingsState(DB.getBookings());
setHolidaysState(DB.getHolidays());
}, []);

const setBookings = useCallback((list) => {
setBookingsState(list);
DB.setBookings(list);
}, []);

const setHolidays = useCallback((list) => {
setHolidaysState(list);
DB.setHolidays(list);
}, []);

const addBooking = useCallback((data) => {
const b = { …data, id: makeId(), status: “pending”, createdAt: new Date().toISOString() };
setBookings([…bookings, b]);
setLastBook(b);
setPage(“success”);
}, [bookings, setBookings]);

const updateBooking = useCallback((id, patch) => {
setBookings(bookings.map((b) => b.id === id ? { …b, …patch } : b));
}, [bookings, setBookings]);

const slotCount = (date, time) =>
bookings.filter((b) => b.date === date && b.time === time && b.status !== “cancelled”).length;

const shared = { setPage, bookings, holidays, setHolidays, slotCount, addBooking, updateBooking, lastBook };

return (
<>
<GlobalCSS />
{page === “home”    && <HomePage    {…shared} />}
{page === “book”    && <BookPage    {…shared} />}
{page === “success” && <SuccessPage {…shared} />}
{page === “admin”   && <AdminPage   {…shared} />}
</>
);
}

// ═══════════════════════════════════════════════════════════════
//  HOME PAGE
// ═══════════════════════════════════════════════════════════════
function HomePage({ setPage }) {
return (
<div>
<Nav activePage="home" setPage={setPage} />

  {/* Hero */}
  <section style={{
    minHeight: "88vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "60px 24px",
    background: "linear-gradient(150deg,#fff5f0 0%,#fdf0fa 55%,#f0eeff 100%)",
    position: "relative", overflow: "hidden",
  }}>
    <Blob top={-120} right={-120} size={480} color="radial-gradient(circle,rgba(249,168,212,.22) 0%,transparent 70%)" />
    <Blob bottom={-80} left={-80} size={340} color="radial-gradient(circle,rgba(196,181,253,.18) 0%,transparent 70%)" />

    <div className="f1" style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(255,255,255,.75)", border: "1px solid #f0e6de",
      borderRadius: 100, padding: "6px 20px",
      fontSize: 11, fontWeight: 700, letterSpacing: "2.5px",
      textTransform: "uppercase", color: "#c084a8", marginBottom: 28,
    }}>
      🍰 Бялуу чимэглэлийн студио
    </div>

    <h1 className="serif f2" style={{ fontSize: "clamp(40px,8vw,84px)", fontWeight: 300, lineHeight: 1.1, color: "#1a1a1a", marginBottom: 18 }}>
      Өөрийн гараар<br />
      <em style={{ color: "#c084a8" }}>бялуугаа чимэглэ</em>
    </h1>

    <p className="f3" style={{ fontSize: 16, color: "#666", maxWidth: 460, lineHeight: 1.75, marginBottom: 44 }}>
      Найзуудь гэр бүлээрээ цагийг хөгжилтэй өнгөрүүлж, өөрийн хэв маягаар өөрийн бялууг чимэглээрэй.
    </p>

    <div className="f4">
      <PrimaryBtn onClick={() => setPage("book")}>Цаг захиалах →</PrimaryBtn>
    </div>
  </section>

  {/* Packages */}
  <section style={{ padding: "80px clamp(16px,5vw,60px)", background: "#fff" }}>
    <SectionHead sub="БАГЦУУД" title="Багцаа сонгох" />
    <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 24 }}>
      {PACKAGES.map((p, i) => (
        <div
          key={p.id}
          style={{
            border: "2px solid " + p.colorBorder,
            borderRadius: 24, padding: 36,
            background: "#fff", position: "relative", overflow: "hidden",
            animation: "fadeUp .6s " + (i * 0.13) + "s ease both",
          }}
        >
          <div style={{
            position: "absolute", top: -24, right: -24,
            width: 110, height: 110, borderRadius: "50%",
            background: p.colorLight, opacity: .55,
          }} />
          <div style={{ fontSize: 40, marginBottom: 16 }}>{p.emoji}</div>
          <h3 className="serif" style={{ fontSize: 26, fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
          <p style={{ fontSize: 28, fontWeight: 700, color: p.colorDark, marginBottom: 24 }}>{fmt(p.price)}</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {p.items.map((it) => (
              <li key={it} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#444" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.colorDark, flexShrink: 0 }} />
                {it}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setPage("book")}
            style={{
              marginTop: 28, width: "100%", background: p.colorDark, color: "#fff",
              border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 600, fontSize: 14,
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = ".82"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Захиалах
          </button>
        </div>
      ))}
    </div>
  </section>

  {/* Info */}
  <section style={{ padding: "72px clamp(16px,5vw,60px)", background: "#fffaf7" }}>
    <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
      {[
        { icon: "📍", label: "Хаяг",           val: STUDIO_ADDRESS },
        { icon: "📞", label: "Утас",            val: STUDIO_PHONE },
        { icon: "🕙", label: "Цагийн хуваарь", val: "10:00 – 20:00 (1 session 90 минут үргэлжилнэ.)" },
      ].map((it) => (
        <div key={it.label} style={{
          background: "#fff", borderRadius: 20, padding: 28,
          border: "1px solid #f0e6de", boxShadow: "0 2px 14px rgba(0,0,0,.04)",
        }}>
          <div style={{ fontSize: 26, marginBottom: 12 }}>{it.icon}</div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "#c084a8", marginBottom: 6 }}>{it.label}</p>
          <p style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{it.val}</p>
        </div>
      ))}
    </div>
  </section>

  <footer style={{ background: "#1a1a1a", color: "#888", textAlign: "center", padding: "30px 24px", fontSize: 13 }}>
    <p className="serif" style={{ fontSize: 20, color: "#fff", marginBottom: 5 }}>Cakely Studio</p>
    <p>{STUDIO_PHONE} · {STUDIO_ADDRESS}</p>
  </footer>
</div>

);
}

// ═══════════════════════════════════════════════════════════════
//  BOOK PAGE
// ═══════════════════════════════════════════════════════════════
function BookPage({ setPage, slotCount, addBooking, holidays }) {
const [step,   setStep]   = useState(1);
const [pkg,    setPkg]    = useState(null);
const [date,   setDate]   = useState(todayStr());
const [time,   setTime]   = useState(””);
const [form,   setForm]   = useState({ name: “”, phone: “”, email: “” });
const [errors, setErrors] = useState({});
const [saving, setSaving] = useState(false);

const isHoliday = holidays.includes(date);

const validate = () => {
const e = {};
if (!form.name.trim()) e.name = “Нэрээ оруулна уу”;
if (!/^\d{8}$/.test(form.phone.replace(/\s/g, “”))) e.phone = “Утасны дугаараа оруулна уу”;
if (!form.email.includes(”@”)) e.email = “Мэйл хаяг оруулна уу”;
setErrors(e);
return Object.keys(e).length === 0;
};

const submit = () => {
if (!validate()) return;
setSaving(true);
addBooking({ …form, date, time, package: pkg.id, packageName: pkg.name, price: pkg.price });
setSaving(false);
};

return (
<div>
<Nav activePage="book" setPage={setPage} />
<div style={{ maxWidth: 580, margin: “0 auto”, padding: “48px clamp(16px,4vw,32px)” }}>

    {/* Stepper */}
    <div style={{ display: "flex", alignItems: "center", marginBottom: 46 }}>
      {["Багц", "Цаг", "Мэдээлэл"].map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all .25s",
            background: step > i + 1 ? "#1a1a1a" : step === i + 1 ? "#c084a8" : "#f0e6de",
            color: step >= i + 1 ? "#fff" : "#bbb",
          }}>
            {step > i + 1 ? "✓" : i + 1}
          </div>
          <span style={{ marginLeft: 7, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", color: step === i + 1 ? "#1a1a1a" : "#bbb" }}>
            {s}
          </span>
          {i < 2 && (
            <div style={{ flex: 1, height: 1, background: step > i + 1 ? "#1a1a1a" : "#e8ddd5", margin: "0 10px", transition: "background .25s" }} />
          )}
        </div>
      ))}
    </div>

    {/* Step 1 – Package */}
    {step === 1 && (
      <div className="f1">
        <h2 className="serif" style={{ fontSize: 34, marginBottom: 8 }}>Багцаа сонгоно уу</h2>
        <p style={{ color: "#888", marginBottom: 28, fontSize: 14 }}>Багцаа сонгоно уу</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPkg(p); setStep(2); }}
              style={{
                border: "2px solid " + (pkg?.id === p.id ? p.colorDark : p.colorBorder),
                borderRadius: 18, padding: "22px 26px",
                background: pkg?.id === p.id ? p.colorLight : "#fff",
                display: "flex", alignItems: "center", gap: 18,
                transition: "all .18s", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 32 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 3 }}>{p.name}</p>
                <p style={{ fontSize: 12, color: "#888" }}>{p.items.join(" · ")}</p>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: p.colorDark, whiteSpace: "nowrap" }}>{fmt(p.price)}</p>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Step 2 – Date / Time */}
    {step === 2 && (
      <div className="f1">
        <BackBtn onClick={() => setStep(1)} />
        <h2 className="serif" style={{ fontSize: 34, marginBottom: 8 }}>Өдөр, цаг сонгоно уу</h2>
        <p style={{ color: "#888", marginBottom: 28, fontSize: 14 }}>
          Сонгосон багц: <strong style={{ color: "#1a1a1a" }}>{pkg?.name}</strong>
        </p>

        <FieldLabel>Өдөр</FieldLabel>
        <input
          type="date"
          value={date}
          min={todayStr()}
          onChange={(e) => { setDate(e.target.value); setTime(""); }}
          style={{ marginBottom: 24 }}
        />

        {isHoliday ? (
          <YellowAlert>⚠️ Амралт.</YellowAlert>
        ) : (
          <>
            <FieldLabel>Цаг сонгоно уу</FieldLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
              {TIME_SLOTS.map((t) => {
                const used = slotCount(date, t);
                const left = MAX_SLOT - used;
                const full = left <= 0;
                const sel  = time === t;
                return (
                  <button
                    key={t}
                    disabled={full}
                    onClick={() => setTime(t)}
                    style={{
                      border: "2px solid " + (sel ? "#1a1a1a" : full ? "#f0e6de" : "#e8ddd5"),
                      borderRadius: 12, padding: "12px 8px",
                      background: sel ? "#1a1a1a" : full ? "#fafafa" : "#fff",
                      color: sel ? "#fff" : full ? "#ccc" : "#1a1a1a",
                      cursor: full ? "not-allowed" : "pointer",
                      transition: "all .14s",
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{t}</p>
                    <p style={{ fontSize: 11, marginTop: 3, color: sel ? "#ddd" : full ? "#ccc" : left <= 2 ? "#f59e0b" : "#6b7280" }}>
                      {full ? "Дүүрсэн" : left + " суудал"}
                    </p>
                  </button>
                );
              })}
            </div>
            <PrimaryBtn disabled={!time} onClick={() => setStep(3)} fullWidth>
              Үргэлжлүүлэх →
            </PrimaryBtn>
          </>
        )}
      </div>
    )}

    {/* Step 3 – Contact */}
    {step === 3 && (
      <div className="f1">
        <BackBtn onClick={() => setStep(2)} />
        <h2 className="serif" style={{ fontSize: 34, marginBottom: 8 }}>Мэдээлэл оруулна уу</h2>
        <p style={{ color: "#888", marginBottom: 28, fontSize: 14 }}>{pkg?.name} · {date} · {time}</p>

        {[
          { key: "name",  label: "Нэр",    ph: "Таны нэр",          type: "text" },
          { key: "phone", label: "Утас",   ph: "99999999",          type: "tel" },
          { key: "email", label: "И-мэйл", ph: "email@example.com", type: "email" },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom: 18 }}>
            <FieldLabel>{f.label}</FieldLabel>
            <input
              type={f.type}
              placeholder={f.ph}
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              style={{ borderColor: errors[f.key] ? "#f87171" : "#e8ddd5" }}
            />
            <FieldError msg={errors[f.key]} />
          </div>
        ))}

        {/* Summary */}
        <div style={{ background: "#f9f5ff", border: "1px solid #e9d5ff", borderRadius: 14, padding: 18, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", marginBottom: 10, letterSpacing: ".5px" }}>
            📋 ЗАХИАЛГЫН ДЭЛГЭРЭНГҮЙ
          </p>
          {[["Багц", pkg?.name], ["Өдөр", date], ["Цаг", time], ["Үнэ", fmt(pkg?.price)]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#888" }}>{k}</span>
              <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{v}</span>
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={saving}
          style={{
            width: "100%", background: "#c084a8", color: "#fff",
            border: "none", borderRadius: 12, padding: "15px 0",
            fontWeight: 700, fontSize: 15, letterSpacing: ".2px",
            boxShadow: "0 4px 18px rgba(192,132,168,.38)",
            opacity: saving ? .7 : 1, transition: "opacity .2s",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Хадгалж байна..." : "Захиалга илгээх 🎂"}
        </button>
      </div>
    )}
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════
//  SUCCESS PAGE
// ═══════════════════════════════════════════════════════════════
function SuccessPage({ setPage, lastBook }) {
if (!lastBook) { setPage(“home”); return null; }
const pkg = PACKAGES.find((p) => p.id === lastBook.package);
return (
<div style={{
minHeight: “100vh”,
background: “linear-gradient(135deg,#fff5f0,#f5f0ff)”,
display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”,
padding: 24,
}}>
<div style={{
maxWidth: 480, width: “100%”,
background: “#fff”, borderRadius: 28, padding: “44px 36px”,
textAlign: “center”, boxShadow: “0 20px 60px rgba(0,0,0,.08)”,
}}>
<div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
<h2 className=“serif” style={{ fontSize: 34, marginBottom: 8 }}>Захиалга амжилттай!</h2>
<p style={{ color: “#888”, marginBottom: 28, fontSize: 14, lineHeight: 1.75 }}>
Захиалгын дугаар: <strong style={{ color: “#1a1a1a” }}>#{lastBook.id}</strong><br />
Та <strong>{lastBook.email}</strong>-руу баталгаажих и-мэйл хүлээж авна.
</p>

    <div style={{ background: "#fdf4ff", border: "1px dashed #e9d5ff", borderRadius: 14, padding: 18, marginBottom: 20, textAlign: "left" }}>
      {[
        ["Багц",  pkg?.name],
        ["Өдөр",  lastBook.date],
        ["Цаг",   lastBook.time],
        ["Нэр",   lastBook.name],
        ["Утас",  lastBook.phone],
        ["Үнэ",   fmt(pkg?.price)],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
          <span style={{ color: "#888" }}>{k}</span>
          <span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>

    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 16, marginBottom: 26, textAlign: "left", fontSize: 13 }}>
      <p style={{ fontWeight: 700, color: "#c2410c", marginBottom: 8 }}>💳 Төлбөр шилжүүлэх</p>
      <p style={{ color: "#555", lineHeight: 1.8 }}>
        <strong>{BANK_NAME}</strong> · <strong>{BANK_ACCOUNT}</strong><br />
        Гүйлгээний утга: <strong>{lastBook.phone}</strong><br />
        Дүн: <strong style={{ color: "#c2410c" }}>{fmt(pkg?.price)}</strong>
      </p>
      <p style={{ marginTop: 8, color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>
        Төлбөр орсны дараа админ баталгаажуулж и-мэйл илгээнэ.
      </p>
    </div>

    <PrimaryBtn onClick={() => setPage("home")} fullWidth>Нүүр хуудас руу буцах</PrimaryBtn>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════
function AdminLogin({ onSuccess, setPage }) {
const [email,    setEmail]    = useState(””);
const [password, setPassword] = useState(””);
const [err,      setErr]      = useState(””);
const [loading,  setLoading]  = useState(false);
const [showPw,   setShowPw]   = useState(false);

const handleLogin = (e) => {
e.preventDefault();
setErr(””);
setLoading(true);
setTimeout(() => {
if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
onSuccess();
} else {
setErr(“И-мэйл эсвэл нууц үг буруу байна.”);
}
setLoading(false);
}, 600);
};

return (
<div style={{
minHeight: “100vh”,
background: “linear-gradient(135deg,#1a1a1a 0%,#2d1b2e 100%)”,
display: “flex”, alignItems: “center”, justifyContent: “center”, padding: 24,
}}>
<div className=“f1” style={{
background: “#fff”, borderRadius: 28, padding: “48px 40px”,
width: “100%”, maxWidth: 400,
boxShadow: “0 32px 80px rgba(0,0,0,.35)”,
}}>
<div style={{ textAlign: “center”, marginBottom: 32 }}>
<div style={{ fontSize: 40, marginBottom: 8 }}>🎂</div>
<h1 className=“serif” style={{ fontSize: 26, fontWeight: 600, color: “#1a1a1a” }}>Cakely Studio</h1>
<p style={{ fontSize: 13, color: “#aaa”, marginTop: 4 }}>Админ удирдлагын систем</p>
</div>

    <div style={{ height: 1, background: "#f0e6de", marginBottom: 28 }} />

    <form onSubmit={handleLogin}>
      <div style={{ marginBottom: 16 }}>
        <FieldLabel>И-мэйл хаяг</FieldLabel>
        <input
          type="email"
          placeholder="cakely1.mn@gmail.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(""); }}
          autoComplete="username"
        />
      </div>

      <div style={{ marginBottom: 20, position: "relative" }}>
        <FieldLabel>Нууц үг</FieldLabel>
        <input
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErr(""); }}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", fontSize: 16, color: "#aaa", padding: 0 }}
        >
          {showPw ? "🙈" : "👁"}
        </button>
      </div>

      {err && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
          ⚠️ {err}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        style={{
          width: "100%",
          background: loading || !email || !password ? "#e5e7eb" : "#1a1a1a",
          color: loading || !email || !password ? "#9ca3af" : "#fff",
          border: "none", borderRadius: 12, padding: "14px 0",
          fontWeight: 600, fontSize: 15, transition: "all .2s",
          cursor: loading || !email || !password ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
      </button>
    </form>

    <button
      onClick={() => setPage("home")}
      style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "#bbb", fontSize: 13 }}
    >
      ← Нүүр хуудасруу буцах
    </button>
  </div>
</div>

);
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN PAGE
// ═══════════════════════════════════════════════════════════════
function AdminPage({ setPage, bookings, updateBooking, holidays, setHolidays }) {
const [authed,  setAuthed]  = useState(false);
const [tab,     setTab]     = useState(“bookings”);
const [filter,  setFilter]  = useState(“all”);
const [newHol,  setNewHol]  = useState(””);
const [schedDt, setSchedDt] = useState(todayStr());

if (!authed) {
return <AdminLogin onSuccess={() => setAuthed(true)} setPage={setPage} />;
}

const filtered = filter === “all” ? bookings : bookings.filter((b) => b.status === filter);

const addHoliday = () => {
if (newHol && !holidays.includes(newHol)) {
setHolidays([…holidays, newHol].sort());
setNewHol(””);
}
};

const removeHoliday = (d) => {
setHolidays(holidays.filter((h) => h !== d));
};

return (
<div style={{ minHeight: “100vh”, background: “#f7f7f7” }}>
{/* Top bar */}
<div style={{
background: “#1a1a1a”, color: “#fff”,
display: “flex”, alignItems: “center”, justifyContent: “space-between”,
padding: “0 clamp(16px,4vw,40px)”, height: 58,
}}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
<span style={{ fontSize: 18 }}>🎂</span>
<span className=“serif” style={{ fontSize: 18, fontWeight: 600 }}>Cakely Admin</span>
<span style={{ fontSize: 11, background: “rgba(255,255,255,.12)”, borderRadius: 6, padding: “2px 8px”, marginLeft: 4, color: “#ddd” }}>
{ADMIN_EMAIL}
</span>
</div>
<div style={{ display: “flex”, gap: 6, alignItems: “center” }}>
{[[“bookings”,“📋 Захиалгууд”], [“calendar”,“📅 Хуваарь”]].map(([k, l]) => (
<button
key={k}
onClick={() => setTab(k)}
style={{
background: tab === k ? “rgba(255,255,255,.15)” : “none”,
border: “none”, color: tab === k ? “#fff” : “#999”,
borderRadius: 8, padding: “6px 14px”, fontSize: 13, fontWeight: 500,
}}

{l}
</button>
))}
<button
onClick={() => setAuthed(false)}
style={{ background: “none”, border: “1px solid #444”, color: “#888”, borderRadius: 8, padding: “5px 12px”, fontSize: 12, marginLeft: 8 }}

Гарах
</button>
</div>
</div>

  <div style={{ maxWidth: 1060, margin: "0 auto", padding: "28px clamp(12px,3vw,28px)" }}>

    {/* ── BOOKINGS ── */}
    {tab === "bookings" && (
      <>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Нийт",           val: bookings.length,                                        color: "#6366f1" },
            { label: "Хүлээгдэж буй", val: bookings.filter((b) => b.status === "pending").length,   color: "#f59e0b" },
            { label: "Баталгаажсан",  val: bookings.filter((b) => b.status === "confirmed").length, color: "#10b981" },
            { label: "Цуцлагдсан",    val: bookings.filter((b) => b.status === "cancelled").length, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "18px 22px", boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
              <p style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{s.val}</p>
              <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
          {[["all","Бүгд"], ["pending","Хүлээгдэж буй"], ["confirmed","Баталгаажсан"], ["cancelled","Цуцлагдсан"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                background: filter === k ? "#1a1a1a" : "#fff",
                color: filter === k ? "#fff" : "#666",
                border: "1px solid #e8ddd5", borderRadius: 8,
                padding: "7px 16px", fontSize: 13, fontWeight: 500,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#bbb", fontSize: 14 }}>Захиалга байхгүй байна</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0e6de" }}>
                    {["#ID","Нэр","Утас","И-мэйл","Багц","Өдөр","Цаг","Үнэ","Төлөв","Үйлдэл"].map((h) => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice().reverse().map((b, i) => {
                    const pkg = PACKAGES.find((p) => p.id === b.package);
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #f8f8f8", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#bbb" }}>#{b.id}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600 }}>{b.name}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13 }}>{b.phone}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: "#777", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.email}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12 }}>{pkg?.name}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600 }}>{b.date}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13 }}>{b.time}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#5b21b6" }}>{fmt(b.price)}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{
                            background: STATUS_COLOR[b.status] + "22",
                            color: STATUS_COLOR[b.status],
                            borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                          }}>
                            {STATUS_LABEL[b.status]}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", gap: 5 }}>
                            {b.status === "pending" && (
                              <button
                                onClick={() => updateBooking(b.id, { status: "confirmed" })}
                                style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                ✓ Баталгаажуулах
                              </button>
                            )}
                            {b.status !== "cancelled" && (
                              <button
                                onClick={() => updateBooking(b.id, { status: "cancelled" })}
                                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600 }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}

    {/* ── CALENDAR ── */}
    {tab === "calendar" && (
      <div>
        <h2 className="serif" style={{ fontSize: 28, marginBottom: 6 }}>Хуваарь удирдах</h2>
        <p style={{ color: "#999", fontSize: 14, marginBottom: 36 }}>Амралтын өдөр тохируулах ба өдрийн захиалгын байдал харах</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 28 }}>

          {/* Holidays */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🛑 Амралтын өдрүүд</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input type="date" value={newHol} onChange={(e) => setNewHol(e.target.value)} style={{ flex: 1 }} />
              <button
                onClick={addHoliday}
                style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 9, padding: "0 18px", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}
              >
                + Нэмэх
              </button>
            </div>
            {holidays.length === 0 ? (
              <p style={{ color: "#ccc", fontSize: 13 }}>Амралтын өдөр байхгүй</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {holidays.map((h) => (
                  <div key={h} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 9, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span>📅 {h}</span>
                    <button
                      onClick={() => removeHoliday(h)}
                      style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 5, padding: "1px 7px", fontSize: 12, fontWeight: 700 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily schedule */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📊 Өдрийн захиалгын байдал</h3>
            <input type="date" value={schedDt} onChange={(e) => setSchedDt(e.target.value)} style={{ marginBottom: 16 }} />
            {holidays.includes(schedDt) ? (
              <YellowAlert>⚠️ Амралтын өдөр – захиалга авахгүй</YellowAlert>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {TIME_SLOTS.map((t) => {
                  const list = bookings.filter((b) => b.date === schedDt && b.time === t && b.status !== "cancelled");
                  const left = MAX_SLOT - list.length;
                  return (
                    <div key={t} style={{ border: "1px solid #f0e6de", borderRadius: 12, padding: "12px 10px", background: left === 0 ? "#fff5f5" : "#fff" }}>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{t}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: left === 0 ? "#ef4444" : left <= 2 ? "#f59e0b" : "#10b981" }}>
                        {left === 0 ? "Дүүрсэн" : list.length + "/" + MAX_SLOT}
                      </p>
                      {list.map((b) => (
                        <p key={b.id} style={{ fontSize: 10, color: "#999", marginTop: 3 }}>• {b.name}</p>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>

);
}
