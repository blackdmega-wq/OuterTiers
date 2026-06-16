import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

/*
 * Canvas sizes — match lb-pod-skin-wrap CSS below.
 * Player model in skinview3d: head-top=y+8, feet-bottom=y-24.
 * Center at y=-8. We aim controls.target at (0,-8,0) so the character
 * is properly centered in the viewport.
 */
const SIZES = {
  1: { width: 100, height: 152 },
  2: { width: 82,  height: 128 },
  3: { width: 76,  height: 118 },
} as const;

/* zoom: smaller = camera farther away = character appears smaller.
 * With controls.target at y=-8 and zoom≈0.88 the full body fills ~75% of canvas. */
const ZOOM: Record<1|2|3, number> = { 1: 0.88, 2: 0.88, 3: 0.80 };

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

      /* Fresh canvas each mount — avoids WebGL context-reuse issue in React StrictMode */
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({
        canvas,
        width,
        height,
        skin: `https://mc-heads.net/skin/${username}`,
      });

      /* Transparent background */
      try { viewer.renderer.setClearColor(0x000000, 0); } catch (_) {}

      /* Center camera on the player model.
       * skinview3d player: head top y=+8, feet bottom y=-24 → center y=-8.
       * Setting controls.target to (0,-8,0) makes the full body fill the canvas. */
      try {
        viewer.controls.target.set(0, -8, 0);
        viewer.controls.update();
      } catch (_) {}

      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      /* ── #3 SPRINT: built-in RunningAnimation ── */
      if (rank === 3) {
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.2;
        viewer.animation = anim;

      /* ── #2 FORTNITE FLOSS ──
         Real floss: arms swing alternately FORWARD/BACKWARD (not sideways!),
         hips twist in the opposite direction — the signature Fortnite floss move. */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t = progress * 4.5;
            const phase = Math.sin(t);
            /* Forward/back arm swing — the actual floss motion */
            s.leftArm.rotation.x  = -phase * 1.2;
            s.rightArm.rotation.x =  phase * 1.2;
            /* Slight outward angle — arms not fully at sides */
            s.leftArm.rotation.z  =  0.15;
            s.rightArm.rotation.z = -0.15;
            /* Hip counter-rotation — the signature floss element */
            s.body.rotation.y = phase * 0.55;
            s.body.rotation.z = Math.cos(t) * 0.06;
            /* Legs: slight weight-shift bounce */
            s.leftLeg.rotation.x  =  phase * 0.15;
            s.rightLeg.rotation.x = -phase * 0.15;
          } catch (_) {}
        });

      /* ── #1 VICTORY: arms raised high, waving, excited head ── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;
            const t = progress * 2.5;
            /* Arms up in victory — slight waving oscillation */
            s.leftArm.rotation.z  = -(1.4 + Math.sin(t * 1.5) * 0.4);
            s.rightArm.rotation.z =   1.4 + Math.sin(t * 1.5 + Math.PI) * 0.4;
            s.leftArm.rotation.x  = -0.2 + Math.sin(t) * 0.2;
            s.rightArm.rotation.x = -0.2 - Math.sin(t) * 0.2;
            /* Excited head */
            s.head.rotation.y = Math.sin(t * 0.8) * 0.3;
            s.head.rotation.x = -0.1 + Math.sin(t * 1.1) * 0.1;
            /* Body celebratory sway */
            s.body.rotation.y = Math.sin(t * 0.5) * 0.1;
            /* Bounce legs */
            s.leftLeg.rotation.x  =  Math.sin(t * 1.8) * 0.08;
            s.rightLeg.rotation.x = -Math.sin(t * 1.8) * 0.08;
          } catch (_) {}
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
