import { useMemo } from 'react';

/**
 * BackgroundWorld
 * Renders decorative floating orbs / ambient glows that sit behind all content.
 * Pure visual — no props required.
 */
const BackgroundWorld = () => {
  const orbs = useMemo(() => [
    { id: 1, size: 420, top: '-8%',  left: '-10%', color: 'rgba(100,60,180,0.13)', blur: 90,  dur: 28 },
    { id: 2, size: 320, top: '30%',  left: '70%',  color: 'rgba(232,168,62,0.07)', blur: 70,  dur: 34 },
    { id: 3, size: 260, top: '70%',  left: '10%',  color: 'rgba(60,120,180,0.09)', blur: 60,  dur: 22 },
    { id: 4, size: 180, top: '55%',  left: '50%',  color: 'rgba(180,80,120,0.07)', blur: 50,  dur: 40 },
    { id: 5, size: 140, top: '10%',  left: '55%',  color: 'rgba(80,180,140,0.06)', blur: 40,  dur: 18 },
  ], []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {orbs.map(orb => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            borderRadius: '50%',
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            animation: `floatOrb ${orb.dur}s ease-in-out infinite alternate`,
            willChange: 'transform',
          }}
        />
      ))}

      {/* Subtle radial vignette to deepen the void feel at the edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgba(5,4,14,0.55) 100%)',
        }}
      />
    </div>
  );
};

export default BackgroundWorld;