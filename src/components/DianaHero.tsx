// @ts-nocheck
'use client'

export default function DianaHero({ size = 180 }: { size?: number }) {
  const off1 = Math.round(size * 0.13)
  const off2 = Math.round(size * 0.234)
  const off3 = Math.round(size * 0.347)
  const s2 = size - off1 * 2
  const s3 = size - off2 * 2
  const s4 = size - off3 * 2
  const r1 = size / 2 - 3
  const r2 = s2 / 2 - 3
  const r3 = s3 / 2 - 2
  const r4 = s4 / 2 - 2
  return (
    <>
      <style>{`
        @keyframes spin      { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes spinRev   { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes starPulse { 0%,100%{opacity:.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>
      <div style={{ position:'absolute', inset:0, animation:'spin 22s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.07)" strokeWidth="1.2"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1.4"
            strokeDasharray={`30 ${Math.round(r1*2*Math.PI)-30}`} strokeLinecap="round"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.15)" strokeWidth="0.7"
            strokeDasharray={`10 ${Math.round(r1*2*Math.PI)-10}`} strokeDashoffset={Math.round(r1*Math.PI*0.6)} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off1, animation:'spinRev 13s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.06)" strokeWidth="1"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.42)" strokeWidth="1.1"
            strokeDasharray={`20 ${Math.round(r2*2*Math.PI)-20}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off2, animation:'spin 8s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="0.9"/>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.38)" strokeWidth="0.9"
            strokeDasharray={`14 ${Math.round(r3*2*Math.PI)-14}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off3, animation:'spinRev 5s linear infinite' }}>
        <svg viewBox={`0 0 ${s4} ${s4}`} width={s4} height={s4}>
          <circle cx={s4/2} cy={s4/2} r={r4} fill="none" stroke="rgba(245,183,49,0.45)" strokeWidth="0.9"
            strokeDasharray={`8 ${Math.round(r4*2*Math.PI)-8}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ animation:'starPulse 2.2s ease-in-out infinite' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F5B731">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, transform:'translateY(-50%)', background:'linear-gradient(90deg,transparent,rgba(245,183,49,0.15),rgba(245,183,49,0.25),rgba(245,183,49,0.15),transparent)' }}/>
      <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, transform:'translateX(-50%)', background:'linear-gradient(180deg,transparent,rgba(245,183,49,0.15),rgba(245,183,49,0.25),rgba(245,183,49,0.15),transparent)' }}/>
    </>
  )
}