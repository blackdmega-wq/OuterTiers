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

      /* ── #2 FORTNITE FLOSS ─────────────────────────────────────────
         Real floss (Backpack Kid) — 4-beat pattern:
           Beat 1: Arms FRONT-RIGHT  + hips LEFT   (HOLD)
           Beat 2: Arms BEHIND-RIGHT               (HOLD)
           Beat 3: Arms FRONT-LEFT   + hips RIGHT  (HOLD)
           Beat 4: Arms BEHIND-LEFT                (HOLD)
           Repeat

         skinview3d sign conventions:
           armZ positive  → arms swing toward VIEWER'S RIGHT
           armX negative  → arm tips go FORWARD  (toward viewer)
           armX positive  → arm tips go BACKWARD (behind body)
           hipY positive  → hips shift VIEWER'S LEFT
         ─────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /* Smooth ease-in/out (S-curve) */
            const smooth = (t: number) => t * t * (3 - 2 * t);

            /* 4 beats. Each beat takes equal time (25% each), but we use
               a tanh-shaped snap so the arms POP into position and hold. */
            const SPEED = 1.5;  // full cycles per second
            const cycle = ((progress * SPEED) % 1.0 + 1.0) % 1.0;

            /* Keyframes for each beat position:
                 armZ : left/right swing  (+ = viewer's RIGHT)
                 armX : forward/behind    (- = FORWARD, + = BEHIND)
                 hipY : hip counter-move  (+ = viewer's LEFT)            */
            const K = [
              { z:  1.30, x: -1.50, hy:  0.85 },  // Beat 1: FRONT-RIGHT, hips LEFT
              { z:  1.00, x:  1.45, hy:  0.35 },  // Beat 2: BEHIND-RIGHT
              { z: -1.30, x: -1.50, hy: -0.85 },  // Beat 3: FRONT-LEFT,  hips RIGHT
              { z: -1.00, x:  1.45, hy: -0.35 },  // Beat 4: BEHIND-LEFT
            ];

            const seg  = cycle * 4;
            const i0   = Math.floor(seg) % 4;
            const i1   = (i0 + 1) % 4;
            const t    = smooth(seg - Math.floor(seg));
            const lerp = (a: number, b: number) => a + (b - a) * t;

            const armZ = lerp(K[i0].z, K[i1].z);
            const armX = lerp(K[i0].x, K[i1].x);

            /* Both arms move as ONE parallel unit */
            s.leftArm.rotation.z  = armZ;
            s.rightArm.rotation.z = armZ;
            s.leftArm.rotation.x  = armX;
            s.rightArm.rotation.x = armX;

            /* Hips move opposite to arms */
            s.body.rotation.y = lerp(K[i0].hy, K[i1].hy);
            s.body.rotation.z = 0;
            s.body.rotation.x = 0;

            /* Legs: completely still */
            s.leftLeg.rotation.x  = 0;
            s.rightLeg.rotation.x = 0;
            s.leftLeg.rotation.z  = 0;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.y = 0;
          } catch (_) {}
        });

      /* ── #1 VICTORY + MINECRAFT TECHNOBLADE CROWN ── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            /* Build Minecraft castle-crown on first frame */
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                /* ── Materials ── */
                const gold  = new T.MeshBasicMaterial({ color: 0xF5D000 });
                const mPurp = new T.MeshBasicMaterial({ color: 0xCC44EE });
                const mBlue = new T.MeshBasicMaterial({ color: 0x4466FF });
                const mBlu2 = new T.MeshBasicMaterial({ color: 0x2244CC });
                const mGrn  = new T.MeshBasicMaterial({ color: 0x33DD55 });

                const g = new T.Group();

                /* Helper: add a box mesh */
                const bx = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                /* ── CROWN DIMENSIONS ──
                   Head = 8 units wide.
                   Crown sits at y=8 (top of head), all y coords are ABOVE that. */
                const BW = 9.0;   // outer width (slightly wider than head)
                const BH = 1.6;   // base band height
                const BT = 1.3;   // wall thickness

                /* ── BASE BAND: 4 rectangular walls ── */
                const fz = -(BW / 2 - BT / 2);   // front face z
                const bz =  (BW / 2 - BT / 2);   // back face z
                const lx = -(BW / 2 - BT / 2);   // left face x
                const rx =  (BW / 2 - BT / 2);   // right face x
                const inner = BW - BT * 2;

                bx(gold, BW,   BH, BT,    0,    BH / 2, fz);       // front wall
                bx(gold, BW,   BH, BT,    0,    BH / 2, bz);       // back wall
                bx(gold, BT,   BH, inner, lx,   BH / 2, 0);        // left wall
                bx(gold, BT,   BH, inner, rx,   BH / 2, 0);        // right wall

                /* ── BATTLEMENTS (Zinnen / Merlons) ──
                   Classic castle crown: evenly spaced rectangular pillars
                   with gaps between them (crenels). Center merlon is tallest.

                   Front & back: 5 merlons at x = -3.2, -1.6, 0, +1.6, +3.2
                   Left & right: 3 merlons each
                   Merlon size: 1.4 × h × 1.3 (width × height × depth)     */
                const MW  = 1.4;  // merlon width
                const MD  = BT;   // merlon depth = wall thickness
                const MH  = 2.0;  // standard merlon height
                const MHC = 2.8;  // center merlon height (taller)

                const frontXPos = [-3.2, -1.6, 0, 1.6, 3.2];

                /* Front merlons */
                frontXPos.forEach((x, i) => {
                  const mh = i === 2 ? MHC : MH;
                  bx(gold, MW, mh, MD, x, BH + mh / 2, fz);
                });

                /* Back merlons */
                frontXPos.forEach((x, i) => {
                  const mh = i === 2 ? MHC : MH;
                  bx(gold, MW, mh, MD, x, BH + mh / 2, bz);
                });

                /* Left side merlons */
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(gold, MD, MH, MW, lx, BH + MH / 2, z);
                });

                /* Right side merlons */
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(gold, MD, MH, MW, rx, BH + MH / 2, z);
                });

                /* Corner blocks — fill each corner at the junction */
                const cornersXZ: [number, number][] = [
                  [lx, fz], [rx, fz], [lx, bz], [rx, bz],
                ];
                cornersXZ.forEach(([cx, cz]) => {
                  bx(gold, BT, MH, BT, cx, BH + MH / 2, cz);
                });

                /* ── GEMS on front band face ──
                   4 colored square gems embedded in the front wall.
                   Colors (left→right): purple, blue, blue, green             */
                const GS   = 1.15;   // gem size
                const GD   = 0.4;    // gem depth (protrudes slightly)
                const GY   = BH / 2; // gem vertical center
                const GZ_F = fz - BT / 2 - 0.05; // just in front of wall

                const gemRow: [number, any][] = [
                  [-2.8, mPurp],
                  [-0.9, mBlue],
                  [ 0.9, mBlu2],
                  [ 2.8, mGrn ],
                ];
                gemRow.forEach(([x, mat]) => {
                  const gem = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  gem.position.set(x as number, GY, GZ_F);
                  g.add(gem);
                });

                /* Place crown at top of head (y=8 in head local space) */
                g.position.set(0, 8, 0);

                s.head.add(g);
              }).catch(() => {});
            }

            /* Victory pose */
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
