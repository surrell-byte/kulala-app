import { useState, useEffect, useCallback, useMemo } from 'react';
import { MAJI_EPISODES, BEDTIME_TALES, CALM_TALES, EXISTING_STORIES, CONTINUE_READING } from './data';
import { useVoiceSynthesis } from './hooks';
import {
  backendStatus,
  getCurrentSession,
  getProfile,
  getStory,
  listFavorites,
  listProgress,
  listStories,
  onAuthStateChange,
  saveProgress as saveRemoteProgress,
  setFavorite,
  signOut,
  startCheckout,
  upsertProfile,
} from './services/kulalaApi';

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

const LOCAL_GROUPS = {
  maji: MAJI_EPISODES,
  bedtime: BEDTIME_TALES,
  calm: CALM_TALES,
  classic: EXISTING_STORIES,
};

const groupStories = (stories) => ({
  maji: stories.filter(story => story.collection === 'maji'),
  bedtime: stories.filter(story => story.collection === 'bedtime'),
  calm: stories.filter(story => story.collection === 'calm'),
  classic: stories.filter(story => story.collection === 'classic'),
});

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
  const [storyGroups,   setStoryGroups]   = useState(LOCAL_GROUPS);

  const voice = useVoiceSynthesis();

  const allStories = useMemo(
    () => [
      ...storyGroups.maji,
      ...storyGroups.classic,
      ...storyGroups.bedtime,
      ...storyGroups.calm,
    ],
    [storyGroups]
  );

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const loadUserLibrary = useCallback(async (currentUser) => {
    if (!backendStatus.isConfigured || !currentUser) return;
    const [remoteFavorites, remoteProgress] = await Promise.all([
      listFavorites(currentUser),
      listProgress(currentUser),
    ]);
    setFavorites(remoteFavorites);
    setStoryProgress(remoteProgress);
  }, []);

  /* ── Restore auth session ────────────────────────────────────────── */
  useEffect(() => {
    if (backendStatus.isConfigured) {
      let isMounted = true;
      getCurrentSession()
        .then(async ({ user: currentUser, profile: currentProfile }) => {
          if (!isMounted) return;
          setUser(currentUser);
          setProfile(currentProfile);
          if (currentUser) await loadUserLibrary(currentUser);
        })
        .catch(err => console.error('Failed to restore Supabase session:', err));

      const unsubscribe = onAuthStateChange(async (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
          setProfile(null);
          setFavorites([]);
          setStoryProgress({});
          return;
        }
        try {
          const currentProfile = await getProfile(currentUser);
          setProfile(currentProfile);
          await loadUserLibrary(currentUser);
        } catch (err) {
          console.error('Failed to load user library:', err);
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

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
  }, [loadUserLibrary]);

  /* ── Load story catalog from Supabase when configured ─────────────── */
  useEffect(() => {
    if (!backendStatus.isConfigured) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      showToast('Premium checkout complete. Your access will update shortly.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('checkout') === 'cancelled') {
      showToast('Checkout cancelled.');
      window.history.replaceState({}, '', window.location.pathname);
    }

    listStories()
      .then(stories => {
        if (stories?.length) setStoryGroups(groupStories(stories));
      })
      .catch(err => {
        console.error('Failed to load remote stories. Falling back to local data:', err);
      });
  }, [showToast]);

  /* ── Load favorites from localStorage ────────────────────────────── */
  useEffect(() => {
    if (backendStatus.isConfigured && user) return;
    try {
      const stored = localStorage.getItem('kulala_favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, [user]);

  /* ── Load story progress from localStorage ────────────────────────── */
  useEffect(() => {
    if (backendStatus.isConfigured && user) return;
    try {
      const stored = localStorage.getItem('kulala_story_progress');
      if (stored) setStoryProgress(JSON.parse(stored));
    } catch {}
  }, [user]);

  /* ── Persist favorites ────────────────────────────────────────────── */
  useEffect(() => {
    if (backendStatus.isConfigured && user) return;
    try {
      localStorage.setItem('kulala_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites, user]);

  /* ── Persist story progress ───────────────────────────────────────── */
  useEffect(() => {
    if (backendStatus.isConfigured && user) return;
    try {
      localStorage.setItem('kulala_story_progress', JSON.stringify(storyProgress));
    } catch {}
  }, [storyProgress, user]);

  const handleLogin = (u, p) => {
    setUser(u);
    setProfile(p);
    setShowAuth(false);
    showToast(`✦ Welcome, ${p?.nickname || 'Dreamer'}!`);
    loadUserLibrary(u).catch(err => console.error('Failed to load user library:', err));
  };

  const handleLogout = async () => {
    if (backendStatus.isConfigured) {
      try {
        await signOut();
      } catch (err) {
        showToast(err.message || 'Could not sign out.');
        return;
      }
    } else {
      try { localStorage.removeItem('kulala_demo_user'); } catch {}
    }
    setUser(null);
    setProfile(null);
    setFavorites([]);
    setStoryProgress({});
    setView('home');
    showToast('👋 Until next bedtime!');
  };

  const handleSaveProfile = useCallback(async ({ user: currentUser, profile: nextProfile }) => {
    if (backendStatus.isConfigured && currentUser) {
      const updated = await upsertProfile({ user: currentUser, profile: nextProfile });
      setProfile(updated);
      return;
    }
    try { localStorage.setItem('kulala_demo_user', JSON.stringify(nextProfile)); } catch {}
    setProfile(nextProfile);
  }, []);

  /* ── Favorites helpers ────────────────────────────────────────────── */
  const isFavorite = useCallback((storyId) => favorites.includes(storyId), [favorites]);

  const toggleFavorite = useCallback((storyId) => {
    setFavorites(prev => {
      const wasFavorite = prev.includes(storyId);
      const next = wasFavorite
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId];
      if (backendStatus.isConfigured && user) {
        setFavorite({ user, storyId, isFavorite: !wasFavorite })
          .catch(err => {
            console.error('Failed to save favorite:', err);
            showToast('Could not sync saved story.');
          });
      }
      showToast(next.includes(storyId) ? '⭐ Added to Saved' : '✦ Removed from Saved');
      return next;
    });
  }, [showToast, user]);

  /* ── Story progress helpers ───────────────────────────────────────── */
  const saveProgress = useCallback((storyId, percent, sentenceIndex) => {
    setStoryProgress(prev => ({
      ...prev,
      [storyId]: { percent, sentenceIndex, updatedAt: Date.now() }
    }));
    if (backendStatus.isConfigured && user) {
      saveRemoteProgress({ user, storyId, percent, sentenceIndex })
        .catch(err => console.error('Failed to save story progress:', err));
    }
  }, [user]);

  const getProgress = useCallback((storyId) => storyProgress[storyId] || null, [storyProgress]);

  /* ── Continue Reading: real data from progress ────────────────────── */
  const continueReadingStories = allStories
    .filter(s => storyProgress[s.id]?.percent > 0 && storyProgress[s.id]?.percent < 100)
    .sort((a, b) => (storyProgress[b.id]?.updatedAt || 0) - (storyProgress[a.id]?.updatedAt || 0))
    .slice(0, 6);

  const handlePlayVoice = useCallback((sentences, options) => {
    if (options.audio) {
      voice.playAudio(options.audio, sentences);
      return;
    }
    voice.speakSentences(sentences, {
      voiceType: options.voiceType,
      accent:    options.accent
    });
  }, [voice.playAudio, voice.speakSentences]);

  const handleStoryOpen = useCallback((story) => {
    const openStory = async () => {
      if (story.isPremium && !user) {
        setAuthReason('premium');
        setShowAuth(true);
        return;
      }

      if (backendStatus.isConfigured && story.isPremium && !profile?.hasPremium) {
        showToast('Opening premium checkout...');
        try {
          await startCheckout();
        } catch (err) {
          console.error('Failed to start checkout:', err);
          showToast('Premium checkout is not configured yet.');
        }
        return;
      }

      if (backendStatus.isConfigured) {
        try {
          const fullStory = await getStory(story.id);
          if (fullStory?.body) {
            setSelectedStory(fullStory);
            return;
          }
          if (story.isPremium) {
            showToast('Premium access is required for this story.');
            return;
          }
        } catch (err) {
          console.error('Failed to load story:', err);
          showToast('Could not load this story.');
          return;
        }
      }

      setSelectedStory(story);
    };

    openStory();
  }, [profile?.hasPremium, showToast, user]);

  const handleDirectStoryOpen = useCallback((story) => {
    if (story?.isPremium) {
      handleStoryOpen(story);
      return;
    }
    setSelectedStory(story);
  }, [handleStoryOpen]);

  const handleShareStory = useCallback(async (story) => {
    if (!story || typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    url.searchParams.set('story', story.id);
    url.searchParams.delete('checkout');

    const shareData = {
      title: story.title,
      text: `Listen to "${story.title}" on Kulala.`,
      url: url.toString(),
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return 'shared';
      } catch (err) {
        if (err?.name === 'AbortError') return null;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        return 'copied';
      } catch {}
    }

    window.prompt('Copy this story link:', shareData.url);
    return 'copied';
  }, []);

  const handleFeaturedStoryOpen = useCallback(() => {
    if (storyGroups.maji[0]) handleStoryOpen(storyGroups.maji[0]);
  }, [handleStoryOpen, storyGroups.maji]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('story');
    if (!storyId || selectedStory) return;
    const story = allStories.find(item => item.id === storyId);
    if (story) handleStoryOpen(story);
  }, [allStories, handleStoryOpen, selectedStory]);

  const handleNavChange = (tabId) => {
    if (tabId === 'profile' && !user) {
      setAuthReason('login');
      setShowAuth(true);
      return;
    }
    setView(tabId);
  };

  /* ── Favorites view content ───────────────────────────────────────── */
  const favoriteStories = allStories.filter(s => favorites.includes(s.id));

  /* ─────────────────────────────────────────────────────────────────── */

  if (showAuth && !user) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-void)' }}>
        <BackgroundWorld />
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
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      <Header
        userProfile={profile}
        calmMode={calmMode}
        setCalmMode={setCalmMode}
        onOpenProfile={() => handleNavChange('profile')}
        onOpenHome={() => setView('home')}
      />

      <main id="main-content" style={{ paddingBottom: 72, position: 'relative', zIndex: 1 }}>
        {/* ── HOME ─────────────────────────────────────────────────── */}
        {view === 'home' && (
          <>
            <HeroBanner
              story={storyGroups.maji[0]}
              onPlay={handleFeaturedStoryOpen}
              onMoreInfo={handleFeaturedStoryOpen}
            />
            {continueReadingStories.length > 0 && (
              <ContinueRow
                items={continueReadingStories.map(s => ({
                  ...s,
                  progress: storyProgress[s.id]?.percent || 0
                }))}
                stories={allStories}
                onOpen={handleDirectStoryOpen}
              />
            )}
            {continueReadingStories.length === 0 && (
              <ContinueRow
                items={CONTINUE_READING}
                stories={allStories}
                onOpen={handleDirectStoryOpen}
              />
            )}
            <div className="deco-line" style={{ marginTop: 48 }} />
            <StoryRow title="Maji's Adventures" stories={storyGroups.maji}     onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Tales"      stories={storyGroups.bedtime} onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Calm & Sleep"        stories={storyGroups.calm}    onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Classics"    stories={storyGroups.classic} onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <div style={{ height: 80 }} />
          </>
        )}

        {/* ── LIBRARY ──────────────────────────────────────────────── */}
        {view === 'library' && (
          <div style={{ paddingTop: 'calc(var(--header-h) + 1.5rem)', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '0 var(--page-px)', marginBottom: '0.5rem' }}>
              <span className="section-label">All Stories</span>
            </div>
            <StoryRow title="Maji's Adventures" stories={storyGroups.maji}     onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Tales"      stories={storyGroups.bedtime} onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Calm & Sleep"        stories={storyGroups.calm}    onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
            <StoryRow title="Bedtime Classics"    stories={storyGroups.classic} onOpen={handleStoryOpen} isFavorite={isFavorite} onFavorite={toggleFavorite} />
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
                ← Return to Home
              </button>
            </div>
            <ProfileTab user={user} userProfile={profile} onLogout={handleLogout} onSaveProfile={handleSaveProfile} />
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
        onShare={handleShareStory}
        userPreferences={profile}
      />
    </div>
  );
};

export default App;
