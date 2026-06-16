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

            const SPEED = 2.5;
            const raw   = ((progress * SPEED) % 2.0 + 2.0) % 2.0;
            const beat  = raw % 1.0;
            const toRight = raw < 1.0;

            /* cubic ease-in-out: snappy pop at extremes */
            const ease = (t: number) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const f    = ease(beat);
            const lerp = (a: number, b: number) => a + (b - a) * f;

            /*
              PHASE_R: arms RIGHT
                leftArm:  forward (lAx neg) + crosses body right (lAz pos)
                rightArm: backward (rAx pos) + outward right (rAz pos)
                hips counter-twist LEFT (body.y neg)

              PHASE_L: arms LEFT (exact mirror)
                rightArm: forward (rAx neg) + crosses body left (rAz neg)
                leftArm:  backward (lAx pos) + outward left (lAz neg)
                hips counter-twist RIGHT (body.y pos)
            */
            const PHASE_R = { lAx: -0.95, lAz:  1.10, rAx:  0.95, rAz:  0.80, by: -0.38 };
            const PHASE_L = { lAx:  0.95, lAz: -0.80, rAx: -0.95, rAz: -1.10, by:  0.38 };

            const from = toRight ? PHASE_L : PHASE_R;
            const to   = toRight ? PHASE_R : PHASE_L;

            s.leftArm.rotation.x  = lerp(from.lAx, to.lAx);
            s.leftArm.rotation.z  = lerp(from.lAz, to.lAz);
            s.leftArm.rotation.y  = 0;
            s.rightArm.rotation.x = lerp(from.rAx, to.rAx);
            s.rightArm.rotation.z = lerp(from.rAz, to.rAz);
            s.rightArm.rotation.y = 0;

            s.body.rotation.y = lerp(from.by, to.by);
            s.body.rotation.x = 0;
            s.body.rotation.z = 0;

            /* hip dip / knee bounce on each beat */
            const bounce = Math.sin(raw * Math.PI) * 0.12;
            s.leftLeg.rotation.x  =  bounce;
            s.rightLeg.rotation.x = -bounce;
            s.leftLeg.rotation.z  = 0;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.y = 0;
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

                /* Crown group sits exactly at the TOP of the head.
                   In head-local space: head bottom = y 0, head top = y 8. */
                g.position.set(0, 8, 0);
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
