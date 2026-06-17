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
         #2  FLOSS DANCE  — v18  (WikiHow 1:1)

         ACHSEN (verifiziert aus Victory-Pose Rank 1):
           arm.z NEGATIV  = Arm geht nach LINKS
           arm.z POSITIV  = Arm geht nach RECHTS
           arm.x POSITIV  = Arm geht nach VORNE (Kamera)
           arm.x NEGATIV  = Arm geht nach HINTEN (Rücken)

         SCHLÜSSEL-ERKENNTNISSE aus WikiHow:
           1. Beide Arme schwingen zur GLEICHEN Seite (swing-Wert bestimmt Richtung)
           2. Arme hängen in der MITTE nach UNTEN (z≈0) und "flossen" durch die Hüfte
              → z skaliert mit Math.abs(swing): 0 in der Mitte, max an den Extremen
           3. Links-Schwung:  LINKER Arm vorne, rechter Arm hinten
              Rechts-Schwung: RECHTER Arm vorne, linker Arm hinten
              → x skaliert mit swing: links-x = -swing, rechts-x = +swing
           4. Kreuzungs-Arm (von gegenüber) braucht größeres z als Außen-Arm

         swing=−1 (LINKS):
           rightArm = Kreuzungs-Arm: z=−1.10, x=−0.55 (HINTEN)
           leftArm  = Außen-Arm:    z=−0.90, x=+0.55 (VORNE)
           Hüfte → RECHTS (+x)

         swing=0 (MITTE, Übergang):
           Beide Arme: z=0 (hängen runter, bürsten die Hüfte)
           Beide Arme: x=0 (neutral)

         swing=+1 (RECHTS):
           rightArm = Außen-Arm:    z=+0.90, x=+0.55 (VORNE)
           leftArm  = Kreuzungs-Arm: z=+1.10, x=−0.55 (HINTEN)
           Hüfte → LINKS (−x)
         ═══════════════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /* ~0.9 Hz — Floss-Tempo */
            const t   = progress * 5.7;
            const raw = Math.sin(t);

            /* Power-Easing: Posen halten, Übergänge flüssig durch Mitte */
            const swing = Math.sign(raw) * Math.pow(Math.abs(raw), 0.42);
            /* swing: −1=voll links, 0=Mitte (Arme unten), +1=voll rechts */

            /* ── RECHTER ARM ──────────────────────────────────────────────
               swing=-1 (voll LINKS): z=-1.15 (links), x=-0.55 (HINTEN)
               swing= 0 (MITTE):      z= 0   (unten),  x=+0.55 (VORNE) ← beide vorne!
               swing=+1 (voll RECHTS): z=+0.95 (rechts), x=+0.55 (VORNE)
               Formel x: 0.55*(1 + 2*min(0,swing)) → -0.55 nur bei voll links */
            s.rightArm.rotation.z = swing * (swing < 0 ? 1.15 : 0.95);
            s.rightArm.rotation.x = 0.55 * (1 + 2 * Math.min(0, swing));
            s.rightArm.rotation.y = 0;

            /* ── LINKER ARM ───────────────────────────────────────────────
               swing=-1 (voll LINKS):  z=-0.95 (links),  x=+0.55 (VORNE)
               swing= 0 (MITTE):       z= 0   (unten),   x=+0.55 (VORNE) ← beide vorne!
               swing=+1 (voll RECHTS): z=+1.15 (rechts), x=-0.55 (HINTEN)
               Formel x: 0.55*(1 - 2*max(0,swing)) → -0.55 nur bei voll rechts */
            s.leftArm.rotation.z = swing * (swing < 0 ? 0.95 : 1.15);
            s.leftArm.rotation.x = 0.55 * (1 - 2 * Math.max(0, swing));
            s.leftArm.rotation.y = 0;

            /* ── KÖRPER — bleibt gerade, leichter z-Tilt (Gewichtsverlagerung) */
            s.body.rotation.y = 0;
            s.body.rotation.x = 0;
            s.body.rotation.z = -swing * 0.04;

            /* ── HÜFTE — gegenläufig zu den Armen (WikiHow Step 3) ─────────
               Arme LINKS (swing<0) → Hüfte RECHTS (+x) ✓                   */
            player.position.x = -swing * 0.55;
            player.position.y = 0;
            player.rotation.y = 0;

            /* ── KOPF — schaut geradeaus ─────────────────────────────────── */
            if (s.head) {
              s.head.rotation.y = 0;
              s.head.rotation.x = 0;
              s.head.rotation.z = 0;
            }

            /* ── BEINE — leicht gespreizt, statisch (keine Bewegung) ─────── */
            s.leftLeg.rotation.z  = -0.10;
            s.leftLeg.rotation.x  =  0;
            s.leftLeg.rotation.y  =  0;
            s.rightLeg.rotation.z =  0.10;
            s.rightLeg.rotation.x =  0;
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
