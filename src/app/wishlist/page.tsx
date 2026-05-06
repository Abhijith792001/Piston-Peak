'use client';

import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, Search } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { useRouter } from 'next/navigation';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white shadow-sm rounded-sm overflow-hidden border border-slate-100">
        {/* Wishlist Header */}
        <div className="p-8 border-b border-slate-50 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Heart size={32} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#212121]">My Wishlist</h2>
            <p className="text-slate-500 text-sm">{wishlist.length} items saved in your vault</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                <Heart size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#212121] mb-2">Your wishlist is empty</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                Looks like you haven't added any collectibles to your wishlist yet.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary flex items-center gap-2"
              >
                <Search size={18} /> EXPLORE REGISTRY
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map(product => (
                <div key={product.id} className="border border-slate-50 rounded-sm hover:shadow-md transition-shadow p-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
