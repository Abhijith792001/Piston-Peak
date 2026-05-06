'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import SkeletonProductCard from '../../components/SkeletonProductCard';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setSearchTerm(queryParam);
    setDebouncedSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [debouncedSearchTerm, products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="bg-white shadow-sm rounded-sm overflow-hidden border border-slate-100">
        {/* Search Header */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#212121]">Search Results</h2>
              <p className="text-slate-500 text-sm">
                {loading ? 'Searching...' : `Showing ${results.length} results for "${searchTerm}"`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative group w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search for models, brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f1f3f6] border border-transparent rounded-sm py-2.5 pl-4 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2874f0] transition-all text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2874f0]">
              <SearchIcon size={18} />
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="border border-slate-50 rounded-sm p-2">
                  <SkeletonProductCard />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.map(product => (
                <div key={product.id} className="border border-slate-50 rounded-sm hover:shadow-md transition-shadow p-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                <SearchIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#212121] mb-2">No results found</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                We couldn't find anything matching "{searchTerm}". Try different keywords or check your spelling.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-[#2874f0] text-white px-10 py-3 font-bold rounded-sm shadow-md hover:brightness-105 transition-all"
              >
                CLEAR SEARCH
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
