import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = { 1:{width:100,height:160}, 2:{width:82,height:128}, 3:{width:76,height:118} } as const;
const ZOOM: Record<1|2|3,number> = { 1:0.58, 2:0.68, 3:0.64 };

const STYLE_ID = 'podium-skin-3d-v10';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  ['podium-skin-3d-css','podium-skin-3d-css-v4','podium-skin-3d-css-v5',
   'podium-skin-3d-v6','podium-skin-3d-v7','podium-skin-3d-v8','podium-skin-3d-v9']
    .forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `

/* ══════════════════════════════════════════════════════════
   ROCKET OVERLAY  (#1) — no wobble, straight flight
   ══════════════════════════════════════════════════════════ */
.mc-rockets-overlay {
  position:absolute; inset:0; overflow:visible;
  pointer-events:none; z-index:3;
}
.mc-fw-slot { position:absolute; bottom:10px; }
.mc-fw-slot--a { left:-8px; }
.mc-fw-slot--b { left:20px; }
.mc-fw-slot--c { right:20px; }

.mc-fw-slot--a { --pc:#ff3322; --sc:#ff9944; --gc:#ffdd88; }
.mc-fw-slot--b { --pc:#ffdd00; --sc:#ffe855; --gc:#ffffff;  }
.mc-fw-slot--c { --pc:#3399ff; --sc:#88ddff; --gc:#ccf0ff;  }

.mc-fw-rocket {
  display:flex; flex-direction:column; align-items:center;
  image-rendering:pixelated; transform-origin:bottom center;
  will-change:transform,opacity;
}
.mc-fw-slot--a .mc-fw-rocket { animation:mc-fly 3.5s cubic-bezier(0.25,0.0,0.5,1.0) infinite  0.0s; }
.mc-fw-slot--b .mc-fw-rocket { animation:mc-fly 4.0s cubic-bezier(0.25,0.0,0.5,1.0) infinite -1.2s; }
.mc-fw-slot--c .mc-fw-rocket { animation:mc-fly 3.7s cubic-bezier(0.25,0.0,0.5,1.0) infinite -2.2s; }

@keyframes mc-fly {
  0%   { transform:translateY(0px);    opacity:1; }
  68%  { transform:translateY(-120px); opacity:1; }
  73%  { transform:translateY(-130px); opacity:0; }
  74%  { transform:translateY(0px);    opacity:0; }
  100% { transform:translateY(0px);    opacity:0; }
}

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
.mc-fw-exhaust {
  width:7px; height:16px; margin-top:-2px;
  background:linear-gradient(to bottom,#ffffff 0%,#ffee44 25%,#ff8800 55%,#ff3300 82%,transparent 100%);
  border-radius:0 0 5px 5px;
  box-shadow:0 0 8px 3px rgba(255,120,0,.9), 0 0 18px 5px rgba(255,60,0,.5);
  filter:blur(0.4px);
  animation:mc-exhaust-smooth .14s ease-in-out infinite alternate;
}
@keyframes mc-exhaust-smooth {
  from { height:16px; transform:scaleX(1.0); opacity:1.0; }
  to   { height:10px; transform:scaleX(0.8); opacity:0.72; }
}
.mc-fw-trail {
  position:absolute; bottom:-2px; left:50%;
  transform:translateX(-50%);
  width:4px; height:50px;
  background:linear-gradient(to top,transparent 0%,rgba(255,140,0,.22) 45%,rgba(255,200,50,.1) 75%,transparent 100%);
  border-radius:50%; filter:blur(3px); pointer-events:none;
}

/* ══════════════════════════════════════════════════════════
   EXPLOSION BURST — child anims synced to slot timing
   ══════════════════════════════════════════════════════════ */
.mc-fw-burst {
  position:absolute; left:50%; bottom:10px;
  transform:translateX(-50%) translateY(-130px);
  width:64px; height:64px; pointer-events:none;
}

.mc-burst-flash { position:absolute; top:50%; left:50%; width:22px; height:22px; border-radius:50%; opacity:0; }
.mc-fw-slot--a .mc-burst-flash { animation:mc-bflash 3.5s linear infinite  0.0s; }
.mc-fw-slot--b .mc-burst-flash { animation:mc-bflash 4.0s linear infinite -1.2s; }
.mc-fw-slot--c .mc-burst-flash { animation:mc-bflash 3.7s linear infinite -2.2s; }
@keyframes mc-bflash {
  0%,68%  { transform:translate(-50%,-50%) scale(0); opacity:0; }
  71%     { transform:translate(-50%,-50%) scale(0.5); opacity:1;
            background:radial-gradient(circle,#fff 0%,var(--gc) 30%,var(--pc) 70%,transparent 100%);
            box-shadow:0 0 16px 6px var(--pc),0 0 30px 12px var(--sc); }
  80%     { transform:translate(-50%,-50%) scale(1.8); opacity:1; }
  92%     { transform:translate(-50%,-50%) scale(2.4); opacity:.45; }
  100%    { transform:translate(-50%,-50%) scale(3.0); opacity:0; }
}

.mc-burst-pr {
  position:absolute; top:50%; left:50%;
  width:5px; height:28px; border-radius:4px 4px 1px 1px;
  transform-origin:50% 0%; margin-left:-2.5px; opacity:0;
}
.mc-fw-slot--a .mc-burst-pr { animation:mc-bpr 3.5s linear infinite  0.0s; }
.mc-fw-slot--b .mc-burst-pr { animation:mc-bpr 4.0s linear infinite -1.2s; }
.mc-fw-slot--c .mc-burst-pr { animation:mc-bpr 3.7s linear infinite -2.2s; }
@keyframes mc-bpr {
  0%,69%  { opacity:0; transform:rotate(var(--ra,0deg)) scaleY(0); }
  72%     { opacity:1; transform:rotate(var(--ra,0deg)) scaleY(0.1);
            background:linear-gradient(to bottom,#fff 0%,var(--gc) 15%,var(--pc) 60%,transparent 100%);
            box-shadow:0 0 8px 3px var(--pc),0 0 14px 5px var(--sc); }
  80%     { opacity:1; transform:rotate(var(--ra,0deg)) scaleY(1.0); }
  91%     { opacity:.7; transform:rotate(var(--ra,0deg)) scaleY(1.5); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) scaleY(1.9); }
}

.mc-burst-sr {
  position:absolute; top:50%; left:50%;
  width:2.5px; height:18px; border-radius:2px;
  transform-origin:50% 0%; margin-left:-1.25px; opacity:0;
}
.mc-fw-slot--a .mc-burst-sr { animation:mc-bsr 3.5s linear infinite  0.0s; }
.mc-fw-slot--b .mc-burst-sr { animation:mc-bsr 4.0s linear infinite -1.2s; }
.mc-fw-slot--c .mc-burst-sr { animation:mc-bsr 3.7s linear infinite -2.2s; }
@keyframes mc-bsr {
  0%,71%  { opacity:0; transform:rotate(var(--ra,0deg)) scaleY(0); }
  74%     { opacity:.9; transform:rotate(var(--ra,0deg)) scaleY(0.2);
            background:linear-gradient(to bottom,var(--gc) 0%,var(--sc) 55%,transparent 100%);
            box-shadow:0 0 5px 2px var(--sc); }
  83%     { opacity:.9; transform:rotate(var(--ra,0deg)) scaleY(1.0); }
  93%     { opacity:.4; transform:rotate(var(--ra,0deg)) scaleY(1.35); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) scaleY(1.65); }
}

.mc-burst-tp {
  position:absolute; top:50%; left:50%;
  width:6px; height:6px; border-radius:50%;
  margin-left:-3px; margin-top:-3px; opacity:0;
}
.mc-fw-slot--a .mc-burst-tp { animation:mc-btp 3.5s linear infinite  0.0s; }
.mc-fw-slot--b .mc-burst-tp { animation:mc-btp 4.0s linear infinite -1.2s; }
.mc-fw-slot--c .mc-burst-tp { animation:mc-btp 3.7s linear infinite -2.2s; }
@keyframes mc-btp {
  0%,75%  { opacity:0; transform:rotate(var(--ra,0deg)) translateY(-20px) scale(0); }
  79%     { opacity:1; transform:rotate(var(--ra,0deg)) translateY(-27px) scale(1.4);
            background:var(--gc); box-shadow:0 0 7px 3px var(--pc); }
  88%     { opacity:1; transform:rotate(var(--ra,0deg)) translateY(-31px) scale(1.0); }
  95%     { opacity:.4; transform:rotate(var(--ra,0deg)) translateY(-35px) scale(.6); }
  100%    { opacity:0;  transform:rotate(var(--ra,0deg)) translateY(-40px) scale(0); }
}
`;
  document.head.appendChild(s);
}

