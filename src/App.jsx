import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import useVoiceSynthesis from './hooks/useVoiceSynthesis';
import { ALL_STORIES, CONTINUE_READING, SOUNDS, BADGES } from './data/stories';
import { generateFallbackCover, showStreakMessage } from './utils/helpers';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeroBanner } from './components/HeroBanner';
import { StoryRow } from './components/StoryRow';
import { ContinueRow } from './components/ContinueRow';
import { BackgroundSoundSelector } from './components/BackgroundSoundSelector';
import { StoryModal } from './components/StoryModal';
import { ProfileTab } from './components/ProfileTab';
import { StarField } from './components/StarField';
import canvasConfetti from 'canvas-confetti';

function App() {
  // ----- State -----
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('kulala_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('kulala_progress');
    return saved ? JSON.parse(saved) : { streak: 0, lastReadDate: null, totalStoriesRead: 0, categoryReads: {}, nightReads: 0, storyProgress: {} };
  });
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('kulala_badges');
    return saved ? JSON.parse(saved) : [];
  });
  const [isPremium, setIsPremium] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sleepModeActive, setSleepModeActive] = useState(false);
  const [sleepEndTime, setSleepEndTime] = useState(null);
  const [sleepTimerId, setSleepTimerId] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [activeSound, setActiveSound] = useState(null);
  const [soundVolume, setSoundVolume] = useState(0.3);
  const [voiceType, setVoiceType] = useState("female");
  const [accent, setAccent] = useState("west");
  const [showMoral, setShowMoral] = useState(true);
  const [calmMode, setCalmMode] = useState(false);
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [bedtimeProgress, setBedtimeProgress] = useState(0);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [currentStoryProgress, setCurrentStoryProgress] = useState(0);
  const audioRef = useRef(null);
  const voice = useVoiceSynthesis();

  // ----- Effects -----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            setIsPremium(data.isPremium === true);
          } else {
            const fallback = { nickname: firebaseUser.email.split('@')[0], age: "4-6", avatar: "🌙", isPremium: false };
            await setDoc(docRef, fallback);
            setUserProfile(fallback);
            setIsPremium(false);
          }
        } catch (err) { console.error(err); }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsPremium(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('kulala_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('kulala_progress', JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem('kulala_badges', JSON.stringify(badges)); }, [badges]);

  useEffect(() => {
    if (activeSound && SOUNDS[activeSound]) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(SOUNDS[activeSound]);
      audio.loop = true;
      audio.volume = soundVolume;
      audio.play();
      audioRef.current = audio;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [activeSound, soundVolume]);

  useEffect(() => {
    if (!bedtimeMode) return;
    let start = Date.now();
    const duration = 2 * 60 * 1000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progressVal = Math.min(elapsed / duration, 1);
      setBedtimeProgress(progressVal);
      const dimmer = document.querySelector('.sleep-dimmer');
      if (dimmer) dimmer.style.opacity = 0.3 + progressVal * 0.5;
      if (audioRef.current) audioRef.current.volume = soundVolume * (1 - progressVal * 0.8);
      voice.setRate(0.85 - progressVal * 0.25);
      if (progressVal >= 1) {
        voice.stop();
        closeModal();
        setBedtimeMode(false);
        setBedtimeProgress(0);
        if (dimmer) dimmer.style.opacity = 0;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [bedtimeMode]);

  useEffect(() => {
    if (!sleepEndTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((sleepEndTime - Date.now()) / 60000));
      setSleepTimerRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepEndTime]);

  useEffect(() => {
    if (calmMode) document.body.classList.add('calm-mode');
    else document.body.classList.remove('calm-mode');
  }, [calmMode]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = voice.isPlaying ? 0.1 : soundVolume;
  }, [voice.isPlaying, soundVolume]);

  // ----- Helper functions -----
  const updateStoryProgress = (story, percentage) => {
    const storyProgress = { ...progress.storyProgress, [story.id]: percentage };
    setProgress(prev => ({ ...prev, storyProgress }));
    setNowPlaying(prev => prev ? { ...prev, progress: percentage } : null);
    if (percentage >= 99) {
      canvasConfetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => alert("🌙 You're building a beautiful bedtime habit"), 1000);
      const today = new Date().toDateString();
      let newStreak = progress.streak;
      let streakIncreased = false;
      if (progress.lastReadDate !== today) {
        if (progress.lastReadDate === new Date(Date.now() - 86400000).toDateString()) {
          newStreak += 1;
          streakIncreased = true;
        } else {
          newStreak = 1;
          streakIncreased = true;
        }
      }
      const isNight = new Date().getHours() >= 20 || new Date().getHours() < 5;
      const newProgress = {
        ...progress,
        streak: newStreak,
        lastReadDate: today,
        totalStoriesRead: progress.totalStoriesRead + 1,
        categoryReads: { ...progress.categoryReads, [story.category]: (progress.categoryReads[story.category] || 0) + 1 },
        nightReads: progress.nightReads + (isNight ? 1 : 0),
        storyProgress: { ...progress.storyProgress, [story.id]: 100 }
      };
      setProgress(newProgress);
      if (streakIncreased && newStreak > 1) showStreakMessage(newStreak);
      const newBadges = [...badges];
      BADGES.forEach(badge => {
        if (!newBadges.find(b => b.id === badge.id) && badge.condition(newProgress)) {
          newBadges.push({ id: badge.id, name: badge.name, icon: badge.icon, earnedAt: new Date().toISOString() });
        }
      });
      if (newBadges.length !== badges.length) {
        setBadges(newBadges);
        setTimeout(() => alert(`🎉 New badge earned: ${newBadges[newBadges.length-1].name} ${newBadges[newBadges.length-1].icon}`), 500);
      }
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openStory = (story) => {
    setSelectedStory(story);
    setModalOpen(true);
    const savedProgress = progress.storyProgress?.[story.id] || 0;
    setCurrentStoryProgress(savedProgress);
  };

  const closeModal = () => {
    voice.stop();
    setModalOpen(false);
    setSelectedStory(null);
    if (sleepTimerId) clearTimeout(sleepTimerId);
    setSleepEndTime(null);
    setSleepTimerRemaining(0);
    setSleepModeActive(false);
    setBedtimeMode(false);
    setBedtimeProgress(0);
    setNowPlaying(null);
    const dimmer = document.querySelector('.sleep-dimmer');
    if (dimmer) dimmer.style.opacity = 0;
  };

  const startVoiceForStory = (sentences, vType, acc, onSentenceChange, onComplete) => {
    const startIdx = Math.floor((currentStoryProgress / 100) * sentences.length);
    voice.speakSentences(
      sentences.slice(startIdx),
      {
        rate: 1.0,
        voiceType: vType,
        storyId: selectedStory.id,
        category: selectedStory.category,
      },
      (idx) => {
        const globalIdx = startIdx + idx;
        onSentenceChange(globalIdx);
        const newPercent = (globalIdx / sentences.length) * 100;
        updateStoryProgress(selectedStory, newPercent);
      },
      () => {
        updateStoryProgress(selectedStory, 100);
        if (onComplete) onComplete();
      }
    );
    setNowPlaying({
      id: selectedStory.id,
      title: selectedStory.title,
      icon: selectedStory.icon || "📖",
      progress: currentStoryProgress,
    });
  };

  const startSleepTimer = (minutes) => {
    if (sleepTimerId) clearTimeout(sleepTimerId);
    if (minutes > 0) {
      const end = Date.now() + minutes * 60000;
      setSleepEndTime(end);
      const timer = setTimeout(() => {
        voice.stop();
        setSleepModeActive(true);
        setSleepEndTime(null);
        setSleepTimerRemaining(0);
        setTimeout(() => closeModal(), 2000);
      }, minutes * 60000);
      setSleepTimerId(timer);
    } else if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      setSleepTimerId(null);
      setSleepEndTime(null);
      setSleepTimerRemaining(0);
    }
  };

  const updateUserProfile = async (profileData) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profileData);
      setUserProfile({ ...userProfile, ...profileData });
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setUserProfile(null);
    setFavorites([]);
    setIsPremium(false);
  };

  const upgradeToPremium = () => {
    if (!user) { alert("Please log in to upgrade."); return; }
    alert("✨ Premium upgrade would unlock all stories + offline listening + ad-free experience. (Demo: Premium activated)");
    setIsPremium(true);
  };

  // ----- Data for rendering -----
  const newStories = ALL_STORIES.filter(s => s.isNew === true);
  const popularStories = ALL_STORIES.filter(s => s.category === "Sleep" || s.category === "Calm").slice(0, 8);
  const premiumStories = ALL_STORIES.filter(s => s.isPremium === true);
  const continueItems = CONTINUE_READING.map(item => ({ ...item, story: ALL_STORIES.find(s => s.id === item.id) })).filter(i => i.story);
  const featuredStory = ALL_STORIES.find(s => s.id === 1001) || ALL_STORIES[0];

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading magical world...</div>;
  if (!user) return <AuthScreen onLogin={(firebaseUser, profile) => { setUser(firebaseUser); setUserProfile(profile); setIsPremium(profile.isPremium === true); }} />;

  return (
    <div className="relative min-h-screen bg-black">
      <div className={`sleep-dimmer ${sleepModeActive ? 'active' : ''}`} style={{ opacity: bedtimeProgress * 0.7 }} />
      <StarField />
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 p-5 z-40">
        <h1 className="text-white text-2xl font-bold mb-8">🌙 Kulala</h1>
        {["home", "library", "favorites", "profile"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl mb-2 text-left transition ${activeTab === tab ? "bg-yellow-400 text-black" : "text-white/80 hover:bg-white/10"}`}
          >
            <span className="text-xl">{tab === "home" ? "🏠" : tab === "library" ? "📚" : tab === "favorites" ? "❤️" : "👤"}</span>
            <span className="font-medium">{tab === "home" ? "Home" : tab === "library" ? "Library" : tab === "favorites" ? "Saved" : "Profile"}</span>
          </button>
        ))}
      </div>

      <Header isPremium={isPremium} onUpgrade={upgradeToPremium} calmMode={calmMode} setCalmMode={setCalmMode} />

      <div className="md:ml-64 pb-nav">
        {activeTab === 'home' && (
          <>
            <HeroBanner story={featuredStory} onPlay={() => openStory(featuredStory)} />
            <BackgroundSoundSelector
              activeSound={activeSound}
              onSelectSound={setActiveSound}
              volume={soundVolume}
              onVolumeChange={setSoundVolume}
              isPlaying={voice.isPlaying}
            />
            <ContinueRow items={continueItems} stories={ALL_STORIES} onOpen={openStory} isPremium={isPremium} />
            <StoryRow title="✨ New Stories" stories={newStories} onOpen={openStory} isPremium={isPremium} />
            <StoryRow title="🌟 Popular Now" stories={popularStories} onOpen={openStory} isPremium={isPremium} />
            {!isPremium && premiumStories.length > 0 && (
              <StoryRow title="⭐ Premium Picks" stories={premiumStories} onOpen={openStory} isPremium={isPremium} />
            )}
            <StoryRow title="📚 All Stories" stories={ALL_STORIES} onOpen={openStory} isPremium={isPremium} />
            <div className="text-center my-4">
              <button onClick={() => alert("📱 Offline download will be available in the mobile app. Coming soon!")} className="bg-white/10 text-white/80 px-4 py-2 rounded-full text-sm">
                📱 Download for offline (Premium)
              </button>
            </div>
          </>
        )}
        {activeTab === 'library' && (
          <div className="px-4 md:px-8 pt-4">
            <h2 className="text-white text-2xl font-bold mb-4">📚 Your Library</h2>
            <StoryRow title="All Stories" stories={ALL_STORIES} onOpen={openStory} isPremium={isPremium} />
          </div>
        )}
        {activeTab === 'favorites' && (
          <div className="px-4 md:px-8 pt-4">
            <h2 className="text-white text-2xl font-bold mb-4">❤️ Your Favorites</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">❤️</div>
                <p className="text-white/60">No favorites yet. Tap the heart on any story to save it here.</p>
              </div>
            ) : (
              <StoryRow title="Saved Stories" stories={ALL_STORIES.filter(s => favorites.includes(s.id))} onOpen={openStory} isPremium={isPremium} />
            )}
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="px-4 md:px-8 pt-4 max-w-2xl mx-auto">
            <ProfileTab
              userProfile={userProfile}
              favorites={favorites}
              progress={progress}
              badges={badges}
              isPremium={isPremium}
              onUpgrade={upgradeToPremium}
              onUpdateProfile={updateUserProfile}
              onLogout={logout}
            />
          </div>
        )}
      </div>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nowPlaying={nowPlaying}
        voiceState={voice}
        onPillTap={() => {
          const story = ALL_STORIES.find(s => s.id === nowPlaying?.id);
          if (story) openStory(story);
        }}
        onPlayPause={() => {
          if (voice.isPlaying && !voice.isPaused) voice.pause();
          else if (voice.isPaused) voice.resume();
        }}
        onCentrePress={() => {
          if (nowPlaying) {
            const story = ALL_STORIES.find(s => s.id === nowPlaying.id);
            if (story) openStory(story);
          } else {
            openStory(featuredStory);
          }
        }}
      />

      <StoryModal
        story={selectedStory}
        isOpen={modalOpen}
        onClose={closeModal}
        onPlayVoice={startVoiceForStory}
        voiceState={voice}
        onSetTimer={startSleepTimer}
        userName={userProfile?.nickname || "little one"}
        voiceType={voiceType}
        setVoiceType={setVoiceType}
        accent={accent}
        setAccent={setAccent}
        showMoral={showMoral}
        setShowMoral={setShowMoral}
        sleepTimerRemaining={sleepTimerRemaining}
        calmMode={calmMode}
        onComplete={() => { if (selectedStory) updateStoryProgress(selectedStory, 100); }}
        onProgressUpdate={(percent) => { if (selectedStory) updateStoryProgress(selectedStory, percent); }}
        onBedtimeMode={() => setBedtimeMode(true)}
      />
    </div>
  );
}

export default App;