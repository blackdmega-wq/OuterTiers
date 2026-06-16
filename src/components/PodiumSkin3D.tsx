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

      /* ── #2 FORTNITE FLOSS ─────────────────────────────────────────────
         Visual logic (from the FRONT, what viewer sees):
           ph > 0 → body.rotation.y = +1.0 → hips swing to the LEFT
                  → arm.rotation.z  = +0.9 → both arm TIPS swing to the RIGHT
                  → "hüfte links → arme rechts" ✓
           ph < 0 → hips RIGHT, arm tips LEFT
                  → "hüfte rechts → arme links" ✓

         Both arms have the SAME rotation.z value → they are parallel.
         Both arms have a fixed small rotation.x (slight forward lean = natural).
         NO oscillating rotation.x → no diagonal/depth wobble.
         Speed: progress × 7 = fast floss rhythm.
      ───────────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t  = progress * 7.0;
            const ph = Math.sin(t);

            /* Hips: LEFT when ph > 0 (positive Y = CCW from above = left side forward) */
            s.body.rotation.y =  ph * 1.0;
            s.body.rotation.x = 0;
            s.body.rotation.z = 0;

            /* Arms: BOTH same Z → parallel; positive Z → tips swing RIGHT from viewer */
            s.leftArm.rotation.z  = ph * 0.9;
            s.rightArm.rotation.z = ph * 0.9;   /* identical = PARALLEL */
            /* Fixed slight forward lean — gives 3-D floss feel, not a pure 2-D swing */
            s.leftArm.rotation.x  = 0.35;
            s.rightArm.rotation.x = 0.35;

            /* Legs: counter weight-shift */
            s.leftLeg.rotation.x  =  ph * 0.2;
            s.rightLeg.rotation.x = -ph * 0.2;
          } catch (_) {}
        });

      /* ── #1 VICTORY + 3D CROWN ── */
      } else {
        /*
         * Crown is added to s.head INSIDE the animation callback on the FIRST FRAME.
         * This guarantees we use the exact same THREE.Group that the callback rotates,
         * so the crown auto-tracks every head movement.
         */
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            /* ---- Crown: attach on first frame, once ---- */
            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;          /* guard — runs once */
              import('three').then((T: any) => {
                if (disposed) return;
                const mat = new T.MeshBasicMaterial({ color: 0xFFD700 });
                const dark = new T.MeshBasicMaterial({ color: 0xAA8800 });
                const g = new T.Group();

                /* Band — radius 4.5 to match head width (head = 8 units wide, r=4) */
                const band = new T.Mesh(new T.CylinderGeometry(4.4, 5.0, 3, 10), mat);
                band.position.y = 1.5;
                g.add(band);

                /* 5 spikes */
                for (let i = 0; i < 5; i++) {
                  const a = (i / 5) * Math.PI * 2;
                  const spike = new T.Mesh(new T.ConeGeometry(1.2, 7, 5), mat);
                  spike.position.set(Math.cos(a) * 3.8, 6.5, Math.sin(a) * 3.8);
                  g.add(spike);
                }

                /* Gems at spike bases */
                for (let i = 0; i < 5; i++) {
                  const a = (i / 5) * Math.PI * 2;
                  const gem = new T.Mesh(new T.SphereGeometry(0.8, 5, 4), dark);
                  gem.position.set(Math.cos(a) * 3.8, 3.0, Math.sin(a) * 3.8);
                  g.add(gem);
                }

                /*
                 * In skinview3d head-group local space:
                 *   y = 0  →  bottom of head (neck pivot)
                 *   y = 8  →  top of head
                 * Position crown just above the head top.
                 */
                g.position.set(0, 8, 0);
                g.rotation.y = Math.PI / 10;

                s.head.add(g);   /* child of the same head group → moves with head */
              }).catch(() => {});
            }

            /* ---- Victory pose ---- */
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
