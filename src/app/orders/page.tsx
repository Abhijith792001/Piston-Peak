'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Order, Product } from '../../types';
import { Package, Clock, CheckCircle2, Truck, XCircle, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const router = useRouter();

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        return;
      }
      
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Order[];
        
        // Sort in memory instead of Firestore to avoid index requirement
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(ordersData);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: selectedProduct.id,
        userId: user.uid,
        userName: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      toast.success('Review submitted successfully!');
      setShowRatingModal(false);
      setComment('');
      setRating(5);
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="text-green-600" size={18} />;
      case 'shipped': return <Truck className="text-blue-600" size={18} />;
      case 'cancelled': return <XCircle className="text-red-600" size={18} />;
      default: return <Clock className="text-yellow-600" size={18} />;
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-400">Loading your orders...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white shadow-sm rounded-sm overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-[#2874f0] rounded-full flex items-center justify-center">
            <Package size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#212121]">My Orders</h2>
            <p className="text-slate-500 text-sm">Track and manage your Piston Peak purchases</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold">You haven't placed any orders yet.</p>
              <button 
                onClick={() => router.push('/')}
                className="btn-primary mt-6"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Order ID</p>
                          <h4 className="font-mono text-sm text-[#212121]">#{order.id?.slice(-8).toUpperCase()}</h4>
                        </div>
                    </div>
                    <div className="flex flex-col md:items-end">
                       <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-xs font-bold uppercase tracking-wider">{order.status}</span>
                       </div>
                       <p className="text-lg font-bold text-[#212121] mt-1">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {order.products.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 relative bg-white border border-slate-100 shadow-sm rounded-sm">
                            <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                fill
                                className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#212121]">{item.name}</p>
                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setShowRatingModal(true);
                            }}
                            className="text-[#2874f0] text-xs font-bold flex items-center gap-1 hover:underline bg-white px-3 py-1.5 rounded-sm border border-slate-200 shadow-sm"
                          >
                            <Star size={14} fill="currentColor" /> RATE & REVIEW
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {order.status !== 'delivered' && (
                     <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic bg-slate-50 p-2 rounded-sm w-fit">
                        <Clock size={12} /> Rating will be available once the order is delivered.
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-[#2874f0] p-6 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-wider">Rate & Review</h3>
                <button onClick={() => setShowRatingModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-8 space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-sm">
                  <div className="w-16 h-16 relative bg-white rounded-sm border border-slate-100 shadow-sm">
                    <Image src={selectedProduct.imageUrl} fill className="object-contain" alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#212121] text-sm">{selectedProduct.name}</h4>
                    <p className="text-xs text-slate-400">{selectedProduct.brand}</p>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                      >
                        <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Share your feedback</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you liked or disliked about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border-2 border-slate-100 rounded-sm p-3 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-buy py-4"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
