'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, ShoppingBag, Plus, Minus, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Image from 'next/image';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const defaultAddress = profile?.addresses?.find(addr => addr.isDefault) || profile?.addresses?.[0];

  const deliveryCharges = 40;
  const discount = cartTotal * 0.1;
  const finalTotal = cartTotal - discount + (cartTotal > 500 ? 0 : deliveryCharges);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/login');
      return;
    }

    if (!defaultAddress) {
      toast.error('Please add a delivery address in your profile');
      router.push('/profile');
      return;
    }

    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        products: cart,
        totalAmount: parseFloat(finalTotal.toFixed(2)),
        status: 'pending',
        deliveryAddress: defaultAddress,
        createdAt: serverTimestamp()
      });

      toast.success('Order Placed Successfully!');
      clearCart();
      router.push('/');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 items-start pb-20">
      {/* List of Items - 8 columns */}
      <div className="lg:col-span-8 bg-white shadow-sm overflow-hidden rounded-xl border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-black text-[#1A1A1B] uppercase tracking-tight italic">YOUR REGISTRY ({cart.length})</h2>
          {user && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-widest">Deliver to:</span>
              {defaultAddress ? (
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#1A1A1B]">{defaultAddress.pincode}</span>
                  <button onClick={() => router.push('/profile')} className="text-[#D72638] font-black uppercase tracking-widest hover:underline px-3 py-1 bg-white border border-slate-200 rounded-md">Change</button>
                </div>
              ) : (
                <button onClick={() => router.push('/profile')} className="text-[#D72638] font-black uppercase tracking-widest hover:underline">Add Address</button>
              )}
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-64 h-64 mx-auto bg-slate-50 flex items-center justify-center rounded-full border border-dashed border-slate-200">
              <ShoppingBag size={100} strokeWidth={1} className="text-slate-200" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1A1A1B] uppercase tracking-tight italic">Your cart is empty!</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">Explore our wide range of premium die-cast</p>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.id} className="p-8 flex flex-col md:flex-row gap-8 hover:bg-slate-50/30 transition-colors">
                <div className="w-32 h-32 flex-shrink-0 flex flex-col items-center gap-4 relative">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center border-2 border-slate-100 bg-white rounded-full py-1.5 px-4 gap-4 shadow-sm z-10">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="text-[#1A1A1B] disabled:text-slate-300 hover:text-[#D72638] transition-colors">
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[#1A1A1B] hover:text-[#D72638] transition-colors">
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-[#D72638] font-black uppercase tracking-widest">{item.brand}</span>
                      <h4 className="text-lg text-[#1A1A1B] font-bold leading-tight mt-1 hover:text-[#D72638] transition-colors cursor-pointer">{item.name}</h4>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-2">
                     <span className="text-xl font-black text-[#1A1A1B]">₹{item.price.toFixed(2)}</span>
                     <span className="text-slate-400 line-through text-sm">₹{(item.price * 1.4).toFixed(2)}</span>
                     <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-sm font-black text-[10px] uppercase tracking-wider border border-green-100">28% Off</span>
                  </div>
                  
                  <div className="flex items-center gap-6 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <button className="hover:text-[#D72638] transition-colors">Save for later</button>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <button onClick={() => removeFromCart(item.id)} className="hover:text-[#D72638] transition-colors">Remove from vault</button>
                  </div>
                </div>

                <div className="text-[10px] font-black text-[#1A1A1B] uppercase tracking-widest hidden lg:block bg-slate-50 p-4 rounded-xl border border-slate-100 self-start">
                  Delivery by <span className="text-[#D72638]">Wed May 7</span>
                  <div className="mt-1 text-green-600">Free Shipping</div>
                </div>
              </div>
            ))}

            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-6 flex justify-end shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-slate-100">
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="btn-buy py-4 px-12 text-sm"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Details - 4 columns */}
      {cart.length > 0 && (
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white shadow-sm rounded-xl border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm font-bold text-slate-600">
                <span>Items ({cart.length})</span>
                <span className="text-[#1A1A1B]">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-600">
                <span>Discount</span>
                <span className="text-green-600">-₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-600">
                <span>Delivery Charges</span>
                <span>{cartTotal > 500 ? <span className="text-green-600 font-black uppercase tracking-widest text-[10px]">Free</span> : `₹${deliveryCharges}`}</span>
              </div>
              
              <div className="flex justify-between text-xl font-black pt-4 border-t border-dashed border-slate-200 text-[#1A1A1B] uppercase italic">
                <span>Total</span>
                <span className="text-[#D72638]">₹{finalTotal.toFixed(2)}</span>
              </div>
              
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <p className="text-green-600 font-black uppercase tracking-tighter text-[10px]">You saved ₹{discount.toFixed(2)} on this order</p>
              </div>
            </div>
            
            <div className="p-6 pt-0 flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <ShieldCheck size={32} className="text-slate-300" />
              <span>Safe & Secure Payments. 100% Authentic products from the Vault.</span>
            </div>
          </div>

          {/* Selected Address Summary */}
          {defaultAddress && (
             <div className="bg-white shadow-sm rounded-xl border border-slate-100 p-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={12} className="text-[#D72638]" /> Shipping Destination
                </h4>
                <div className="space-y-1">
                  <p className="font-black text-[#1A1A1B] text-sm uppercase">{defaultAddress.name}</p>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {defaultAddress.address}, {defaultAddress.locality}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                  </p>
                  <p className="text-xs font-black text-[#1A1A1B] pt-1">Phone: {defaultAddress.phone}</p>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
