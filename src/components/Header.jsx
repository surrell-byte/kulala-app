import { memo } from 'react';

const Header = memo(({ userProfile, calmMode, setCalmMode, onOpenProfile }) => (
  <header className="kulala-header">
    <div className="header-logo">
      <span>🌙</span>
      Kulala
      <span className="logo-dot" />
    </div>
    <div className="header-actions">
      <button
        className={`header-btn${calmMode ? ' calm-active' : ''}`}
        onClick={() => setCalmMode(v => !v)}
        title="Toggle calm mode"
      >
        {calmMode ? '🌿 Calm On' : '🌿 Calm'}
      </button>
      <button
        className="avatar-btn"
        onClick={onOpenProfile}
        title={userProfile ? 'My Profile' : 'Sign In'}
      >
        {userProfile?.avatar || (userProfile ? '👤' : '✦')}
      </button>
    </div>
  </header>
));

export default Header;
