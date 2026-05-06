'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  LogOut, 
  Package, 
  Heart,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Home as HomeIcon,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Address } from '../../types';
import { cn } from '../../lib/utils';

export default function Profile() {
  const { user, profile, logout, isAdmin, updateProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');

  // Address Management State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    type: 'home',
    isDefault: false
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout Failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile({ name: newName });
      setIsEditingName(false);
      toast.success('Name updated successfully');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentAddresses = profile?.addresses || [];
      let updatedAddresses: Address[];

      if (editingAddressId) {
        updatedAddresses = currentAddresses.map(addr => 
          addr.id === editingAddressId ? { ...addr, ...addressForm } as Address : addr
        );
      } else {
        const newAddress: Address = {
          ...addressForm,
          id: Math.random().toString(36).substring(7),
          isDefault: currentAddresses.length === 0 || addressForm.isDefault
        } as Address;
        updatedAddresses = [...currentAddresses, newAddress];
      }

      // If this address is set as default, unset others
      if (addressForm.isDefault) {
        const targetId = editingAddressId || updatedAddresses[updatedAddresses.length - 1].id;
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === targetId
        }));
      }

      await updateProfile({ addresses: updatedAddresses });
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        name: '',
        phone: '',
        pincode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        type: 'home',
        isDefault: false
      });
      toast.success(editingAddressId ? 'Address updated' : 'Address added');
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const updatedAddresses = (profile?.addresses || []).filter(addr => addr.id !== id);
      await updateProfile({ addresses: updatedAddresses });
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updatedAddresses = (profile?.addresses || []).map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
      await updateProfile({ addresses: updatedAddresses });
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const handleEditAddress = (addr: Address) => {
    setAddressForm(addr);
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white shadow-sm rounded-lg border border-slate-100">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
          <User size={40} />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1B] mb-2 uppercase tracking-tight">Please log in</h2>
        <p className="text-slate-500 mb-8 font-medium">Login to view your profile and manage orders</p>
        <button
          onClick={() => router.push('/login')}
          className="btn-primary"
        >
          LOGIN
        </button>
      </div>
    );
  }

  const navItems = [
    { label: 'My Orders', path: '/orders', icon: <Package size={18} className="text-slate-400" /> },
    { label: 'Wishlist', path: '/wishlist', icon: <Heart size={18} className="text-slate-400" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-100">
        <div className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 bg-[#1A1A1B] rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-slate-50 shadow-xl">
            {profile?.name?.[0] || user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-b-2 border-[#D72638] outline-none text-2xl font-black text-[#1A1A1B] bg-transparent w-full md:w-64"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                    <CheckCircle2 size={24} />
                  </button>
                  <button onClick={() => setIsEditingName(false)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 size={24} />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-[#1A1A1B] uppercase tracking-tighter italic">
                    {profile?.name || 'User'}
                  </h2>
                  <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-400 hover:text-[#D72638] transition-colors">
                    <Edit2 size={18} />
                  </button>
                </>
              )}
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-wide mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {isAdmin && (
                <span className="bg-[#1A1A1B] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> Administrator
                </span>
              )}
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                Member Since 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Navigation Menu */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Navigation</h3>
            </div>
            <div className="flex flex-col">
              {isAdmin && (
                <Link href="/admin" className={cn(
                    "p-4 flex items-center gap-3 text-sm font-bold transition-colors border-b border-slate-50 group",
                    pathname === '/admin' ? "bg-slate-50 text-[#D72638]" : "text-[#1A1A1B] hover:bg-slate-50"
                  )}>
                  <ShieldCheck size={18} className={pathname === '/admin' ? "text-[#D72638]" : "text-slate-400 group-hover:text-[#D72638]"} /> Admin Dashboard
                </Link>
              )}
              {navItems.map((item) => (
                <Link key={item.path} href={item.path} className={cn(
                    "p-4 flex items-center gap-3 text-sm font-bold transition-colors border-b border-slate-50",
                    pathname === item.path ? "bg-slate-50 text-[#D72638]" : "text-[#1A1A1B] hover:bg-slate-50"
                  )}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { className: pathname === item.path ? "text-[#D72638]" : "text-slate-400" })}
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-4 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} /> {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - Address Management */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MapPin size={24} className="text-[#D72638]" />
                <h3 className="text-xl font-black text-[#1A1A1B] uppercase tracking-tight">Delivery Addresses</h3>
              </div>
              <button 
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({
                    name: profile?.name || '',
                    phone: '',
                    pincode: '',
                    locality: '',
                    address: '',
                    city: '',
                    state: '',
                    type: 'home',
                    isDefault: false
                  });
                  setShowAddressForm(true);
                }}
                className="text-[#D72638] font-black text-xs uppercase tracking-widest flex items-center gap-1.5 hover:underline"
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest mb-4 text-[#1A1A1B]">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    className="col-span-1 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638]"
                    required
                  />
                  <input 
                    type="tel" 
                    placeholder="10-digit Phone" 
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                    className="col-span-1 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638]"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Pincode" 
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="col-span-1 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638]"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Locality" 
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({...addressForm, locality: e.target.value})}
                    className="col-span-1 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638]"
                    required
                  />
                  <textarea 
                    placeholder="Address (Area and Street)" 
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                    className="col-span-2 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638] h-24"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="City/District/Town" 
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="col-span-1 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638]"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="State" 
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="col-span-1 bg-white border border-slate-200 p-2.5 rounded-md text-sm outline-none focus:ring-1 focus:ring-[#D72638]"
                    required
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address Type</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={addressForm.type === 'home'} 
                        onChange={() => setAddressForm({...addressForm, type: 'home'})}
                        className="accent-[#D72638]"
                      />
                      <span className="text-sm font-bold flex items-center gap-1.5"><HomeIcon size={14} /> Home</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={addressForm.type === 'work'} 
                        onChange={() => setAddressForm({...addressForm, type: 'work'})}
                        className="accent-[#D72638]"
                      />
                      <span className="text-sm font-bold flex items-center gap-1.5"><Briefcase size={14} /> Work</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="accent-[#D72638]"
                  />
                  <label htmlFor="isDefault" className="text-sm font-bold">Set as default address</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary py-2 px-8 text-xs">SAVE</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }} 
                    className="font-bold text-slate-400 text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {profile?.addresses?.length ? (
                profile.addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={cn(
                      "p-6 rounded-xl border transition-all",
                      addr.isDefault ? "border-[#D72638] bg-red-50/10 shadow-md shadow-red-500/5" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest flex items-center gap-1">
                          {addr.type === 'home' ? <HomeIcon size={10} /> : <Briefcase size={10} />}
                          {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-[#D72638] text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleEditAddress(addr)} className="text-slate-400 hover:text-[#D72638] transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="font-black text-[#1A1A1B] uppercase tracking-tight">{addr.name}</span>
                        <span className="font-bold text-[#1A1A1B]">{addr.phone}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {addr.address}, {addr.locality}, {addr.city}, {addr.state} - <span className="font-bold text-[#1A1A1B]">{addr.pincode}</span>
                      </p>
                    </div>

                    {!addr.isDefault && (
                      <button 
                        onClick={() => handleSetDefault(addr.id)}
                        className="mt-4 text-[10px] font-black text-[#D72638] uppercase tracking-widest hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">No delivery addresses found. Add one to speed up checkout.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
