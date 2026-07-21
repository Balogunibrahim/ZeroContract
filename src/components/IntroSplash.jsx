import { useEffect } from "react";

const STYLE = `
.zci-overlay{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:radial-gradient(120% 70% at 50% 0%,#0f342a,#0a211a);cursor:pointer;
  animation:zci-out .6s ease 3.2s forwards;padding:24px}
.zci-brand{display:flex;flex-direction:column;align-items:center;gap:14px}
.zci-brand svg{width:104px;height:104px}
.zci-ringVal{stroke-dasharray:167 214;stroke-dashoffset:167;animation:zci-ring 1s ease .25s forwards}
.zci-arrow,.zci-arrowBar{opacity:0;transform-box:fill-box;transform-origin:center}
.zci-arrow{animation:zci-pop .55s cubic-bezier(.2,1.3,.4,1) .95s forwards}
.zci-arrowBar{animation:zci-pop .55s cubic-bezier(.2,1.3,.4,1) 1.05s forwards}
.zci-wm{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;font-size:34px;letter-spacing:-.01em;color:#fff;opacity:0;animation:zci-fade .6s ease 1.15s forwards}
.zci-wm span{color:#7FC9AC}
.zci-tag{margin-top:16px;color:#BFE0D3;font-size:14px;font-weight:500;text-align:center;opacity:0;animation:zci-tag 1.9s ease 1.5s forwards}
@keyframes zci-ring{to{stroke-dashoffset:0}}
@keyframes zci-pop{0%{opacity:0;transform:scale(.3)}70%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
@keyframes zci-fade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes zci-tag{0%{opacity:0;transform:translateY(10px)}18%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:1}}
@keyframes zci-out{to{opacity:0;visibility:hidden}}
@media (prefers-reduced-motion: reduce){
  .zci-overlay,.zci-ringVal,.zci-arrow,.zci-arrowBar,.zci-wm,.zci-tag{animation-duration:.01ms !important;animation-delay:0ms !important}
}
`;

export default function IntroSplash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="zci-overlay" onClick={onDone} role="presentation" aria-label="Zero Contract intro">
      <style>{STYLE}</style>
      <div className="zci-brand">
        <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="zci-ig" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5FE3A9" />
              <stop offset="1" stopColor="#F0C766" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,.15)" strokeWidth="12" />
          <circle className="zci-ringVal" cx="50" cy="50" r="34" stroke="url(#zci-ig)" strokeWidth="12" strokeLinecap="round" strokeDasharray="167 214" transform="rotate(-90 50 50)" />
          <path className="zci-arrow" d="M50 40l9 11H41z" fill="#F0C766" />
          <rect className="zci-arrowBar" x="46.5" y="49" width="7" height="15" rx="3" fill="#F0C766" />
        </svg>
        <div className="zci-wm">Zero<span>Contract</span></div>
      </div>
      <div className="zci-tag">Know what you actually earn</div>
    </div>
  );
}
