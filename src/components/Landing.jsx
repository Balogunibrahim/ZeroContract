const CSS = `
.zc-landing{--ink:#16211C;--muted:#5E6B63;--faint:#93A099;--line:#E5EAE6;--brand:#0A7B57;--deep:#0B3D2E;--tint:#E6F2EC;--gold:#E0A02B;--paper:#F4F6F3;
  font-family:'Inter',-apple-system,sans-serif;color:var(--ink);background:#fff;min-height:100vh;overflow-x:hidden;text-align:left}
.zc-landing *{box-sizing:border-box}
.zc-landing .wrap{max-width:1080px;margin:0 auto;padding:0 40px}
.zc-landing a{text-decoration:none}
.zc-landing .nav{display:flex;align-items:center;justify-content:space-between;height:72px;border-bottom:1px solid var(--line)}
.zc-landing .brand{display:flex;align-items:center;gap:10px}
.zc-landing .brand svg{width:32px;height:32px}
.zc-landing .brand .bn{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700}
.zc-landing .brand .bn span{color:var(--brand)}
.zc-landing .navlinks{display:flex;gap:30px}
.zc-landing .navlinks a{color:var(--muted);font-size:14px;font-weight:500;cursor:pointer}
.zc-landing .navbtn{background:var(--deep);color:#fff;font-weight:600;font-size:13.5px;padding:10px 18px;border-radius:11px;border:none;cursor:pointer;font-family:'Inter',sans-serif}
.zc-landing .hero{background:radial-gradient(120% 90% at 10% 0%,#0F5C43,transparent 55%),radial-gradient(120% 100% at 100% 100%,#092b21,transparent 55%),#0B3D2E;color:#fff}
.zc-landing .herogrid{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;padding:60px 40px 66px;max-width:1080px;margin:0 auto}
.zc-landing .eyebrow{font-family:'Space Grotesk',sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#7FC9AC;font-weight:600;margin-bottom:18px}
.zc-landing .hero h1{font-family:'Space Grotesk',sans-serif;font-size:54px;font-weight:700;letter-spacing:-.03em;line-height:1.02;margin:0}
.zc-landing .hero h1 em{font-style:normal;color:#F0C766}
.zc-landing .hero .sub{font-size:17px;color:#BFE0D3;line-height:1.55;margin-top:20px;max-width:440px}
.zc-landing .ctarow{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}
.zc-landing .btn-primary{background:#F0C766;color:#0B3D2E;font-weight:700;font-size:15px;padding:14px 26px;border-radius:13px;border:none;cursor:pointer;font-family:'Inter',sans-serif}
.zc-landing .btn-ghost{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.28);font-weight:600;font-size:15px;padding:14px 24px;border-radius:13px;cursor:pointer;font-family:'Inter',sans-serif}
.zc-landing .trust{font-size:12.5px;color:#8FB3A5;margin-top:22px}
.zc-landing .trust b{color:#DCEBE3;font-weight:600}
.zc-landing .phonewrap{display:flex;justify-content:center}
.zc-landing .phone{width:280px;background:#0A140F;border-radius:40px;padding:9px;box-shadow:0 40px 80px -24px rgba(0,0,0,.6);transform:rotate(1.5deg)}
.zc-landing .screen{background:var(--paper);border-radius:32px;overflow:hidden;padding:16px 15px 20px}
.zc-landing .pg{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.zc-landing .pg .g1{font-size:11px;color:var(--muted)}.zc-landing .pg .g2{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700}
.zc-landing .pav{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0A7B57,#0B3D2E);color:#fff;display:grid;place-items:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px}
.zc-landing .phero{background:linear-gradient(150deg,#0B4835,#0B3D2E);border-radius:20px;padding:17px 16px;color:#fff}
.zc-landing .phero .l{font-size:10.5px;color:#9FD0BE}
.zc-landing .phero .amt{font-family:'Space Grotesk',sans-serif;font-size:33px;font-weight:700;letter-spacing:-.02em;margin-top:3px}
.zc-landing .phero .amt span{color:#7FC9AC;font-size:20px}
.zc-landing .phero .row{display:flex;gap:12px;margin-top:10px}
.zc-landing .phero .row div{font-size:10px;color:#BFE0D3}
.zc-landing .phero .row b{display:block;font-family:'Space Grotesk',sans-serif;font-size:12.5px;color:#fff;font-weight:600}
.zc-landing .pcount{background:linear-gradient(135deg,#FDF6E6,#FBF1DC);border:1px solid #EFDCAF;border-radius:16px;padding:12px 13px;margin-top:11px;display:flex;align-items:center;gap:12px}
.zc-landing .pcount .ring{width:42px;height:42px;flex:0 0 42px;border-radius:50%;background:conic-gradient(var(--gold) 0 80%,#F1E2BC 80% 100%);display:grid;place-items:center}
.zc-landing .pcount .ring b{width:32px;height:32px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;line-height:1}
.zc-landing .pcount .ring b i{font-style:normal;font-size:15px;font-weight:700;color:#B77E17}
.zc-landing .pcount .ring b em{font-style:normal;font-size:6.5px;font-weight:700;color:#C9A24B;text-transform:uppercase}
.zc-landing .pcount .ci .k{font-size:9.5px;color:#B08A2E;font-weight:600;text-transform:uppercase}
.zc-landing .pcount .ci .d{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#5C4611;margin-top:1px}
.zc-landing .pcount .ci .e{font-size:10px;color:#9A7A28;margin-top:1px}
.zc-landing .prr{background:#fff;border:1px solid var(--line);border-radius:15px;padding:11px 13px;margin-top:11px;display:flex;align-items:center;gap:10px}
.zc-landing .prr .rg{width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:conic-gradient(var(--brand) 0 78%,var(--tint) 78% 100%);display:grid;place-items:center}
.zc-landing .prr .rg b{width:25px;height:25px;border-radius:50%;background:#fff;display:grid;place-items:center;font-family:'Space Grotesk',sans-serif;font-size:8.5px;font-weight:700;color:var(--brand)}
.zc-landing .prr .rt .k{font-size:10px;color:var(--muted)}
.zc-landing .prr .rt .v{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;margin-top:1px}
.zc-landing .prr .rt .v s{color:var(--faint);font-weight:500;font-size:11px;margin-right:5px}
.zc-landing .feat{padding:66px 40px}
.zc-landing .kick{font-family:'Space Grotesk',sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);font-weight:600;text-align:center}
.zc-landing .feat h2{font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:700;letter-spacing:-.02em;text-align:center;margin:12px auto 8px;max-width:600px;line-height:1.12}
.zc-landing .fl{text-align:center;color:var(--muted);font-size:15.5px;max-width:520px;margin:0 auto 40px;line-height:1.5}
.zc-landing .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1080px;margin:0 auto}
.zc-landing .fc{background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:24px 22px}
.zc-landing .fc .fi{width:46px;height:46px;border-radius:14px;background:var(--tint);display:grid;place-items:center;color:var(--brand);margin-bottom:16px}
.zc-landing .fc .fi svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.zc-landing .fc h3{font-family:'Space Grotesk',sans-serif;font-size:16.5px;font-weight:700;margin:0}
.zc-landing .fc p{font-size:13.5px;color:var(--muted);line-height:1.5;margin-top:8px}
.zc-landing .ctawrap{padding:0 40px 60px}
.zc-landing .cta{background:linear-gradient(135deg,#0A7B57,#0B3D2E);border-radius:28px;padding:52px 40px;text-align:center;color:#fff;position:relative;overflow:hidden;max-width:1080px;margin:0 auto}
.zc-landing .cta:after{content:"";position:absolute;right:-60px;top:-60px;width:240px;height:240px;background:radial-gradient(circle,rgba(224,160,43,.25),transparent 70%);border-radius:50%}
.zc-landing .cta h2{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-.02em;position:relative;margin:0}
.zc-landing .cta p{color:#BFE0D3;font-size:16px;margin:12px auto 26px;max-width:440px;line-height:1.5;position:relative}
.zc-landing .cta .ctarow{justify-content:center;position:relative}
.zc-landing .cta .btn-primary{background:#fff;color:#0B3D2E}
.zc-landing .foot{border-top:1px solid var(--line);padding:30px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.zc-landing .foot .lk{display:flex;gap:22px}
.zc-landing .foot a{color:var(--muted);font-size:13.5px;cursor:pointer}
.zc-landing .foot .cp{font-size:12.5px;color:var(--faint)}
@media (max-width:900px){
  .zc-landing .herogrid{grid-template-columns:1fr;gap:34px;padding:44px 24px}
  .zc-landing .navlinks{display:none}
  .zc-landing .hero h1{font-size:38px}
  .zc-landing .wrap{padding:0 22px}
  .zc-landing .feat{padding:48px 22px}
  .zc-landing .cards{grid-template-columns:repeat(2,1fr)}
  .zc-landing .ctawrap{padding:0 22px 48px}
  .zc-landing .cta{padding:40px 24px}
}
@media (max-width:560px){
  .zc-landing .cards{grid-template-columns:1fr}
  .zc-landing .hero h1{font-size:32px}
  .zc-landing .phone{width:250px}
}
`;

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="zcl-nv" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A7B57" /><stop offset="1" stopColor="#E0A02B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="34" stroke="#E1EDE7" strokeWidth="12" />
      <circle cx="50" cy="50" r="34" stroke="url(#zcl-nv)" strokeWidth="12" strokeLinecap="round" strokeDasharray="167 214" transform="rotate(-90 50 50)" />
      <path d="M50 40l9 11H41z" fill="#0B3D2E" />
      <rect x="46.5" y="49" width="7" height="15" rx="3" fill="#0B3D2E" />
    </svg>
  );
}

