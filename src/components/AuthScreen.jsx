import { useState } from 'react';

const AuthScreen = ({ onLogin, reason }) => {
  const [mode, setMode]         = useState(reason === 'signup' ? 'signup' : 'login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup' && !nickname) { setError('Choose a name!'); return; }
    const profile = {
      email,
      nickname: nickname || email.split('@')[0],
      avatar: '🌙',
      age: '6-8'
    };
    try { localStorage.setItem('kulala_demo_user', JSON.stringify(profile)); } catch {}
    onLogin({ uid: 'demo', email }, profile);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: '2.5rem' }}>🌙</span>
        </div>
        <h2 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Join Kulala'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Step into the world of African bedtime magic.'
            : reason === 'premium'
            ? 'Create a free account to unlock premium stories.'
            : "Your child's story journey begins here."}
        </p>
        {mode === 'signup' && (
          <input
            className="auth-input"
            type="text"
            placeholder="Child's name or nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />
        )}
        <input
          className="auth-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && (
          <p style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'center', marginBottom: 12, fontWeight: 600 }}>
            {error}
          </p>
        )}
        <button className="auth-submit" onClick={handleSubmit}>
          {mode === 'login' ? 'Sign In ✦' : 'Create Account ✦'}
        </button>
        <div className="auth-toggle">
          {mode === 'login' ? (
            <>No account?{' '}<button onClick={() => { setMode('signup'); setError(''); }}>Create one free</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
