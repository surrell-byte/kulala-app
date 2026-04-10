import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("4-6");
  const [avatar, setAvatar] = useState("🌙");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const avatars = ["🌙", "🦁", "🐘", "🦒", "🐒", "⭐", "🌳", "🦉"];

  const handleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          nickname,
          age,
          avatar,
          email,
          createdAt: new Date(),
        });
        onLogin(userCred.user, { nickname, age, avatar });
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const docRef = doc(db, "users", userCred.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          onLogin(userCred.user, docSnap.data());
        } else {
          const fallback = { nickname: email.split('@')[0], age: "4-6", avatar: "🌙" };
          await setDoc(docRef, fallback);
          onLogin(userCred.user, fallback);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const nickname = user.displayName || user.email.split('@')[0];
        const profile = {
          nickname,
          age: "4-6",
          avatar: "🌙",
          email: user.email,
          createdAt: new Date(),
        };
        await setDoc(docRef, profile);
        onLogin(user, profile);
      } else {
        onLogin(user, docSnap.data());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-indigo-950 to-black">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <input
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignUp && (
          <>
            <input
              className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white mb-3"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <select
              className="w-full p-3 rounded-xl bg-black/30 border border-white/20 text-white mb-3"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              <option value="2-4">Age 2–4</option>
              <option value="4-6">Age 4–6</option>
              <option value="6-8">Age 6–8</option>
              <option value="8-10">Age 8–10</option>
            </select>
            <div className="flex gap-2 mb-3 flex-wrap">
              {avatars.map(av => (
                <button
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`text-2xl p-2 rounded-full ${avatar === av ? 'bg-yellow-400/30 border border-yellow-400' : 'bg-white/10'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-red-400 text-sm mb-3">{error}</p>

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-3 bg-yellow-400 text-indigo-950 font-bold rounded-full hover:bg-yellow-500 transition"
        >
          {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Login")}
        </button>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-3 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
        </button>

        <p className="text-center text-white/60 mt-4">
          {isSignUp ? "Already have an account?" : "New to Kulala?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-yellow-400 ml-1">
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};