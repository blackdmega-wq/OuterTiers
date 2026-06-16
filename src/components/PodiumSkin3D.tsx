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
         Both arms move as ONE UNIT (same rotation values = parallel).
         They oscillate between BEHIND BACK (ph>0) and IN FRONT (ph<0).
         Simultaneously they swing LEFT (ph>0) and RIGHT (ph<0).
         Hips are OPPOSITE to arms:
           ph > 0 → arms BEHIND + LEFT  →  hips RIGHT
           ph < 0 → arms IN FRONT + RIGHT  →  hips LEFT
         ─────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const t  = progress * 7.0;   // fast floss tempo
            const ph = Math.sin(t);

            /* rotation.x positive → arm tips go BACKWARD (behind body)
               rotation.x negative → arm tips go FORWARD (in front)      */

            /* Both arms identical = they move as a single parallel unit  */
            s.leftArm.rotation.x  = ph * 1.35;    // behind when ph>0, front when ph<0
            s.rightArm.rotation.x = ph * 1.35;    // identical = PARALLEL

            /* rotation.z negative on leftArm (x=+5) → tip goes to VIEWER'S LEFT
               Same on rightArm (x=-5)               → tip also goes LEFT         */
            s.leftArm.rotation.z  = -ph * 0.85;   // LEFT when ph>0, RIGHT when ph<0
            s.rightArm.rotation.z = -ph * 0.85;   // identical = PARALLEL

            /* Hips OPPOSITE to arms:
               body.rotation.y negative → hips swing RIGHT (ph>0, arms go left+behind) */
            s.body.rotation.y = -ph * 0.65;
            /* Hip dip/tilt — makes it look like hip swing, not just chest twist */
            s.body.rotation.z =  ph * 0.12;
            s.body.rotation.x = 0;

            /* Legs: slight weight-shift to complete the hip visual */
            s.leftLeg.rotation.x  =  ph * 0.18;
            s.rightLeg.rotation.x = -ph * 0.18;
            s.leftLeg.rotation.z  = -ph * 0.08;
            s.rightLeg.rotation.z =  ph * 0.08;
          } catch (_) {}
        });

      /* ── #1 VICTORY + TECHNOBLADE CROWN ── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            /* Attach Technoblade crown on first frame — same head reference the
               animation callback uses, so it auto-tracks every head rotation.   */
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                /* Technoblade's crown: small, hot-pink, 3 elegant points */
                const pink = new T.MeshBasicMaterial({ color: 0xFF69B4, side: T.DoubleSide });
                const darkPink = new T.MeshBasicMaterial({ color: 0xC2185B });

                const g = new T.Group();

                /* Crown band — snug fit on head (head = 8 units wide, r=4).
                   Slightly inset so it sits ON the head, not floating.         */
                const band = new T.Mesh(
                  new T.CylinderGeometry(3.6, 4.0, 1.8, 8, 1, false),
                  pink
                );
                band.position.y = 0.9;
                g.add(band);

                /* 3 spikes at 0°, 120°, 240° — Technoblade crown style */
                for (let i = 0; i < 3; i++) {
                  const a = (i / 3) * Math.PI * 2;
                  const spike = new T.Mesh(
                    new T.ConeGeometry(0.75, 4.2, 5),
                    pink
                  );
                  spike.position.set(Math.cos(a) * 3.0, 3.7, Math.sin(a) * 3.0);
                  g.add(spike);

                  /* Small gem at spike base */
                  const gem = new T.Mesh(new T.SphereGeometry(0.55, 5, 4), darkPink);
                  gem.position.set(Math.cos(a) * 3.0, 1.8, Math.sin(a) * 3.0);
                  g.add(gem);
                }

                /* y=8: top of head in local space (head goes y=0 neck → y=8 top) */
                g.position.set(0, 8, 0);
                g.rotation.y = Math.PI / 6;   /* rotate slightly for aesthetics */

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
