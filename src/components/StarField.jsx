import { useMemo } from 'react';

const StarField = () => {
  const stars = useMemo(() =>
    [...Array(44)].map((_, i) => ({
      id:      i,
      size:    Math.random() * 2.4 + 1,
      left:    Math.random() * 100,
      top:     Math.random() * 82,
      twDur:   (Math.random() * 4 + 5).toFixed(1),
      flDur:   (Math.random() * 60 + 60).toFixed(0),
      delay:   (Math.random() * 12).toFixed(1),
      opacity: Math.random() * 0.35 + 0.25,
    })), []
  );

  return (
    <div className="star-field">
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
