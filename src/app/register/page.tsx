'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ADMIN_EMAIL } from '../../constants';
import Image from 'next/image';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const role = email === ADMIN_EMAIL ? 'admin' : 'user';
      
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: serverTimestamp()
      });
      
      toast.success('Registration Successful');
      router.push('/');
    } catch (error: any) {
      console.error('Registration Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Account already exists. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address format.');
      } else {
        toast.error('Registration Failed: ' + error.message);
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
      
      toast.success('Registration Successful');
      router.push('/');
    } catch (error: any) {
      console.error('Google Registration Error:', error);
      toast.error('Google Sign-in Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-4xl mx-auto bg-white shadow-xl mt-4 md:mt-10 overflow-hidden min-h-0 md:min-h-[500px]">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-2/5 bg-[#1A1A1B] p-10 text-white flex-col">
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic leading-tight">JOIN THE <span className="text-[#D72638]">PEAK</span></h2>
        <p className="text-lg text-slate-300 font-bold">Sign up to start your premium collection journey.</p>
        <div className="mt-auto relative w-full h-48">
          <Image 
            src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=600" 
            alt="Graphic" 
            className="opacity-30 rounded-lg grayscale object-cover" 
            fill
          />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-3/5 p-6 md:p-10 flex flex-col">
        <form onSubmit={handleRegister} className="space-y-6 md:space-y-8">
          <div className="relative group border-b border-slate-200 focus-within:border-[#D72638] transition-colors">
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2 outline-none text-[#1A1A1B] text-sm font-medium"
              required
            />
          </div>
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
          <div className="relative group border-b border-slate-200 focus-within:border-[#D72638] transition-colors">
            <input
              type="password"
              placeholder="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 outline-none text-[#1A1A1B] text-sm font-medium"
              required
            />
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            By continuing, you agree to Piston Peak's <span className="text-[#D72638]">Terms of Use</span> and <span className="text-[#D72638]">Privacy Policy</span>.          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creating Account...' : 'Continue'}
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
          <Link href="/login" className="text-[#1A1A1B] font-black text-xs uppercase tracking-widest hover:text-[#D72638] transition-colors">Existing User? Log in</Link>
        </div>
      </div>
    </div>
  );
}
