import { useEffect, useState } from 'react';

const AVATARS = ['🌙', '⭐', '🌟', '🦁', '🌳', '🦜', '🌊', '🥁', '🦋', '🌺', '🐘', '🦒'];

const ProfileTab = ({ user, userProfile, onLogout, onSaveProfile }) => {
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [age, setAge]           = useState(userProfile?.age      || '6-8');
  const [avatar, setAvatar]     = useState(userProfile?.avatar   || '🌙');
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    setNickname(userProfile?.nickname || '');
    setAge(userProfile?.age || '6-8');
    setAvatar(userProfile?.avatar || '🌙');
  }, [userProfile]);

  const save = async () => {
    const updated = { ...userProfile, nickname, age, avatar };
    setError('');
    try {
      if (onSaveProfile) {
        await onSaveProfile({ user, profile: updated });
      } else {
        try { localStorage.setItem('kulala_demo_user', JSON.stringify(updated)); } catch {}
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Could not save profile.');
    }
  };

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar-big">{avatar}</div>
        <div>
          <p className="profile-name">{nickname || 'Little Dreamer'}</p>
          <p className="profile-email">{userProfile?.email}</p>
        </div>
      </div>
      <label className="profile-form-label">Display Name</label>
      <input
        className="profile-input"
        type="text"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        placeholder="e.g. Zara the Brave"
      />
      <label className="profile-form-label">Age Group</label>
      <select
        className="profile-input"
        value={age}
        onChange={e => setAge(e.target.value)}
        style={{ cursor: 'pointer' }}
      >
        <option value="2-4">Age 2–4</option>
        <option value="4-6">Age 4–6</option>
        <option value="6-8">Age 6–8</option>
        <option value="8-10">Age 8–10</option>
      </select>
      <label className="profile-form-label" style={{ marginBottom: 12 }}>Choose Avatar</label>
      <div className="avatar-grid" style={{ marginBottom: 28 }}>
        {AVATARS.map(av => (
          <button
            key={av}
            className={`avatar-option${avatar === av ? ' selected' : ''}`}
            onClick={() => setAvatar(av)}
          >
            {av}
          </button>
        ))}
      </div>
      <button className="btn-save" onClick={save}>
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
      {error && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'center', marginBottom: 12, fontWeight: 600 }}>
          {error}
        </p>
      )}
      <button className="btn-logout" onClick={onLogout}>
        Sign Out
      </button>
    </div>
  );
};

export default ProfileTab;
