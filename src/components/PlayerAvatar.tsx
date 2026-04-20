import { useState } from 'react';

interface PlayerAvatarProps {
  username: string;
  size?: number;
  className?: string;
  mode?: 'head' | 'bust' | 'body';
}

export default function PlayerAvatar({ username, size = 32, className = '', mode = 'head' }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);

  let src: string;
  if (failed || mode === 'head') {
    src = `https://mc-heads.net/avatar/${username}/${size}`;
  } else if (mode === 'body' || mode === 'bust') {
    src = `https://mc-heads.net/player/${username}`;
  } else {
    src = `https://mc-heads.net/avatar/${username}/${size}`;
  }

  if (failed) {
    src = `https://ui-avatars.com/api/?name=${username}&size=${size}&background=1a1a2d&color=ffffff&bold=true&format=png`;
  }

  const imgStyle: React.CSSProperties = { imageRendering: 'pixelated' };
  const displaySize = mode === 'head' ? size : undefined;

  return (
    <img
      src={src}
      alt={username}
      width={displaySize}
      height={displaySize}
      loading="lazy"
      decoding="async"
      className={`player-avatar ${className}`}
      onError={() => setFailed(true)}
      style={imgStyle}
    />
  );
}
