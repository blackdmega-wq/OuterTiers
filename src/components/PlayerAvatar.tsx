import { useState } from 'react';

interface PlayerAvatarProps {
  username: string;
  size?: number;
  className?: string;
  mode?: 'head' | 'bust' | 'body' | 'face3d';
}

export default function PlayerAvatar({ username, size = 32, className = '', mode = 'head' }: PlayerAvatarProps) {
  const [stage, setStage] = useState(0);
  const advance = () => setStage(s => s + 1);

  if (mode === 'face3d') {
    const srcs = [
      `https://crafatar.com/renders/head/${username}?size=256&overlay&default=MHF_Steve`,
      `https://visage.surgeplay.com/head/256/${username}`,
      `https://mc-heads.net/avatar/${username}/256`,
      `https://ui-avatars.com/api/?name=${username}&size=256&background=0d1117&color=60a5fa&bold=true&format=png`,
    ];
    const src = srcs[Math.min(stage, srcs.length - 1)];
    return (
      <img
        src={src}
        alt={username}
        loading="eager"
        decoding="async"
        className={`player-avatar player-avatar--3d ${className}`}
        onError={advance}
        style={{
          imageRendering: stage >= 2 ? 'pixelated' : 'auto',
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: stage === 0 ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' : undefined,
        }}
      />
    );
  }

  if (mode === 'body' || mode === 'bust') {
    const srcs = [
      `https://mc-heads.net/player/${username}`,
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
    `https://mc-heads.net/avatar/${username}/${size}`,
    `https://crafatar.com/avatars/${username}?size=${size}&overlay&default=MHF_Steve`,
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
