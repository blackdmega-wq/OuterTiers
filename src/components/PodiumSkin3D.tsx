import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = {
  1: { width: 110, height: 170, cameraZ: 62 },
  2: { width: 88,  height: 140, cameraZ: 68 },
  3: { width: 82,  height: 132, cameraZ: 70 },
} as const;

export default function PodiumSkin3D({ username, rank }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height, cameraZ } = SIZES[rank];

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
      });

      /* transparent background */
      try { viewer.background = null; } catch (_) {}
      try { viewer.renderer.setClearColor(0x000000, 0); } catch (_) {}
      viewer.camera.position.z = cameraZ;
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      /* load skin async */
      viewer.loadSkin(`https://mc-heads.net/skin/${username}`).catch(() =>
        viewer.loadSkin(`https://minotar.net/skin/${username}`)
      );

      if (rank === 3) {
        /* ── #3 SPRINT: built-in skeletal running animation, 2.4× speed ── */
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.4;
        viewer.animation = anim;

      } else if (rank === 2) {
        /* ── #2 FORTNITE FLOSS: big arm swings + hip counter-twist ── */
        viewer.animation = (player: any, time: number) => {
          const t = time * 5.5;
          const swing = Math.sin(t) * 1.5;
          player.skin.leftArm.rotation.z  =  swing + 0.5;
          player.skin.rightArm.rotation.z = -swing - 0.5;
          player.skin.leftArm.rotation.x  =  Math.cos(t) * 0.35;
          player.skin.rightArm.rotation.x = -Math.cos(t) * 0.35;
          /* Body hip counter-twist — the floss signature */
          player.skin.body.rotation.y = -Math.sin(t) * 0.55;
          player.skin.body.rotation.z = -Math.sin(t) * 0.07;
          /* Knee bounce */
          player.skin.leftLeg.rotation.x  =  Math.sin(t * 0.5) * 0.25;
          player.skin.rightLeg.rotation.x = -Math.sin(t * 0.5) * 0.25;
        };

      } else {
        /* ── #1 VICTORY: arms raised + waving, excited head, body sway ── */
        viewer.animation = (player: any, time: number) => {
          const t = time * 2.8;
          player.skin.leftArm.rotation.z  = -(1.6 + Math.sin(t * 1.7) * 0.5);
          player.skin.rightArm.rotation.z =   1.6 + Math.sin(t * 1.7 + Math.PI) * 0.5;
          player.skin.leftArm.rotation.x  =  Math.sin(t) * 0.35 - 0.3;
          player.skin.rightArm.rotation.x = -Math.sin(t) * 0.35 - 0.3;
          player.skin.head.rotation.x = -0.2 + Math.sin(t * 0.9) * 0.15;
          player.skin.head.rotation.y =  Math.sin(t * 0.7) * 0.3;
          player.skin.body.rotation.y = Math.sin(t * 0.45) * 0.12;
          player.skin.leftLeg.rotation.x  =  Math.sin(t * 1.6) * 0.1;
          player.skin.rightLeg.rotation.x = -Math.sin(t * 1.6) * 0.1;
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
      style={{ display: 'block', background: 'transparent' }}
    />
  );
}
