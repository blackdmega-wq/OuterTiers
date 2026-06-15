import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

/* Canvas sizes — match CSS lb-pod-skin-wrap sizes */
const SIZES = {
  1: { width: 140, height: 220 },
  2: { width: 110, height: 175 },
  3: { width: 100, height: 165 },
} as const;

const ZOOM: Record<1|2|3, number> = { 1: 0.82, 2: 0.85, 3: 0.85 };

export default function PodiumSkin3D({ username, rank }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    let viewer: any;

    import('skinview3d').then((sv3d) => {
      if (disposed || !canvasRef.current) return;

      viewer = new sv3d.SkinViewer({
        canvas: canvasRef.current,
        width,
        height,
        skin: `https://mc-heads.net/skin/${username}`,
        background: null,
      });

      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      if (rank === 3) {
        /* ── #3 SPRINT ── built-in skeletal running at 2.2× speed */
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.2;
        viewer.animation = anim;

      } else if (rank === 2) {
        /* ── #2 FORTNITE FLOSS ── big arm swings + hip counter-twist */
        viewer.animation = (player: any, time: number) => {
          try {
            const s = player?.skin;
            if (!s) return;
            const t = time * 5.5;
            const swing = Math.sin(t) * 1.5;
            s.leftArm.rotation.z  =  swing + 0.5;
            s.rightArm.rotation.z = -swing - 0.5;
            s.leftArm.rotation.x  =  Math.cos(t) * 0.35;
            s.rightArm.rotation.x = -Math.cos(t) * 0.35;
            s.body.rotation.y = -Math.sin(t) * 0.55;
            s.body.rotation.z = -Math.sin(t) * 0.07;
            s.leftLeg.rotation.x  =  Math.sin(t * 0.5) * 0.25;
            s.rightLeg.rotation.x = -Math.sin(t * 0.5) * 0.25;
          } catch (_) { /* skin not ready yet, skip frame */ }
        };

      } else {
        /* ── #1 VICTORY ── arms raised high, waving, excited head */
        viewer.animation = (player: any, time: number) => {
          try {
            const s = player?.skin;
            if (!s) return;
            const t = time * 2.8;
            s.leftArm.rotation.z  = -(1.6 + Math.sin(t * 1.7) * 0.5);
            s.rightArm.rotation.z =   1.6 + Math.sin(t * 1.7 + Math.PI) * 0.5;
            s.leftArm.rotation.x  =  Math.sin(t) * 0.35 - 0.3;
            s.rightArm.rotation.x = -Math.sin(t) * 0.35 - 0.3;
            s.head.rotation.x = -0.2 + Math.sin(t * 0.9) * 0.15;
            s.head.rotation.y =  Math.sin(t * 0.7) * 0.3;
            s.body.rotation.y = Math.sin(t * 0.45) * 0.12;
            s.leftLeg.rotation.x  =  Math.sin(t * 1.6) * 0.1;
            s.rightLeg.rotation.x = -Math.sin(t * 1.6) * 0.1;
          } catch (_) { /* skin not ready yet, skip frame */ }
        };
      }
    }).catch(console.error);

    return () => {
      disposed = true;
      if (viewer) { try { viewer.dispose(); } catch (_) {} }
    };
  }, [username, rank]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: 'block',
        background: 'transparent',
        position: 'relative',
        zIndex: 1,
      }}
    />
  );
}
