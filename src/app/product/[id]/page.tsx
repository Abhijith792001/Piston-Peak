'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product, Review } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { ShoppingCart, Zap, Heart, MapPin, Star, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
          
          // Fetch Reviews
          const revQuery = query(
            collection(db, 'reviews'),
            where('productId', '==', id),
            orderBy('createdAt', 'desc')
          );
          const revSnap = await getDocs(revQuery);
          setReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  if (loading) return (
    <div className="bg-white p-4 md:p-8 shadow-sm animate-pulse">
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/5] bg-slate-100 rounded-sm" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-14 bg-slate-100 rounded-sm" />
            <div className="h-14 bg-slate-100 rounded-sm" />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
          </div>
          <div className="flex gap-3">
            <div className="h-6 bg-slate-100 rounded w-16" />
            <div className="h-6 bg-slate-100 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-20" />
            <div className="h-10 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="space-y-4 pt-6 border-t border-slate-50">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-20 bg-slate-100 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="text-center py-20 bg-white">
        <h2 className="text-2xl font-bold text-[#212121]">Product Not Found</h2>
        <button onClick={() => router.push('/')} className="mt-6 btn-primary">Go to Home</button>
    </div>
  );

  const wishlisted = isInWishlist(product.id);
  const originalPrice = product.originalPrice || product.price * 1.4;
  const discountAmount = product.discount ? `${Math.round(product.discount)}% off` : '28% off';

  const handleBuyNow = () => {
    addToCart(product);
    router.push('/cart');
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-white p-4 md:p-8 shadow-sm">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Image and Sticky Buttons */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24">
            <div className="border border-slate-200 p-4 relative aspect-[4/5] flex items-center justify-center">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain" 
                fill
                priority
              />
              <button 
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-300 hover:text-red-500 transition-colors z-10"
                title="Wishlist"
              >
                <Heart size={20} fill={wishlisted ? '#ff6161' : 'none'} className={wishlisted ? 'text-[#ff6161]' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => {
                  addToCart(product);
                  toast.success('Added to cart');
                }}
                className="btn-cart flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-buy flex items-center justify-center gap-2"
              >
                <Zap size={20} fill="currentColor" /> Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <nav className="text-xs text-slate-400 flex items-center gap-1">
               <button onClick={() => router.push('/')} className="hover:text-[#2874f0]">Home</button> 
               <span>›</span> 
               <span>Toys</span> 
               <span>›</span> 
               <span className="text-[#212121]">{product.brand}</span>
            </nav>
            <h1 className="text-xl md:text-2xl text-[#212121] font-medium leading-normal">
              {product.name} ({product.brand})
            </h1>
          </div>

          <div className="flex items-center gap-3">
             {averageRating && (
                <div className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                  {averageRating} <Star size={12} fill="currentColor" />
                </div>
             )}
             <span className="text-sm font-bold text-slate-400">
                {reviews.length} {reviews.length === 1 ? 'Rating' : 'Ratings'}
             </span>
             <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
                <span className="text-[10px] font-bold text-[#2874f0]">Piston Peak Verified</span>
             </div>
          </div>

          <div className="space-y-1">
             <div className="text-green-600 text-sm font-bold">Special Price</div>
             <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-[#212121]">₹{product.price.toFixed(2)}</span>
                <span className="text-slate-400 line-through text-lg font-medium">₹{originalPrice.toFixed(2)}</span>
                <span className="text-green-600 font-bold text-lg">{discountAmount}</span>
             </div>
          </div>

          {/* Offers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#212121]">Available offers</h4>
            <ul className="space-y-2 text-sm">
               <li className="flex gap-2">
                  <span className="text-green-600 font-bold tracking-tighter">🏷</span>
                  <span><span className="font-bold">Bank Offer</span> 10% instant discount on Cards up to ₹2000</span>
               </li>
               <li className="flex gap-2">
                  <span className="text-green-600 font-bold tracking-tighter">🏷</span>
                  <span><span className="font-bold">Partner Offer</span> Sign up for Pay Later and get a free voucher</span>
               </li>
            </ul>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-12 gap-y-4 py-6 border-y border-slate-100 flex items-start">
             <div className="col-span-3 text-sm font-bold text-slate-400">Delivery</div>
             <div className="col-span-9 space-y-2">
                <div className="flex items-center gap-2 border-b-2 border-[#2874f0] w-fit pb-1">
                  <MapPin size={16} className="text-[#2874f0]" />
                  <input type="text" placeholder="Enter Pincode" className="text-sm font-bold outline-none w-32" defaultValue="560001" />
                  <button className="text-[#2874f0] font-bold text-sm ml-4">Check</button>
                </div>
                <p className="text-sm font-bold text-[#212121]">Delivery by Tomorrow, Wed | <span className="text-green-600">Free</span></p>
             </div>
          </div>

          {/* Seller */}
          <div className="grid grid-cols-12 gap-y-4 py-2 flex items-start border-t border-slate-100 pt-6">
             <div className="col-span-3 text-sm font-bold text-slate-400">Seller</div>
             <div className="col-span-9 text-sm">
                <div className="flex items-center gap-2">
                   <span className="text-[#2874f0] font-bold">FastTrack Retail</span>
                   <div className="bg-[#2874f0] text-white text-[10px] font-bold px-1 rounded-sm">4.8 ★</div>
                </div>
             </div>
          </div>

          <div className="border border-slate-200 rounded-sm p-6 space-y-4">
             <h3 className="font-bold text-[#212121]">Product Description</h3>
             <p className="text-sm text-slate-500 leading-relaxed">
                {product.description || `Enhance your collection with this high-detail ${product.name} from ${product.brand}. Perfect for enthusiasts and professional collectors, this model brings unmatched precision and craftsmanship to your display shelf.`}
             </p>
          </div>

          {/* Real Reviews Section */}
          <div className="border border-slate-200 rounded-sm p-6 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#212121] text-lg">Ratings & Reviews</h3>
             </div>
             
             {reviews.length === 0 ? (
               <p className="text-slate-400 text-sm italic">No reviews yet for this product.</p>
             ) : (
               <div className="divide-y divide-slate-100">
                  {reviews.map((review) => (
                    <div key={review.id} className="py-6 first:pt-0 last:pb-0 space-y-2">
                       <div className="flex items-center gap-2">
                          <div className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                             {review.rating} ★
                          </div>
                          <p className="font-bold text-[#212121] text-sm capitalize">{review.userName}</p>
                       </div>
                       <p className="text-sm text-slate-600">{review.comment}</p>
                       {review.createdAt && (
                         <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1" suppressHydrationWarning>
                            <Clock size={10} />
                            {new Date(review.createdAt?.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </p>
                       )}
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
