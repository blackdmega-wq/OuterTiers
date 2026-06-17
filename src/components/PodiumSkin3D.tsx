import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = {
  1: { width: 100, height: 160 },
  2: { width: 82,  height: 128 },
  3: { width: 76,  height: 118 },
} as const;
const ZOOM: Record<1|2|3, number> = { 1: 0.58, 2: 0.68, 3: 0.64 };

/* ─────────────────────────────────────────────────────────────
   CSS — injected once into <head>  (version 6)
   ───────────────────────────────────────────────────────────── */
const STYLE_ID = 'podium-skin-3d-v6';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  ['podium-skin-3d-css','podium-skin-3d-css-v4','podium-skin-3d-css-v5']
    .forEach(id => { const el=document.getElementById(id); if(el) el.remove(); });
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `

/* ══════════════════════════════════════════════════════════════
   MINECRAFT FIREWORK ROCKETS  (#1)  — 4 rockets
   ══════════════════════════════════════════════════════════════ */
.mc-rockets-overlay {
  position:absolute; inset:0; overflow:visible;
  pointer-events:none; z-index:3;
}
.mc-fw-slot {
  position:absolute; bottom:10px;
}
/* 4 rocket positions */
.mc-fw-slot--a { left:-8px; }
.mc-fw-slot--b { left:20px; }
.mc-fw-slot--c { right:20px; }
.mc-fw-slot--d { right:-8px; }

/* ── Rocket visual flies up with wobble ── */
.mc-fw-rocket {
  display:flex; flex-direction:column; align-items:center;
  image-rendering:pixelated; transform-origin:bottom center;
}
.mc-fw-slot--a .mc-fw-rocket { animation:mc-fly-l 2.4s ease-in-out infinite; animation-delay:0.0s; }
.mc-fw-slot--b .mc-fw-rocket { animation:mc-fly-r 2.7s ease-in-out infinite; animation-delay:0.9s; }
.mc-fw-slot--c .mc-fw-rocket { animation:mc-fly-l 2.5s ease-in-out infinite; animation-delay:1.7s; }
.mc-fw-slot--d .mc-fw-rocket { animation:mc-fly-r 2.6s ease-in-out infinite; animation-delay:0.5s; }

@keyframes mc-fly-l {
  0%  {transform:translateY(0px)    rotate( 0deg);opacity:1}
  12% {transform:translateY(-16px)  rotate(-8deg);opacity:1}
  30% {transform:translateY(-42px)  rotate( 5deg);opacity:1}
  48% {transform:translateY(-72px)  rotate(-7deg);opacity:1}
  62% {transform:translateY(-100px) rotate( 4deg);opacity:1}
  70% {transform:translateY(-118px) rotate( 0deg);opacity:1}
  74% {transform:translateY(-124px) rotate( 0deg);opacity:0}
  75% {transform:translateY(0px)    rotate( 0deg);opacity:0}
  100%{transform:translateY(0px)    rotate( 0deg);opacity:0}
}
@keyframes mc-fly-r {
  0%  {transform:translateY(0px)    rotate( 0deg);opacity:1}
  12% {transform:translateY(-16px)  rotate( 8deg);opacity:1}
  30% {transform:translateY(-42px)  rotate(-5deg);opacity:1}
  48% {transform:translateY(-72px)  rotate( 7deg);opacity:1}
  62% {transform:translateY(-100px) rotate(-4deg);opacity:1}
  70% {transform:translateY(-118px) rotate( 0deg);opacity:1}
  74% {transform:translateY(-124px) rotate( 0deg);opacity:0}
  75% {transform:translateY(0px)    rotate( 0deg);opacity:0}
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
  image-rendering:pixelated;
}
.mc-fw-fuse {
  width:6px; height:7px;
  background:repeating-conic-gradient(#111 0% 25%,#333 0% 50%) 0 0/3px 3px;
}
.mc-fw-exhaust {
  width:5px; height:10px; margin-top:-2px;
  background:linear-gradient(to bottom,#ffcc22,#ff5500,transparent);
  border-radius:0 0 4px 4px;
  animation:mc-exhaust 0.08s steps(2) infinite;
}
@keyframes mc-exhaust {
  0%  {height:10px;opacity:1;}
  100%{height:6px; opacity:.65;}
}

/* ══════════════════════════════════════════════════════════════
   EXPLOSION BURST  — revamped
   Structure inside .mc-fw-burst:
     .mc-burst-flash   — central white flare
     .mc-burst-pr ×8   — primary rays  (long, thick, bright)
     .mc-burst-sr ×8   — secondary rays (medium, 22.5° offset)
     .mc-burst-tp ×8   — tip sparkles at ends of primary rays
   ══════════════════════════════════════════════════════════════ */
.mc-fw-burst {
  position:absolute; left:50%; bottom:10px;
  width:60px; height:60px; pointer-events:none;
}
/* Each slot has its own burst timing + colors */
.mc-fw-slot--a .mc-fw-burst { animation:mc-burst-time 2.4s ease-out infinite; animation-delay:0.0s; --pc:#ff3322;--sc:#ff9944;--gc:#ffdd88; }
.mc-fw-slot--b .mc-fw-burst { animation:mc-burst-time 2.7s ease-out infinite; animation-delay:0.9s; --pc:#ffdd00;--sc:#fff066;--gc:#ffffff; }
.mc-fw-slot--c .mc-fw-burst { animation:mc-burst-time 2.5s ease-out infinite; animation-delay:1.7s; --pc:#3399ff;--sc:#88ddff;--gc:#ccf0ff; }
.mc-fw-slot--d .mc-fw-burst { animation:mc-burst-time 2.6s ease-out infinite; animation-delay:0.5s; --pc:#33ee66;--sc:#99ffbb;--gc:#ddffee; }

@keyframes mc-burst-time {
  0%,69% { transform:translate(-50%,calc(-124px - 50%)) scale(0);   opacity:0; }
  73%    { transform:translate(-50%,calc(-124px - 50%)) scale(0.3);  opacity:1; }
  80%    { transform:translate(-50%,calc(-124px - 50%)) scale(1.0);  opacity:1; }
  90%    { transform:translate(-50%,calc(-124px - 50%)) scale(1.35); opacity:.80; }
  100%   { transform:translate(-50%,calc(-124px - 50%)) scale(1.70); opacity:0; }
}

/* Central flash */
.mc-burst-flash {
  position:absolute; top:50%; left:50%;
  width:18px; height:18px; border-radius:50%;
  transform:translate(-50%,-50%) scale(0);
  background:radial-gradient(circle,#ffffff 0%,var(--gc,#ffee88) 40%,var(--pc,#ff4400) 75%,transparent 100%);
  box-shadow:0 0 12px 4px var(--pc,#ff4400), 0 0 24px 8px var(--sc,#ffaa00);
  animation:burst-flash-anim 1s ease-out forwards;
  /* driven by parent .mc-fw-burst keyframe for timing */
}
@keyframes burst-flash-anim {
  0%   {transform:translate(-50%,-50%) scale(0.2);opacity:1;}
  30%  {transform:translate(-50%,-50%) scale(1.4);opacity:1;}
  70%  {transform:translate(-50%,-50%) scale(1.8);opacity:.6;}
  100% {transform:translate(-50%,-50%) scale(2.2);opacity:0;}
}

/* Primary rays */
.mc-burst-pr {
  position:absolute; top:50%; left:50%;
  width:4px; height:26px; border-radius:3px 3px 1px 1px;
  transform-origin:50% 0%; margin-left:-2px; margin-top:0;
  background:linear-gradient(to bottom, var(--gc,#ffffff) 0%, var(--pc,#ff4400) 55%, transparent 100%);
  box-shadow:0 0 6px 2px var(--pc,#ff4400), 0 0 10px 3px var(--sc,#ffaa00);
  animation:burst-pr-anim 1s ease-out forwards;
}
@keyframes burst-pr-anim {
  0%   {transform:rotate(var(--ra,0deg)) scaleY(0);   opacity:1;}
  25%  {transform:rotate(var(--ra,0deg)) scaleY(1.0); opacity:1;}
  65%  {transform:rotate(var(--ra,0deg)) scaleY(1.3); opacity:.85;}
  100% {transform:rotate(var(--ra,0deg)) scaleY(1.6); opacity:0;}
}

/* Secondary rays */
.mc-burst-sr {
  position:absolute; top:50%; left:50%;
  width:2px; height:16px; border-radius:2px;
  transform-origin:50% 0%; margin-left:-1px; margin-top:0;
  background:linear-gradient(to bottom, var(--gc,#ffffff) 0%, var(--sc,#ffaa00) 60%, transparent 100%);
  box-shadow:0 0 4px 1px var(--sc,#ffaa00);
  animation:burst-sr-anim 1s ease-out forwards;
}
@keyframes burst-sr-anim {
  0%   {transform:rotate(var(--ra,0deg)) scaleY(0);   opacity:.9;}
  30%  {transform:rotate(var(--ra,0deg)) scaleY(1.0); opacity:.9;}
  70%  {transform:rotate(var(--ra,0deg)) scaleY(1.2); opacity:.6;}
  100% {transform:rotate(var(--ra,0deg)) scaleY(1.4); opacity:0;}
}

/* Tip sparkles */
.mc-burst-tp {
  position:absolute; top:50%; left:50%;
  width:5px; height:5px; border-radius:50%;
  margin-left:-2.5px; margin-top:-2.5px;
  background:var(--gc,#ffffff);
  box-shadow:0 0 5px 2px var(--pc,#ff4400);
  animation:burst-tp-anim 1s ease-out forwards;
}
@keyframes burst-tp-anim {
  0%  {transform:rotate(var(--ra,0deg)) translateY(-20px) scale(0); opacity:0;}
  25% {transform:rotate(var(--ra,0deg)) translateY(-26px) scale(1); opacity:1;}
  60% {transform:rotate(var(--ra,0deg)) translateY(-30px) scale(1.2);opacity:.8;}
  100%{transform:rotate(var(--ra,0deg)) translateY(-36px) scale(.5); opacity:0;}
}

/* ══════════════════════════════════════════════════════════════
   CARTOON DUST CLOUD  (#3) — z-index:10 above canvas
   ══════════════════════════════════════════════════════════════ */
.dust-cloud-overlay {
  position:absolute; bottom:0; left:50%; transform:translateX(-50%);
  width:80px; height:30px; pointer-events:none; z-index:10;
}
.dust-puff {
  position:absolute; border-radius:50%;
  background:rgba(228,220,206,0.96);
  border:2px solid rgba(198,190,174,.55);
}
.dp-l1{width:22px;height:22px;left:29px;bottom:0; animation:dp-left  .40s ease-out infinite;animation-delay:.00s;}
.dp-l2{width:16px;height:16px;left:27px;bottom:3px;animation:dp-left  .40s ease-out infinite;animation-delay:.20s;}
.dp-r1{width:22px;height:22px;left:29px;bottom:0; animation:dp-right .40s ease-out infinite;animation-delay:.10s;}
.dp-r2{width:16px;height:16px;left:31px;bottom:3px;animation:dp-right .40s ease-out infinite;animation-delay:.30s;}
.dp-c {width:18px;height:18px;left:31px;bottom:0; animation:dp-up    .40s ease-out infinite;animation-delay:.05s;}

@keyframes dp-left {
  0%  {transform:scale(.15) translate(  0px,  0px);opacity:0;}
  15% {transform:scale(.80) translate( -8px, -4px);opacity:1.0;}
  55% {transform:scale(1.2) translate(-20px, -9px);opacity:.65;}
  100%{transform:scale(1.6) translate(-32px,-15px);opacity:0;}
}
@keyframes dp-right {
  0%  {transform:scale(.15) translate( 0px,  0px);opacity:0;}
  15% {transform:scale(.80) translate( 8px, -4px);opacity:1.0;}
  55% {transform:scale(1.2) translate(20px, -9px);opacity:.65;}
  100%{transform:scale(1.6) translate(32px,-15px);opacity:0;}
}
@keyframes dp-up {
  0%  {transform:scale(.15) translate(0px,  0px);opacity:0;}
  15% {transform:scale(.70) translate(0px, -6px);opacity:.9;}
  55% {transform:scale(1.1) translate(0px,-13px);opacity:.55;}
  100%{transform:scale(1.4) translate(0px,-22px);opacity:0;}
}
`;
  document.head.appendChild(s);
}

