import { useState, useEffect, useCallback } from 'react';
import { MAJI_EPISODES, BEDTIME_TALES, CALM_TALES, EXISTING_STORIES, ALL_STORIES, CONTINUE_READING } from './data';
import { useVoiceSynthesis } from './hooks';

import StarField        from './components/StarField';
import BackgroundWorld from './components/BackgroundWorld';
import Header      from './components/Header';
import HeroBanner  from './components/HeroBanner';
import ContinueRow from './components/ContinueRow';
import StoryRow    from './components/StoryRow';
import StoryModal  from './components/StoryModal';
import AuthScreen  from './components/AuthScreen';
import ProfileTab  from './components/ProfileTab';

/* ─── Bottom nav tabs ───────────────────────────────────────────────── */
const NAV_TABS = [
  { id: 'home',      label: 'Home',    icon: '🏠' },
  { id: 'library',   label: 'Library', icon: '📚' },
  { id: 'favorites', label: 'Saved',   icon: '⭐' },
  { id: 'profile',   label: 'Me',      icon: '👤' },
];

const App = () => {
  const [user,          setUser]          = useState(null);
  const [profile,       setProfile]       = useState(null);
  const [view,          setView]          = useState('home');
  const [selectedStory, setSelectedStory] = useState(null);
  const [calmMode,      setCalmMode]      = useState(false);
  const [showAuth,      setShowAuth]      = useState(false);
  const [authReason,    setAuthReason]    = useState('login');
  const [toast,         setToast]         = useState(null);
  const [favorites,     setFavorites]     = useState([]);
  const [storyProgress, setStoryProgress] = useState({});

  const voice = useVoiceSynthesis();

  /* ── 1. FIXED: useEffect instead of useState for side-effects ─────── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kulala_demo_user');
      if (stored) {
        const p = JSON.parse(stored);
        setUser({ uid: 'demo', email: p.email || 'guest@kulala.app' });
        setProfile(p);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
    }
  }, []);

  /* ── Load favorites from localStorage ────────────────────────────── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kulala_favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  /* ── Load story progress from localStorage ────────────────────────── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kulala_story_progress');
      if (stored) setStoryProgress(JSON.parse(stored));
    } catch {}
  }, []);

  /* ── Persist favorites ────────────────────────────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem('kulala_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  /* ── Persist story progress ───────────────────────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem('kulala_story_progress', JSON.stringify(storyProgress));
    } catch {}
  }, [storyProgress]);

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

  /* ── Favorites helpers ────────────────────────────────────────────── */
  const isFavorite = useCallback((storyId) => favorites.includes(storyId), [favorites]);

  const toggleFavorite = useCallback((storyId) => {
    setFavorites(prev => {
      const next = prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId];
      showToast(next.includes(storyId) ? '⭐ Added to Saved' : '✦ Removed from Saved');
      return next;
    });
  }, []);

  /* ── Story progress helpers ───────────────────────────────────────── */
  const saveProgress = useCallback((storyId, percent, sentenceIndex) => {
    setStoryProgress(prev => ({
      ...prev,
      [storyId]: { percent, sentenceIndex, updatedAt: Date.now() }
    }));
  }, []);

  const getProgress = useCallback((storyId) => storyProgress[storyId] || null, [storyProgress]);

  /* ── Continue Reading: real data from progress ────────────────────── */
  const continueReadingStories = ALL_STORIES
    .filter(s => storyProgress[s.id]?.percent > 0 && storyProgress[s.id]?.percent < 100)
    .sort((a, b) => (storyProgress[b.id]?.updatedAt || 0) - (storyProgress[a.id]?.updatedAt || 0))
    .slice(0, 6);

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

  const handleNavChange = (tabId) => {
    if (tabId === 'profile' && !user) {
      setAuthReason('login');
      setShowAuth(true);
      return;
    }
    setView(tabId);
  };

  /* ── Favorites view content ───────────────────────────────────────── */
  const favoriteStories = ALL_STORIES.filter(s => favorites.includes(s.id));

  /* ─────────────────────────────────────────────────────────────────── */

  if (showAuth && !user) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-void)' }}>
        <BackgroundWorld />
        <StarField />
        <AuthScreen onLogin={handleLogin} reason={authReason} />
        <button
          onClick={() => setShowAuth(false)}
          aria-label="Back to Library"
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
      <BackgroundWorld />
      <StarField />
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      <Header
        userProfile={profile}
        calmMode={calmMode}
        setCalmMode={setCalmMode}
        onOpenProfile={() => handleNavChange('profile')}
      />

      <main style={{ paddingBottom: 72, position: 'relative', zIndex: 1 }}>
        {/* ── HOME ─────────────────────────────────────────────────── */}
        {view === 'home' && (
          <>
            <HeroBanner
              story={MAJI_EPISODES[0]}
              onPlay={() => setSelectedStory(MAJI_EPISODES[0])}
            />
            {continueReadingStories.length > 0 && (
              <ContinueRow
                items={continueReadingStories.map(s => ({
                  ...s,
                  progress: storyProgress[s.id]?.percent || 0
                }))}
                stories={ALL_STORIES}
                onOpen={setSelectedStory}
              />
            )}
            {continueReadingStories.length === 0 && (
              <ContinueRow
                items={CONTINUE_READING}
                stories={ALL_STORIES}
                onOpen={setSelectedStory}
              />
            )}
            <div className="deco-line" style={{ marginTop: 48 }} />
            <StoryRow title="Maji's Adventures" stories={MAJI_EPISODES}     onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Tales"      stories={BEDTIME_TALES}    onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Calm & Sleep"        stories={CALM_TALES}       onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Classics"    stories={EXISTING_STORIES} onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <div style={{ height: 80 }} />
          </>
        )}

        {/* ── LIBRARY ──────────────────────────────────────────────── */}
        {view === 'library' && (
          <div style={{ paddingTop: 'calc(var(--header-h) + 1.5rem)', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '0 var(--page-px)', marginBottom: '0.5rem' }}>
              <span className="section-label">All Stories</span>
            </div>
            <StoryRow title="Maji's Adventures" stories={MAJI_EPISODES}     onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Tales"      stories={BEDTIME_TALES}    onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Calm & Sleep"        stories={CALM_TALES}       onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Classics"    stories={EXISTING_STORIES} onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <div style={{ height: 80 }} />
          </div>
        )}

        {/* ── FAVORITES ────────────────────────────────────────────── */}
        {view === 'favorites' && (
          <div style={{ paddingTop: 'calc(var(--header-h) + 1.5rem)', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '0 var(--page-px) 1rem' }}>
              <span className="section-label">Saved Stories</span>
            </div>
            {favoriteStories.length === 0 ? (
              <div style={{
                padding: '4rem var(--page-px)',
                textAlign: 'center',
                color: 'var(--ivory-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                lineHeight: 1.7,
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
                <div style={{ fontWeight: 600, color: 'var(--ivory-dim)', marginBottom: 8 }}>No saved stories yet</div>
                <div>Tap the star on any story to save it here for easy access.</div>
              </div>
            ) : (
              <>
                <StoryRow
                  title={`${favoriteStories.length} saved`}
                  stories={favoriteStories}
                  onOpen={handleStoryOpen}
                  isFavorite={isFavorite}
                  onFavorite={toggleFavorite}
                />
                <div style={{ height: 80 }} />
              </>
            )}
          </div>
        )}

        {/* ── PROFILE ──────────────────────────────────────────────── */}
        {view === 'profile' && (
          <div>
            <div style={{ padding: '1.5rem 1.75rem 0', position: 'relative', zIndex: 1 }}>
              <button
                onClick={() => setView('home')}
                aria-label="Return to Home"
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

      {/* ── BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            className={`bottom-nav-btn${view === tab.id ? ' active' : ''}`}
            onClick={() => handleNavChange(tab.id)}
            aria-label={tab.label}
            aria-current={view === tab.id ? 'page' : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <StoryModal
        story={selectedStory}
        isOpen={!!selectedStory}
        onClose={() => { setSelectedStory(null); voice.stop(); }}
        voiceState={voice}
        onPlayVoice={handlePlayVoice}
        userName={profile?.nickname}
        isFavorite={selectedStory ? isFavorite(selectedStory.id) : false}
        onFavorite={selectedStory ? () => toggleFavorite(selectedStory.id) : undefined}
        onSaveProgress={saveProgress}
        getProgress={getProgress}
      />
    </div>
  );
};

export default App;