const FEATURES = [
  { t: "Real hourly rate", d: "We take off travel time and cost, so you see what a shift truly pays. Not what the ad claimed.", icon: <path d="M12 2v20M6 5h9a3.5 3.5 0 010 7H8a3.5 3.5 0 000 7h10" /> },
  { t: "Payday countdown", d: "See how many days until you get paid and how much to expect. No more guessing.", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, gold: true },
  { t: "Compare shifts", d: "Put two offers side by side and see which leaves more money in your pocket after the trip.", icon: <path d="M12 3v18M5 8h14M5 8l-2 5h4zM19 8l-2 5h4z" /> },
  { t: "Calendar & reminders", d: "Every shift in one view with earnings per day, and a nudge before each start time.", icon: <><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></> },
];

export default function Landing({ onLogin, onSignup }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <div className="zc-landing">
      <style>{CSS}</style>

      <div className="wrap"><div className="nav">
        <div className="brand"><Logo /><div className="bn">Zero<span>Contract</span></div></div>
        <div className="navlinks">
          <a onClick={() => scrollTo("features")}>Features</a>
          <a onClick={() => scrollTo("features")}>How it works</a>
          <a onClick={() => scrollTo("get-started")}>Get started</a>
        </div>
        <button className="navbtn" onClick={onLogin}>Log in</button>
      </div></div>

      <section className="hero"><div className="herogrid">
        <div>
          <div className="eyebrow">Built for UK shift work</div>
          <h1>Know what you <em>actually</em> earn.</h1>
          <p className="sub">Log your shifts, see your real hourly rate after travel, compare which job is worth it, and count down to payday. All in one place.</p>
          <div className="ctarow">
            <button className="btn-primary" onClick={onSignup}>Get started free</button>
            <button className="btn-ghost" onClick={onLogin}>Log in</button>
          </div>
          <div className="trust"><b>Free to start</b> · No ads · Your data stays yours</div>
        </div>
        <div className="phonewrap"><div className="phone"><div className="screen">
          <div className="pg"><div><div className="g1">Wednesday evening</div><div className="g2">Evening, Baloo</div></div><div className="pav">B</div></div>
          <div className="phero"><div className="l">Earned this month</div><div className="amt"><span>£</span>1,284.50</div>
            <div className="row"><div><b>112h</b>worked</div><div><b>14</b>shifts</div><div><b>£11.40</b>real rate</div></div></div>
          <div className="pcount"><div className="ring"><b><i>6</i><em>days</em></b></div>
            <div className="ci"><div className="k">Next payday</div><div className="d">Friday 25 July</div><div className="e">£642 expected</div></div></div>
          <div className="prr"><div className="rg"><b>78%</b></div>
            <div className="rt"><div className="k">Your real hourly rate</div><div className="v"><s>£12.60</s>£11.40/hr</div></div></div>
        </div></div></div>
      </div></section>

      <section className="feat" id="features">
        <div className="kick">Why Zero Contract</div>
        <h2>The headline rate is never the whole story.</h2>
        <p className="fl">Zero hours work means irregular pay and hidden costs. Zero Contract shows you the truth in numbers you can trust.</p>
        <div className="cards">
          {FEATURES.map((f) => (
            <div className="fc" key={f.t}>
              <div className="fi" style={f.gold ? { background: "#FBF1DC", color: "#B77E17" } : undefined}>
                <svg viewBox="0 0 24 24">{f.icon}</svg>
              </div>
              <h3>{f.t}</h3><p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="ctawrap" id="get-started"><div className="cta">
        <h2>Start tracking your next shift</h2>
        <p>Free to start. Set your pay rate once and Zero Contract does the maths for every shift after.</p>
        <div className="ctarow">
          <button className="btn-primary" onClick={onSignup}>Get started free</button>
          <button className="btn-ghost" onClick={onLogin}>Log in</button>
        </div>
      </div></div>

      <div className="foot">
        <div className="brand"><Logo size={26} /><div className="bn" style={{ fontSize: 15 }}>Zero<span style={{ color: "#0A7B57" }}>Contract</span></div></div>
        <div className="lk"><a onClick={() => scrollTo("features")}>Features</a><a onClick={onLogin}>Log in</a></div>
        <div className="cp">© 2026 Zero Contract</div>
      </div>
    </div>
  );
}
