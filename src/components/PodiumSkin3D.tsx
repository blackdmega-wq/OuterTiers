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

      /* ═══════════════════════════════════════════════════════
         #2  FORTNITE FLOSS DANCE (Backpack Kid)

         Viewed from the FRONT of the dancer:
         ┌──────────────────────────────────────────────────────┐
         │  PHASE-R  (arms swing RIGHT):                        │
         │   Left arm  → FORWARD + crosses body to RIGHT        │
         │   Right arm → BACKWARD + swings outward RIGHT        │
         │   Hips counter-twist to the LEFT                     │
         │                                                      │
         │  PHASE-L  (arms swing LEFT):                         │
         │   Right arm → FORWARD + crosses body to LEFT         │
         │   Left arm  → BACKWARD + swings outward LEFT         │
         │   Hips counter-twist to the RIGHT                    │
         └──────────────────────────────────────────────────────┘

         skinview3d arm rotation axes:
           rotation.x  neg = arm swings FORWARD (toward camera)
                       pos = arm swings BACKWARD
           leftArm.rotation.z   pos = arm crosses body RIGHT
                                neg = arm swings outward LEFT
           rightArm.rotation.z  neg = arm crosses body LEFT
                                pos = arm swings outward RIGHT
         ═══════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /*
              ─── FLOSS — 4-BEAT KEYFRAME CYCLE ──────────────────────────
              Beat 1: L-arm OUT-LEFT,  R-arm BEHIND
              Beat 2: L-arm OUT-RIGHT, R-arm OUT-RIGHT  (both arms RIGHT)
              Beat 3: L-arm OUT-LEFT,  R-arm OUT-LEFT   (both arms LEFT)
              Beat 4: L-arm BEHIND,    R-arm OUT-RIGHT

              Rotation.z sign rule (Three.js, char faces +Z):
                leftArm  .z POSITIVE → crosses body to char-RIGHT
                leftArm  .z NEGATIVE → points outward char-LEFT
                rightArm .z POSITIVE → crosses body to char-LEFT
                rightArm .z NEGATIVE → points outward char-RIGHT

              Legs: no movement (user request)
              ─────────────────────────────────────────────────────────────
            */
            const SPEED = 1.5;
            const raw = ((progress * SPEED * 4) % 4 + 4) % 4;
            const ki  = Math.floor(raw);
            const frac = raw - ki;

            const ease = (t: number) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const ef   = ease(frac);
            const lerp = (a: number, b: number) => a + (b - a) * ef;

            /*  lAx  lAz   rAx   rAz   by  */
            const KEYS = [
              /* Beat 1 — L out-LEFT,  R behind      */
              { lAx:  0.10, lAz: -1.30, rAx:  1.20, rAz:  0.10, by:  0.35 },
              /* Beat 2 — Both arms RIGHT             */
              { lAx:  0.10, lAz:  1.30, rAx:  0.10, rAz: -1.30, by: -0.45 },
              /* Beat 3 — Both arms LEFT              */
              { lAx:  0.10, lAz: -1.30, rAx:  0.10, rAz:  1.30, by:  0.45 },
              /* Beat 4 — L behind,    R out-RIGHT    */
              { lAx:  1.20, lAz: -0.10, rAx:  0.10, rAz: -1.30, by: -0.35 },
            ];

            const kA = KEYS[ki % 4];
            const kB = KEYS[(ki + 1) % 4];

            s.leftArm.rotation.x  = lerp(kA.lAx, kB.lAx);
            s.leftArm.rotation.z  = lerp(kA.lAz, kB.lAz);
            s.leftArm.rotation.y  = 0;
            s.rightArm.rotation.x = lerp(kA.rAx, kB.rAx);
            s.rightArm.rotation.z = lerp(kA.rAz, kB.rAz);
            s.rightArm.rotation.y = 0;

            s.body.rotation.y = lerp(kA.by, kB.by);
            s.body.rotation.x = 0;
            s.body.rotation.z = 0;

            /* Legs: no movement */
            s.leftLeg.rotation.x  = 0; s.leftLeg.rotation.z  = 0; s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.x = 0; s.rightLeg.rotation.z = 0; s.rightLeg.rotation.y = 0;
          } catch (_) {}
        });

      /* ═══════════════════════════════════════════════════════
         #1  VICTORY POSE + MINECRAFT CASTLE CROWN

         Crown built to match reference screenshot 1-to-1:
         • Wide base band (yellow/gold) — chunky walls
         • Castle merlons: 5 front, 5 back, 3 per side, corner blocks
         • Center merlon visibly taller
         • 4 LARGE gems on the FRONT face (toward camera = +Z in head space):
             purple | light-blue | dark-blue | green
         • Crown sits ON TOP of head (group.y = 8 = head top)

         IMPORTANT — coordinate system in skinview3d:
           The character faces +Z (toward the camera).
           In head LOCAL space the face/front is at +Z.
           ∴ front wall of crown = positive Z; gems protrude at +Z.
         ═══════════════════════════════════════════════════════ */
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

                /* ── Materials ── */
                const gold  = new T.MeshLambertMaterial({ color: 0xF0CC00 });
                const mPurp = new T.MeshLambertMaterial({ color: 0xBB44EE });
                const mBlu1 = new T.MeshLambertMaterial({ color: 0x55AAFF });
                const mBlu2 = new T.MeshLambertMaterial({ color: 0x1155CC });
                const mGrn  = new T.MeshLambertMaterial({ color: 0x33DD44 });

                const g = new T.Group();
                const bx = (
                  mat: any, w: number, h: number, d: number,
                  x: number, y: number, z: number,
                ) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                /*
                  Crown dimensions — proportioned to match IMG_4985 reference.
                  Head = 8×8×8 units; crown sits on top (group at y=8).
                  Total height above head: BH + MHC = 1.6 + 2.0 = 3.6 units (~45% of head).
                */
                const BW  = 10.5;               // crown width (wider than 8-unit head)
                const BH  = 1.6;               // base band height
                const BT  = 1.3;               // wall thickness

                /* Character faces +Z (toward camera).
                   Front wall = POSITIVE Z, back wall = NEGATIVE Z. */
                const FZ  =  (BW / 2 - BT / 2);   // front wall center (+Z = toward camera)
                const BKZ = -(BW / 2 - BT / 2);   // back  wall center (-Z)
                const LX  = -(BW / 2 - BT / 2);   // left  wall center
                const RX  =  (BW / 2 - BT / 2);   // right wall center
                const inner = BW - BT * 2;         // inner span

                /* ── BASE BAND — 4 walls ── */
                bx(gold, BW,    BH, BT,    0,     BH / 2, FZ);   // FRONT wall
                bx(gold, BW,    BH, BT,    0,     BH / 2, BKZ);  // back wall
                bx(gold, BT,    BH, inner, LX,    BH / 2, 0);    // left wall
                bx(gold, BT,    BH, inner, RX,    BH / 2, 0);    // right wall

                /* ── MERLONS (castle battlements) ──
                   Front & back: 5 merlons, evenly spaced.
                   Center merlon is taller (matches the reference screenshot).
                   Sides: 3 merlons each. Corner junction blocks. */
                const MW  = 1.4;   // merlon width
                const MD  = BT;    // merlon depth
                const MH  = 1.5;   // standard merlon height
                const MHC = 2.0;   // center merlon height (taller)
                const yB  = BH;    // merlons start at base top

                const frontXs = [-3.5, -1.75, 0, 1.75, 3.5];

                /* front merlons */
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yB + h / 2, FZ);
                });
                /* back merlons */
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yB + h / 2, BKZ);
                });
                /* left side merlons */
                [-2.2, 0, 2.2].forEach((z) => bx(gold, MD, MH, MW, LX, yB + MH / 2, z));
                /* right side merlons */
                [-2.2, 0, 2.2].forEach((z) => bx(gold, MD, MH, MW, RX, yB + MH / 2, z));
                /* corner junction blocks */
                ([[LX, FZ], [RX, FZ], [LX, BKZ], [RX, BKZ]] as [number,number][])
                  .forEach(([cx, cz]) => bx(gold, BT, MH, BT, cx, yB + MH / 2, cz));

                /* ── GEMS on the FRONT face (+Z, toward camera) ──
                   Large coloured squares embedded in the base band.
                   They protrude outward (more positive Z) to be CLEARLY visible.

                   Front wall face is at:  FZ + BT/2  (most-positive-Z surface)
                   Gem protrudes to:       FZ + BT/2 + GD
                   Gem centre at:          FZ + BT/2 + GD/2                      */
                const GS   = 1.55;                           // gem side length
                const GD   = 0.70;                           // gem depth (protrusion)
                const GY   = BH / 2;                         // vertically centred in band
                const GZ   = FZ + BT / 2 + GD / 2;          // ← FRONT face, protruding outward

                ([
                  [-3.1, mPurp],   // purple (left)
                  [-1.0, mBlu1],   // light blue
                  [ 1.0, mBlu2],   // dark blue
                  [ 3.1, mGrn ],   // green (right)
                ] as [number, any][]).forEach(([x, mat]) => {
                  const gem = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  gem.position.set(x, GY, GZ);
                  g.add(gem);
                });

                /* Lower the crown so it sits ON the head (not floating above).
                   y=8 = head top. y=7 sinks the crown 1 unit into head — looks worn. */
                g.position.set(0, 7.0, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            /* Victory pose — gentle wave */
            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.4 + Math.sin(t * 1.5) * 0.35);
            s.rightArm.rotation.z =   1.4 + Math.sin(t * 1.5 + Math.PI) * 0.35;
            s.leftArm.rotation.x  = -0.18 + Math.sin(t) * 0.18;
            s.rightArm.rotation.x = -0.18 - Math.sin(t) * 0.18;
            s.head.rotation.y     =  Math.sin(t * 0.8) * 0.25;
            s.head.rotation.x     = -0.08 + Math.sin(t * 1.1) * 0.08;
            s.body.rotation.y     =  Math.sin(t * 0.5) * 0.08;
            s.leftLeg.rotation.x  =  Math.sin(t * 1.8) * 0.06;
            s.rightLeg.rotation.x = -Math.sin(t * 1.8) * 0.06;
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
