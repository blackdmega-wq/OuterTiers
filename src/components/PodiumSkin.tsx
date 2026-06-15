import { useEffect, useRef } from 'react';

interface PodiumSkinProps {
  username: string;
  rank: 1 | 2 | 3;
  width: number;
  height: number;
  className?: string;
}

// zoom: how much player fills the frame (1.0 = head at top edge)
// rotY: player Y-axis rotation in radians
const RANK_CFG: Record<number, { anim: string; speed: number; rotY: number; zoom: number; light: number }> = {
  1: { anim: 'FlyingAnimation',  speed: 0.55, rotY: -0.22, zoom: 0.82, light: 3.8 },
  2: { anim: 'WalkingAnimation', speed: 1.05, rotY:  0.62, zoom: 0.90, light: 3.2 },
  3: { anim: 'RunningAnimation', speed: 1.20, rotY: -0.68, zoom: 0.90, light: 3.2 },
};

export default function PodiumSkin({ username, rank, width, height, className = '' }: PodiumSkinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cfg = RANK_CFG[rank];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null;
    let cancelled = false;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sv: any = await import('skinview3d');
        if (cancelled || !canvasRef.current) return;

        const AnimClass = sv[cfg.anim];
        const anim = new AnimClass();
        anim.speed = cfg.speed;

        viewer = new sv.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
          skin: `https://mc-heads.net/skin/${username}`,
          enableControls: false,
          animation: anim,
          zoom: cfg.zoom,
        });

        viewer.autoRotate = false;
        viewer.playerObject.rotation.y = cfg.rotY;
        viewer.globalLight.intensity  = cfg.light;
        viewer.cameraLight.intensity  = 1.6;
      } catch (_e) {
        if (canvasRef.current) {
          const img = document.createElement('img');
          img.src = `https://mc-heads.net/body/${username}/256`;
          img.style.cssText = 'width:100%;height:100%;object-fit:contain;image-rendering:pixelated;';
          canvasRef.current.replaceWith(img);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (viewer) { try { viewer.dispose(); } catch (_) {} }
    };
  }, [username, rank, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', background: 'transparent' }}
    />
  );
}