/* ── 8 primary rays at 0°,45°,90°,135°,180°,225°,270°,315° ── */
const PR = [0,45,90,135,180,225,270,315];
/* ── 8 secondary rays at 22.5° offset ── */
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
      /* z-index:1 so the dust overlay (z-index:10) renders on top */
      canvas.style.cssText = 'display:block;background:transparent;position:relative;z-index:1;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({ canvas, width, height, skin:`https://mc-heads.net/skin/${username}` });
      try { viewer.renderer.setClearColor(0x000000,0); } catch(_){}
      try { viewer.controls.target.set(0,-8,0); viewer.controls.update(); } catch(_){}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch(_){}

      /* ══════════════════════════════════════════════════════════
         #3  FAST SPRINT  — speed 9.0 rad/s (~1.4 strides/sec)
         ══════════════════════════════════════════════════════════ */
      if (rank === 3) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s) return;
            const t = progress * 9.0;          /* fast sprint */

            s.body.rotation.x = 0.22;
            s.body.rotation.y = 0;
            s.body.rotation.z = Math.sin(t*2)*0.05;

            const arm = Math.sin(t)*1.15;
            s.rightArm.rotation.x =  arm;
            s.leftArm.rotation.x  = -arm;
            s.rightArm.rotation.z = -0.07;
            s.leftArm.rotation.z  =  0.07;
            s.rightArm.rotation.y = 0;
            s.leftArm.rotation.y  = 0;

            const leg = Math.sin(t)*1.0;
            s.rightLeg.rotation.x = -leg;
            s.leftLeg.rotation.x  =  leg;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.z  = 0;

            if (s.head) {
              s.head.rotation.x = 0.15 + Math.sin(t*2)*0.04;
              s.head.rotation.y = 0;
              s.head.rotation.z = Math.sin(t*2)*0.025;
            }
            player.position.y = -Math.abs(Math.sin(t))*0.6;
            player.position.x = 0;
            player.rotation.y = 0;
          } catch(_){}
        });

      /* ══════════════════════════════════════════════════════════
         #2  FLOSS DANCE
         ══════════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t = progress*7.5;
            const rawS=Math.sin(t), swing=Math.sign(rawS)*Math.pow(Math.abs(rawS),.60);
            const rawD=Math.sin(t/2), depth=Math.sign(rawD)*Math.pow(Math.abs(rawD),.50);
            s.rightArm.rotation.z= swing*1.35; s.rightArm.rotation.x= depth*.62; s.rightArm.rotation.y=0;
            s.leftArm.rotation.z = swing*1.35; s.leftArm.rotation.x =-depth*.62; s.leftArm.rotation.y=0;
            player.position.x=-swing*.70; player.position.y=0; player.rotation.y=0;
            s.body.rotation.z=swing*.10; s.body.rotation.x=0; s.body.rotation.y=0;
            if(s.head){s.head.rotation.y=swing*.12;s.head.rotation.x=0;s.head.rotation.z=0;}
            s.leftLeg.rotation.z= .18;s.leftLeg.rotation.x= .05;s.leftLeg.rotation.y=0;
            s.rightLeg.rotation.z=-.18;s.rightLeg.rotation.x=.05;s.rightLeg.rotation.y=0;
          } catch(_){}
        });

      /* ══════════════════════════════════════════════════════════
         #1  VICTORY POSE + CROWN
         ══════════════════════════════════════════════════════════ */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if (disposed||s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;
                const yTop =new T.MeshPhongMaterial({color:0xFFEE00,specular:0xFFFF88,shininess:140,emissive:0x332200,emissiveIntensity:.30});
                const yMid =new T.MeshPhongMaterial({color:0xEECC00,specular:0xFFFF44,shininess:100,emissive:0x221500,emissiveIntensity:.22});
                const yDark=new T.MeshPhongMaterial({color:0xCC9900,specular:0xDDCC33,shininess:70, emissive:0x110E00,emissiveIntensity:.15});
                const fW=[yMid,yMid,yTop,yDark,yMid,yMid],fT=[yMid,yMid,yTop,yDark,yTop,yMid],fC=[yMid,yMid,yTop,yDark,yTop,yMid];
                const gP=new T.MeshPhongMaterial({color:0xDD44FF,specular:0xFFCCFF,shininess:200,emissive:0x9900CC,emissiveIntensity:.90});
                const gC=new T.MeshPhongMaterial({color:0x44CCFF,specular:0xCCEEFF,shininess:200,emissive:0x006688,emissiveIntensity:.85});
                const gB=new T.MeshPhongMaterial({color:0x2255EE,specular:0x88AAFF,shininess:200,emissive:0x001188,emissiveIntensity:.85});
                const gG=new T.MeshPhongMaterial({color:0x11EE44,specular:0xAAFFCC,shininess:200,emissive:0x005511,emissiveIntensity:.90});
                const g=new T.Group();
                const bx=(mat:any,w:number,h:number,d:number,x:number,y:number,z:number)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);};
                const BW=10,BH=1,BT=.8,inner=BW-BT*2,FZ=BW/2-BT/2,BKZ=-(BW/2-BT/2),LX=-(BW/2-BT/2),RX=BW/2-BT/2;
                bx(fW,BW,BH,BT,0,BH/2,FZ);bx(fW,BW,BH,BT,0,BH/2,BKZ);bx(fW,BT,BH,inner,LX,BH/2,0);bx(fW,BT,BH,inner,RX,BH/2,0);
                const MW=.88,MD=BT,MH=1.45,MHC=2.2,yB=BH;
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x,i)=>{const h=i===3?MHC:MH,mat=i===3?fC:fT;bx(mat,MW,h,MD,x,yB+h/2,FZ);bx(mat,MW,h,MD,x,yB+h/2,BKZ);});
                [-2,0,2].forEach(z=>{bx(fT,MD,MH,MW,LX,yB+MH/2,z);bx(fT,MD,MH,MW,RX,yB+MH/2,z);});
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as[number,number][]).forEach(([cx,cz])=>bx(fT,BT,MH,BT,cx,yB+MH/2,cz));
                const GS=1.3,GD=.8,GY=BH/2,GZ=FZ+BT/2+GD/2;
                ([[-2.8,gP],[-.9,gC],[.9,gB],[2.8,gG]] as[number,any][]).forEach(([x,mat])=>{const gem=new T.Mesh(new T.BoxGeometry(GS,GS,GD),mat);gem.position.set(x,GY,GZ);g.add(gem);});
                g.position.set(0,6,0);s.head.add(g);
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
      {/* ── #1: 4 Minecraft Firework Rockets ── */}
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
                {/* Center flash */}
                <div className="mc-burst-flash"/>
                {/* 8 primary rays */}
                {PR.map(a=>(
                  <div key={`p${a}`} className="mc-burst-pr" style={{'--ra':`${a}deg`} as React.CSSProperties}/>
                ))}
                {/* 8 secondary rays */}
                {SR.map(a=>(
                  <div key={`s${a}`} className="mc-burst-sr" style={{'--ra':`${a}deg`} as React.CSSProperties}/>
                ))}
                {/* 8 tip sparkles */}
                {PR.map(a=>(
                  <div key={`t${a}`} className="mc-burst-tp" style={{'--ra':`${a}deg`} as React.CSSProperties}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── #3: Cartoon Dust Cloud (z-index:10, above canvas z-index:1) ── */}
      {rank === 3 && (
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
