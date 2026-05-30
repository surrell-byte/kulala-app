import { useMemo } from 'react';

const StarField = () => {
  const stars = useMemo(() =>
    [...Array(80)].map((_, i) => ({
      id:      i,
      size:    Math.random() * 2.2 + 0.4,
      left:    Math.random() * 100,
      top:     Math.random() * 200,
      twDur:   (Math.random() * 4 + 2).toFixed(1),
      flDur:   (Math.random() * 30 + 18).toFixed(0),
      delay:   (Math.random() * 10).toFixed(1),
      opacity: Math.random() * 0.6 + 0.2,
    })), []
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', overflow: 'hidden', zIndex: 0
    }}>
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            width:  s.size + 'px',
            height: s.size + 'px',
            left:   s.left + '%',
            top:    s.top + '%',
            '--tw-dur': s.twDur + 's',
            '--fl-dur': s.flDur + 's',
            animationDelay: s.delay + 's',
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
