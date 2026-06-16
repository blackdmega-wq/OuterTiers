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

export default function PodiumSkin3D({ username, rank }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let disposed = false;
    let viewer: any;
    let canvas: HTMLCanvasElement | null = null;

    import('skinview3d').then((sv3d) => {
      if (disposed || !wrapRef.current) return;

      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({
        canvas,
        width,
        height,
        skin: `https://mc-heads.net/skin/${username}`,
      });

      try { viewer.renderer.setClearColor(0x000000, 0); } catch (_) {}
      try {
        viewer.controls.target.set(0, -8, 0);
        viewer.controls.update();
      } catch (_) {}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      /* ── #3 SPRINT ── */
      if (rank === 3) {
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.2;
        viewer.animation = anim;

      /* ═══════════════════════════════════════════════════════════════
         #2  MINECRAFT FLOSS DANCE

         Referenzbild + Anleitung: Floss = VORWÄRTS/RÜCKWÄRTS-Pendel
         ──────────────────────────────────────────────────────────────
         Frame 1 (swing=+1): rechter Arm VORNE, linker Arm HINTEN
           → rightArm.x negativ (vorne), leftArm.x positiv (hinten)
           → Körper dreht LINKS (+y)
         Frame 3 (swing=−1): linker Arm VORNE, rechter Arm HINTEN
           → leftArm.x negativ (vorne), rightArm.x positiv (hinten)
           → gespiegelt
         Beide Arme leicht nach außen zur eigenen Seite (z-Komponente)
         ──────────────────────────────────────────────────────────────
         skinview3d Achsen:
           arm.rotation.x  NEGATIV=vorne  POSITIV=hinten
           leftArm.z   NEGATIV=außen-links  (eigene Seite für left)
           rightArm.z  NEGATIV=außen-rechts (eigene Seite für right)
           body.y  POSITIV=Körper dreht LINKS
         ═══════════════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const lerp  = (a: number, b: number, p: number) => a + (b - a) * p;
            const t     = progress * 2.8;
            const swing = Math.sin(t);        /* +1=rechter Arm vorne  −1=linker Arm vorne */
            const ph    = (swing + 1) * 0.5; /* 0=linker Arm vorne  1=rechter Arm vorne */

            /* ── RECHTER ARM ─────────────────────────────────────────────────
               ph=1 (Frame 1): VORNE   x=−0.90 (51° vorne) + z=−0.52 (nach außen-rechts)
               ph=0 (Frame 3): HINTEN  x=+0.65 (37° hinten)+ z=−0.25 (weniger außen)
               Formel: forward arm spreads wider outward than backward arm              */
            s.rightArm.rotation.x = lerp(+0.65, -0.90, ph);
            s.rightArm.rotation.z = lerp(-0.25, -0.52, ph);
            s.rightArm.rotation.y =  swing * 0.08;

            /* ── LINKER ARM ──────────────────────────────────────────────────
               ph=0 (Frame 3): VORNE   x=−0.90 + z=−0.52 (nach außen-links)
               ph=1 (Frame 1): HINTEN  x=+0.65 + z=−0.25                             */
            s.leftArm.rotation.x = lerp(-0.90, +0.65, ph);
            s.leftArm.rotation.z = lerp(-0.52, -0.25, ph);
            s.leftArm.rotation.y = -swing * 0.08;

            /* ── KÖRPER — dreht ENTGEGEN dem vorderen Arm ────────────────────
               Frame 1 (rechts vorne): Körper dreht LINKS → +y                       */
            s.body.rotation.y =  swing * 0.22;
            s.body.rotation.x =  0;
            s.body.rotation.z =  0;
            s.body.position.x =  0;

            /* ── KOPF — subtile Gegenbewegung ───────────────────────────── */
            if (s.head) {
              s.head.rotation.y = -swing * 0.10;
              s.head.rotation.x =  0;
              s.head.rotation.z =  0;
            }

            /* ── BEINE — leicht auseinander + minimaler Weight-Shift ─────── */
            s.leftLeg.rotation.z  =  0.18;
            s.leftLeg.rotation.x  =  swing * 0.04;
            s.leftLeg.rotation.y  =  0;
            s.rightLeg.rotation.z = -0.18;
            s.rightLeg.rotation.x = -swing * 0.04;
            s.rightLeg.rotation.y =  0;

          } catch (_) {}
        });

      /* ═══════════════════════════════════════════════════════════════
         #1  VICTORY POSE + MINECRAFT CASTLE CROWN
         ═══════════════════════════════════════════════════════════════ */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;

              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                const yTop  = new T.MeshPhongMaterial({ color: 0xFFEE00, specular: 0xFFFF88, shininess: 140, emissive: 0x332200, emissiveIntensity: 0.30 });
                const yMid  = new T.MeshPhongMaterial({ color: 0xEECC00, specular: 0xFFFF44, shininess: 100, emissive: 0x221500, emissiveIntensity: 0.22 });
                const yDark = new T.MeshPhongMaterial({ color: 0xCC9900, specular: 0xDDCC33, shininess: 70,  emissive: 0x110E00, emissiveIntensity: 0.15 });

                const facesWall   = [yMid, yMid, yTop, yDark, yMid, yMid];
                const facesTop    = [yMid, yMid, yTop, yDark, yTop, yMid];
                const facesCenter = [yMid, yMid, yTop, yDark, yTop, yMid];

                const gemPurple = new T.MeshPhongMaterial({ color: 0xDD44FF, specular: 0xFFCCFF, shininess: 200, emissive: 0x9900CC, emissiveIntensity: 0.90 });
                const gemCyan   = new T.MeshPhongMaterial({ color: 0x44CCFF, specular: 0xCCEEFF, shininess: 200, emissive: 0x006688, emissiveIntensity: 0.85 });
                const gemBlue   = new T.MeshPhongMaterial({ color: 0x2255EE, specular: 0x88AAFF, shininess: 200, emissive: 0x001188, emissiveIntensity: 0.85 });
                const gemGreen  = new T.MeshPhongMaterial({ color: 0x11EE44, specular: 0xAAFFCC, shininess: 200, emissive: 0x005511, emissiveIntensity: 0.90 });

                const g  = new T.Group();
                const bx = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                const BW = 10.0, BH = 1.0, BT = 0.80, inner = BW - BT * 2;
                const FZ = BW/2-BT/2, BKZ = -(BW/2-BT/2), LX = -(BW/2-BT/2), RX = BW/2-BT/2;

                bx(facesWall, BW, BH, BT,    0,    BH/2, FZ );
                bx(facesWall, BW, BH, BT,    0,    BH/2, BKZ);
                bx(facesWall, BT, BH, inner, LX,   BH/2, 0  );
                bx(facesWall, BT, BH, inner, RX,   BH/2, 0  );

                const MW = 0.88, MD = BT, MH = 1.45, MHC = 2.20, yB = BH;
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x, i) => {
                  const h   = i === 3 ? MHC : MH;
                  const mat = i === 3 ? facesCenter : facesTop;
                  bx(mat, MW, h, MD, x, yB+h/2, FZ );
                  bx(mat, MW, h, MD, x, yB+h/2, BKZ);
                });
                [-2.0, 0, 2.0].forEach(z => {
                  bx(facesTop, MD, MH, MW, LX, yB+MH/2, z);
                  bx(facesTop, MD, MH, MW, RX, yB+MH/2, z);
                });
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as [number,number][])
                  .forEach(([cx,cz]) => bx(facesTop, BT, MH, BT, cx, yB+MH/2, cz));

                const GS=1.30, GD=0.80, GY=BH/2, GZ=FZ+BT/2+GD/2;
                ([[-2.8,gemPurple],[-0.9,gemCyan],[0.9,gemBlue],[2.8,gemGreen]] as [number,any][])
                  .forEach(([x,mat]) => { const gem=new T.Mesh(new T.BoxGeometry(GS,GS,GD),mat); gem.position.set(x,GY,GZ); g.add(gem); });

                g.position.set(0, 6.0, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.45 + Math.sin(t*1.5)*0.30);
            s.rightArm.rotation.z =   1.45 + Math.sin(t*1.5+Math.PI)*0.30;
            s.leftArm.rotation.x  = -0.20 + Math.sin(t)*0.20;
            s.rightArm.rotation.x = -0.20 - Math.sin(t)*0.20;
            s.head.rotation.y     =  Math.sin(t*0.8)*0.24;
            s.head.rotation.x     = -0.08 + Math.sin(t*1.1)*0.08;
            s.body.rotation.y     =  Math.sin(t*0.5)*0.08;
            s.leftLeg.rotation.x  =  Math.sin(t*1.8)*0.06;
            s.rightLeg.rotation.x = -Math.sin(t*1.8)*0.06;
          } catch (_) {}
        });
      }
    }).catch(console.error);

    return () => {
      disposed = true;
      if (viewer) { try { viewer.dispose(); } catch (_) {} }
      if (canvas && wrap.contains(canvas)) { wrap.removeChild(canvas); }
    };
  }, [username, rank]);

  return (
    <div
      ref={wrapRef}
      style={{ width, height, position: 'relative', zIndex: 1, flexShrink: 0, margin: '0 auto' }}
    />
  );
}
