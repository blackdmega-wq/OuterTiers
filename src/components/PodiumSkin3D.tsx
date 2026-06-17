import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = { 1:{width:100,height:160}, 2:{width:82,height:128}, 3:{width:76,height:118} } as const;
const ZOOM:Record<1|2|3,number> = { 1:0.58, 2:0.68, 3:0.64 };

const STYLE_ID = 'podium-skin-3d-v7';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  ['podium-skin-3d-css','podium-skin-3d-css-v4','podium-skin-3d-css-v5','podium-skin-3d-v6']
    .forEach(id => { const el=document.getElementById(id); if(el) el.remove(); });
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `

/* ══════════════════════════════════════════════════════════════
   MINECRAFT FIREWORK ROCKETS (#1) — 4 rockets
   ══════════════════════════════════════════════════════════════ */
.mc-rockets-overlay {
  position:absolute; inset:0; overflow:visible;
  pointer-events:none; z-index:3;
}
.mc-fw-slot { position:absolute; bottom:10px; }
.mc-fw-slot--a { left:-8px;  }
.mc-fw-slot--b { left:20px;  }
.mc-fw-slot--c { right:20px; }
.mc-fw-slot--d { right:-8px; }

/* ── Rocket visual ── */
.mc-fw-rocket {
  display:flex; flex-direction:column; align-items:center;
  image-rendering:pixelated; transform-origin:bottom center;
}
/* Each slot: unique duration + delay, same two keyframes (fly-l / fly-r) */
.mc-fw-slot--a .mc-fw-rocket { animation:mc-fly-l 2.4s ease-in-out infinite 0.0s;  }
.mc-fw-slot--b .mc-fw-rocket { animation:mc-fly-r 2.7s ease-in-out infinite 0.9s;  }
.mc-fw-slot--c .mc-fw-rocket { animation:mc-fly-l 2.5s ease-in-out infinite 1.7s;  }
.mc-fw-slot--d .mc-fw-rocket { animation:mc-fly-r 2.6s ease-in-out infinite 0.5s;  }

@keyframes mc-fly-l {
  0%  {transform:translateY(0px)    rotate( 0deg);opacity:1}
  12% {transform:translateY(-16px)  rotate(-8deg);opacity:1}
  30% {transform:translateY(-44px)  rotate( 5deg);opacity:1}
  50% {transform:translateY(-76px)  rotate(-7deg);opacity:1}
  65% {transform:translateY(-106px) rotate( 4deg);opacity:1}
  72% {transform:translateY(-122px) rotate( 0deg);opacity:1}
  75% {transform:translateY(-128px) rotate( 0deg);opacity:0}
  76% {transform:translateY(0px)    rotate( 0deg);opacity:0}
  100%{transform:translateY(0px)    rotate( 0deg);opacity:0}
}
@keyframes mc-fly-r {
  0%  {transform:translateY(0px)    rotate( 0deg);opacity:1}
  12% {transform:translateY(-16px)  rotate( 8deg);opacity:1}
  30% {transform:translateY(-44px)  rotate(-5deg);opacity:1}
  50% {transform:translateY(-76px)  rotate( 7deg);opacity:1}
  65% {transform:translateY(-106px) rotate(-4deg);opacity:1}
  72% {transform:translateY(-122px) rotate( 0deg);opacity:1}
  75% {transform:translateY(-128px) rotate( 0deg);opacity:0}
  76% {transform:translateY(0px)    rotate( 0deg);opacity:0}
  100%{transform:translateY(0px)    rotate( 0deg);opacity:0}
}

/* ── Pixel-art rocket parts ── */
.mc-fw-cap  { position:relative; width:14px; height:10px; margin-bottom:-1px; }
.mc-fw-cap-bar  { position:absolute; top:5px; left:0; width:14px; height:4px;
  background:#5c2e0e; box-shadow:inset 0 1px 0 rgba(255,255,255,.15),inset 0 -1px 0 rgba(0,0,0,.3); }
.mc-fw-cap-knob { position:absolute; top:0; left:4px; width:6px; height:7px; background:#6b3417; }
.mc-fw-body {
  width:10px; height:22px;
  background:repeating-linear-gradient(-45deg,#cc1111 0,#cc1111 3px,#f2f2f2 3px,#f2f2f2 6px);
  border-left:1px solid rgba(0,0,0,.2); border-right:1px solid rgba(0,0,0,.2);
}
.mc-fw-fuse { width:6px; height:7px; background:repeating-conic-gradient(#111 0% 25%,#333 0% 50%) 0 0/3px 3px; }
.mc-fw-exhaust {
  width:5px; height:10px; margin-top:-2px;
  background:linear-gradient(to bottom,#ffcc22,#ff5500,transparent);
  border-radius:0 0 4px 4px;
  animation:mc-exhaust .08s steps(2) infinite;
}
@keyframes mc-exhaust { 0%{height:10px;opacity:1} 100%{height:6px;opacity:.6} }

/* ══════════════════════════════════════════════════════════════
   EXPLOSION BURST — fixed sync
   Key insight: every child element gets the SAME duration+delay
   as its parent slot, so keyframe % lines up perfectly.
   The idle phase (0-70%) keeps opacity:0 / scale:0.
   The burst phase (70-100%) plays the actual explosion.
   ══════════════════════════════════════════════════════════════ */
.mc-fw-burst {
  position:absolute;
  /* static position at rocket peak — no animation needed here */
  left:50%;
  bottom:10px;
  transform:translateX(-50%) translateY(-128px);
  width:64px; height:64px;
  pointer-events:none;
}

/* Per-slot: colors via CSS variables */
.mc-fw-slot--a { --pc:#ff3322; --sc:#ff9944; --gc:#ffdd88; }
.mc-fw-slot--b { --pc:#ffdd00; --sc:#ffe855; --gc:#ffffff;  }
.mc-fw-slot--c { --pc:#3399ff; --sc:#88ddff; --gc:#ccf0ff;  }
.mc-fw-slot--d { --pc:#33ee66; --sc:#99ffbb; --gc:#dfffee;  }

/* ── Central flash ──
   Each slot assigns the SAME duration+delay as its rocket animation */
.mc-burst-flash {
  position:absolute; top:50%; left:50%;
  width:20px; height:20px; border-radius:50%;
  /* default hidden — overridden by slot rules below */
  opacity:0;
}
.mc-fw-slot--a .mc-burst-flash { animation:mc-bflash 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-flash { animation:mc-bflash 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-flash { animation:mc-bflash 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-flash { animation:mc-bflash 2.6s linear infinite 0.5s; }
@keyframes mc-bflash {
  0%,70%  { transform:translate(-50%,-50%) scale(0);   opacity:0; }
  73%     { transform:translate(-50%,-50%) scale(0.5);  opacity:1;
            background:radial-gradient(circle,#fff 0%,var(--gc) 35%,var(--pc) 75%,transparent 100%);
            box-shadow:0 0 14px 5px var(--pc),0 0 28px 10px var(--sc); }
  82%     { transform:translate(-50%,-50%) scale(1.7);  opacity:1; }
  92%     { transform:translate(-50%,-50%) scale(2.2);  opacity:.5; }
  100%    { transform:translate(-50%,-50%) scale(2.8);  opacity:0; }
}

/* ── Primary rays (8 × long, thick) ── */
.mc-burst-pr {
  position:absolute; top:50%; left:50%;
  width:5px; height:28px; border-radius:4px 4px 1px 1px;
  transform-origin:50% 0%; margin-left:-2.5px;
  opacity:0;
}
.mc-fw-slot--a .mc-burst-pr { animation:mc-bpr 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-pr { animation:mc-bpr 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-pr { animation:mc-bpr 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-pr { animation:mc-bpr 2.6s linear infinite 0.5s; }
@keyframes mc-bpr {
  0%,70%  { opacity:0; transform:rotate(var(--ra,0deg)) scaleY(0); }
  73%     { opacity:1; transform:rotate(var(--ra,0deg)) scaleY(0.15);
            background:linear-gradient(to bottom,#fff 0%,var(--gc) 20%,var(--pc) 65%,transparent 100%);
            box-shadow:0 0 7px 2px var(--pc),0 0 12px 4px var(--sc); }
  81%     { opacity:1; transform:rotate(var(--ra,0deg)) scaleY(1.0); }
  91%     { opacity:.75; transform:rotate(var(--ra,0deg)) scaleY(1.45); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) scaleY(1.85); }
}

/* ── Secondary rays (8 × shorter, thinner) ── */
.mc-burst-sr {
  position:absolute; top:50%; left:50%;
  width:2.5px; height:17px; border-radius:2px;
  transform-origin:50% 0%; margin-left:-1.25px;
  opacity:0;
}
.mc-fw-slot--a .mc-burst-sr { animation:mc-bsr 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-sr { animation:mc-bsr 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-sr { animation:mc-bsr 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-sr { animation:mc-bsr 2.6s linear infinite 0.5s; }
@keyframes mc-bsr {
  0%,72%  { opacity:0; transform:rotate(var(--ra,0deg)) scaleY(0); }
  75%     { opacity:.9; transform:rotate(var(--ra,0deg)) scaleY(0.2);
            background:linear-gradient(to bottom,var(--gc) 0%,var(--sc) 55%,transparent 100%);
            box-shadow:0 0 5px 1px var(--sc); }
  83%     { opacity:.9; transform:rotate(var(--ra,0deg)) scaleY(1.0); }
  93%     { opacity:.5; transform:rotate(var(--ra,0deg)) scaleY(1.3); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) scaleY(1.6); }
}

/* ── Tip sparkles (8 × dots at ray ends) ── */
.mc-burst-tp {
  position:absolute; top:50%; left:50%;
  width:5px; height:5px; border-radius:50%;
  margin-left:-2.5px; margin-top:-2.5px;
  opacity:0;
}
.mc-fw-slot--a .mc-burst-tp { animation:mc-btp 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-tp { animation:mc-btp 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-tp { animation:mc-btp 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-tp { animation:mc-btp 2.6s linear infinite 0.5s; }
@keyframes mc-btp {
  0%,76%  { opacity:0; transform:rotate(var(--ra,0deg)) translateY(-20px) scale(0); }
  80%     { opacity:1; transform:rotate(var(--ra,0deg)) translateY(-26px) scale(1.3);
            background:var(--gc); box-shadow:0 0 6px 2px var(--pc); }
  88%     { opacity:1; transform:rotate(var(--ra,0deg)) translateY(-30px) scale(1.0); }
  95%     { opacity:.5; transform:rotate(var(--ra,0deg)) translateY(-34px) scale(.7); }
  100%    { opacity:0; transform:rotate(var(--ra,0deg)) translateY(-38px) scale(0); }
}

/* ══════════════════════════════════════════════════════════════
   DUST CLOUD (#3)
   z-index:0 = BEHIND canvas (z-index:1)
   Transparent canvas pixels let dust show through.
   bottom:14px = slightly above feet level
   ══════════════════════════════════════════════════════════════ */
.dust-cloud-overlay {
  position:absolute; bottom:14px; left:50%;
  transform:translateX(-50%);
  width:88px; height:34px;
  pointer-events:none;
  z-index:0;
}
.dust-puff {
  position:absolute; border-radius:50%;
  background:rgba(232,224,210,0.92);
  border:2px solid rgba(200,192,176,.5);
}
.dp-l1{width:24px;height:24px;left:32px;bottom:0; animation:dp-left  .40s ease-out infinite;animation-delay:.00s;}
.dp-l2{width:17px;height:17px;left:29px;bottom:4px;animation:dp-left  .40s ease-out infinite;animation-delay:.20s;}
.dp-r1{width:24px;height:24px;left:32px;bottom:0; animation:dp-right .40s ease-out infinite;animation-delay:.10s;}
.dp-r2{width:17px;height:17px;left:34px;bottom:4px;animation:dp-right .40s ease-out infinite;animation-delay:.30s;}
.dp-c {width:20px;height:20px;left:34px;bottom:0; animation:dp-up    .40s ease-out infinite;animation-delay:.05s;}

@keyframes dp-left {
  0%  {transform:scale(.12) translate(  0px,  0px);opacity:0;}
  15% {transform:scale(.80) translate( -9px, -5px);opacity:1.0;}
  55% {transform:scale(1.2) translate(-22px,-10px);opacity:.65;}
  100%{transform:scale(1.6) translate(-36px,-17px);opacity:0;}
}
@keyframes dp-right {
  0%  {transform:scale(.12) translate( 0px,  0px);opacity:0;}
  15% {transform:scale(.80) translate( 9px, -5px);opacity:1.0;}
  55% {transform:scale(1.2) translate(22px,-10px);opacity:.65;}
  100%{transform:scale(1.6) translate(36px,-17px);opacity:0;}
}
@keyframes dp-up {
  0%  {transform:scale(.12) translate(0px,  0px);opacity:0;}
  15% {transform:scale(.70) translate(0px, -7px);opacity:.9;}
  55% {transform:scale(1.1) translate(0px,-14px);opacity:.55;}
  100%{transform:scale(1.4) translate(0px,-24px);opacity:0;}
}
`;
  document.head.appendChild(s);
}

