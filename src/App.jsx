import { useState, useCallback } from 'react';
import { MAJI_EPISODES, BEDTIME_TALES, CALM_TALES, EXISTING_STORIES, ALL_STORIES, CONTINUE_READING } from './data';
import { useVoiceSynthesis } from './hooks';

import StarField   from './components/StarField';
import Header      from './components/Header';
import HeroBanner  from './components/HeroBanner';
import ContinueRow from './components/ContinueRow';
import StoryRow    from './components/StoryRow';
import StoryModal  from './components/StoryModal';
import AuthScreen  from './components/AuthScreen';
import ProfileTab  from './components/ProfileTab';

const App = () => {
  const [user,          setUser]          = useState(null);
  const [profile,       setProfile]       = useState(null);
  const [view,          setView]          = useState('home');
  const [selectedStory, setSelectedStory] = useState(null);
  const [calmMode,      setCalmMode]      = useState(false);
  const [showAuth,      setShowAuth]      = useState(false);
  const [authReason,    setAuthReason]    = useState('login');
  const [toast,         setToast]         = useState(null);

  const voice = useVoiceSynthesis();

  useState(() => {
    try {
      const stored = localStorage.getItem('kulala_demo_user');
      if (stored) {
        const p = JSON.parse(stored);
        setUser({ uid: 'demo', email: p.email || 'guest@kulala.app' });
        setProfile(p);
      }
    } catch {}
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleLogin = (u, p) => {
    setUser(u);
    setProfile(p);
    setShowAuth(false);
    showToast(`✦ Welcome, ${p.nickname || 'Dreamer'}!`);
  };

  const handleLogout = () => {
    try { localStorage.removeItem('kulala_demo_user'); } catch {}
    setUser(null);
    setProfile(null);
    setView('home');
    showToast('👋 Until next bedtime!');
  };

  const handlePlayVoice = useCallback((sentences, options) => {
    voice.speakSentences(sentences, {
      voiceType: options.voiceType,
      accent:    options.accent
    });
  }, [voice.speakSentences]);

  const handleStoryOpen = useCallback((story) => {
    if (story.isPremium && !user) {
      setAuthReason('premium');
      setShowAuth(true);
    } else {
      setSelectedStory(story);
    }
  }, [user]);

  if (showAuth && !user) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-void)' }}>
        <StarField />
        <AuthScreen onLogin={handleLogin} reason={authReason} />
        <button
          onClick={() => setShowAuth(false)}
          style={{
            position: 'fixed', top: 22, left: 22, zIndex: 110,
            background: 'none', border: 'none',
            color: 'rgba(242,234,216,0.45)', cursor: 'pointer',
            fontSize: '0.88rem', fontWeight: 600,
            fontFamily: 'var(--font-body)', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f2ead8'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(242,234,216,0.45)'}
        >
          ← Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className={calmMode ? 'calm-mode' : ''} style={{ minHeight: '100vh', background: 'var(--bg-void)' }}>
      <StarField />
      {toast && <div className="toast">{toast}</div>}
      <Header
        userProfile={profile}
        calmMode={calmMode}
        setCalmMode={setCalmMode}
        onOpenProfile={() => {
          if (user) {
            setView(view === 'profile' ? 'home' : 'profile');
          } else {
            setAuthReason('login');
            setShowAuth(true);
          }
        }}
      />
      <main style={{ paddingBottom: 80, position: 'relative', zIndex: 1 }}>
        {view === 'home' ? (
          <>
            <HeroBanner
              story={MAJI_EPISODES[0]}
              onPlay={() => setSelectedStory(MAJI_EPISODES[0])}
            />
            <ContinueRow
              items={CONTINUE_READING}
              stories={ALL_STORIES}
              onOpen={setSelectedStory}
            />
            <div className="deco-line" style={{ marginTop: 48 }} />
            <StoryRow title="Maji's Adventures" stories={MAJI_EPISODES}    onOpen={handleStoryOpen} />
            <StoryRow title="Bedtime Tales"      stories={BEDTIME_TALES}   onOpen={handleStoryOpen} />
            <StoryRow title="Calm & Sleep"       stories={CALM_TALES}      onOpen={handleStoryOpen} />
            <StoryRow title="Bedtime Classics"   stories={EXISTING_STORIES} onOpen={handleStoryOpen} />
            <div style={{ height: 80 }} />
          </>
        ) : (
          <div>
            <div style={{ padding: '1.5rem 1.75rem 0', position: 'relative', zIndex: 1 }}>
              <button
                onClick={() => setView('home')}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(242,234,216,0.45)', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.88rem', marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-body)', transition: 'color 0.2s',
                  marginTop: 90,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#f2ead8'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(242,234,216,0.45)'}
              >
                ← Return to Library
              </button>
            </div>
            <ProfileTab userProfile={profile} onLogout={handleLogout} />
          </div>
        )}
      </main>
      <StoryModal
        story={selectedStory}
        isOpen={!!selectedStory}
        onClose={() => { setSelectedStory(null); voice.stop(); }}
        voiceState={voice}
        onPlayVoice={handlePlayVoice}
        userName={profile?.nickname}
      />
    </div>
  );
};

export default App;
