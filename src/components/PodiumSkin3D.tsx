import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = {
  1: { width: 100, height: 160 },
  2: { width: 82,  height: 128 },
  3: { width: 76,  height: 118 },
} as const;

const ZOOM: Record<1|2|3, number> = { 1: 0.58, 2: 0.68, 3: 0.64 };

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

      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({
        canvas,
        width,
        height,
        skin: `https://mc-heads.net/skin/${username}`,
      });

      try { viewer.renderer.setClearColor(0x000000, 0); } catch (_) {}
      try {
        viewer.controls.target.set(0, -8, 0);
        viewer.controls.update();
      } catch (_) {}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      /* ── #3 SPRINT ── */
      if (rank === 3) {
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.2;
        viewer.animation = anim;

      /* ═══════════════════════════════════════════════════════════════
         #2  MINECRAFT FLOSS EMOTE — vollständige Blockbench-Keyframes

         Startpose:
           Arme: locker nach unten (0°)
           Beine: leicht auseinander (10–15° = 0.20 rad)
           Kopf:  gerade nach vorne

         FRAME 1 — „Rechte Seite vorne" (swing = +1)
           Rechter Oberarm: VOR dem Körper     → x = −25° (−0.436 rad)
           Rechter Unterarm: leicht nach innen → forearm z = −10° (−0.175 rad)  [Delay 1 Frame]
           Schulter rechts: minimal mitdrehen  → arm.y = +8° (+0.140 rad)
           Linker Oberarm: HINTER dem Körper   → x = +25° (+0.436 rad)
           Linker Unterarm: leicht nach außen  → forearm z = +10° (+0.175 rad)  [Delay 1 Frame]
           Schulter links: minimal mitdrehen   → arm.y = −8° (−0.140 rad)
           Körper: leicht nach LINKS drehen    → body.y = +10° (+0.175 rad)
           Hüfte: minimal nach rechts          → body.z = −2° (−0.035 rad)

         FRAME 2 — ease-in-out Übergang (Mitte / Neutralposition)

         FRAME 3 — „Linke Seite vorne" (swing = −1)
           Linker Oberarm: VOR dem Körper      → x = −25°
           Rechter Oberarm: HINTER dem Körper  → x = +25°
           Körper: leicht nach RECHTS drehen   → body.y = −10°
           [Alles spiegelverkehrt zu Frame 1]

         FRAME 4 — ease-in-out zurück zu Mitte

         Profi-Tipps (alle implementiert):
           ✔ Schulter mitrotieren (arm.rotation.y ≠ 0)
           ✔ Unterarm 1 Frame verzögert (phase offset −0.35 rad)
           ✔ Kopf 3° Gegenbewegung (Anti-stiff)
           ✔ Beine 10–15° auseinander + minimaler Weight-Shift (1–2°)
           ✔ Sinuswelle = automatisches ease-in-out (12–16 FPS Effekt)

         skinview3d Achsen (Charakter schaut +Z = zur Kamera):
           arm.rotation.x: NEGATIV = nach VORNE  POSITIV = nach HINTEN
           leftArm.rotation.z:  NEGATIV = außen LINKS  POSITIV = kreuzt RECHTS
           rightArm.rotation.z: NEGATIV = außen RECHTS POSITIV = kreuzt LINKS
           arm.rotation.y: leichte Schulter-Rotation um eigene Achse
           body.rotation.y: POSITIV = dreht Oberkörper nach LINKS
         ═══════════════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            /* 12–16 FPS Rhythmus — Sinuswelle hält Extremposen länger */
            const SPEED = 2.8;
            const t     = progress * SPEED;

            /* Oberarm-Swing (Hauptbewegung) */
            const swing = Math.sin(t);

            /* Unterarm-Swing: 1 Frame Delay ≈ 0.35 rad Phasenversatz */
            const swingFore = Math.sin(t - 0.35);

            const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

            /* ph: 0 = Frame 3 (Arme LINKS)   1 = Frame 1 (Arme RECHTS) */
            const ph     = (swing     + 1) * 0.5;
            const phFore = (swingFore + 1) * 0.5;

            /* ── LINKER OBERARM ─────────────────────────────────────────────
               Frame 3 (ph=0, links): VOR dem Körper nach links
                 x=−25°=−0.436 (vorne),  z=−30°=−0.524 (außen links)
               Frame 1 (ph=1, rechts): HINTER dem Körper nach rechts
                 x=+25°=+0.436 (hinten), z=+20°=+0.349 (kreuzt rechts, hinten)

               Schulter mitrotieren: y bewegt sich gegenseitig zum swing
                 swing=+1 (rechts) → linker Arm hinten → Schulter dreht −8°
                 swing=−1 (links)  → linker Arm vorne  → Schulter dreht +8°     */
            s.leftArm.rotation.x = lerp(-0.436, +0.436, ph);
            s.leftArm.rotation.z = lerp(-0.524, +0.349, ph);
            s.leftArm.rotation.y = -swing * 0.140;   /* ±8° Schulter-Rotation */

            /* ── LINKER UNTERARM (forearm) — 1 Frame verzögert ─────────────
               Vorne (links): leicht nach außen  → z = +0.175
               Hinten (rechts): leicht nach innen → z = −0.175
               skinview3d: versuche leftArm.leftForeArm oder leftForeArm         */
            try {
              const lFore = s.leftArm?.leftForeArm ?? s.leftForeArm ?? null;
              if (lFore) {
                /* Wenn vorne (phFore→0): außen +10°;  wenn hinten (phFore→1): innen −10° */
                lFore.rotation.z = lerp(+0.175, -0.175, phFore);
                lFore.rotation.x = 0;
                lFore.rotation.y = 0;
              }
            } catch (_) {}

            /* ── RECHTER OBERARM ────────────────────────────────────────────
               Frame 3 (ph=0, links): HINTER dem Körper nach links
                 x=+25°=+0.436 (hinten), z=+20°=+0.349 (kreuzt links, hinten)
               Frame 1 (ph=1, rechts): VOR dem Körper nach rechts
                 x=−25°=−0.436 (vorne),  z=−30°=−0.524 (außen rechts)

               Schulter mitrotieren: y bewegt sich mit swing
                 swing=+1 (rechts) → rechter Arm vorne → Schulter dreht +8°      */
            s.rightArm.rotation.x = lerp(+0.436, -0.436, ph);
            s.rightArm.rotation.z = lerp(+0.349, -0.524, ph);
            s.rightArm.rotation.y =  swing * 0.140;   /* ±8° Schulter-Rotation */

            /* ── RECHTER UNTERARM (forearm) — 1 Frame verzögert ────────────
               Vorne (rechts): leicht nach innen → z = −0.175
               Hinten (links): leicht nach außen → z = +0.175                    */
            try {
              const rFore = s.rightArm?.rightForeArm ?? s.rightForeArm ?? null;
              if (rFore) {
                /* Wenn vorne (phFore→1): innen −10°;  wenn hinten (phFore→0): außen +10° */
                rFore.rotation.z = lerp(+0.175, -0.175, phFore);
                rFore.rotation.x = 0;
                rFore.rotation.y = 0;
              }
            } catch (_) {}

            /* ── KÖRPER / SCHULTERN — gegenseitig zu den Armen ─────────────
               Frame 1 (swing=+1, rechts): Oberkörper dreht LINKS  +10°
               Frame 3 (swing=−1, links):  Oberkörper dreht RECHTS −10°

               Hüfte: GLEICHE Richtung wie Arme (1–2 Pixel verschieben)
               Frame 1 (Arme RECHTS) → Hüfte position +x (RECHTS) ✓
               Frame 3 (Arme LINKS)  → Hüfte position −x (LINKS)  ✓
               → body.position.x statt rotation.z (Translation, nicht Rotation) */
            s.body.rotation.y =  swing * 0.175;   /* ±10° Körper-Rotation */
            s.body.rotation.z =  0;
            s.body.rotation.x =  0;
            s.body.position.x =  swing * 0.30;    /* ±1–2 Pixel Hüft-Shift */

            /* ── KOPF — Micro-Movement 3° in Gegenrichtung (Anti-stiff) ────
               Profi-Tipp: Kopf kippt ENTGEGEN der Körperdrehung               */
            if (s.head) {
              s.head.rotation.y = -swing * 0.052;  /* ±3° Gegenbewegung */
              s.head.rotation.x =  0;
              s.head.rotation.z =  0;
            }

            /* ── BEINE — 10–15° auseinander + minimaler Weight-Shift ────────
               Startpose: Beine leicht auseinander (0.20 rad ≈ 11.5°)
               Weight-Shift: ±1–2° links/rechts mit jedem Schwung               */
            s.leftLeg.rotation.x  =  swing * 0.03;   /* ±1.7° Weight-Shift */
            s.leftLeg.rotation.z  =  0.20;            /* 11.5° auseinander  */
            s.leftLeg.rotation.y  =  0;
            s.rightLeg.rotation.x = -swing * 0.03;
            s.rightLeg.rotation.z = -0.20;            /* 11.5° auseinander  */
            s.rightLeg.rotation.y =  0;

          } catch (_) {}
        });

      /* ═══════════════════════════════════════════════════════════════
         #1  VICTORY POSE + MINECRAFT CASTLE CROWN
         ═══════════════════════════════════════════════════════════════ */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;

              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                const yTop  = new T.MeshPhongMaterial({ color: 0xFFEE00, specular: 0xFFFF88, shininess: 140, emissive: 0x332200, emissiveIntensity: 0.30 });
                const yMid  = new T.MeshPhongMaterial({ color: 0xEECC00, specular: 0xFFFF44, shininess: 100, emissive: 0x221500, emissiveIntensity: 0.22 });
                const yDark = new T.MeshPhongMaterial({ color: 0xCC9900, specular: 0xDDCC33, shininess: 70,  emissive: 0x110E00, emissiveIntensity: 0.15 });

                const facesWall   = [yMid, yMid, yTop, yDark, yMid, yMid];
                const facesTop    = [yMid, yMid, yTop, yDark, yTop, yMid];
                const facesCenter = [yMid, yMid, yTop, yDark, yTop, yMid];

                const gemPurple = new T.MeshPhongMaterial({ color: 0xDD44FF, specular: 0xFFCCFF, shininess: 200, emissive: 0x9900CC, emissiveIntensity: 0.90 });
                const gemCyan   = new T.MeshPhongMaterial({ color: 0x44CCFF, specular: 0xCCEEFF, shininess: 200, emissive: 0x006688, emissiveIntensity: 0.85 });
                const gemBlue   = new T.MeshPhongMaterial({ color: 0x2255EE, specular: 0x88AAFF, shininess: 200, emissive: 0x001188, emissiveIntensity: 0.85 });
                const gemGreen  = new T.MeshPhongMaterial({ color: 0x11EE44, specular: 0xAAFFCC, shininess: 200, emissive: 0x005511, emissiveIntensity: 0.90 });

                const g  = new T.Group();
                const bx = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                const BW = 10.0, BH = 1.0, BT = 0.80, inner = BW - BT * 2;
                const FZ = BW/2-BT/2, BKZ = -(BW/2-BT/2), LX = -(BW/2-BT/2), RX = BW/2-BT/2;

                bx(facesWall, BW, BH, BT,    0,    BH/2, FZ );
                bx(facesWall, BW, BH, BT,    0,    BH/2, BKZ);
                bx(facesWall, BT, BH, inner, LX,   BH/2, 0  );
                bx(facesWall, BT, BH, inner, RX,   BH/2, 0  );

                const MW = 0.88, MD = BT, MH = 1.45, MHC = 2.20, yB = BH;
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x, i) => {
                  const h   = i === 3 ? MHC : MH;
                  const mat = i === 3 ? facesCenter : facesTop;
                  bx(mat, MW, h, MD, x, yB+h/2, FZ );
                  bx(mat, MW, h, MD, x, yB+h/2, BKZ);
                });
                [-2.0, 0, 2.0].forEach(z => {
                  bx(facesTop, MD, MH, MW, LX, yB+MH/2, z);
                  bx(facesTop, MD, MH, MW, RX, yB+MH/2, z);
                });
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as [number,number][])
                  .forEach(([cx,cz]) => bx(facesTop, BT, MH, BT, cx, yB+MH/2, cz));

                const GS=1.30, GD=0.80, GY=BH/2, GZ=FZ+BT/2+GD/2;
                ([[-2.8,gemPurple],[-0.9,gemCyan],[0.9,gemBlue],[2.8,gemGreen]] as [number,any][])
                  .forEach(([x,mat]) => { const gem=new T.Mesh(new T.BoxGeometry(GS,GS,GD),mat); gem.position.set(x,GY,GZ); g.add(gem); });

                g.position.set(0, 6.0, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.45 + Math.sin(t*1.5)*0.30);
            s.rightArm.rotation.z =   1.45 + Math.sin(t*1.5+Math.PI)*0.30;
            s.leftArm.rotation.x  = -0.20 + Math.sin(t)*0.20;
            s.rightArm.rotation.x = -0.20 - Math.sin(t)*0.20;
            s.head.rotation.y     =  Math.sin(t*0.8)*0.24;
            s.head.rotation.x     = -0.08 + Math.sin(t*1.1)*0.08;
            s.body.rotation.y     =  Math.sin(t*0.5)*0.08;
            s.leftLeg.rotation.x  =  Math.sin(t*1.8)*0.06;
            s.rightLeg.rotation.x = -Math.sin(t*1.8)*0.06;
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
      style={{ width, height, position: 'relative', zIndex: 1, flexShrink: 0, margin: '0 auto' }}
    />
  );
}
