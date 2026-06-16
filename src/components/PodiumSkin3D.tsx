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
         #2  FORTNITE FLOSS DANCE — exact 4-frame analysis

         skinview3d axis reference (character faces +Z = toward camera):
           leftArm.rotation.x:
             NEGATIVE  → arm swings FORWARD (toward camera/in front of body)
             POSITIVE  → arm swings BACKWARD (behind body)
           leftArm.rotation.z:
             NEGATIVE  → arm extends outward to the LEFT
             POSITIVE  → arm crosses body to the RIGHT
           rightArm.rotation.x:
             NEGATIVE  → arm swings FORWARD (toward camera)
             POSITIVE  → arm swings BACKWARD (behind body)
           rightArm.rotation.z:
             NEGATIVE  → arm extends outward to the RIGHT
             POSITIVE  → arm crosses body to the LEFT

         4 POSES mapped from reference images:
         ┌────────────────────────────────────────────────────────────┐
         │ Pose 1: L arm horizontal LEFT,  R arm BEHIND back         │
         │         lAz=-1.55 (outward left)                          │
         │         rAx=+0.80 (backward), rAz=+0.18 (near body)      │
         │                                                            │
         │ Pose 2: R arm horizontal RIGHT, L arm FORWARD+crossing    │
         │         (left arm in FRONT of belly, sweeping to RIGHT)   │
         │         lAx=-0.88 (strongly forward), lAz=+1.10 (crosses)│
         │         rAz=-1.55 (outward right)                         │
         │                                                            │
         │ Pose 3: BOTH arms to the LEFT                             │
         │         L arm: lAz=-1.55 (outward left)                   │
         │         R arm: rAx=-0.55 (forward/crossing height),       │
         │                rAz=+1.32 (crosses body to LEFT)           │
         │                                                            │
         │ Pose 4: R arm horizontal RIGHT, L arm BEHIND back         │
         │         lAx=+0.80 (backward), lAz=-0.18 (near body)      │
         │         rAz=-1.55 (outward right)                         │
         └────────────────────────────────────────────────────────────┘
         ═══════════════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /* ── FLOSS DANCE — REVAMPED v2: corrected Y-axis direction ────
               Three.js XYZ Euler rotation — arm starts at (0,-1,0) local.

               Verified axis directions (from victory-pose ground truth):
                 arm.x POSITIVE → tilts arm BACKWARD (away from camera)
                 arm.x NEGATIVE → tilts arm FORWARD  (toward camera / in front)
                 arm.z for leftArm:  NEGATIVE → extends LEFT, POSITIVE → crosses RIGHT
                 arm.z for rightArm: POSITIVE → extends RIGHT, NEGATIVE → crosses LEFT

               Y-axis math for leftArm crossing BEHIND to the RIGHT
               -------------------------------------------------------
               After X (+1.40 rad): arm direction ≈ (0, -0.170, -0.985) — mostly backward.
               After Y (-1.20 rad): x-component = sin(-1.20) * (-0.985) ≈ +0.918 → RIGHT ✓
                                    Y NEGATIVE sweeps the backward arm toward +X (rightward).
                                    Y POSITIVE (previous bug) swept it toward -X (leftward = WRONG).
               Final result with Z+0.30: arm tip at ≈ (0.93, +0.11, -0.36) — clearly right+behind ✓

               Y-axis for rightArm crossing BEHIND to the LEFT: opposite sign (+1.20).

               Extending arm gets slight forward tilt (x = -0.15) so it stands
               clearly in FRONT of the body while the crossing arm goes BEHIND —
               this depth contrast is what makes the behind/in-front visible.
            ──────────────────────────────────────────────────────────────── */
            const SPEED = 2.2;
            const t     = progress * SPEED;
            const swing = Math.sin(t);   /* −1 (full-left) → +1 (full-right) */

            const goRight = Math.max(0,  swing);  /* 0→1 as swing goes 0→+1 */
            const goLeft  = Math.max(0, -swing);  /* 0→1 as swing goes 0→−1 */

            /* ── LEFT arm ────────────────────────────────────────────────
               Extends LEFT (goLeft):  z=-1.55, x=-0.15 (forward), y=0
               Crosses BEHIND (goRight): z=+0.30, x=+1.40 (backward), y=-1.20
                 y NEGATIVE = sweeps arm tip toward +X = rightward behind body ✓ */
            s.leftArm.rotation.z = -goLeft * 1.55 + goRight * 0.30;
            s.leftArm.rotation.x = -goLeft * 0.15 + goRight * 1.40;
            s.leftArm.rotation.y = -goRight * 1.20;   /* NEGATIVE → sweeps rightward ✓ */

            /* ── RIGHT arm ───────────────────────────────────────────────
               Extends RIGHT (goRight): z=+1.55, x=-0.15 (forward), y=0
               Crosses BEHIND (goLeft):  z=-0.30, x=+1.40 (backward), y=+1.20
                 y POSITIVE = sweeps arm tip toward -X = leftward behind body ✓ */
            s.rightArm.rotation.z =  goRight * 1.55 - goLeft * 0.30;
            s.rightArm.rotation.x = -goRight * 0.15 + goLeft * 1.40;
            s.rightArm.rotation.y =  goLeft  * 1.20;   /* POSITIVE → sweeps leftward ✓ */

            /* ── Body: hip counter-sway (hips move OPPOSITE to arms) ── */
            s.body.rotation.z = -swing * 0.18;
            s.body.rotation.y =  swing * 0.08;
            s.body.rotation.x =  0.06;

            /* ── Head: follows the sway softly ── */
            if (s.head) {
              s.head.rotation.y = swing * 0.10;
              s.head.rotation.x = -0.04 + Math.cos(t) * 0.04;
              s.head.rotation.z = 0;
            }

            /* ── Legs: slight weight-shift with each swing ── */
            s.leftLeg.rotation.x  =  swing * 0.08;
            s.leftLeg.rotation.z  =  0.14;
            s.leftLeg.rotation.y  =  0;
            s.rightLeg.rotation.x = -swing * 0.08;
            s.rightLeg.rotation.z = -0.14;
            s.rightLeg.rotation.y =  0;
          } catch (_) {}
        });

      /* ═══════════════════════════════════════════════════════════════
         #1  VICTORY POSE + MINECRAFT CASTLE CROWN — REVAMPED

         Crown redesign goals:
         ✓ Clearly YELLOW (not gold-metal-gray) — MeshPhongMaterial
           with emissive so it reads as yellow in the 3D scene
         ✓ Proper shading: 3 material variants (bright top, mid front,
           dark inner/bottom) → face-wise lighting differentiates depth
         ✓ Slimmer proportions: thinner walls, more elegant merlons
         ✓ 7 front merlons (center clearly taller)
         ✓ 4 gem types on the front face with strong emissive glow
         ✓ Multi-material BoxGeometry [right,left,top,bottom,front,back]
           so each face has a different shade for depth illusion
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

                /* ── YELLOW materials — 3 shades for face-level shading ──
                   MeshPhongMaterial: responds to scene light, gives specular
                   highlights that read clearly as shiny YELLOW, not metallic gray. */
                const yTop  = new T.MeshPhongMaterial({
                  color: 0xFFEE00, specular: 0xFFFF88, shininess: 140,
                  emissive: 0x332200, emissiveIntensity: 0.30,
                });
                const yMid  = new T.MeshPhongMaterial({
                  color: 0xEECC00, specular: 0xFFFF44, shininess: 100,
                  emissive: 0x221500, emissiveIntensity: 0.22,
                });
                const yDark = new T.MeshPhongMaterial({
                  color: 0xCC9900, specular: 0xDDCC33, shininess: 70,
                  emissive: 0x110E00, emissiveIntensity: 0.15,
                });

                /*
                  Per-face material array for BoxGeometry:
                  index 0 = +X (right), 1 = -X (left), 2 = +Y (top),
                  3 = -Y (bottom), 4 = +Z (front/toward camera), 5 = -Z (back)
                  → top face = yTop (brightest), front = yMid, sides = yMid, bottom = yDark
                */
                const facesWall    = [yMid,  yMid,  yTop,  yDark, yMid,  yMid ];
                const facesTop     = [yMid,  yMid,  yTop,  yDark, yTop,  yMid ];
                const facesCenter  = [yMid,  yMid,  yTop,  yDark, yTop,  yMid ];

                /* ── Gem materials — strong emissive glow ── */
                const gemPurple = new T.MeshPhongMaterial({
                  color: 0xDD44FF, specular: 0xFFCCFF, shininess: 200,
                  emissive: 0x9900CC, emissiveIntensity: 0.90,
                });
                const gemCyan = new T.MeshPhongMaterial({
                  color: 0x44CCFF, specular: 0xCCEEFF, shininess: 200,
                  emissive: 0x006688, emissiveIntensity: 0.85,
                });
                const gemBlue = new T.MeshPhongMaterial({
                  color: 0x2255EE, specular: 0x88AAFF, shininess: 200,
                  emissive: 0x001188, emissiveIntensity: 0.85,
                });
                const gemGreen = new T.MeshPhongMaterial({
                  color: 0x11EE44, specular: 0xAAFFCC, shininess: 200,
                  emissive: 0x005511, emissiveIntensity: 0.90,
                });

                const g = new T.Group();

                /* Helper: add box with per-face materials or single material */
                const bx = (
                  mat: any,
                  w: number, h: number, d: number,
                  x: number, y: number, z: number,
                ) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                /*
                  SLIMMER crown proportions:
                  Head = 8×8×8 units. Crown sits at g.position.y = 6.0
                  (properly seated on head — lower, more weighted look).

                  BW  = total width (slightly wider than 8-unit head)
                  BH  = base band height  → slimmer = 1.0
                  BT  = wall thickness   → thinner = 0.80
                */
                const BW    = 10.0;
                const BH    = 1.0;
                const BT    = 0.80;
                const inner = BW - BT * 2;

                const FZ  =  (BW / 2 - BT / 2);   /* front wall center (+Z, toward camera) */
                const BKZ = -(BW / 2 - BT / 2);   /* back wall center */
                const LX  = -(BW / 2 - BT / 2);   /* left wall center */
                const RX  =  (BW / 2 - BT / 2);   /* right wall center */

                /* ── BASE BAND — 4 walls ── */
                bx(facesWall, BW, BH, BT, 0,  BH/2, FZ );  /* front */
                bx(facesWall, BW, BH, BT, 0,  BH/2, BKZ);  /* back  */
                bx(facesWall, BT, BH, inner, LX, BH/2, 0); /* left  */
                bx(facesWall, BT, BH, inner, RX, BH/2, 0); /* right */

                /* ── MERLONS (castle battlements) ──
                   7 across front & back. Center is distinctly taller.
                   Slim merlons for an elegant, not-chunky look. */
                const MW  = 0.88;   /* merlon width — slim */
                const MD  = BT;
                const MH  = 1.45;  /* standard merlon height */
                const MHC = 2.20;  /* center merlon — clearly taller */
                const yB  = BH;    /* merlons rest on top of base band */

                const xs7 = [-3.4, -2.26, -1.13, 0, 1.13, 2.26, 3.4];

                xs7.forEach((x, i) => {
                  const h   = i === 3 ? MHC : MH;
                  const mat = i === 3 ? facesCenter : facesTop;
                  bx(mat, MW, h, MD, x, yB + h/2, FZ );  /* front merlon */
                  bx(mat, MW, h, MD, x, yB + h/2, BKZ);  /* back  merlon */
                });

                /* Side merlons: 3 per side */
                [-2.0, 0, 2.0].forEach((z) => {
                  bx(facesTop, MD, MH, MW, LX, yB + MH/2, z);
                  bx(facesTop, MD, MH, MW, RX, yB + MH/2, z);
                });

                /* Corner caps */
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as [number,number][])
                  .forEach(([cx, cz]) => bx(facesTop, BT, MH, BT, cx, yB+MH/2, cz));

                /* ── GEMS on FRONT face — protrude outward so clearly visible ──
                   Front wall outer surface = FZ + BT/2
                   Gem center              = FZ + BT/2 + GD/2                    */
                const GS = 1.30;                   /* gem face size */
                const GD = 0.80;                   /* protrusion depth */
                const GY = BH / 2;                 /* vertically centred in band */
                const GZ = FZ + BT/2 + GD/2;       /* protrudes forward */

                ([
                  [-2.8, gemPurple],
                  [-0.9, gemCyan  ],
                  [ 0.9, gemBlue  ],
                  [ 2.8, gemGreen ],
                ] as [number, any][]).forEach(([x, mat]) => {
                  const gem = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  gem.position.set(x, GY, GZ);
                  g.add(gem);
                });

                /* Seat the crown on head top */
                g.position.set(0, 6.0, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            /* Victory pose — arms wide open, gentle wave */
            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.45 + Math.sin(t * 1.5) * 0.30);
            s.rightArm.rotation.z =   1.45 + Math.sin(t * 1.5 + Math.PI) * 0.30;
            s.leftArm.rotation.x  = -0.20 + Math.sin(t) * 0.20;
            s.rightArm.rotation.x = -0.20 - Math.sin(t) * 0.20;
            s.head.rotation.y     =  Math.sin(t * 0.8) * 0.24;
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