const PR = [0,45,90,135,180,225,270,315];
const SR = [22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5];

/* ── Step-impact ring FX for rank 3 sprint ── */
interface StepRing {
  x: number; y: number;
  r: number; maxR: number;
  life: number; maxLife: number;
}

function startDustCanvas(
  cv: HTMLCanvasElement,
  w: number,
  h: number
): () => void {
  cv.width = w;
  cv.height = h;
  const dc = cv.getContext('2d') as CanvasRenderingContext2D;
  if (!dc) return () => {};

  const rings: StepRing[] = [];
  const LFX = w * 0.36;
  const RFX = w * 0.64;
  const FY  = h - 20;          // ground contact point (at the feet)

  const START_T = performance.now();
  let prevCy = 0;
  let lastT  = performance.now();
  let animId = 0;

  function spawnRing(fx: number) {
    // Primary impact ring
    rings.push({ x: fx, y: FY, r: 0, maxR: 9, life: 0.22, maxLife: 0.22 });
    // Secondary smaller echo
    rings.push({ x: fx, y: FY, r: 0, maxR: 5, life: 0.30, maxLife: 0.30 });
  }

  function tick(now: number) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastT) / 16.67, 2.5);
    lastT = now;

    // Sync with sprint animation formula
    const t = ((now - START_T) / 1000) * 10.5;
    const cy = Math.sin(t);
    if (prevCy <= 0 && cy > 0) spawnRing(RFX);
    else if (prevCy >= 0 && cy < 0) spawnRing(LFX);
    prevCy = cy;

    dc.clearRect(0, 0, w, h);

    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i];
      rg.life -= 0.032 * dt;
      if (rg.life <= 0) { rings.splice(i, 1); continue; }

      const lifeRatio = rg.life / rg.maxLife; // 1→0 as ring ages
      rg.r = rg.maxR * (1 - lifeRatio);        // grows 0→maxR
      const alpha = lifeRatio * 0.75;           // fades out

      // Stroke width shrinks as ring expands
      const lw = 0.8 + lifeRatio * 2.0;

      dc.beginPath();
      dc.ellipse(rg.x, rg.y, rg.r, rg.r * 0.32, 0, 0, Math.PI * 2);
      dc.strokeStyle = `rgba(160,200,255,${alpha})`;
      dc.lineWidth = lw;
      dc.stroke();

      // Bright inner flash at the moment of impact
      if (lifeRatio > 0.65) {
        dc.beginPath();
        dc.ellipse(rg.x, rg.y, rg.r * 0.5, rg.r * 0.16, 0, 0, Math.PI * 2);
        dc.strokeStyle = `rgba(220,240,255,${(lifeRatio - 0.65) / 0.35 * 0.9})`;
        dc.lineWidth = lw * 0.5;
        dc.stroke();
      }
    }
  }

  animId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(animId);
}

