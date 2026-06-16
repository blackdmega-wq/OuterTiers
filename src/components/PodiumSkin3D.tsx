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
         #2  FLOSS DANCE  (Backpack Kid / real floss)

         The dance alternates two mirror positions:

         POS-L  (arms swing LEFT):
           left arm  = FORWARD + outward-left   (lAx neg, lAz neg)
           right arm = BACKWARD + crosses left   (rAx pos, rAz neg)
           hips twist to the LEFT                (body.y pos)

         POS-R  (arms swing RIGHT):
           right arm = FORWARD + outward-right   (rAx neg, rAz pos)
           left arm  = BACKWARD + crosses right  (lAx pos, lAz pos)
           hips twist to the RIGHT               (body.y neg)

         skinview3d rotation convention (arms hang down = 0):
           arm.rotation.x  neg = arm swings FORWARD  (toward camera)
                           pos = arm swings BACKWARD
           leftArm.rotation.z  neg = arm goes LEFT  (outward)
                               pos = arm goes RIGHT (crosses body)
           rightArm.rotation.z pos = arm goes RIGHT (outward)
                               neg = arm goes LEFT  (crosses body)
         ═══════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /* floss tempo: ~2.5 cycles per progress unit */
            const SPEED = 2.5;
            const raw   = ((progress * SPEED) % 2.0 + 2.0) % 2.0;
            const beat  = raw % 1.0;
            const toLeft = raw < 1.0;

            /* cubic ease-in-out for snappy "pop" between positions */
            const ease = (t: number) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const f    = ease(beat);
            const lerp = (a: number, b: number) => a + (b - a) * f;

            /* ── Keyframes ── */
            const POS_L = {
              lAx: -1.15, lAz: -0.85,  // left arm: forward + out-left
              rAx:  1.15, rAz: -1.30,  // right arm: back + crosses to left
              by:   0.45,               // hips twist left
            };
            const POS_R = {
              lAx:  1.15, lAz:  1.30,  // left arm: back + crosses to right
              rAx: -1.15, rAz:  0.85,  // right arm: forward + out-right
              by:  -0.45,               // hips twist right
            };

            const from = toLeft ? POS_R : POS_L;
            const to   = toLeft ? POS_L : POS_R;

            s.leftArm.rotation.x  = lerp(from.lAx, to.lAx);
            s.leftArm.rotation.z  = lerp(from.lAz, to.lAz);
            s.leftArm.rotation.y  = 0;
            s.rightArm.rotation.x = lerp(from.rAx, to.rAx);
            s.rightArm.rotation.z = lerp(from.rAz, to.rAz);
            s.rightArm.rotation.y = 0;

            s.body.rotation.y = lerp(from.by, to.by);
            s.body.rotation.x = 0;
            s.body.rotation.z = 0;

            /* slight bounce in knees on off-beat */
            const kneeF = Math.sin(raw * Math.PI) * 0.10;
            s.leftLeg.rotation.x  =  kneeF;
            s.rightLeg.rotation.x = -kneeF;
            s.leftLeg.rotation.z  = 0;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.y = 0;
          } catch (_) {}
        });

      /* ═══════════════════════════════════════════════════════
         #1  VICTORY POSE + MINECRAFT CASTLE CROWN

         Crown dimensions based 1-to-1 on the reference screenshot:
         ┌─────────────────────────────────────────────────────┐
         │  Wide yellow/gold base band (thick, chunky walls)   │
         │  5 merlons front & back, 3 per side, corner blocks  │
         │  Center merlon is visibly taller                    │
         │  4 LARGE gem squares on front face:                 │
         │    purple | light-blue | dark-blue | green          │
         │  Crown lowered to y=6.8 so it overlaps head edge    │
         └─────────────────────────────────────────────────────┘
         ═══════════════════════════════════════════════════════ */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            /* Build crown once */
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;

              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                /* ── Materials ── */
                const gold  = new T.MeshLambertMaterial({ color: 0xF0CC00 });
                const mPurp = new T.MeshLambertMaterial({ color: 0xBB44EE });
                const mBlu1 = new T.MeshLambertMaterial({ color: 0x6699FF });
                const mBlu2 = new T.MeshLambertMaterial({ color: 0x2255CC });
                const mGrn  = new T.MeshLambertMaterial({ color: 0x44DD55 });

                const g = new T.Group();
                const bx = (
                  mat: any, w: number, h: number, d: number,
                  x: number, y: number, z: number,
                ) => {
                  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  mesh.position.set(x, y, z);
                  g.add(mesh);
                };

                /* ─────────────────────────────────────────────
                   DIMENSIONS  (head = 8 units wide/tall/deep)
                   Crown is noticeably wider than the head —
                   same chunky castle-crown feel as screenshot.
                   ───────────────────────────────────────────── */
                const BW   = 11.0;          // total width  (head = 8)
                const BH   = 2.2;           // base band height
                const BT   = 1.4;           // wall thickness (chunky)
                const inner = BW - BT * 2;  // inner span = 8.2

                const fz = -(BW / 2 - BT / 2);  // front wall center z
                const bz =  (BW / 2 - BT / 2);  // back  wall center z
                const lx = -(BW / 2 - BT / 2);  // left  wall center x
                const rx =  (BW / 2 - BT / 2);  // right wall center x

                /* ── BASE BAND — 4 solid walls ── */
                bx(gold, BW,    BH, BT,    0,      BH / 2, fz);  // front
                bx(gold, BW,    BH, BT,    0,      BH / 2, bz);  // back
                bx(gold, BT,    BH, inner, lx,     BH / 2, 0);   // left
                bx(gold, BT,    BH, inner, rx,     BH / 2, 0);   // right

                /* ── MERLONS (castle battlements) ──
                   Front & back: 5 merlons with gaps between them.
                   Center merlon is clearly taller (crown shape).
                   Sides: 3 merlons each. Corners fill junctions. */
                const MW  = 1.5;   // merlon width
                const MD  = BT;    // merlon depth = wall thickness
                const MH  = 2.4;   // standard merlon height
                const MHC = 3.4;   // center merlon (tallest)
                const yB  = BH;    // merlons start at top of base

                /* Front face merlons — 5 evenly spread */
                const frontXs = [-3.5, -1.75, 0, 1.75, 3.5];
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yB + h / 2, fz);
                });

                /* Back face merlons — mirror of front */
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yB + h / 2, bz);
                });

                /* Left side merlons — 3 */
                [-2.5, 0, 2.5].forEach((z) => {
                  bx(gold, MD, MH, MW, lx, yB + MH / 2, z);
                });

                /* Right side merlons — 3 */
                [-2.5, 0, 2.5].forEach((z) => {
                  bx(gold, MD, MH, MW, rx, yB + MH / 2, z);
                });

                /* Corner junction blocks */
                ([[lx, fz], [rx, fz], [lx, bz], [rx, bz]] as [number,number][])
                  .forEach(([cx, cz]) => bx(gold, BT, MH, BT, cx, yB + MH / 2, cz));

                /* ── GEMS on front face ──
                   4 LARGE coloured squares embedded in the base band.
                   They protrude from the front wall face to be clearly
                   visible. Colours L→R: purple · light-blue · dark-blue · green.

                   Gem z position is in FRONT of the front wall:
                     fz = wall centre, wall extends from fz-BT/2 to fz+BT/2
                     gem centre = fz - BT/2 - GD/2  (sits on wall face) */
                const GS  = 1.50;               // gem side length (large)
                const GD  = 0.55;               // gem depth (protrudes clearly)
                const GY  = BH / 2;             // vertically centred in base band
                const GZF = fz - BT / 2 - GD / 2 + 0.05;  // on front face surface

                ([
                  [-3.2, mPurp],
                  [-1.0, mBlu1],
                  [ 1.0, mBlu2],
                  [ 3.2, mGrn ],
                ] as [number, any][]).forEach(([x, mat]) => {
                  const m = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  m.position.set(x, GY, GZF);
                  g.add(m);
                });

                /*
                  Place crown so it overlaps slightly with the head top,
                  sitting like a real crown (not floating above).
                  Head top = y 8.  Lowering to y 6.8 embeds it ~1.2 units.
                */
                g.position.set(0, 6.8, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            /* Victory pose — gentle wave */
            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.4 + Math.sin(t * 1.5) * 0.4);
            s.rightArm.rotation.z =   1.4 + Math.sin(t * 1.5 + Math.PI) * 0.4;
            s.leftArm.rotation.x  = -0.2 + Math.sin(t) * 0.2;
            s.rightArm.rotation.x = -0.2 - Math.sin(t) * 0.2;
            s.head.rotation.y     =  Math.sin(t * 0.8) * 0.3;
            s.head.rotation.x     = -0.1 + Math.sin(t * 1.1) * 0.1;
            s.body.rotation.y     =  Math.sin(t * 0.5) * 0.1;
            s.leftLeg.rotation.x  =  Math.sin(t * 1.8) * 0.08;
            s.rightLeg.rotation.x = -Math.sin(t * 1.8) * 0.08;
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
