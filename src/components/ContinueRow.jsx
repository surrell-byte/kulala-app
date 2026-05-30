import { memo } from 'react';

const ContinueRow = memo(({ items, stories, onOpen }) => {
  if (!items?.length) return null;
  return (
    <section className="continue-row">
      <p className="section-label" style={{ marginBottom: 14 }}>Continue Exploring</p>
      <div className="story-scroll scrollbar-hide">
        {items.map(item => {
          const story = stories.find(s => s.id === item.id);
          if (!story) return null;
          return (
            <div key={item.id} className="continue-card" onClick={() => onOpen(story)}>
              <div className="continue-thumb">
                <img src={item.cover} alt={item.title} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: 'var(--ivory)', fontWeight: 600, fontSize: '0.83rem',
                  marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis', fontFamily: 'var(--font-body)'
                }}>
                  {item.title}
                </p>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: item.progress + '%', animation: 'progressFill 1s ease' }}
                  />
                </div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(242,234,216,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {item.progress}% Complete
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default ContinueRow;
