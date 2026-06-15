import { useEffect, useRef } from 'react';

interface PodiumSkinProps {
  username: string;
  rank: 1 | 2 | 3;
  className?: string;
}

// Exact CSS display dimensions — skinview3d sets canvas size,
// pixelRatio:"match-device" (default) handles HiDPI automatically.
const RANK_DIMS: Record<number, [number, number]> = {
  1: [78, 112],
  2: [64, 92],
  3: [60, 88],
};

export default function PodiumSkin({ username, rank, className = '' }: PodiumSkinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const [w, h] = RANK_DIMS[rank];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null;
    let cancelled = false;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sv: any = await import('skinview3d');
        if (cancelled || !canvasRef.current) return;

        /* ── Per-rank animation ── */
        let anim: any;
        let rotY = 0;
        let zoom = 0.90;

        if (rank === 1) {
          // Victory wave — right arm raised
          anim = new sv.WaveAnimation('right');
          anim.speed = 0.70;
          rotY  = 0.18;
          zoom  = 0.85;
        } else if (rank === 2) {
          // Floss dance — arms alternate left/right (Fortnite emote)
          anim = new sv.FunctionAnimation((player: any, progress: number) => {
            const s = player.skin;
            const t = progress * Math.PI * 2;
            // Arms swing on Z-axis alternately — characteristic floss motion
            s.leftArm.rotation.z  =  Math.sin(t) * 1.4 + 0.5;
            s.rightArm.rotation.z = -Math.sin(t) * 1.4 - 0.5;
            s.leftArm.rotation.x  =  Math.cos(t) * 0.15;
            s.rightArm.rotation.x = -Math.cos(t) * 0.15;
            // Body sways with the rhythm
            s.body.rotation.y = Math.sin(t) * 0.22;
            // Slight leg bounce
            s.leftLeg.rotation.x  = Math.sin(t + Math.PI) * 0.30;
            s.rightLeg.rotation.x = Math.sin(t) * 0.30;
          });
          anim.speed = 1.9;
          rotY  = 0.28;
          zoom  = 0.92;
        } else {
          // Fast sprint — straight ahead
          anim = new sv.RunningAnimation();
          anim.speed = 2.2;
          rotY  = 0.0;
          zoom  = 0.90;
        }

        viewer = new sv.SkinViewer({
          canvas: canvasRef.current,
          width:  w,
          height: h,
          skin: `https://mc-heads.net/skin/${username}`,
          enableControls: false,
          animation: anim,
          zoom,
        });

        viewer.autoRotate          = false;
        viewer.playerObject.rotation.y = rotY;
        viewer.globalLight.intensity   = rank === 1 ? 3.8 : 3.2;
        viewer.cameraLight.intensity   = 1.6;

        /* ── #1: Add 3D gold crown to player head via Three.js ── */
        if (rank === 1) {
          try {
            // three is a peer dep of skinview3d — always available
            const THREE = await import('three');
            if (cancelled) return;

            const goldMat  = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.15 });
            const gemMat   = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.95, roughness: 0.05, emissive: 0xef4444, emissiveIntensity: 0.3 });

            const crown = new THREE.Group();

            // Band — flat ring sitting on top of the head
            const bandGeo = new THREE.TorusGeometry(4.0, 0.7, 4, 8);
            const band    = new THREE.Mesh(bandGeo, goldMat);
            band.rotation.x = Math.PI / 2; // lay flat
            band.position.y = 4.2; // just above head top
            crown.add(band);

            // 5 crown spikes
            const NUM_SPIKES  = 5;
            const spikeRadius = 4.0;
            for (let i = 0; i < NUM_SPIKES; i++) {
              const angle = (i / NUM_SPIKES) * Math.PI * 2;
              const spike = new THREE.Mesh(
                new THREE.ConeGeometry(0.55, 2.8, 5),
                goldMat
              );
              spike.position.x = Math.cos(angle) * spikeRadius;
              spike.position.z = Math.sin(angle) * spikeRadius;
              spike.position.y = 5.8;
              crown.add(spike);

              // Gem on center spike only
              if (i === 0) {
                const gem = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), gemMat);
                gem.position.copy(spike.position);
                gem.position.y += 1.6;
                crown.add(gem);
              }
            }

            // Attach to the player's head group — moves with head animations
            viewer.playerObject.skin.head.add(crown);
          } catch (_e) {
            // three.js unavailable — crown silently skipped
          }
        }

      } catch (_e) {
        // Fallback: static body image
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
  }, [username, rank]);

  // No width/height HTML attrs — skinview3d sets them based on constructor args
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', background: 'transparent' }}
    />
  );
}
