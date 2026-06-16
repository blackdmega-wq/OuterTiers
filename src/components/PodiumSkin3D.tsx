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

      /* ── #2 FLOSS (real Backpack Kid floss) ── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /*
              Real floss: both arms swing to the SAME lateral side,
              but one arm is FORWARD and the other is BACKWARD.
              Hips swing in the OPPOSITE direction to the arms.

              Beat 1 – arms swing LEFT:  left arm FORWARD, right arm BEHIND, hips go RIGHT
              Beat 2 – arms swing RIGHT: right arm FORWARD, left arm BEHIND,  hips go LEFT
            */

            const SPEED = 2.0;
            // smooth step: ease in-out for each beat
            const raw   = ((progress * SPEED) % 2.0 + 2.0) % 2.0; // 0–2 repeating
            const beat  = raw % 1.0;                                  // 0–1 within current beat
            const isLeft = raw < 1.0;                                 // true = arms-left beat

            // Smooth interpolation (ease-in-out cubic)
            const smooth = (t: number) => t * t * (3 - 2 * t);
            const f = smooth(beat);

            // ── Keyframe endpoints ──
            // When arms LEFT:  lAx forward(-), lAz left(-), rAx back(+), rAz left(-)
            // When arms RIGHT: rAx forward(-), rAz right(+), lAx back(+), lAz right(+)
            const LEFT  = { lAx: -1.1, lAz: -1.1, rAx:  1.1, rAz: -0.8, hy:  0.55 };
            const RIGHT = { lAx:  1.1, lAz:  0.8, rAx: -1.1, rAz:  1.1, hy: -0.55 };

            const from = isLeft ? RIGHT : LEFT;
            const to   = isLeft ? LEFT  : RIGHT;
            const lerp = (a: number, b: number) => a + (b - a) * f;

            s.leftArm.rotation.x  = lerp(from.lAx, to.lAx);
            s.leftArm.rotation.z  = lerp(from.lAz, to.lAz);
            s.rightArm.rotation.x = lerp(from.rAx, to.rAx);
            s.rightArm.rotation.z = lerp(from.rAz, to.rAz);

            // Arms stay roughly horizontal — minimal y rotation
            s.leftArm.rotation.y  = 0;
            s.rightArm.rotation.y = 0;

            // Body: hips counter-swing + slight up-down bob
            s.body.rotation.y = lerp(from.hy, to.hy);
            s.body.rotation.x = 0;
            s.body.rotation.z = 0;

            // Legs: slight mirrored step to match hip sway
            s.leftLeg.rotation.z  =  lerp(from.hy, to.hy) * 0.2;
            s.rightLeg.rotation.z = -lerp(from.hy, to.hy) * 0.2;
            s.leftLeg.rotation.x  = 0;
            s.rightLeg.rotation.x = 0;
            s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.y = 0;
          } catch (_) {}
        });

      /* ── #1 VICTORY + MINECRAFT CROWN ── */
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

                /*
                  ════════════════════════════════════════════
                  MINECRAFT CASTLE CROWN
                  Matches the screenshot:
                  - Wide blocky gold base band
                  - Evenly-spaced castle merlons (battlements)
                  - 4 large colored gem squares on front face
                  - Chunky corner blocks for 3D depth
                  ════════════════════════════════════════════
                */

                const gold  = new T.MeshLambertMaterial({ color: 0xF0CC00 });
                const mPurp = new T.MeshLambertMaterial({ color: 0xBB44EE });
                const mBlu1 = new T.MeshLambertMaterial({ color: 0x6699FF });
                const mBlu2 = new T.MeshLambertMaterial({ color: 0x2255DD });
                const mGrn  = new T.MeshLambertMaterial({ color: 0x44EE55 });

                const g = new T.Group();

                const bx = (
                  mat: any, w: number, h: number, d: number,
                  x: number, y: number, z: number,
                ) => {
                  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  mesh.position.set(x, y, z);
                  g.add(mesh);
                };

                /*
                  Crown dimensions — slightly wider than 8-unit head for visual presence.
                  Base band is solid (4 walls), merlons sit on top.
                */
                const BW = 10.5;   // outer width
                const BH = 2.5;    // base band height (taller = more visible band)
                const BT = 1.6;    // wall thickness (chunky)
                const inner = BW - BT * 2;  // 7.3

                /* Anchor z/x for each wall face */
                const fz = -(BW / 2 - BT / 2);
                const bz =  (BW / 2 - BT / 2);
                const lx = -(BW / 2 - BT / 2);
                const rx =  (BW / 2 - BT / 2);

                /* ── BASE BAND (4 walls) ── */
                bx(gold, BW,    BH, BT,    0,      BH / 2, fz);
                bx(gold, BW,    BH, BT,    0,      BH / 2, bz);
                bx(gold, BT,    BH, inner, lx,     BH / 2, 0);
                bx(gold, BT,    BH, inner, rx,     BH / 2, 0);

                /* ── MERLONS (castle battlements) ──
                   5 merlons on front & back — evenly spaced, uniform height.
                   Center merlon is slightly taller (like screenshot).
                   3 merlons on each side.
                   Corner blocks fill gaps at junctions. */
                const MW  = 1.6;   // merlon width
                const MD  = BT;    // merlon depth = wall thickness
                const MH  = 2.8;   // standard merlon height
                const MHC = 3.8;   // center merlon (taller)
                const yBase = BH;  // merlons sit on top of base band

                /* Front: 5 merlons evenly spread */
                const frontXs = [-3.6, -1.8, 0, 1.8, 3.6];
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yBase + h / 2, fz);
                });

                /* Back: 5 merlons */
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yBase + h / 2, bz);
                });

                /* Left side: 3 merlons */
                [-2.4, 0, 2.4].forEach((z) => {
                  bx(gold, MD, MH, MW, lx, yBase + MH / 2, z);
                });

                /* Right side: 3 merlons */
                [-2.4, 0, 2.4].forEach((z) => {
                  bx(gold, MD, MH, MW, rx, yBase + MH / 2, z);
                });

                /* Corner blocks: fill the 4 corner junctions */
                ([ [lx, fz], [rx, fz], [lx, bz], [rx, bz] ] as [number, number][])
                  .forEach(([cx, cz]) => bx(gold, BT, MH, BT, cx, yBase + MH / 2, cz));

                /* ── GEMS on front face ──
                   4 large colored squares in the base band on the front face.
                   Colors (left→right): purple · light-blue · dark-blue · green
                   Slightly protruding from the front wall face. */
                const GS   = 1.5;                    // gem size (bigger = more visible)
                const GD   = 0.5;                    // gem depth (protrudes from wall)
                const GY   = BH / 2;                 // vertical center of base band
                const GZ_F = fz - BT / 2 - 0.08;    // just in front of the wall

                const gems: [number, any][] = [
                  [-3.0, mPurp],
                  [-1.0, mBlu1],
                  [ 1.0, mBlu2],
                  [ 3.0, mGrn ],
                ];
                gems.forEach(([x, mat]) => {
                  const m = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  m.position.set(x as number, GY, GZ_F);
                  g.add(m);
                });

                /* Place crown sitting on top of head (head = 8 units tall) */
                g.position.set(0, 8, 0);
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
