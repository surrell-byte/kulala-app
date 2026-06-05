import { memo } from 'react';

const Header = memo(({ userProfile, calmMode, setCalmMode, onOpenProfile, onOpenHome }) => (
  <header className="kulala-header" role="banner">
    <a className="skip-link" href="#main-content">Skip to stories</a>
    <button type="button" className="header-logo" onClick={onOpenHome} aria-label="Go to home">
      <span aria-hidden="true">🌙</span>
      <span>Kulala</span>
      <span className="logo-dot" aria-hidden="true" />
    </button>
    <div className="header-actions" role="group" aria-label="Account and display controls">
      <button
        type="button"
        className={`header-btn${calmMode ? ' calm-active' : ''}`}
        onClick={() => setCalmMode(v => !v)}
        aria-pressed={calmMode}
        aria-label={calmMode ? 'Turn calm mode off' : 'Turn calm mode on'}
      >
        <span aria-hidden="true">🌿</span>
        <span>{calmMode ? 'Calm on' : 'Calm'}</span>
      </button>
      <button
        type="button"
        className="avatar-btn"
        onClick={onOpenProfile}
        aria-label={userProfile ? 'Open profile' : 'Sign in'}
      >
        <span aria-hidden="true">{userProfile?.avatar || (userProfile ? '👤' : '✦')}</span>
      </button>
    </div>
  </header>
));

export default Header;
