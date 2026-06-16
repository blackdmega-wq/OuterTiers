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

const ZOOM: Record<1|2|3, number> = { 1: 0.65, 2: 0.68, 3: 0.64 };

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

      /* ── #2 FORTNITE FLOSS ──────────────────────────────────────────
         Motion: arms swing BEHIND BACK ↔ IN FRONT. Both arms identical
         (parallel). Zero Z-oscillation = no diagonal.
         Hips opposite to arms:
           phase > 0 → hips LEFT  (body.y +) → arms BEHIND (arm.x +) → appear RIGHT
           phase < 0 → hips RIGHT (body.y −) → arms FRONT  (arm.x −) → appear LEFT
         ─────────────────────────────────────────────────────────────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t  = progress * 7.0;        // fast floss!
            const ph = Math.sin(t);

            // Hips LEFT when ph>0, RIGHT when ph<0
            s.body.rotation.y = ph * 0.75;
            s.body.rotation.z = 0;
            s.body.rotation.x = 0;

            // BOTH arms identical → parallel.
            // rotation.x positive = arm tips go BACKWARD (behind back).
            s.leftArm.rotation.x  = ph * 1.45;
            s.rightArm.rotation.x = ph * 1.45;   // same value = parallel!
            // Tiny static outward angle — NO oscillating Z (prevents diagonal)
            s.leftArm.rotation.z  =  0.12;
            s.rightArm.rotation.z = -0.12;

            // Legs: subtle counter-bounce
            s.leftLeg.rotation.x  =  ph * 0.18;
            s.rightLeg.rotation.x = -ph * 0.18;
          } catch (_) {}
        });

      /* ── #1 VICTORY + 3D CROWN ── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
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

        /* Add 3D crown to head bone after viewer initialises (300 ms grace) */
        setTimeout(() => {
          if (disposed) return;
          import('three').then((THREE: any) => {
            try {
              // Try multiple access paths for the head bone
              const head =
                (viewer as any)?.playerObject?.skin?.head ??
                (viewer as any)?.playerObject?.children?.[0]?.skin?.head;
              if (!head || head.userData?.crownAdded) return;
              head.userData.crownAdded = true;

              // MeshBasicMaterial = always visible, no lighting dependency
              const gold = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
              const dark = new THREE.MeshBasicMaterial({ color: 0xB8860B });
              const g    = new THREE.Group();

              // Crown band — radius matches head width (head = 8 units wide → r=4)
              const band = new THREE.Mesh(
                new THREE.CylinderGeometry(4.3, 4.8, 2.8, 10, 1, false),
                gold
              );
              band.position.y = 1.4;
              g.add(band);

              // 5 spikes evenly around top
              for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                const spike = new THREE.Mesh(
                  new THREE.ConeGeometry(1.1, 6, 5),
                  gold
                );
                spike.position.set(Math.cos(a) * 3.7, 5.8, Math.sin(a) * 3.7);
                g.add(spike);
              }

              // Small gem at each spike base
              for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                const gem = new THREE.Mesh(
                  new THREE.SphereGeometry(0.7, 5, 5),
                  dark
                );
                gem.position.set(Math.cos(a) * 3.7, 2.8, Math.sin(a) * 3.7);
                g.add(gem);
              }

              // Place crown ON TOP of head.
              // In head-group local space: pivot at neck (y=0), head top at y=8.
              g.position.set(0, 8, 0);
              g.rotation.y = Math.PI / 10;
              head.add(g);
            } catch (_) {}
          }).catch(() => {});
        }, 350);
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