const PR = [0,45,90,135,180,225,270,315];
const SR = [22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5];

export default function PodiumSkin3D({ username, rank }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
    ensureStyles();
    const wrap = wrapRef.current;
    if (!wrap) return;

    let disposed = false;
    let viewer: any;
    let canvas: HTMLCanvasElement | null = null;

    import('skinview3d').then((sv3d) => {
      if (disposed || !wrapRef.current) return;

      canvas = document.createElement('canvas');
      /* z-index:1 ensures dust (z-index:0) renders behind the player.
         Transparent WebGL pixels allow the dust to show through. */
      canvas.style.cssText = 'display:block;background:transparent;position:relative;z-index:1;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({ canvas, width, height, skin:`https://mc-heads.net/skin/${username}` });
      try { viewer.renderer.setClearColor(0x000000,0); } catch(_){}
      try { viewer.controls.target.set(0,-8,0); viewer.controls.update(); } catch(_){}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch(_){}

      /* ──────────────── #3 FAST SPRINT ──────────────── */
      if (rank === 3) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin; if (!s) return;
            const t = progress * 9.0;
            s.body.rotation.x = 0.22; s.body.rotation.y = 0;
            s.body.rotation.z = Math.sin(t*2)*0.05;
            const arm = Math.sin(t)*1.15;
            s.rightArm.rotation.x =  arm; s.leftArm.rotation.x = -arm;
            s.rightArm.rotation.z = -0.07; s.leftArm.rotation.z = 0.07;
            s.rightArm.rotation.y = 0; s.leftArm.rotation.y = 0;
            const leg = Math.sin(t)*1.0;
            s.rightLeg.rotation.x = -leg; s.leftLeg.rotation.x = leg;
            s.rightLeg.rotation.z = 0; s.leftLeg.rotation.z = 0;
            if (s.head) {
              s.head.rotation.x = 0.15+Math.sin(t*2)*0.04;
              s.head.rotation.y = 0; s.head.rotation.z = Math.sin(t*2)*0.025;
            }
            player.position.y = -Math.abs(Math.sin(t))*0.6;
            player.position.x = 0; player.rotation.y = 0;
          } catch(_){}
        });

      /* ──────────────── #2 FLOSS DANCE ──────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin; if (!s?.leftArm) return;
            const t = progress*7.5;
            const rS=Math.sin(t), swing=Math.sign(rS)*Math.pow(Math.abs(rS),.60);
            const rD=Math.sin(t/2), depth=Math.sign(rD)*Math.pow(Math.abs(rD),.50);
            s.rightArm.rotation.z=swing*1.35; s.rightArm.rotation.x=depth*.62; s.rightArm.rotation.y=0;
            s.leftArm.rotation.z =swing*1.35; s.leftArm.rotation.x=-depth*.62; s.leftArm.rotation.y=0;
            player.position.x=-swing*.70; player.position.y=0; player.rotation.y=0;
            s.body.rotation.z=swing*.10; s.body.rotation.x=0; s.body.rotation.y=0;
            if(s.head){s.head.rotation.y=swing*.12;s.head.rotation.x=0;s.head.rotation.z=0;}
            s.leftLeg.rotation.z=.18;s.leftLeg.rotation.x=.05;s.leftLeg.rotation.y=0;
            s.rightLeg.rotation.z=-.18;s.rightLeg.rotation.x=.05;s.rightLeg.rotation.y=0;
          } catch(_){}
        });

      /* ──────────────── #1 VICTORY + CROWN ──────────────── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin; if (!s?.head) return;
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if(disposed||s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;
                const yTop=new T.MeshPhongMaterial({color:0xFFEE00,specular:0xFFFF88,shininess:140,emissive:0x332200,emissiveIntensity:.30});
                const yMid=new T.MeshPhongMaterial({color:0xEECC00,specular:0xFFFF44,shininess:100,emissive:0x221500,emissiveIntensity:.22});
                const yDark=new T.MeshPhongMaterial({color:0xCC9900,specular:0xDDCC33,shininess:70,emissive:0x110E00,emissiveIntensity:.15});
                const fW=[yMid,yMid,yTop,yDark,yMid,yMid],fT=[yMid,yMid,yTop,yDark,yTop,yMid],fC=[yMid,yMid,yTop,yDark,yTop,yMid];
                const gP=new T.MeshPhongMaterial({color:0xDD44FF,specular:0xFFCCFF,shininess:200,emissive:0x9900CC,emissiveIntensity:.90});
                const gC=new T.MeshPhongMaterial({color:0x44CCFF,specular:0xCCEEFF,shininess:200,emissive:0x006688,emissiveIntensity:.85});
                const gB=new T.MeshPhongMaterial({color:0x2255EE,specular:0x88AAFF,shininess:200,emissive:0x001188,emissiveIntensity:.85});
                const gG=new T.MeshPhongMaterial({color:0x11EE44,specular:0xAAFFCC,shininess:200,emissive:0x005511,emissiveIntensity:.90});
                const g=new T.Group();
                const bx=(mat:any,w:number,h:number,d:number,x:number,y:number,z:number)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);};
                const BW=10,BH=1,BT=.8,inner=BW-BT*2,FZ=BW/2-BT/2,BKZ=-(BW/2-BT/2),LX=-(BW/2-BT/2),RX=BW/2-BT/2;
                bx(fW,BW,BH,BT,0,BH/2,FZ);bx(fW,BW,BH,BT,0,BH/2,BKZ);bx(fW,BT,BH,inner,LX,BH/2,0);bx(fW,BT,BH,inner,RX,BH/2,0);
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x,i)=>{const h=i===3?2.2:1.45,mat=i===3?fC:fT;bx(mat,.88,h,BT,x,BH+h/2,FZ);bx(mat,.88,h,BT,x,BH+h/2,BKZ);});
                [-2,0,2].forEach(z=>{bx(fT,BT,1.45,.88,LX,BH+1.45/2,z);bx(fT,BT,1.45,.88,RX,BH+1.45/2,z);});
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as[number,number][]).forEach(([cx,cz])=>bx(fT,BT,1.45,BT,cx,BH+1.45/2,cz));
                ([[-2.8,gP],[-.9,gC],[.9,gB],[2.8,gG]] as[number,any][]).forEach(([x,mat])=>{const gem=new T.Mesh(new T.BoxGeometry(1.3,1.3,.8),mat);gem.position.set(x,BH/2,FZ+BT/2+.4);g.add(gem);});
                g.position.set(0,6,0); s.head.add(g);
              }).catch(()=>{});
            }
            const t=progress*2.5;
            s.leftArm.rotation.z =-(1.45+Math.sin(t*1.5)*.30); s.rightArm.rotation.z=1.45+Math.sin(t*1.5+Math.PI)*.30;
            s.leftArm.rotation.x =-0.20+Math.sin(t)*.20;       s.rightArm.rotation.x=-0.20-Math.sin(t)*.20;
            s.head.rotation.y=Math.sin(t*.8)*.24; s.head.rotation.x=-0.08+Math.sin(t*1.1)*.08;
            s.body.rotation.y=Math.sin(t*.5)*.08;
            s.leftLeg.rotation.x=Math.sin(t*1.8)*.06; s.rightLeg.rotation.x=-Math.sin(t*1.8)*.06;
          } catch(_){}
        });
      }
    }).catch(console.error);

    return () => {
      disposed=true;
      if(viewer){try{viewer.dispose();}catch(_){}}
      if(canvas&&wrap.contains(canvas)){wrap.removeChild(canvas);}
    };
  }, [username, rank]);

  return (
    <div
      ref={wrapRef}
      style={{width,height,position:'relative',zIndex:1,flexShrink:0,margin:'0 auto',overflow:'visible'}}
    >
      {rank === 1 && (
        <div className="mc-rockets-overlay">
          {(['a','b','c','d'] as const).map(slot => (
            <div key={slot} className={`mc-fw-slot mc-fw-slot--${slot}`}>
              <div className="mc-fw-rocket">
                <div className="mc-fw-cap">
                  <div className="mc-fw-cap-knob"/>
                  <div className="mc-fw-cap-bar"/>
                </div>
                <div className="mc-fw-body"/>
                <div className="mc-fw-fuse"/>
                <div className="mc-fw-exhaust"/>
              </div>
              <div className="mc-fw-burst">
                <div className="mc-burst-flash"/>
                {PR.map(a=>(
                  <div key={`p${a}`} className="mc-burst-pr"
                    style={{'--ra':`${a}deg`} as React.CSSProperties}/>
                ))}
                {SR.map(a=>(
                  <div key={`s${a}`} className="mc-burst-sr"
                    style={{'--ra':`${a}deg`} as React.CSSProperties}/>
                ))}
                {PR.map(a=>(
                  <div key={`t${a}`} className="mc-burst-tp"
                    style={{'--ra':`${a}deg`} as React.CSSProperties}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {rank === 3 && (
        /* z-index:0 = behind canvas (z-index:1).
           Transparent WebGL bg lets dust show through. */
        <div className="dust-cloud-overlay">
          <div className="dust-puff dp-l1"/>
          <div className="dust-puff dp-l2"/>
          <div className="dust-puff dp-r1"/>
          <div className="dust-puff dp-r2"/>
          <div className="dust-puff dp-c"/>
        </div>
      )}
    </div>
  );
}
