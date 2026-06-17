import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = { 1:{width:100,height:160}, 2:{width:82,height:128}, 3:{width:76,height:118} } as const;
const ZOOM: Record<1|2|3,number> = { 1:0.58, 2:0.68, 3:0.64 };

const STYLE_ID = 'podium-skin-3d-v8';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  ['podium-skin-3d-css','podium-skin-3d-css-v4','podium-skin-3d-css-v5',
   'podium-skin-3d-v6','podium-skin-3d-v7']
    .forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `

/* ══════════════════════════════════════════════════════════
   ROCKET OVERLAY  (#1)
   ══════════════════════════════════════════════════════════ */
.mc-rockets-overlay {
  position:absolute; inset:0; overflow:visible;
  pointer-events:none; z-index:3;
}
.mc-fw-slot {
  position:absolute; bottom:10px;
}
.mc-fw-slot--a { left:-8px; }
.mc-fw-slot--b { left:20px; }
.mc-fw-slot--c { right:20px; }
.mc-fw-slot--d { right:-8px; }

/* Per-slot burst colors */
.mc-fw-slot--a { --pc:#ff3322; --sc:#ff9944; --gc:#ffdd88; }
.mc-fw-slot--b { --pc:#ffdd00; --sc:#ffe855; --gc:#ffffff;  }
.mc-fw-slot--c { --pc:#3399ff; --sc:#88ddff; --gc:#ccf0ff;  }
.mc-fw-slot--d { --pc:#33ee66; --sc:#99ffbb; --gc:#dfffee;  }

/* ────────────────────────────────────────────────────────
   SMOOTH ROCKET FLIGHT
   Two separate animations per slot:
     mc-fly-*   → translateY + opacity  (smooth, ease-in)
     mc-wobble  → rotate                (fast continuous alternate)
   Separating them means each runs at its own timing curve
   → NO discrete frame jumps visible to the eye.
   ──────────────────────────────────────────────────────── */
.mc-fw-rocket {
  display:flex; flex-direction:column; align-items:center;
  image-rendering:pixelated; transform-origin:bottom center;
  will-change:transform,opacity;
}

/* slot-a: 2.4s flight, left-leaning wobble */
.mc-fw-slot--a .mc-fw-rocket {
  animation:
    mc-fly-l     2.4s cubic-bezier(0.3,0.0,0.55,1.0) infinite  0.0s,
    mc-wobble-l  0.26s ease-in-out           infinite alternate 0.0s;
}
/* slot-b */
.mc-fw-slot--b .mc-fw-rocket {
  animation:
    mc-fly-r     2.7s cubic-bezier(0.3,0.0,0.55,1.0) infinite  0.9s,
    mc-wobble-r  0.30s ease-in-out           infinite alternate 0.9s;
}
/* slot-c */
.mc-fw-slot--c .mc-fw-rocket {
  animation:
    mc-fly-l     2.5s cubic-bezier(0.3,0.0,0.55,1.0) infinite  1.7s,
    mc-wobble-l  0.28s ease-in-out           infinite alternate 1.7s;
}
/* slot-d */
.mc-fw-slot--d .mc-fw-rocket {
  animation:
    mc-fly-r     2.6s cubic-bezier(0.3,0.0,0.55,1.0) infinite  0.5s,
    mc-wobble-r  0.32s ease-in-out           infinite alternate 0.5s;
}

/* Flight: pure vertical + opacity — browser interpolates every frame */
@keyframes mc-fly-l {
  0%   { transform:translateY(0px);    opacity:1 }
  68%  { transform:translateY(-122px); opacity:1 }
  73%  { transform:translateY(-130px); opacity:0 }
  74%  { transform:translateY(0px);    opacity:0 }
  100% { transform:translateY(0px);    opacity:0 }
}
@keyframes mc-fly-r {
  0%   { transform:translateY(0px);    opacity:1 }
  68%  { transform:translateY(-122px); opacity:1 }
  73%  { transform:translateY(-130px); opacity:0 }
  74%  { transform:translateY(0px);    opacity:0 }
  100% { transform:translateY(0px);    opacity:0 }
}

/* Wobble: fast continuous rotation — completely independent from flight */
@keyframes mc-wobble-l {
  from { rotate:-6deg }
  to   { rotate: 5deg }
}
@keyframes mc-wobble-r {
  from { rotate: 5deg }
  to   { rotate:-6deg }
}

/* ── Pixel-art rocket parts ── */
.mc-fw-cap  { position:relative; width:14px; height:10px; margin-bottom:-1px; }
.mc-fw-cap-bar {
  position:absolute; top:5px; left:0; width:14px; height:4px; background:#5c2e0e;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.3);
}
.mc-fw-cap-knob { position:absolute; top:0; left:4px; width:6px; height:7px; background:#6b3417; }

.mc-fw-body {
  width:10px; height:22px;
  background:repeating-linear-gradient(-45deg,#cc1111 0,#cc1111 3px,#f2f2f2 3px,#f2f2f2 6px);
  border-left:1px solid rgba(0,0,0,.2); border-right:1px solid rgba(0,0,0,.2);
}
.mc-fw-fuse {
  width:6px; height:7px;
  background:repeating-conic-gradient(#111 0% 25%,#333 0% 50%) 0 0/3px 3px;
}

/* Smooth flame exhaust — no steps() */
.mc-fw-exhaust {
  width:7px; height:16px; margin-top:-2px;
  background:linear-gradient(to bottom,#ffffff 0%,#ffee44 25%,#ff8800 55%,#ff3300 80%,transparent 100%);
  border-radius:0 0 5px 5px;
  box-shadow:0 0 8px 3px rgba(255,120,0,0.9), 0 0 18px 5px rgba(255,60,0,0.5);
  filter:blur(0.4px);
  animation:mc-exhaust-smooth .14s ease-in-out infinite alternate;
  will-change:transform,height;
}
@keyframes mc-exhaust-smooth {
  from { height:16px; transform:scaleX(1.0); opacity:1.0; }
  to   { height:10px; transform:scaleX(0.8); opacity:0.75; }
}

/* ── Glowing exhaust trail behind the rocket ── */
.mc-fw-trail {
  position:absolute; bottom:-2px; left:50%;
  transform:translateX(-50%);
  width:4px; height:50px;
  background:linear-gradient(to top,transparent 0%,rgba(255,140,0,.25) 40%,rgba(255,200,50,.12) 75%,transparent 100%);
  border-radius:50%;
  filter:blur(3px);
  pointer-events:none;
}

/* ══════════════════════════════════════════════════════════
   EXPLOSION BURST  (each child synced to parent slot timing)
   ══════════════════════════════════════════════════════════ */
.mc-fw-burst {
  position:absolute; left:50%; bottom:10px;
  transform:translateX(-50%) translateY(-130px);
  width:64px; height:64px;
  pointer-events:none;
}

/* Flash */
.mc-burst-flash { position:absolute; top:50%; left:50%; width:22px; height:22px; border-radius:50%; opacity:0; }
.mc-fw-slot--a .mc-burst-flash { animation:mc-bflash 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-flash { animation:mc-bflash 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-flash { animation:mc-bflash 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-flash { animation:mc-bflash 2.6s linear infinite 0.5s; }
@keyframes mc-bflash {
  0%,68%  { transform:translate(-50%,-50%) scale(0); opacity:0; }
  71%     { transform:translate(-50%,-50%) scale(0.5); opacity:1;
            background:radial-gradient(circle,#fff 0%,var(--gc) 30%,var(--pc) 70%,transparent 100%);
            box-shadow:0 0 16px 6px var(--pc),0 0 30px 12px var(--sc); }
  80%     { transform:translate(-50%,-50%) scale(1.8); opacity:1; }
  92%     { transform:translate(-50%,-50%) scale(2.4); opacity:.45; }
  100%    { transform:translate(-50%,-50%) scale(3.0); opacity:0; }
}

/* Primary rays */
.mc-burst-pr {
  position:absolute; top:50%; left:50%;
  width:5px; height:28px; border-radius:4px 4px 1px 1px;
  transform-origin:50% 0%; margin-left:-2.5px; opacity:0;
}
.mc-fw-slot--a .mc-burst-pr { animation:mc-bpr 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-pr { animation:mc-bpr 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-pr { animation:mc-bpr 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-pr { animation:mc-bpr 2.6s linear infinite 0.5s; }
@keyframes mc-bpr {
  0%,69%  { opacity:0; transform:rotate(var(--ra,0deg)) scaleY(0); }
  72%     { opacity:1; transform:rotate(var(--ra,0deg)) scaleY(0.1);
            background:linear-gradient(to bottom,#fff 0%,var(--gc) 15%,var(--pc) 60%,transparent 100%);
            box-shadow:0 0 8px 3px var(--pc),0 0 14px 5px var(--sc); }
  80%     { opacity:1; transform:rotate(var(--ra,0deg)) scaleY(1.0); }
  91%     { opacity:.7; transform:rotate(var(--ra,0deg)) scaleY(1.5); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) scaleY(1.9); }
}

/* Secondary rays */
.mc-burst-sr {
  position:absolute; top:50%; left:50%;
  width:2.5px; height:18px; border-radius:2px;
  transform-origin:50% 0%; margin-left:-1.25px; opacity:0;
}
.mc-fw-slot--a .mc-burst-sr { animation:mc-bsr 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-sr { animation:mc-bsr 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-sr { animation:mc-bsr 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-sr { animation:mc-bsr 2.6s linear infinite 0.5s; }
@keyframes mc-bsr {
  0%,71%  { opacity:0; transform:rotate(var(--ra,0deg)) scaleY(0); }
  74%     { opacity:.9; transform:rotate(var(--ra,0deg)) scaleY(0.2);
            background:linear-gradient(to bottom,var(--gc) 0%,var(--sc) 55%,transparent 100%);
            box-shadow:0 0 5px 2px var(--sc); }
  83%     { opacity:.9; transform:rotate(var(--ra,0deg)) scaleY(1.0); }
  93%     { opacity:.4; transform:rotate(var(--ra,0deg)) scaleY(1.35); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) scaleY(1.65); }
}

/* Tip sparkles */
.mc-burst-tp {
  position:absolute; top:50%; left:50%;
  width:6px; height:6px; border-radius:50%;
  margin-left:-3px; margin-top:-3px; opacity:0;
}
.mc-fw-slot--a .mc-burst-tp { animation:mc-btp 2.4s linear infinite 0.0s; }
.mc-fw-slot--b .mc-burst-tp { animation:mc-btp 2.7s linear infinite 0.9s; }
.mc-fw-slot--c .mc-burst-tp { animation:mc-btp 2.5s linear infinite 1.7s; }
.mc-fw-slot--d .mc-burst-tp { animation:mc-btp 2.6s linear infinite 0.5s; }
@keyframes mc-btp {
  0%,75%  { opacity:0; transform:rotate(var(--ra,0deg)) translateY(-20px) scale(0); }
  79%     { opacity:1; transform:rotate(var(--ra,0deg)) translateY(-27px) scale(1.4);
            background:var(--gc); box-shadow:0 0 7px 3px var(--pc); }
  88%     { opacity:1; transform:rotate(var(--ra,0deg)) translateY(-31px) scale(1.0); }
  95%     { opacity:.4; transform:rotate(var(--ra,0deg)) translateY(-35px) scale(.6); }
  100%    { opacity:0; transform:rotate(var(--ra,0deg)) translateY(-40px) scale(0); }
}

/* ══════════════════════════════════════════════════════════
   DUST CLOUD REVAMP (#3)
   
   Problem: z-index can't put CSS sibling "behind" a WebGL
   canvas — transparent canvas pixels show page background,
   not lower-z siblings.
   
   Solution: height:22px + overflow:hidden clips all particles
   to ground level. They're technically above the canvas
   (z-index:10) but physically can only appear at foot level,
   so they LOOK like ground dust, not body-covering circles.
   
   12 tiny pixel-art dust particles scattered horizontally.
   ══════════════════════════════════════════════════════════ */
.dust-wrap {
  position:absolute; bottom:2px; left:50%;
  transform:translateX(-50%);
  width:96px; height:22px;
  overflow:hidden;
  pointer-events:none;
  z-index:10;
}
.dp {
  position:absolute;
  border-radius:1px;
}
/* 12 particles: left-side (go left), right-side (go right) */
/* format: bottom, left, size, color, animation, delay */
.dp-01{width:4px;height:4px;background:rgba(185,155,110,.90);bottom:1px;left:46px;animation:dp-l1 .30s ease-out infinite;animation-delay:.000s;}
.dp-02{width:3px;height:3px;background:rgba(200,175,135,.85);bottom:4px;left:44px;animation:dp-l2 .30s ease-out infinite;animation-delay:.075s;}
.dp-03{width:4px;height:3px;background:rgba(170,142, 98,.88);bottom:2px;left:43px;animation:dp-l3 .30s ease-out infinite;animation-delay:.150s;}
.dp-04{width:3px;height:4px;background:rgba(210,188,155,.80);bottom:0px;left:45px;animation:dp-l4 .30s ease-out infinite;animation-delay:.225s;}
.dp-05{width:5px;height:3px;background:rgba(160,130, 88,.92);bottom:1px;left:47px;animation:dp-l5 .30s ease-out infinite;animation-delay:.015s;}
.dp-06{width:3px;height:3px;background:rgba(195,165,120,.82);bottom:3px;left:46px;animation:dp-l6 .30s ease-out infinite;animation-delay:.195s;}
.dp-07{width:4px;height:4px;background:rgba(185,155,110,.90);bottom:1px;left:46px;animation:dp-r1 .30s ease-out infinite;animation-delay:.000s;}
.dp-08{width:3px;height:3px;background:rgba(200,175,135,.85);bottom:4px;left:48px;animation:dp-r2 .30s ease-out infinite;animation-delay:.075s;}
.dp-09{width:4px;height:3px;background:rgba(170,142, 98,.88);bottom:2px;left:47px;animation:dp-r3 .30s ease-out infinite;animation-delay:.150s;}
.dp-10{width:3px;height:4px;background:rgba(210,188,155,.80);bottom:0px;left:49px;animation:dp-r4 .30s ease-out infinite;animation-delay:.225s;}
.dp-11{width:5px;height:3px;background:rgba(160,130, 88,.92);bottom:1px;left:48px;animation:dp-r5 .30s ease-out infinite;animation-delay:.015s;}
.dp-12{width:3px;height:3px;background:rgba(195,165,120,.82);bottom:3px;left:46px;animation:dp-r6 .30s ease-out infinite;animation-delay:.195s;}

/* Left particles scatter leftward */
@keyframes dp-l1{0%{transform:translate( 0px,0px)scale(1);opacity:0}10%{opacity:1}100%{transform:translate(-28px,-6px)scale(.4);opacity:0}}
@keyframes dp-l2{0%{transform:translate( 0px,0px)scale(1);opacity:0}10%{opacity:.9}100%{transform:translate(-22px,-10px)scale(.3);opacity:0}}
@keyframes dp-l3{0%{transform:translate( 0px,0px)scale(1);opacity:0}10%{opacity:.9}100%{transform:translate(-18px,-4px)scale(.5);opacity:0}}
@keyframes dp-l4{0%{transform:translate( 0px,0px)scale(1);opacity:0}10%{opacity:.8}100%{transform:translate(-32px,-2px)scale(.3);opacity:0}}
@keyframes dp-l5{0%{transform:translate( 0px,0px)scale(1);opacity:0}10%{opacity:1}100%{transform:translate(-14px,-8px)scale(.6);opacity:0}}
@keyframes dp-l6{0%{transform:translate( 0px,0px)scale(1);opacity:0}10%{opacity:.85}100%{transform:translate(-26px,-5px)scale(.4);opacity:0}}
/* Right particles scatter rightward */
@keyframes dp-r1{0%{transform:translate(0px,0px)scale(1);opacity:0}10%{opacity:1}100%{transform:translate(28px,-6px)scale(.4);opacity:0}}
@keyframes dp-r2{0%{transform:translate(0px,0px)scale(1);opacity:0}10%{opacity:.9}100%{transform:translate(22px,-10px)scale(.3);opacity:0}}
@keyframes dp-r3{0%{transform:translate(0px,0px)scale(1);opacity:0}10%{opacity:.9}100%{transform:translate(18px,-4px)scale(.5);opacity:0}}
@keyframes dp-r4{0%{transform:translate(0px,0px)scale(1);opacity:0}10%{opacity:.8}100%{transform:translate(32px,-2px)scale(.3);opacity:0}}
@keyframes dp-r5{0%{transform:translate(0px,0px)scale(1);opacity:0}10%{opacity:1}100%{transform:translate(14px,-8px)scale(.6);opacity:0}}
@keyframes dp-r6{0%{transform:translate(0px,0px)scale(1);opacity:0}10%{opacity:.85}100%{transform:translate(26px,-5px)scale(.4);opacity:0}}
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
    let disposed = false, viewer: any, canvas: HTMLCanvasElement | null = null;

    import('skinview3d').then((sv3d) => {
      if (disposed || !wrapRef.current) return;
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;position:relative;z-index:1;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({ canvas, width, height, skin:`https://mc-heads.net/skin/${username}` });
      try { viewer.renderer.setClearColor(0x000000,0); } catch(_){}
      try { viewer.controls.target.set(0,-8,0); viewer.controls.update(); } catch(_){}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch(_){}

      /* ──────── #3  FAST SPRINT ──────── */
      if (rank === 3) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin; if (!s) return;
            const t = progress * 9.0;
            s.body.rotation.x=0.22; s.body.rotation.y=0; s.body.rotation.z=Math.sin(t*2)*.05;
            const arm=Math.sin(t)*1.15;
            s.rightArm.rotation.x= arm; s.leftArm.rotation.x=-arm;
            s.rightArm.rotation.z=-0.07; s.leftArm.rotation.z=0.07;
            s.rightArm.rotation.y=0; s.leftArm.rotation.y=0;
            const leg=Math.sin(t)*1.0;
            s.rightLeg.rotation.x=-leg; s.leftLeg.rotation.x=leg;
            s.rightLeg.rotation.z=0; s.leftLeg.rotation.z=0;
            if(s.head){s.head.rotation.x=0.15+Math.sin(t*2)*.04;s.head.rotation.y=0;s.head.rotation.z=Math.sin(t*2)*.025;}
            player.position.y=-Math.abs(Math.sin(t))*.6; player.position.x=0; player.rotation.y=0;
          } catch(_){}
        });

      /* ──────── #2  FLOSS DANCE ──────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s=player?.skin; if(!s?.leftArm) return;
            const t=progress*7.5;
            const rS=Math.sin(t),swing=Math.sign(rS)*Math.pow(Math.abs(rS),.60);
            const rD=Math.sin(t/2),depth=Math.sign(rD)*Math.pow(Math.abs(rD),.50);
            s.rightArm.rotation.z=swing*1.35;s.rightArm.rotation.x=depth*.62;s.rightArm.rotation.y=0;
            s.leftArm.rotation.z=swing*1.35;s.leftArm.rotation.x=-depth*.62;s.leftArm.rotation.y=0;
            player.position.x=-swing*.70;player.position.y=0;player.rotation.y=0;
            s.body.rotation.z=swing*.10;s.body.rotation.x=0;s.body.rotation.y=0;
            if(s.head){s.head.rotation.y=swing*.12;s.head.rotation.x=0;s.head.rotation.z=0;}
            s.leftLeg.rotation.z=.18;s.leftLeg.rotation.x=.05;s.leftLeg.rotation.y=0;
            s.rightLeg.rotation.z=-.18;s.rightLeg.rotation.x=.05;s.rightLeg.rotation.y=0;
          } catch(_){}
        });

      /* ──────── #1  VICTORY + CROWN ──────── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s=player?.skin; if(!s?.head) return;
            if(!s.head.userData.crownDone){
              s.head.userData.crownDone=true;
              import('three').then((T:any)=>{
                if(disposed||s.head.userData.crownBuilt)return;
                s.head.userData.crownBuilt=true;
                const yT=new T.MeshPhongMaterial({color:0xFFEE00,specular:0xFFFF88,shininess:140,emissive:0x332200,emissiveIntensity:.30});
                const yM=new T.MeshPhongMaterial({color:0xEECC00,specular:0xFFFF44,shininess:100,emissive:0x221500,emissiveIntensity:.22});
                const yD=new T.MeshPhongMaterial({color:0xCC9900,specular:0xDDCC33,shininess:70,emissive:0x110E00,emissiveIntensity:.15});
                const fW=[yM,yM,yT,yD,yM,yM],fT=[yM,yM,yT,yD,yT,yM],fC=[yM,yM,yT,yD,yT,yM];
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
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]]as[number,number][]).forEach(([cx,cz])=>bx(fT,BT,1.45,BT,cx,BH+1.45/2,cz));
                ([[-2.8,gP],[-.9,gC],[.9,gB],[2.8,gG]]as[number,any][]).forEach(([x,mat])=>{const gem=new T.Mesh(new T.BoxGeometry(1.3,1.3,.8),mat);gem.position.set(x,BH/2,FZ+BT/2+.4);g.add(gem);});
                g.position.set(0,6,0);s.head.add(g);
              }).catch(()=>{});
            }
            const t=progress*2.5;
            s.leftArm.rotation.z=-(1.45+Math.sin(t*1.5)*.30);s.rightArm.rotation.z=1.45+Math.sin(t*1.5+Math.PI)*.30;
            s.leftArm.rotation.x=-0.20+Math.sin(t)*.20;s.rightArm.rotation.x=-0.20-Math.sin(t)*.20;
            s.head.rotation.y=Math.sin(t*.8)*.24;s.head.rotation.x=-0.08+Math.sin(t*1.1)*.08;
            s.body.rotation.y=Math.sin(t*.5)*.08;
            s.leftLeg.rotation.x=Math.sin(t*1.8)*.06;s.rightLeg.rotation.x=-Math.sin(t*1.8)*.06;
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
                <div className="mc-fw-trail"/>
              </div>
              <div className="mc-fw-burst">
                <div className="mc-burst-flash"/>
                {PR.map(a=>(
                  <div key={`p${a}`} className="mc-burst-pr" style={{'--ra':`${a}deg`}as React.CSSProperties}/>
                ))}
                {SR.map(a=>(
                  <div key={`s${a}`} className="mc-burst-sr" style={{'--ra':`${a}deg`}as React.CSSProperties}/>
                ))}
                {PR.map(a=>(
                  <div key={`t${a}`} className="mc-burst-tp" style={{'--ra':`${a}deg`}as React.CSSProperties}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {rank === 3 && (
        /* height:22px + overflow:hidden clips dust to ground level only
           — physically impossible for particles to overlap player body */
        <div className="dust-wrap">
          {Array.from({length:12},(_,i)=>(
            <div key={i} className={`dp dp-${String(i+1).padStart(2,'0')}`}/>
          ))}
        </div>
      )}
    </div>
  );
}
