'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ADMIN_EMAIL } from '../../constants';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login Successful');
      router.push('/');
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Try again later.');
      } else {
        toast.error('Login Failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Google User',
          email: user.email,
          role,
          createdAt: serverTimestamp()
        });
      }
      
      toast.success('Login Successful');
      router.push('/');
    } catch (error: any) {
      console.error('Google Login Error:', error);
      toast.error('Google Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error('Error sending reset link');
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-4xl mx-auto bg-white shadow-xl mt-4 md:mt-10 overflow-hidden min-h-0 md:min-h-[500px]">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-2/5 bg-[#1A1A1B] p-10 text-white flex-col">
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">PISTON <span className="text-[#D72638]">PEAK</span></h2>
        <p className="text-lg text-slate-300 font-bold leading-tight">Access your premium toy collection and exclusive drops.</p>
        <div className="mt-auto relative w-full h-48">
          <Image 
            src="https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=600" 
            alt="Login Graphic" 
            className="opacity-30 rounded-lg grayscale object-cover" 
            fill
          />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-3/5 p-6 md:p-10 flex flex-col">
        <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
          <div className="relative group border-b border-slate-200 focus-within:border-[#D72638] transition-colors">
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 outline-none text-[#1A1A1B] text-sm font-medium"
              required
            />
          </div>
          <div className="relative group border-b border-slate-200 focus-within:border-[#D72638] transition-colors flex items-center">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 outline-none text-[#1A1A1B] text-sm font-medium"
              required
            />
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-[#D72638] text-xs font-black uppercase tracking-widest whitespace-nowrap ml-2"
            >
              Forgot?
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            By continuing, you agree to Piston Peak's <span className="text-[#D72638]">Terms of Use</span> and <span className="text-[#D72638]">Privacy Policy</span>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 md:mt-6 flex flex-col gap-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors font-bold text-sm text-[#1A1A1B]"
          >
            <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/3840px-Google_%22G%22_logo.svg.png" 
                alt="Google" 
                width={20} 
                height={20} 
            />
            CONTINUE WITH GOOGLE
          </button>
          
          <div className="flex items-center gap-4 text-slate-300">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
        </div>

        <div className="mt-4 md:mt-auto text-center space-y-4 pt-6">
          <Link href="/register" className="text-[#1A1A1B] font-black text-xs uppercase tracking-widest hover:text-[#D72638] transition-colors">New to Piston Peak? Create an account</Link>
        </div>
      </div>
    </div>
  );
}
