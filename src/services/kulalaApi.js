import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const backendStatus = {
  isConfigured: isSupabaseConfigured,
};

const profileFromUser = (user, profile = null) => ({
  email: user?.email || profile?.email || '',
  nickname: profile?.nickname || user?.user_metadata?.nickname || user?.email?.split('@')[0] || 'Dreamer',
  avatar: profile?.avatar || user?.user_metadata?.avatar || '🌙',
  age: profile?.age || user?.user_metadata?.age || '6-8',
  bedtimeMood: profile?.bedtime_mood || user?.user_metadata?.bedtime_mood || 'calm',
  preferredVoice: profile?.preferred_voice || user?.user_metadata?.preferred_voice || 'female',
  defaultSleepTimer: profile?.default_sleep_timer ?? user?.user_metadata?.default_sleep_timer ?? null,
  hasPremium: Boolean(profile?.has_premium),
});

const storyFromRow = (row) => ({
  id: row.id || row.story_id,
  title: row.title,
  cover: row.cover,
  age: row.age,
  readTime: row.readTime || row.read_time,
  category: row.category,
  icon: row.icon,
  featured: row.featured,
  isPremium: row.isPremium ?? row.is_premium,
  body: row.body,
  moral: row.moral,
  audio: row.audio,
  collection: row.collection,
});

export async function getCurrentSession() {
  if (!supabase) return { user: null, profile: null };
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const user = data.session?.user || null;
  if (!user) return { user: null, profile: null };
  const profile = await getProfile(user);
  return { user, profile };
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => data.subscription.unsubscribe();
}

export async function signIn({ email, password }) {
  if (!supabase) throw new Error('Supabase is not configured yet.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUp({ email, password, nickname }) {
  if (!supabase) throw new Error('Supabase is not configured yet.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Directs the user back to your app after they confirm their email
      emailRedirectTo: window.location.origin,
      data: {
        nickname,
        avatar: '🌙',
        age: '6-8',
        bedtime_mood: 'calm',
        preferred_voice: 'female',
      },
    },
  });
  if (error) throw error;

  // The database trigger creates the profile row. Profile updates happen only
  // after the user has an authenticated session.
  return {
    user: data.user,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(user) {
  if (!supabase || !user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('email,nickname,avatar,age,bedtime_mood,preferred_voice,default_sleep_timer,has_premium')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return profileFromUser(user, data);
}

export async function upsertProfile({ user, profile }) {
  if (!supabase || !user) return profile;
  const payload = {
    id: user.id,
    email: user.email || profile.email,
    nickname: profile.nickname,
    avatar: profile.avatar,
    age: profile.age,
    bedtime_mood: profile.bedtimeMood || 'calm',
    preferred_voice: profile.preferredVoice || 'female',
    default_sleep_timer: profile.defaultSleepTimer ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select('email,nickname,avatar,age,bedtime_mood,preferred_voice,default_sleep_timer,has_premium')
    .single();
  if (error) throw error;
  return profileFromUser(user, data);
}

export async function listStories() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('story_catalog')
    .select('*') 
    // View uses aliased name for sorting
    .order('sortOrder', { ascending: true });
  if (error) throw error;
  return data.map(storyFromRow);
}

export async function getStory(storyId) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_story_for_current_user', {
    requested_story_id: storyId,
  });
  if (error) throw error;
  return data?.[0] ? storyFromRow(data[0]) : null;
}

export async function listFavorites(user) {
  if (!supabase || !user) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('story_id')
    .eq('user_id', user.id);
  if (error) throw error;
  return data.map(row => row.story_id);
}

export async function setFavorite({ user, storyId, isFavorite }) {
  if (!supabase || !user) return;
  if (isFavorite) {
    const { error } = await supabase
      .from('favorites')
      .upsert({ user_id: user.id, story_id: storyId });
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('story_id', storyId);
  if (error) throw error;
}

export async function listProgress(user) {
  if (!supabase || !user) return {};
  const { data, error } = await supabase
    .from('story_progress')
    .select('story_id,percent,sentence_index,updated_at')
    .eq('user_id', user.id);
  if (error) throw error;
  return data.reduce((acc, row) => {
    acc[row.story_id] = {
      percent: row.percent,
      sentenceIndex: row.sentence_index,
      updatedAt: new Date(row.updated_at).getTime(),
    };
    return acc;
  }, {});
}

export async function saveProgress({ user, storyId, percent, sentenceIndex }) {
  if (!supabase || !user) return;
  const { error } = await supabase
    .from('story_progress')
    .upsert({
      user_id: user.id,
      story_id: storyId,
      percent,
      sentence_index: sentenceIndex,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function startCheckout() {
  if (!supabase) throw new Error('Supabase is not configured yet.');
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      origin: window.location.origin,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Checkout is not configured yet.');
  window.location.assign(data.url);
}
