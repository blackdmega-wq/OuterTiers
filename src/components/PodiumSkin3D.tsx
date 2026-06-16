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

      /* ── #2 FLOSS (slower, real 4-beat) ── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const smooth = (t: number) => t * t * (3 - 2 * t);

            /* SPEED reduced to 0.8 for a slower, cleaner floss */
            const SPEED = 0.8;
            const cycle = ((progress * SPEED) % 1.0 + 1.0) % 1.0;

            /* 4 beats — real Backpack Kid floss:
               Beat 1: FRONT-RIGHT  hips LEFT
               Beat 2: BEHIND-RIGHT
               Beat 3: FRONT-LEFT   hips RIGHT
               Beat 4: BEHIND-LEFT                 */
            const K = [
              { z:  1.30, x: -1.50, hy:  0.85 },
              { z:  1.00, x:  1.45, hy:  0.35 },
              { z: -1.30, x: -1.50, hy: -0.85 },
              { z: -1.00, x:  1.45, hy: -0.35 },
            ];

            const seg  = cycle * 4;
            const i0   = Math.floor(seg) % 4;
            const i1   = (i0 + 1) % 4;
            const t    = smooth(seg - Math.floor(seg));
            const lerp = (a: number, b: number) => a + (b - a) * t;

            const armZ = lerp(K[i0].z, K[i1].z);
            const armX = lerp(K[i0].x, K[i1].x);

            s.leftArm.rotation.z  = armZ;
            s.rightArm.rotation.z = armZ;
            s.leftArm.rotation.x  = armX;
            s.rightArm.rotation.x = armX;

            s.body.rotation.y = lerp(K[i0].hy, K[i1].hy);
            s.body.rotation.z = 0;
            s.body.rotation.x = 0;

            s.leftLeg.rotation.x  = 0; s.rightLeg.rotation.x = 0;
            s.leftLeg.rotation.z  = 0; s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.y  = 0; s.rightLeg.rotation.y = 0;
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

                /* ── Crown uses MeshLambertMaterial so it catches the
                   directional + ambient lights already in the skinview3d
                   scene — giving proper 3D depth & shading. ── */
                const gold  = new T.MeshLambertMaterial({ color: 0xF6D000 });
                const mPurp = new T.MeshLambertMaterial({ color: 0xCC44EE });
                const mBlue = new T.MeshLambertMaterial({ color: 0x5577FF });
                const mBlu2 = new T.MeshLambertMaterial({ color: 0x2244CC });
                const mGrn  = new T.MeshLambertMaterial({ color: 0x33DD55 });

                const g = new T.Group();

                const bx = (
                  mat: any, w: number, h: number, d: number,
                  x: number, y: number, z: number,
                ) => {
                  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  mesh.position.set(x, y, z);
                  g.add(mesh);
                };

                /* ══════════════════════════════════════════════
                   CROWN LAYOUT  (all y coords from top of head)

                   Head width ≈ 8 units. Crown should be slightly
                   wider so it sits visually on top of the head.

                   BASE BAND: 4 thick walls, height BH
                   MERLONS  : castle battlements on all 4 sides
                   GEMS     : colored squares on front face
                   ══════════════════════════════════════════════ */
                const BW = 10.0;   // outer width  (wider than 8-unit head)
                const BH = 2.0;    // base band height
                const BT = 1.5;    // wall thickness (thick for chunky look)
                const inner = BW - BT * 2;  // 7.0

                /* Anchor z/x coords for each wall face */
                const fz = -(BW / 2 - BT / 2);   //  front: −3.75
                const bz =  (BW / 2 - BT / 2);   //  back:  +3.75
                const lx = -(BW / 2 - BT / 2);   //  left:  −3.75
                const rx =  (BW / 2 - BT / 2);   //  right: +3.75

                /* ── BASE BAND (4 walls) ── */
                bx(gold, BW,   BH, BT,    0,     BH / 2, fz);
                bx(gold, BW,   BH, BT,    0,     BH / 2, bz);
                bx(gold, BT,   BH, inner, lx,    BH / 2, 0);
                bx(gold, BT,   BH, inner, rx,    BH / 2, 0);

                /* ── MERLONS (castle battlements) ──
                   Front & back: 5 merlons with clear gaps.
                   Center merlon is noticeably taller (classic crown).
                   Side (left/right): 3 merlons each.
                   Corner blocks connect front↔side at junctions. */
                const MW  = 1.5;   // merlon width
                const MD  = BT;    // merlon depth (= wall thickness)
                const MH  = 2.4;   // standard merlon height
                const MHC = 3.2;   // center merlon height (taller)

                /* Front merlons — positions spread across BW */
                const frontX = [-3.5, -1.75, 0, 1.75, 3.5];
                frontX.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, BH + h / 2, fz);
                });

                /* Back merlons */
                frontX.forEach((x, i) => {
                  const h = i === 2 ? MHC : MH;
                  bx(gold, MW, h, MD, x, BH + h / 2, bz);
                });

                /* Left side merlons */
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(gold, MD, MH, MW, lx, BH + MH / 2, z);
                });

                /* Right side merlons */
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(gold, MD, MH, MW, rx, BH + MH / 2, z);
                });

                /* Corner blocks: fill the 4 corner junctions */
                ([ [lx, fz], [rx, fz], [lx, bz], [rx, bz] ] as [number, number][])
                  .forEach(([cx, cz]) => bx(gold, BT, MH, BT, cx, BH + MH / 2, cz));

                /* ── GEMS on front face ──
                   4 colored squares, slightly protruding from front wall.
                   Colors (left→right): purple · blue · dark-blue · green   */
                const GS   = 1.25;                   // gem size
                const GD   = 0.45;                   // gem depth
                const GY   = BH / 2;                 // gem vertical center
                const GZ_F = fz - BT / 2 - 0.05;    // just in front of wall

                const gems: [number, any][] = [
                  [-2.8, mPurp],
                  [-0.9, mBlue],
                  [ 0.9, mBlu2],
                  [ 2.8, mGrn ],
                ];
                gems.forEach(([x, mat]) => {
                  const m = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  m.position.set(x as number, GY, GZ_F);
                  g.add(m);
                });

                /* Place crown at top of head */
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
