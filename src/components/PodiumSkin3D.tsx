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
        skin: `https://mc-heads.net/skin/${username}`,
      });

      try { viewer.background = null; } catch (_) {}
      viewer.renderer.setClearColor(0x000000, 0);
      viewer.camera.position.z = cameraZ;
      viewer.autoRotate = false;
      viewer.controls.enabled = false;

      if (rank === 3) {
        /* ── #3 SPRINT: built-in skeletal running animation, sped up ── */
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.4;
        viewer.animation = anim;

      } else if (rank === 2) {
        /* ── #2 FORTNITE FLOSS: big alternating arm swings + hip twist ── */
        viewer.animation = {
          animate(player: any, time: number) {
            const t = time * 5.5;
            const swing = Math.sin(t) * 1.5;
            /* Arms floss opposite directions — large amplitude */
            player.skin.leftArm.rotation.z  =  swing + 0.5;
            player.skin.rightArm.rotation.z = -swing - 0.5;
            player.skin.leftArm.rotation.x  =  Math.cos(t) * 0.35;
            player.skin.rightArm.rotation.x = -Math.cos(t) * 0.35;
            /* Body hip counter-twist (the floss signature move) */
            player.skin.body.rotation.y = -Math.sin(t) * 0.55;
            player.skin.body.rotation.z = -Math.sin(t) * 0.07;
            /* Knees slightly bounce with beat */
            player.skin.leftLeg.rotation.x  =  Math.sin(t * 0.5) * 0.25;
            player.skin.rightLeg.rotation.x = -Math.sin(t * 0.5) * 0.25;
          }
        };

      } else {
        /* ── #1 VICTORY: arms raised high, wave + head excitement ── */
        viewer.animation = {
          animate(player: any, time: number) {
            const t = time * 2.8;
            /* Both arms raised high and alternately waving */
            player.skin.leftArm.rotation.z  = -(1.6 + Math.sin(t * 1.7) * 0.5);
            player.skin.rightArm.rotation.z =   1.6 + Math.sin(t * 1.7 + Math.PI) * 0.5;
            player.skin.leftArm.rotation.x  =  Math.sin(t) * 0.35 - 0.3;
            player.skin.rightArm.rotation.x = -Math.sin(t) * 0.35 - 0.3;
            /* Head looks up, shakes side to side with joy */
            player.skin.head.rotation.x = -0.2 + Math.sin(t * 0.9) * 0.15;
            player.skin.head.rotation.y =  Math.sin(t * 0.7) * 0.3;
            /* Body slight triumphant sway */
            player.skin.body.rotation.y = Math.sin(t * 0.45) * 0.12;
            /* Legs small victory bounce */
            player.skin.leftLeg.rotation.x  =  Math.sin(t * 1.6) * 0.1;
            player.skin.rightLeg.rotation.x = -Math.sin(t * 1.6) * 0.1;
          }
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
