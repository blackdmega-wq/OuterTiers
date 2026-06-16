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

      /* ───────────────────────────────────────────────────────
         #2  REAL FLOSS DANCE (Backpack Kid)

         The floss alternates between two positions:

         POSITION A – arms swing LEFT:
           Left arm  → reaches FORWARD to the left
           Right arm → swings BACKWARD to the left (crosses body)
           Hips      → counter-swing to the RIGHT

         POSITION B – arms swing RIGHT:
           Right arm → reaches FORWARD to the right
           Left arm  → swings BACKWARD to the right (crosses body)
           Hips      → counter-swing to the LEFT

         skinview3d arm rotation axes (arms hang straight down = 0):
           rotation.x  negative = forward,  positive = backward
           left  arm rotation.z  negative = outward/left, positive = inward/right
           right arm rotation.z  positive = outward/right, negative = inward/left
         ─────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const SPEED = 2.8;
            // 0–1 beat within current half-cycle
            const raw  = ((progress * SPEED) % 2.0 + 2.0) % 2.0;
            const beat = raw % 1.0;
            const goingLeft = raw < 1.0;

            // ease-in-out cubic
            const ease = (t: number) => t < 0.5
              ? 4 * t * t * t
              : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const f = ease(beat);
            const lerp = (a: number, b: number) => a + (b - a) * f;

            /*
              Keyframes:
              posA = arms LEFT  (left-fwd / right-back / hips-right)
              posB = arms RIGHT (right-fwd / left-back / hips-left)
            */
            const posA = { lAx: -1.05, lAz: -0.75, rAx:  1.05, rAz: -1.25, hy:  0.50 };
            const posB = { lAx:  1.05, lAz:  1.25, rAx: -1.05, rAz:  0.75, hy: -0.50 };

            const from = goingLeft ? posB : posA;
            const to   = goingLeft ? posA : posB;

            s.leftArm.rotation.x  = lerp(from.lAx, to.lAx);
            s.leftArm.rotation.z  = lerp(from.lAz, to.lAz);
            s.leftArm.rotation.y  = 0;
            s.rightArm.rotation.x = lerp(from.rAx, to.rAx);
            s.rightArm.rotation.z = lerp(from.rAz, to.rAz);
            s.rightArm.rotation.y = 0;

            s.body.rotation.y = lerp(from.hy, to.hy);
            s.body.rotation.x = 0;
            s.body.rotation.z = 0;

            // slight knee bend on off-beat
            const kneeF = Math.sin(raw * Math.PI) * 0.12;
            s.leftLeg.rotation.x  =  kneeF;
            s.rightLeg.rotation.x = -kneeF;
            s.leftLeg.rotation.z  = 0;
            s.rightLeg.rotation.z = 0;
          } catch (_) {}
        });

      /* ───────────────────────────────────────────────────────
         #1  VICTORY POSE + COMPACT MINECRAFT CROWN

         Crown matches the reference screenshot:
         - Slightly wider than head (8 units), castle battlement style
         - Short base band + evenly-spaced merlons
         - 4 coloured gem squares on the front face
         Crown is intentionally compact so it reads as a hat,
         not a tower — total height ≈ 2.6 units above head top.
         ─────────────────────────────────────────────────────── */
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
                const gold  = new T.MeshLambertMaterial({ color: 0xF2C200 });
                const mPurp = new T.MeshLambertMaterial({ color: 0xBB44EE });
                const mBlu1 = new T.MeshLambertMaterial({ color: 0x6699FF });
                const mBlu2 = new T.MeshLambertMaterial({ color: 0x2255DD });
                const mGrn  = new T.MeshLambertMaterial({ color: 0x44EE66 });

                const g = new T.Group();
                const bx = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  mesh.position.set(x, y, z);
                  g.add(mesh);
                };

                /*
                  Crown dimensions — compact, sits snugly on 8-unit head.
                  BW = 9.0  →  only 0.5 units wider on each side.
                  Total crown height = BH + MHC = 1.0 + 1.6 = 2.6 units.
                */
                const BW = 9.0;
                const BH = 1.0;    // base band height
                const BT = 0.9;    // wall thickness
                const inner = BW - BT * 2;  // 7.2

                const fz = -(BW / 2 - BT / 2);   // front face z
                const bz =  (BW / 2 - BT / 2);   // back face z
                const lx = -(BW / 2 - BT / 2);   // left face x
                const rx =  (BW / 2 - BT / 2);   // right face x

                /* ── BASE BAND (4 walls) ── */
                bx(gold, BW,    BH, BT,    0,      BH / 2, fz);
                bx(gold, BW,    BH, BT,    0,      BH / 2, bz);
                bx(gold, BT,    BH, inner, lx,     BH / 2, 0);
                bx(gold, BT,    BH, inner, rx,     BH / 2, 0);

                /*
                  ── MERLONS (castle battlements) ──
                  Front & back: 5 merlons, evenly spaced.
                  Center merlon slightly taller (crown-like).
                  Sides: 3 merlons each.
                  Corner blocks at 4 junctions.
                */
                const MW  = 1.2;    // merlon width
                const MD  = BT;     // merlon depth
                const MH  = 1.2;    // normal merlon height
                const MHC = 1.6;    // centre merlon height (tallest)
                const yBase = BH;   // merlons sit on top of base band

                const frontXs = [-3.2, -1.6, 0, 1.6, 3.2];
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yBase + h / 2, fz);
                });
                frontXs.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, yBase + h / 2, bz);
                });
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(gold, MD, MH, MW, lx, yBase + MH / 2, z);
                });
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(gold, MD, MH, MW, rx, yBase + MH / 2, z);
                });
                /* corner fills */
                ([[lx, fz], [rx, fz], [lx, bz], [rx, bz]] as [number,number][])
                  .forEach(([cx, cz]) => bx(gold, BT, MH, BT, cx, yBase + MH / 2, cz));

                /*
                  ── GEMS on front face ──
                  4 colour squares embedded in the base band.
                  Slight protrusion so they're visible.
                  L→R: purple · light-blue · dark-blue · green
                */
                const GS  = 0.80;
                const GD  = 0.40;
                const GY  = BH / 2;
                const GZF = fz - BT / 2 - 0.06;

                const gems: [number, any][] = [
                  [-2.6, mPurp],
                  [-0.9, mBlu1],
                  [ 0.9, mBlu2],
                  [ 2.6, mGrn ],
                ];
                gems.forEach(([x, mat]) => {
                  const m = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  m.position.set(x as number, GY, GZF);
                  g.add(m);
                });

                /* Place crown flush on top of head (head top = y 8) */
                g.position.set(0, 8, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            /* Victory pose — gentle arm wave */
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
