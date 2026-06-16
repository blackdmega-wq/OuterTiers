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
         Full cycle (loop):
           1. Arms RIGHT + FORWARD (vorne vordergrund), hips LEFT
           2. Arms swing DIAGONALLY BEHIND the back
           3. Arms BEHIND moving LEFT, hips RIGHT
           4. Arms swing forward again back to RIGHT

         Key: ph = sin(t)
           • z = +ph  → arms swing RIGHT (ph>0) / LEFT (ph<0)
           • x = -ph  → FORWARD when going RIGHT (ph>0, x<0 = front)
                        BEHIND when going LEFT   (ph<0, x>0 = behind back)
           Both arms move as ONE UNIT (same values = parallel motion).
           Legs stay still.

         Sign conventions (skinview3d):
           rotation.z positive on left/rightArm → tips go VIEWER'S RIGHT
           rotation.x positive                  → tips go BACKWARD (behind)
           body.rotation.y positive             → hips go VIEWER'S LEFT
         ─────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const t  = progress * 4.0;
            const ph = Math.sin(t);

            /* LEFT / RIGHT swing — both arms move as one parallel unit */
            s.leftArm.rotation.z  = ph * 1.15;
            s.rightArm.rotation.z = ph * 1.15;

            /* FORWARD / BEHIND — oval arc:
               ph > 0 (arms RIGHT) → x negative = tips forward/front ✓
               ph < 0 (arms LEFT)  → x positive = tips backward/behind ✓ */
            s.leftArm.rotation.x  = -ph * 1.30;
            s.rightArm.rotation.x = -ph * 1.30;

            /* Hips opposite to arms:
               arms RIGHT (ph>0) → hips LEFT  (+y)
               arms LEFT  (ph<0) → hips RIGHT (−y) */
            s.body.rotation.y = ph * 0.75;
            s.body.rotation.z = -ph * 0.10;
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

                const matGold    = new T.MeshBasicMaterial({ color: 0xFFB800 });
                const matGoldDk  = new T.MeshBasicMaterial({ color: 0xCC8800 });
                const matMaroon  = new T.MeshBasicMaterial({ color: 0x6B0A0A });
                const matRed     = new T.MeshBasicMaterial({ color: 0xFF2222 });
                const matGreen   = new T.MeshBasicMaterial({ color: 0x22EE44 });
                const matBlue    = new T.MeshBasicMaterial({ color: 0x4488FF });

                const g = new T.Group();

                /* ── BAND (bottom ring) ──
                   Head = 8 units wide. Band extends slightly beyond (W=9.6).
                   4 rectangular box segments form a square ring.             */
                const BW = 9.6;   // band outer width
                const BH = 2.6;   // band height
                const BT = 1.8;   // band thickness

                const addBox = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                // Front band
                addBox(matGold, BW, BH, BT, 0, BH / 2, -(BW / 2 - BT / 2));
                // Back band
                addBox(matGold, BW, BH, BT, 0, BH / 2,  (BW / 2 - BT / 2));
                // Left band
                addBox(matGold, BT, BH, BW - BT * 2, -(BW / 2 - BT / 2), BH / 2, 0);
                // Right band
                addBox(matGold, BT, BH, BW - BT * 2,  (BW / 2 - BT / 2), BH / 2, 0);

                // Thin gold top-rim on band
                const RW = BW + 0.4;
                addBox(matGoldDk, RW, 0.6, BT,    0,  BH + 0.3, -(RW / 2 - BT / 2));
                addBox(matGoldDk, RW, 0.6, BT,    0,  BH + 0.3,  (RW / 2 - BT / 2));
                addBox(matGoldDk, BT, 0.6, RW - BT * 2, -(RW / 2 - BT / 2), BH + 0.3, 0);
                addBox(matGoldDk, BT, 0.6, RW - BT * 2,  (RW / 2 - BT / 2), BH + 0.3, 0);

                /* ── INNER CAP (maroon fill inside the band, top section) ── */
                const CW = BW - BT * 2;
                const capY = BH + 1.8;
                addBox(matMaroon, CW, 3.2, CW, 0, capY, 0);

                /* ── SECOND GOLD BAND on top of cap ── */
                const B2W = BW - 1.6;
                const b2Y = BH + 3.2 + 1.0;
                addBox(matGold, B2W, 1.8, BT, 0, b2Y, -(B2W / 2 - BT / 2));
                addBox(matGold, B2W, 1.8, BT, 0, b2Y,  (B2W / 2 - BT / 2));
                addBox(matGold, BT, 1.8, B2W - BT * 2, -(B2W / 2 - BT / 2), b2Y, 0);
                addBox(matGold, BT, 1.8, B2W - BT * 2,  (B2W / 2 - BT / 2), b2Y, 0);

                /* ── PRONGS (rectangular gold pillars rising from top) ── */
                const pY  = b2Y + 1.8 / 2;
                const PSZ = 2.0;  // prong size (width/depth)
                // Center tall prong
                addBox(matGold, PSZ, 6.5, PSZ, 0, pY + 3.25, 0);
                // 4 corner prongs (shorter)
                const off = 3.0;
                addBox(matGold, PSZ, 4.5, PSZ, -off, pY + 2.25, -off);
                addBox(matGold, PSZ, 4.5, PSZ,  off, pY + 2.25, -off);
                addBox(matGold, PSZ, 4.5, PSZ, -off, pY + 2.25,  off);
                addBox(matGold, PSZ, 4.5, PSZ,  off, pY + 2.25,  off);

                /* ── GEMS on front band (colored cubes) ── */
                const GZ   = -(BW / 2 - BT / 2) - 1.0;
                const GY   = BH / 2;
                const GS   = 1.3;
                const gems: [number, any][] = [
                  [-3.5, matRed], [-1.7, matBlue], [0, matGreen], [1.7, matBlue], [3.5, matRed],
                ];
                gems.forEach(([gx, mat]) => {
                  addBox(mat, GS, GS, GS, gx as number, GY, GZ);
                });

                /* Also add a few gems on the back band */
                const GZB = (BW / 2 - BT / 2) + 1.0;
                addBox(matGreen, GS, GS, GS, -1.8, GY, GZB);
                addBox(matRed,   GS, GS, GS,  1.8, GY, GZB);

                /* Place crown at top of head (y=8 = top of head in local space) */
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
