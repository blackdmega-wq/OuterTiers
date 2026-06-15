import { useEffect, useRef } from 'react';

interface PodiumSkinProps {
  username: string;
  rank: 1 | 2 | 3;
  width: number;
  height: number;
  className?: string;
}

const RANK_CFG = {
  1: { anim: 'FlyingAnimation',  speed: 0.55, rotY: -0.22, camZ: 60, camY:  8, light: 3.8 },
  2: { anim: 'WalkingAnimation', speed: 1.05, rotY:  0.62, camZ: 65, camY:  2, light: 3.2 },
  3: { anim: 'RunningAnimation', speed: 1.20, rotY: -0.68, camZ: 67, camY:  0, light: 3.2 },
} as const;

export default function PodiumSkin({ username, rank, width, height, className = '' }: PodiumSkinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cfg = RANK_CFG[rank];
    let viewer: any = null;
    let cancelled = false;

    (async () => {
      try {
        const sv = await import('skinview3d');
        if (cancelled || !canvasRef.current) return;

        viewer = new sv.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
          skin: `https://mc-heads.net/skin/${username}`,
          alpha: true,
        });

        viewer.renderer.setClearAlpha(0);
        viewer.autoRotate = false;

        const AnimClass = (sv as any)[cfg.anim];
        if (AnimClass) {
          viewer.animation = new AnimClass();
          viewer.animation.speed = cfg.speed;
        }

        viewer.playerObject.rotation.y = cfg.rotY;
        viewer.camera.position.z = cfg.camZ;
        viewer.camera.position.y = cfg.camY;

        if (viewer.globalLight)  viewer.globalLight.intensity  = cfg.light;
        if (viewer.cameraLight)  viewer.cameraLight.intensity  = 1.6;
      } catch (e) {
        // Fallback: show static img if skinview3d fails
        const img = document.createElement('img');
        img.src = `https://mc-heads.net/body/${username}/256`;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;image-rendering:pixelated;';
        canvas.replaceWith(img);
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
