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
         Correct floss sequence (looping):
           Phase 1: Both arms swing to the RIGHT (in front), hips go LEFT
           Phase 2: Arms swing BEHIND the back (diagonal)
           Phase 3: Both arms swing to the LEFT (in front), hips go RIGHT
           Repeat

         Implementation:
           ph = sin(t)  →  drives left/right arm swing
           armX = cos(2t) →  behind at zero-crossings (cos=+1),
                              forward at left/right extreme (cos=−1)

         Sign conventions in skinview3d:
           rotation.z positive on leftArm & rightArm → tips go VIEWER'S RIGHT
           rotation.z negative on both                → tips go VIEWER'S LEFT
           rotation.x positive                        → tips go BACKWARD (behind body)
           body.rotation.y positive                   → hips go VIEWER'S LEFT
         ─────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const t  = progress * 4.5;   // floss tempo
            const ph = Math.sin(t);       // −1 to 1: left/right swing driver

            /* Both arms move as ONE UNIT (parallel, same values) */
            /* ph > 0 → arms go VIEWER'S RIGHT; ph < 0 → VIEWER'S LEFT */
            s.leftArm.rotation.z  = ph * 1.1;
            s.rightArm.rotation.z = ph * 1.1;

            /* cos(2t):
                 = +1 when t = 0, π   → arms at center crossing → BEHIND (+x)
                 = −1 when t = π/2, 3π/2 → arms at left/right extreme → IN FRONT (−x) */
            const armX = Math.cos(2 * t) * 1.25;
            s.leftArm.rotation.x  = armX;
            s.rightArm.rotation.x = armX;

            /* Hips OPPOSITE to arms:
               ph > 0 (arms RIGHT) → hips LEFT (+y)
               ph < 0 (arms LEFT)  → hips RIGHT (−y) */
            s.body.rotation.y = ph * 0.70;
            s.body.rotation.z = -ph * 0.12;
            s.body.rotation.x = 0;

            /* Legs: NO movement — feet stay planted */
            s.leftLeg.rotation.x  = 0;
            s.rightLeg.rotation.x = 0;
            s.leftLeg.rotation.z  = 0;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.y = 0;
          } catch (_) {}
        });

      /* ── #1 VICTORY + TECHNOBLADE CROWN ── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            /* Attach Technoblade crown on first frame */
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                /* Technoblade's crown: gold, wide to match head, tall spikes */
                const gold     = new T.MeshBasicMaterial({ color: 0xFFD700, side: T.DoubleSide });
                const darkGold = new T.MeshBasicMaterial({ color: 0xB8860B });

                const g = new T.Group();

                /* Crown band — matches head width (head = 8 units wide, r ≈ 4).
                   Top radius 4.4, bottom 5.0 so it sits flush on the head.     */
                const band = new T.Mesh(
                  new T.CylinderGeometry(4.4, 5.0, 2.4, 8, 1, false),
                  gold
                );
                band.position.y = 1.2;
                g.add(band);

                /* 4 spikes evenly spaced — classic Technoblade crown shape */
                for (let i = 0; i < 4; i++) {
                  const a = (i / 4) * Math.PI * 2;
                  const spike = new T.Mesh(
                    new T.ConeGeometry(0.9, 5.8, 5),
                    gold
                  );
                  spike.position.set(Math.cos(a) * 3.9, 5.1, Math.sin(a) * 3.9);
                  g.add(spike);

                  /* Gold gem at spike base */
                  const gem = new T.Mesh(new T.SphereGeometry(0.6, 6, 4), darkGold);
                  gem.position.set(Math.cos(a) * 3.9, 2.4, Math.sin(a) * 3.9);
                  g.add(gem);
                }

                /* y=8: top of head in local space (head y=0 neck → y=8 top) */
                g.position.set(0, 8, 0);
                g.rotation.y = Math.PI / 4;   /* slight rotation for aesthetics */

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
