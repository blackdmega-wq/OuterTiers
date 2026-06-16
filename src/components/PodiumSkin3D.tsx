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
         4-PHASE KEYFRAME ANIMATION — explicit hold + transition phases:

         Phase 0 (HOLD): Arms FRONT-RIGHT,       hips LEFT
         Phase 1 (TRANS): Arms swing BEHIND       (diagonal behind)
         Phase 2 (HOLD): Arms BEHIND-LEFT,        hips RIGHT
         Phase 3 (TRANS): Arms come FORWARD       (back to front-right)

         Sign conventions (skinview3d):
           rotation.z positive on left/rightArm  → tips go VIEWER'S RIGHT
           rotation.x positive                   → tips go BACKWARD (behind body)
           rotation.x negative                   → tips go FORWARD (in front)
           body.rotation.y positive              → hips go VIEWER'S LEFT
         ─────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /* Smooth step ease-in/out (S-curve for each phase) */
            const smooth = (t: number) => t * t * (3 - 2 * t);

            /* Cycle 0→1, speed controls tempo */
            const SPEED = 1.6;
            const cycle = ((progress * SPEED) % 1.0 + 1.0) % 1.0;

            /* 4 explicit keyframes:
                 armZ: left/right arm swing  (+ = viewer's right)
                 armX: forward/behind        (- = forward, + = behind)
                 hipY: hips direction        (+ = viewer's left)
                 hipZ: body tilt             (small counter-tilt) */
            const K = [
              { z:  1.20, x: -1.10, hy:  0.80, hz: -0.08 },   // FRONT-RIGHT  + hips LEFT
              { z:  0.30, x:  1.25, hy:  0.15, hz:  0.00 },   // DIAGONAL BEHIND (transition)
              { z: -1.20, x:  1.10, hy: -0.80, hz:  0.08 },   // BEHIND-LEFT  + hips RIGHT
              { z: -0.30, x: -1.25, hy: -0.15, hz:  0.00 },   // FORWARD CENTER (transition)
            ];

            const seg  = cycle * 4;
            const i0   = Math.floor(seg) % 4;
            const i1   = (i0 + 1) % 4;
            const t    = smooth(seg - Math.floor(seg));
            const lerp = (a: number, b: number) => a + (b - a) * t;

            const armZ = lerp(K[i0].z, K[i1].z);
            const armX = lerp(K[i0].x, K[i1].x);

            /* Both arms move as one parallel unit */
            s.leftArm.rotation.z  = armZ;
            s.rightArm.rotation.z = armZ;
            s.leftArm.rotation.x  = armX;
            s.rightArm.rotation.x = armX;

            s.body.rotation.y = lerp(K[i0].hy, K[i1].hy);
            s.body.rotation.z = lerp(K[i0].hz, K[i1].hz);
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

            /* Build Minecraft-style blocky Technoblade crown on first frame */
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                /* ── Materials ── */
                const matGold   = new T.MeshBasicMaterial({ color: 0xFFB800 });
                const matGoldDk = new T.MeshBasicMaterial({ color: 0xCC8800 });
                const matMaroon = new T.MeshBasicMaterial({ color: 0x5C0808 });
                const matRed    = new T.MeshBasicMaterial({ color: 0xFF2222 });
                const matGreen  = new T.MeshBasicMaterial({ color: 0x22EE44 });
                const matBlue   = new T.MeshBasicMaterial({ color: 0x4488FF });

                const g = new T.Group();

                /* Helper: add a box */
                const box = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                /* ── DIMENSIONS ──
                   Head ≈ 8 units wide. Crown target height above head: ~6 units.
                   All values chosen to match the Minecraft Technoblade crown style. */
                const BW = 8.5;  // band outer width (slightly wider than head)
                const BH = 1.5;  // band height
                const BT = 1.1;  // band wall thickness

                /* ── BOTTOM BAND (gold ring) ── */
                box(matGold, BW,       BH, BT,         0,         BH / 2, -(BW / 2 - BT / 2));  // front
                box(matGold, BW,       BH, BT,         0,         BH / 2,  (BW / 2 - BT / 2));  // back
                box(matGold, BT,       BH, BW - BT*2, -(BW/2-BT/2), BH/2, 0);                   // left
                box(matGold, BT,       BH, BW - BT*2,  (BW/2-BT/2), BH/2, 0);                   // right

                /* Mid-band stripe (darker gold for visual depth) */
                box(matGoldDk, BW, 0.4, BT,       0,       BH/2, -(BW/2-BT/2));
                box(matGoldDk, BW, 0.4, BT,       0,       BH/2,  (BW/2-BT/2));
                box(matGoldDk, BT, 0.4, BW-BT*2, -(BW/2-BT/2), BH/2, 0);
                box(matGoldDk, BT, 0.4, BW-BT*2,  (BW/2-BT/2), BH/2, 0);

                /* ── INNER CAP (maroon fill, sits inside band) ── */
                const CW  = BW - BT * 2;              // 6.3
                const capY = BH + 0.7;                // center: 2.2
                box(matMaroon, CW, 1.4, CW, 0, capY, 0);

                /* ── UPPER GOLD RING (second tier, inset) ── */
                const B2W  = BW - 1.4;                // 7.1
                const b2Y  = BH + 1.4 + 0.3;         // 3.2
                box(matGold, B2W,       0.6, BT,         0,           b2Y, -(B2W/2-BT/2));
                box(matGold, B2W,       0.6, BT,         0,           b2Y,  (B2W/2-BT/2));
                box(matGold, BT,        0.6, B2W-BT*2, -(B2W/2-BT/2), b2Y, 0);
                box(matGold, BT,        0.6, B2W-BT*2,  (B2W/2-BT/2), b2Y, 0);

                /* ── SECOND MAROON CAP ── */
                const CW2  = B2W - BT * 2;
                const cap2Y = b2Y + 0.3 + 0.45;      // 3.95
                box(matMaroon, CW2, 0.9, CW2, 0, cap2Y, 0);

                /* ── PRONGS (rectangular gold pillars) ── */
                const pBase = b2Y + 0.6 + 0.9;       // 4.7
                const PS    = 1.2;                    // prong footprint

                /* Center prong — tallest */
                box(matGold, PS, 3.0, PS, 0, pBase + 1.5, 0);

                /* 4 corner prongs — shorter */
                const off = 2.1;
                const PCS = 1.0;
                box(matGold, PCS, 2.0, PCS, -off, pBase + 1.0, -off);
                box(matGold, PCS, 2.0, PCS,  off, pBase + 1.0, -off);
                box(matGold, PCS, 2.0, PCS, -off, pBase + 1.0,  off);
                box(matGold, PCS, 2.0, PCS,  off, pBase + 1.0,  off);

                /* Small gold caps on top of each prong tip */
                box(matGoldDk, PS+0.2, 0.3, PS+0.2, 0,    pBase+3.0+0.15, 0);
                box(matGoldDk, PCS+0.2, 0.3, PCS+0.2, -off, pBase+2.0+0.15, -off);
                box(matGoldDk, PCS+0.2, 0.3, PCS+0.2,  off, pBase+2.0+0.15, -off);
                box(matGoldDk, PCS+0.2, 0.3, PCS+0.2, -off, pBase+2.0+0.15,  off);
                box(matGoldDk, PCS+0.2, 0.3, PCS+0.2,  off, pBase+2.0+0.15,  off);

                /* ── GEMS on band (colorful Minecraft-style cubes) ── */
                const GS   = 0.95;
                const GY   = BH / 2;
                const GZ_F = -(BW / 2 - BT / 2) - 0.7;  // front face

                /* Front gems: red  blue  green  blue  red */
                const frontGems: [number, any][] = [
                  [-3.0, matRed], [-1.5, matBlue], [0, matGreen], [1.5, matBlue], [3.0, matRed],
                ];
                frontGems.forEach(([gx, mat]) => box(mat, GS, GS, GS, gx as number, GY, GZ_F));

                /* Back gems: green  red */
                const GZ_B = (BW / 2 - BT / 2) + 0.7;
                box(matGreen, GS, GS, GS, -1.8, GY, GZ_B);
                box(matRed,   GS, GS, GS,  1.8, GY, GZ_B);

                /* Side gems */
                box(matBlue,  GS, GS, GS, -(BW/2-BT/2)-0.7, GY, -1.0);
                box(matRed,   GS, GS, GS,  (BW/2-BT/2)+0.7, GY, -1.0);
                box(matGreen, GS, GS, GS, -(BW/2-BT/2)-0.7, GY,  1.0);
                box(matBlue,  GS, GS, GS,  (BW/2-BT/2)+0.7, GY,  1.0);

                /* ── Place crown at top of head ── */
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
