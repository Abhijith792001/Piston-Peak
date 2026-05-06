'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Smartphone,
  Cpu,
  Gamepad2,
  Shirt,
  Home as HomeIcon,
  Search as SearchIcon,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { NAVIGATION_LINKS } from '../constants';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart } = useCart();
  const { user, profile, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout Failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Automotive Theme Header */}
      <header className="bg-[#1A1A1B] text-white sticky top-0 z-50 h-16 flex items-center shadow-lg border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-0 max-w-6xl flex items-center gap-4 lg:gap-10">
          {/* Logo */}
          <Link href="/" className="flex flex-col italic group">
            <span className="text-xl font-black italic leading-none tracking-tighter">PISTON <span className="text-[#D72638]">PEAK</span></span>
            <span className="text-[10px] hover:underline flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              PREMIUM <span className="text-[#D72638] font-bold">REGISTRY</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex items-center relative group">
            <input 
              type="text" 
              placeholder="Search by brand (Inno64, Hot Wheels) or model..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#2A2A2B] text-white py-2.5 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D72638] shadow-inner text-sm placeholder:text-slate-500 transition-all"
            />
            <button type="submit" className="absolute right-3 text-slate-400 hover:text-[#D72638] transition-colors">
              <SearchIcon size={18} />
            </button>
          </form>

          {/* Nav Actions */}
          <nav className="flex items-center gap-6 lg:gap-10 ml-auto">
            {user ? (
               <div className="relative group">
                <button className="flex items-center gap-1.5 font-bold text-sm tracking-wide uppercase">
                  {profile?.name || user.displayName || user.email?.split('@')[0]}
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white text-[#212121] shadow-2xl rounded-md w-48 border border-slate-100 overflow-hidden">
                    {isAdmin && (
                      <Link href="/admin" className="block px-6 py-3 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3 text-[#D72638] font-bold">
                        <ShieldCheck size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="block px-6 py-3 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3">
                      <User size={16} /> Profile
                    </Link>
                    <Link href="/orders" className="block px-6 py-3 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3">
                      <Package size={16} /> My Orders
                    </Link>
                    <Link href="/wishlist" className="block px-6 py-3 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3">
                      <Heart size={16} /> Wishlist
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-6 py-3 hover:bg-slate-50 flex items-center gap-3 text-red-500">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex items-center justify-center bg-[#D72638] text-white px-8 py-2 rounded-md font-bold text-sm hover:brightness-110 shadow-lg shadow-red-900/20 transition-all">
                Login
              </Link>
            )}

            <Link href="/cart" className="flex items-center gap-1.5 font-bold text-sm relative hover:text-[#D72638] transition-colors">
              <ShoppingCart size={18} />
              <span className="hidden lg:inline uppercase tracking-widest text-xs">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -left-2 bg-[#D72638] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Search - Only on mobile */}
      <div className="md:hidden bg-[#1A1A1B] px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center relative">
          <input 
            type="text" 
            placeholder="Search for products"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#2A2A2B] text-white py-2 px-10 rounded-md focus:outline-none text-sm"
          />
          <SearchIcon size={16} className="absolute left-3 text-slate-500" />
        </form>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#1A1A1B] text-white">
                <span className="font-black italic tracking-tighter">MENU</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-6 mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
                  <div className="grid gap-2">
                    {NAVIGATION_LINKS.map(link => (
                      <Link 
                        key={link.label} 
                        href={link.path} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                      >
                        <span className="text-sm font-bold text-[#1A1A1B] uppercase tracking-wide group-hover:text-[#D72638]">{link.label}</span>
                        <ChevronDown size={14} className="-rotate-90 text-slate-300" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-6 mt-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account</h3>
                  {user ? (
                    <div className="grid gap-2">
                       {isAdmin && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#D72638] font-bold text-sm bg-red-50">
                          <ShieldCheck size={18} /> Admin Dashboard
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50">
                        <User size={18} /> Profile
                      </Link>
                      <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50">
                        <Package size={18} /> My Orders
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 py-3 px-4 rounded-lg text-red-500 font-bold text-sm hover:bg-red-50 w-full text-left">
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-4 bg-[#D72638] text-white rounded-lg font-bold text-sm shadow-lg shadow-red-900/20">
                      LOGIN / REGISTER
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Category Bar - Visible on desktop, scrollable on mobile */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="container mx-auto max-w-6xl flex items-center md:justify-center gap-8 md:gap-12 py-3 px-4 md:px-0 min-w-max">
          {NAVIGATION_LINKS.map(link => (
            <Link key={link.label} href={link.path} className="flex flex-col items-center gap-1 hover:text-[#D72638] transition-colors group">
              <span className="text-[10px] md:text-xs font-black text-[#1A1A1B] uppercase tracking-widest group-hover:text-[#D72638] transition-colors whitespace-nowrap">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <main className="container mx-auto max-w-6xl py-4 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#172337] text-white py-12 mt-12">
        <div className="container mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <h5 className="text-slate-400 uppercase font-bold tracking-wider">About</h5>
            <ul className="space-y-2">
              <li><button className="hover:underline">Contact Us</button></li>
              <li><button className="hover:underline">About Us</button></li>
              <li><button className="hover:underline">Careers</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="text-slate-400 uppercase font-bold tracking-wider">Help</h5>
            <ul className="space-y-2">
              <li><button className="hover:underline">Payments</button></li>
              <li><button className="hover:underline">Shipping</button></li>
              <li><button className="hover:underline">Cancellation & Returns</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="text-slate-400 uppercase font-bold tracking-wider">Policy</h5>
            <ul className="space-y-2">
              <li><button className="hover:underline">Return Policy</button></li>
              <li><button className="hover:underline">Terms Of Use</button></li>
              <li><button className="hover:underline">Privacy</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="text-slate-400 uppercase font-bold tracking-wider">Social</h5>
            <ul className="space-y-2">
              <li><button className="hover:underline">Facebook</button></li>
              <li><button className="hover:underline">Twitter</button></li>
              <li><button className="hover:underline">YouTube</button></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl px-4 pt-10 mt-10 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5 text-yellow-400 tracking-wide">★ Become a Seller</span>
            <span className="flex items-center gap-1.5 text-yellow-400 tracking-wide">★ Advertise</span>
          </div>
          <div className="text-slate-400">
            © 2024-2026 PistonPeak.com
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
