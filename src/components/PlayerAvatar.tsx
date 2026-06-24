import { useState, useEffect } from 'react';

interface PlayerAvatarProps {
  username: string;
  size?: number;
  className?: string;
  mode?: 'head' | 'bust' | 'body' | 'face3d';
}

export default function PlayerAvatar({ username, size = 32, className = '', mode = 'head' }: PlayerAvatarProps) {
  const [stage, setStage] = useState(0);
  const advance = () => setStage(s => s + 1);

  // Reset to primary source whenever the player identifier changes
  useEffect(() => { setStage(0); }, [username]);

  if (mode === 'face3d') {
    const srcs = [
      `https://minotar.net/helm/${username}/256`,
      `https://mc-heads.net/avatar/${username}/256`,
      `https://visage.surgeplay.com/face/256/${username}`,
      `https://ui-avatars.com/api/?name=${username}&size=256&background=0d1117&color=60a5fa&bold=true&format=png`,
    ];
    const src = srcs[Math.min(stage, srcs.length - 1)];
    return (
      <img
        src={src}
        alt={username}
        loading="eager"
        decoding="async"
        className={`player-avatar player-avatar--face ${className}`}
        onError={advance}
        style={{
          imageRendering: 'pixelated',
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  }

  if (mode === 'body' || mode === 'bust') {
    const srcs = [
      `https://minotar.net/body/${username}/128`,
      `https://crafatar.com/renders/body/${username}?size=128&overlay&default=MHF_Steve`,
      `https://ui-avatars.com/api/?name=${username}&size=${size}&background=1a1a2d&color=ffffff&bold=true&format=png`,
    ];
    const src = srcs[Math.min(stage, srcs.length - 1)];
    return (
      <img
        src={src}
        alt={username}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`player-avatar ${className}`}
        onError={advance}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  const srcs = [
    `https://minotar.net/helm/${username}/${size}`,
    `https://mc-heads.net/avatar/${username}/${size}`,
    `https://visage.surgeplay.com/face/${size}/${username}`,
    `https://ui-avatars.com/api/?name=${username}&size=${size}&background=1a1a2d&color=ffffff&bold=true&format=png`,
  ];
  const src = srcs[Math.min(stage, srcs.length - 1)];

  return (
    <img
      src={src}
      alt={username}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`player-avatar ${className}`}
      onError={advance}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
