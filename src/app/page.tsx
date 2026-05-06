'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Banner } from '../types';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import Image from 'next/image';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));
        const prodSnap = await getDocs(prodQ);
        setProducts(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        const bannerSnap = await getDocs(collection(db, 'banners'));
        setBanners(bannerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-swipe Banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const featuredProducts = products.filter(p => p.featured === true);
  const bestOfToys = products.filter(p => p.tags?.some(tag => tag.toLowerCase() === 'best of toys'));
  const trendingToys = products.filter(p => p.tags?.some(tag => tag.toLowerCase() === 'trending' || tag.toLowerCase() === 'trending toys'));
  
  const otherProducts = products.filter(p => 
    !p.featured && 
    !p.tags?.some(tag => ['best of toys', 'trending', 'trending toys'].includes(tag.toLowerCase()))
  );

  const renderProductSection = (title: string, subtitle: string, items: Product[]) => {
    if (items.length === 0 && !loading) return null;

    const isTrending = title.toLowerCase().includes('trending product');

    return (
      <div className={cn("mb-8", isTrending ? "trending-section" : "bg-white shadow-sm")}>
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-black text-[#1A1A1B] uppercase tracking-tight truncate">{title}</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">{subtitle}</p>
          </div>
          <button className="btn-primary py-2 px-4 md:px-6 text-[10px] md:text-xs tracking-widest whitespace-nowrap shrink-0">
            VIEW ALL
          </button>
        </div>
        
        <div className="p-2 md:p-6">
          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white">
                    <SkeletonProductCard />
                  </div>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-slate-100">
               {items.slice(0, 10).map((product) => (
                <div key={product.id} className="bg-white">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Dynamic Auto-swiping Banner Carousel */}
      <div className="relative h-[200px] md:h-[320px] w-full overflow-hidden bg-slate-100 shadow-sm rounded-[16px]">
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            <motion.div
              key={currentBannerIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 cursor-pointer"
              onClick={() => banners[currentBannerIndex].link && window.open(banners[currentBannerIndex].link, '_blank')}
            >
              <Image 
                src={banners[currentBannerIndex].imageUrl} 
                className="w-full h-full object-cover rounded-[16px]" 
                alt={banners[currentBannerIndex].title || 'Banner'}
                fill
                priority
              />
              {banners[currentBannerIndex].title && (
                <div className="hidden md:block absolute bottom-10 left-10 bg-black/40 backdrop-blur-md p-4 text-white rounded-sm border-l-4 border-[#ffe500]">
                   <h2 className="text-2xl font-bold uppercase tracking-widest leading-tight">{banners[currentBannerIndex].title}</h2>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 font-bold">
               {loading ? 'Loading Banners...' : 'No banners available'}
            </div>
          )}
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm transition-all"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-[#ffe500] w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {renderProductSection('Trending Product', 'Hand-picked premium selections from the vault', featuredProducts)}

      {renderProductSection('Best of Toys', 'Top deals on high-priority collectibles', bestOfToys)}
      
      {/* Static Brand Promotional Strip */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <div className="h-48 bg-white p-4 shadow-sm group cursor-pointer relative overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=600" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
            alt="Hot Wheels"
            fill
          />
          <div className="relative z-10 bg-white/90 p-4 w-2/3 h-full flex flex-col justify-center">
            <h3 className="font-bold text-lg text-[#212121]">Hot Wheels Collection</h3>
            <p className="text-xs text-green-600 font-bold mt-1">Min. 20% Off</p>
          </div>
        </div>
        <div className="h-48 bg-white p-4 shadow-sm group cursor-pointer relative overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&q=80&w=600" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
            alt="Matchbox"
            fill
          />
          <div className="relative z-10 bg-white/90 p-4 w-2/3 h-full flex flex-col justify-center">
            <h3 className="font-bold text-lg text-[#212121]">Matchbox Series</h3>
            <p className="text-xs text-green-600 font-bold mt-1">Special Edition</p>
          </div>
        </div>
        <div className="h-48 bg-white p-4 shadow-sm group cursor-pointer relative overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=600" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
            alt="Premium"
            fill
          />
          <div className="relative z-10 bg-white/90 p-4 w-2/3 h-full flex flex-col justify-center">
            <h3 className="font-bold text-lg text-[#212121]">Inno64 & More</h3>
            <p className="text-xs text-green-600 font-bold mt-1">New Arrivals</p>
          </div>
        </div>
      </div>

      {renderProductSection('Trending Toys', 'What everyone is talking about right now', trendingToys)}

      {/* Explore More Section */}
      {otherProducts.length > 0 && (
        <div className="bg-white shadow-sm p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-[#212121] mb-6">Explore More</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {otherProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {loading && products.length === 0 && (
         <div className="bg-white shadow-sm p-10 text-center text-slate-400 font-bold">
            Loading Piston Peak Registry...
         </div>
      )}
    </div>
  );
}
