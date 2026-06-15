import { useEffect, useRef } from 'react';

interface PodiumSkinProps {
  username: string;
  rank: 1 | 2 | 3;
  width: number;
  height: number;
  className?: string;
}

/* ── Confetti particles for #1 champion background ── */
const CONFETTI = [
  { id:  0, left: 10, color: '#ff4757', delay: 0.0, dur: 1.8, shape: 'circle' },
  { id:  1, left: 22, color: '#ffd32a', delay: 0.4, dur: 2.0, shape: 'rect'   },
  { id:  2, left: 38, color: '#2ed573', delay: 0.8, dur: 1.6, shape: 'rect'   },
  { id:  3, left: 50, color: '#ffffff', delay: 0.2, dur: 1.9, shape: 'star'   },
  { id:  4, left: 65, color: '#1e90ff', delay: 0.6, dur: 1.7, shape: 'circle' },
  { id:  5, left: 80, color: '#ffa502', delay: 1.0, dur: 2.1, shape: 'rect'   },
  { id:  6, left: 92, color: '#ff6b81', delay: 0.3, dur: 1.5, shape: 'circle' },
  { id:  7, left: 15, color: '#eccc68', delay: 1.2, dur: 1.8, shape: 'rect'   },
  { id:  8, left: 45, color: '#ff6348', delay: 0.7, dur: 2.2, shape: 'star'   },
  { id:  9, left: 72, color: '#a29bfe', delay: 1.5, dur: 1.6, shape: 'circle' },
  { id: 10, left: 57, color: '#fd79a8', delay: 0.1, dur: 1.9, shape: 'rect'   },
  { id: 11, left: 30, color: '#00cec9', delay: 0.9, dur: 2.0, shape: 'circle' },
  { id: 12, left: 85, color: '#fdcb6e', delay: 1.3, dur: 1.7, shape: 'star'   },
  { id: 13, left:  5, color: '#ff4757', delay: 0.5, dur: 1.8, shape: 'rect'   },
  { id: 14, left: 96, color: '#2ed573', delay: 1.1, dur: 1.6, shape: 'circle' },
];

/* ── Tiny crown SVG that sits ON the player head ── */
function CrownOnHead() {
  return (
    <svg
      className="podium-crown-on-head"
      viewBox="0 0 40 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* base band */}
      <rect x="2" y="17" width="36" height="6" rx="2" fill="#b45309"/>
      {/* crown spikes */}
      <polygon points="2,17 8,4 14,13 20,0 26,13 32,4 38,17" fill="#f59e0b"/>
      <polygon points="2,17 8,4 14,13 20,0 26,13 32,4 38,17" fill="none" stroke="#fbbf24" strokeWidth="1"/>
      {/* gem dots on tips */}
      <circle cx="8"  cy="4"  r="2.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="0.8"/>
      <circle cx="20" cy="0"  r="2.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.8"/>
      <circle cx="32" cy="4"  r="2.5" fill="#fde68a" stroke="#f59e0b" strokeWidth="0.8"/>
    </svg>
  );
}

export default function PodiumSkin({ username, rank, width, height, className = '' }: PodiumSkinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null;
    let cancelled = false;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sv: any = await import('skinview3d');
        if (cancelled || !canvasRef.current) return;

        /* ── Per-rank animation factory ── */
        let anim: any;
        let rotY = 0;
        let zoom = 0.9;
        let light = 3.2;

        if (rank === 1) {
          // Victory wave: right arm raised triumphantly
          anim = new sv.WaveAnimation('right');
          anim.speed = 0.70;
          rotY  = 0.18;
          zoom  = 0.86;
          light = 3.8;
        } else if (rank === 2) {
          // Floss dance: arms alternate left/right at waist (Fortnite emote)
          anim = new sv.FunctionAnimation((player: any, progress: number) => {
            const s = player.skin;
            const phase = progress * Math.PI * 2;
            // Arms swing alternately on Z axis
            s.leftArm.rotation.z  =  Math.sin(phase) * 1.4 + 0.5;
            s.rightArm.rotation.z = -Math.sin(phase) * 1.4 - 0.5;
            s.leftArm.rotation.x  = 0;
            s.rightArm.rotation.x = 0;
            // Body twists slightly
            s.body.rotation.y = Math.sin(phase) * 0.2;
            // Legs: small bounce
            s.leftLeg.rotation.x  =  Math.sin(phase + Math.PI) * 0.3;
            s.rightLeg.rotation.x =  Math.sin(phase) * 0.3;
          });
          anim.speed = 1.8;
          rotY  = 0.30;
          zoom  = 0.92;
          light = 3.2;
        } else {
          // Fast sprint straight ahead
          anim = new sv.RunningAnimation();
          anim.speed = 2.2;
          rotY  = 0.0;
          zoom  = 0.90;
          light = 3.2;
        }

        viewer = new sv.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
          skin: `https://mc-heads.net/skin/${username}`,
          enableControls: false,
          animation: anim,
          zoom,
        });

        viewer.autoRotate = false;
        viewer.playerObject.rotation.y = rotY;
        viewer.globalLight.intensity   = light;
        viewer.cameraLight.intensity   = 1.6;
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
    <div className="podium-skin-wrapper">
      {/* Confetti particles — behind the skin */}
      {rank === 1 && CONFETTI.map(p => (
        <div
          key={p.id}
          className={`podium-confetti podium-confetti--${p.shape}`}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* 3D skin canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{ display: 'block', background: 'transparent', position: 'relative', zIndex: 1 }}
      />

      {/* Crown worn on head (#1 only) — rendered AFTER canvas so it overlays on top */}
      {rank === 1 && <CrownOnHead />}
    </div>
  );
}
