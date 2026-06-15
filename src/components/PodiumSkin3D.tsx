import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

/* Canvas sizes — match lb-pod-skin-wrap CSS */
const SIZES = {
  1: { width: 130, height: 200 },
  2: { width: 100, height: 160 },
  3: { width: 90,  height: 148 },
} as const;

/* zoom < default(0.9) = camera farther = character appears smaller */
const ZOOM: Record<1|2|3, number> = { 1: 0.68, 2: 0.70, 3: 0.62 };

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

      /* Fresh canvas each mount — avoids WebGL context-reuse bugs with React StrictMode */
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({
        canvas,
        width,
        height,
        skin: `https://mc-heads.net/skin/${username}`,
      });

      /* Transparent background — use renderer API since 'null' is not valid TS type */
      try { viewer.renderer.setClearColor(0x000000, 0); } catch (_) {}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      if (rank === 3) {
        /* ── #3 SPRINT: built-in RunningAnimation at 2.2× speed ── */
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.2;
        viewer.animation = anim;

      } else if (rank === 2) {
        /* ── #2 FORTNITE FLOSS: FunctionAnimation wrapper (required in v3!) ── */
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t = progress * 5.5;
            const swing = Math.sin(t) * 1.5;
            s.leftArm.rotation.z  =  swing + 0.5;
            s.rightArm.rotation.z = -swing - 0.5;
            s.leftArm.rotation.x  =  Math.cos(t) * 0.35;
            s.rightArm.rotation.x = -Math.cos(t) * 0.35;
            s.body.rotation.y = -Math.sin(t) * 0.55;
            s.body.rotation.z = -Math.sin(t) * 0.07;
            s.leftLeg.rotation.x  =  Math.sin(t * 0.5) * 0.25;
            s.rightLeg.rotation.x = -Math.sin(t * 0.5) * 0.25;
          } catch (_) { /* skin not ready yet — safe to skip */ }
        });

      } else {
        /* ── #1 VICTORY: FunctionAnimation wrapper (required in v3!) ── */
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t = progress * 2.8;
            s.leftArm.rotation.z  = -(1.6 + Math.sin(t * 1.7) * 0.5);
            s.rightArm.rotation.z =   1.6 + Math.sin(t * 1.7 + Math.PI) * 0.5;
            s.leftArm.rotation.x  =  Math.sin(t) * 0.35 - 0.3;
            s.rightArm.rotation.x = -Math.sin(t) * 0.35 - 0.3;
            s.head.rotation.x = -0.2 + Math.sin(t * 0.9) * 0.15;
            s.head.rotation.y =  Math.sin(t * 0.7) * 0.3;
            s.body.rotation.y =  Math.sin(t * 0.45) * 0.12;
            s.leftLeg.rotation.x  =  Math.sin(t * 1.6) * 0.1;
            s.rightLeg.rotation.x = -Math.sin(t * 1.6) * 0.1;
          } catch (_) { /* skin not ready yet — safe to skip */ }
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
      style={{ width, height, position: 'relative', zIndex: 1, flexShrink: 0 }}
    />
  );
}
