import { useEffect, useRef } from 'react';

interface PodiumSkinProps {
  username: string;
  rank: 1 | 2 | 3;
  width: number;
  height: number;
  className?: string;
}

const RANK_CFG: Record<number, { anim: string; animArgs: unknown[]; speed: number; rotY: number; zoom: number; light: number }> = {
  1: { anim: 'WaveAnimation',   animArgs: ['right'], speed: 0.75, rotY:  0.15, zoom: 0.85, light: 3.8 },
  2: { anim: 'CrouchAnimation', animArgs: [],        speed: 0.55, rotY:  0.35, zoom: 0.92, light: 3.2 },
  3: { anim: 'WalkingAnimation',animArgs: [],        speed: 0.95, rotY:  0.0,  zoom: 0.90, light: 3.2 },
};

// Crown SVG worn on top of the player's head (#1 only)
function CrownOverlay() {
  return (
    <svg
      className="podium-crown-on-head"
      viewBox="0 0 56 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown body */}
      <path d="M4 30 L12 8 L28 20 L44 8 L52 30 Z" fill="#f59e0b" />
      <path d="M4 30 L12 8 L28 18 L44 8 L52 30" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
      {/* Crown band */}
      <rect x="4" y="26" width="48" height="4" rx="2" fill="#d97706"/>
      {/* Gems */}
      <circle cx="4"  cy="8"  r="4.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.2"/>
      <circle cx="28" cy="2"  r="4.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.2"/>
      <circle cx="52" cy="8"  r="4.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.2"/>
      {/* Center gem ruby */}
      <circle cx="28" cy="2" r="2.5" fill="#ef4444"/>
    </svg>
  );
}

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
        const anim = new AnimClass(...cfg.animArgs);
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
    <div className={`podium-skin-wrapper${rank === 1 ? ' podium-skin-wrapper--champion' : ''}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{ display: 'block', background: 'transparent' }}
      />
      {rank === 1 && <CrownOverlay />}
    </div>
  );
}