export default function PodiumSkin3D({ username, rank }: Props) {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
    ensureStyles();
    const wrap = wrapRef.current;
    if (!wrap) return;
    let disposed = false;
    let viewer: any;
    let canvas: HTMLCanvasElement | null = null;
    let stopDust: (() => void) | null = null;

    // Start canvas dust for rank 3
    if (rank === 3 && dustCanvasRef.current) {
      stopDust = startDustCanvas(dustCanvasRef.current, width, height);
    }

    const isMobile = window.innerWidth < 768;
    const targetFps = isMobile ? 15 : 45;

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

      // Cap render FPS — reduces GPU load significantly on mobile
      try {
        const _ms = 1000 / targetFps; let _lt = 0;
        const _orig = viewer.render.bind(viewer);
        viewer.renderer.setAnimationLoop((t: number) => { if (t - _lt >= _ms) { _lt = t; _orig(); } });
      } catch(_) {}

      /* ──────── #3  FAST SPRINT ──────── */
      if (rank === 3) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin; if (!s) return;
            const t = progress * 10.5;
            const cy = Math.sin(t), c2 = Math.sin(t * 2);
            s.body.rotation.x = 0.34 + c2 * 0.04;
            s.body.rotation.y = 0;
            s.body.rotation.z = c2 * 0.08;
            const armX = cy * 1.40;
            s.rightArm.rotation.x =  armX; s.leftArm.rotation.x = -armX;
            s.rightArm.rotation.z = -0.14 - Math.abs(cy) * 0.10;
            s.leftArm.rotation.z  =  0.14 + Math.abs(cy) * 0.10;
            s.rightArm.rotation.y =  cy * 0.10; s.leftArm.rotation.y = -cy * 0.10;
            const legX = cy * 1.30;
            s.rightLeg.rotation.x = -legX; s.leftLeg.rotation.x = legX;
            s.rightLeg.rotation.z =  Math.abs(cy) * 0.05;
            s.leftLeg.rotation.z  = -Math.abs(cy) * 0.05;
            if (s.head) {
              s.head.rotation.x = 0.20 + c2 * 0.07;
              s.head.rotation.y = cy * 0.07;
              s.head.rotation.z = c2 * 0.03;
            }
            player.position.y = -Math.abs(cy) * 1.0;
            player.position.x =  cy * 0.06;
            player.rotation.y = 0;
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
      disposed = true;
      if (stopDust) stopDust();
      if (viewer) { try { viewer.dispose(); } catch(_) {} }
      if (canvas && wrap.contains(canvas)) { wrap.removeChild(canvas); }
    };
  }, [username, rank, width, height]);

  return (
    <div
      ref={wrapRef}
      style={{width,height,position:'relative',zIndex:1,flexShrink:0,margin:'0 auto',overflow:'visible'}}
    >
      {/* Canvas dust rendered FIRST (z-index 0) — WebGL canvas appended SECOND (z-index 1) by useEffect.
          Transparent WebGL pixels let the dust canvas show through underneath. */}
      {rank === 3 && (
        <canvas
          ref={dustCanvasRef}
          style={{
            position:'absolute', bottom:0, left:0,
            width:`${width}px`, height:`${height}px`,
            pointerEvents:'none', zIndex:0,
          }}
          width={width}
          height={height}
        />
      )}

      {rank === 1 && (
        <div className="mc-rockets-overlay">
          {(['a','b','c'] as const).map(slot => (
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
    </div>
  );
}
