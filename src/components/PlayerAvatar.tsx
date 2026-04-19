import { useState } from 'react';

interface PlayerAvatarProps {
  username: string;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ username, size = 32, className = '' }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);

  const src = failed
    ? `https://ui-avatars.com/api/?name=${username}&size=${size}&background=1a1a2d&color=ffffff&bold=true&format=png`
    : `https://mc-heads.net/avatar/${username}/${size}`;

  return (
    <img
      src={src}
      alt={username}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`player-avatar ${className}`}
      onError={() => setFailed(true)}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
