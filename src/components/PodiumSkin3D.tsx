import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = {
  1: { width: 100, height: 152 },
  2: { width: 82,  height: 128 },
  3: { width: 76,  height: 118 },
} as const;

const ZOOM: Record<1|2|3, number> = { 1: 0.68, 2: 0.68, 3: 0.64 };

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

      /* ── #2 FORTNITE FLOSS ──
         Arms swing FORWARD (in front) / BACKWARD (behind back).
         BOTH arms identical rotation = parallel.
         NO Z oscillation = no diagonal motion.
         Hips go OPPOSITE direction to arms.
         When hips RIGHT → both arms IN FRONT (= appear to the LEFT of body).
         When hips LEFT  → both arms BEHIND BACK (= appear to the RIGHT of body).
      ── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t = progress * 7.0;        // fast floss!
            const phase = Math.sin(t);

            // Hips: negative Y = RIGHT, positive Y = LEFT
            s.body.rotation.y = -phase * 0.75;
            s.body.rotation.z = 0;

            // Both arms PARALLEL — identical X rotation only (forward/backward swing).
            // rotation.x negative = arm tips go FORWARD (in front of body).
            // When hips RIGHT (phase>0): arms IN FRONT (negative X) → appear LEFT from viewer.
            s.leftArm.rotation.x  = -phase * 1.4;
            s.rightArm.rotation.x = -phase * 1.4;  // same = parallel!

            // Tiny static outward angle only — NO oscillating Z (no diagonal!)
            s.leftArm.rotation.z  =  0.12;
            s.rightArm.rotation.z = -0.12;

            // Legs counter-bounce
            s.leftLeg.rotation.x  = -phase * 0.15;
            s.rightLeg.rotation.x =  phase * 0.15;
          } catch (_) {}
        });

      /* ── #1 VICTORY + 3D CROWN ── */
      } else {
        let crownAdded = false;

        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            // Add 3D crown to head bone on first frame
            if (!crownAdded && s.head) {
              crownAdded = true;
              import('three').then((THREE) => {
                const mat = new THREE.MeshPhongMaterial({
                  color: 0xFFD700,
                  emissive: 0xAA6600,
                  emissiveIntensity: 0.35,
                  shininess: 150,
                });

                const g = new THREE.Group();

                // Crown band (ring)
                const band = new THREE.Mesh(
                  new THREE.CylinderGeometry(4.2, 4.8, 2.5, 8),
                  mat
                );
                band.position.y = 1.25;
                g.add(band);

                // 5 spikes
                for (let i = 0; i < 5; i++) {
                  const a = (i / 5) * Math.PI * 2;
                  const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(1.0, 5.5, 5),
                    mat
                  );
                  spike.position.set(Math.cos(a) * 3.6, 5.25, Math.sin(a) * 3.6);
                  g.add(spike);
                }

                // Position above head top (head local y=0 at neck, y=8 at top)
                g.position.y = 9;
                g.rotation.y = Math.PI / 10;

                s.head.add(g);
              }).catch(() => {});
            }

            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.4 + Math.sin(t * 1.5) * 0.4);
            s.rightArm.rotation.z =   1.4 + Math.sin(t * 1.5 + Math.PI) * 0.4;
            s.leftArm.rotation.x  = -0.2 + Math.sin(t) * 0.2;
            s.rightArm.rotation.x = -0.2 - Math.sin(t) * 0.2;
            s.head.rotation.y = Math.sin(t * 0.8) * 0.3;
            s.head.rotation.x = -0.1 + Math.sin(t * 1.1) * 0.1;
            s.body.rotation.y = Math.sin(t * 0.5) * 0.1;
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
