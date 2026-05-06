'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { Product } from '../types';
import Link from 'next/link';
import Image from 'next/image';
import { cn, getDeterministicNumber } from '../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  // Use deterministic values based on product ID
  const dummyRating = getDeterministicNumber(product.id, 3.5, 5.0, 1);
  const dummyReviews = getDeterministicNumber(product.id, 100, 5000);
  const originalPrice = product.originalPrice || product.price * 1.25;
  const discountLabel = product.discount ? `${Math.round(product.discount)}% OFF` : 'SALE';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-transparent hover:border-slate-100"
    >
      <Link href={`/product/${product.id}`} className="p-4 relative block aspect-square bg-white overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          fill
        />
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors z-10"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart size={18} fill={wishlisted ? '#ff6161' : 'none'} className={wishlisted ? 'text-[#ff6161]' : ''} />
        </button>
      </Link>

      <div className="px-4 pb-6 pt-2 flex flex-col flex-1">
        {/* Brand/Category */}
        <span className="text-[10px] text-[#D72638] mb-1 font-black uppercase tracking-widest">{product.brand}</span>
        
        {/* Title */}
        <Link href={`/product/${product.id}`} className="mb-2">
          <h3 className="text-sm font-bold text-[#1A1A1B] line-clamp-1 group-hover:text-[#D72638] transition-colors">{product.name}</h3>
        </Link>

        {/* Brand/Verified Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#1A1A1B] px-2 py-0.5 rounded-sm flex items-center gap-1">
            <span className="text-[8px] font-black text-white uppercase tracking-widest">VAULT CERTIFIED</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-base font-black text-[#1A1A1B]">₹{product.price.toFixed(2)}</span>
          <span className="text-xs text-slate-400 line-through">₹{originalPrice.toFixed(2)}</span>
          <span className="text-xs text-[#D72638] font-bold">{discountLabel}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
