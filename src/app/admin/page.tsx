'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, UserProfile, Order, Banner } from '../../types';
import { Plus, Trash2, Edit, Users, ShoppingBag, Package, IndianRupee, X, LayoutDashboard, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders' | 'banners'>('products');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Form States
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '', brand: 'Hot Wheels', price: undefined, originalPrice: undefined, discount: undefined, description: '', imageUrl: '', stock: undefined, tags: [], featured: false
  });
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({ imageUrl: '', link: '', title: '' });
  const [tagsInput, setTagsInput] = useState('');

  const handleOriginalPriceChange = (val: number) => {
    const op = isNaN(val) ? 0 : val;
    const d = currentProduct.discount || 0;
    const p = op * (1 - d / 100);
    setCurrentProduct({ ...currentProduct, originalPrice: op, price: parseFloat(p.toFixed(2)) });
  };

  const handleDiscountChange = (val: number) => {
    const d = isNaN(val) ? 0 : val;
    const op = currentProduct.originalPrice || 0;
    const p = op * (1 - d / 100);
    setCurrentProduct({ ...currentProduct, discount: d, price: parseFloat(p.toFixed(2)) });
  };

  const handleSellingPriceChange = (val: number) => {
    const p = isNaN(val) ? 0 : val;
    const op = currentProduct.originalPrice || 0;
    const d = op > 0 ? ((op - p) / op) * 100 : 0;
    setCurrentProduct({ ...currentProduct, price: p, discount: parseFloat(d.toFixed(2)) });
  };

  useEffect(() => {
    if (currentProduct.tags) {
      setTagsInput(currentProduct.tags.join(', '));
    } else {
      setTagsInput('');
    }
  }, [currentProduct.id, currentProduct.tags]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      const userSnap = await getDocs(collection(db, 'users'));
      const orderSnap = await getDocs(collection(db, 'orders'));
      const bannerSnap = await getDocs(collection(db, 'banners'));

      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setUsers(userSnap.docs.map(d => d.data() as UserProfile));
      
      // Sort orders by createdAt descending (latest first)
      const fetchedOrders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setOrders(fetchedOrders);
      
      setBanners(bannerSnap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
    } catch (error) {
      toast.error('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading('save-product');
    try {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      const productData = { ...currentProduct, tags };

      if (currentProduct.id) {
        await updateDoc(doc(db, 'products', currentProduct.id), {
          ...productData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
        toast.success('Product added');
      }
      setShowAddModal(false);
      setCurrentProduct({ name: '', brand: 'Hot Wheels', price: undefined, originalPrice: undefined, discount: undefined, description: '', imageUrl: '', stock: undefined, tags: [], featured: false });
      setTagsInput('');
      fetchData();
    } catch (error) {
      toast.error('Error saving product');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading('save-banner');
    try {
      if (currentBanner.id) {
        await updateDoc(doc(db, 'banners', currentBanner.id), {
          ...currentBanner,
          updatedAt: serverTimestamp()
        });
        toast.success('Banner updated successfully');
      } else {
        await addDoc(collection(db, 'banners'), {
          ...currentBanner,
          createdAt: serverTimestamp()
        });
        toast.success('Banner added successfully');
      }
      setShowBannerModal(false);
      setCurrentBanner({ imageUrl: '', link: '', title: '' });
      fetchData();
    } catch (error) {
      toast.error('Error saving banner');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setIsActionLoading(`delete-${id}`);
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting product');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    setIsActionLoading(`delete-banner-${id}`);
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success('Banner deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting banner');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsActionLoading(`status-${orderId}`);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('Order status updated');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsActionLoading(null);
    }
  };

  const stats = [
    { label: 'Products', value: products.length, icon: Package },
    { label: 'Customers', value: users.length, icon: Users },
    { label: 'Orders', value: orders.length, icon: ShoppingBag },
    { label: 'Revenue', value: `₹${orders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(0)}`, icon: IndianRupee },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 font-bold text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#2874f0] rounded-sm">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#212121]">Admin Dashboard</h2>
            <p className="text-xs text-slate-500">Manage your store inventory and users</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrentBanner({ imageUrl: '', link: '', title: '' });
              setShowBannerModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-2.5 font-bold rounded-sm shadow-md hover:brightness-105 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> ADD BANNER
          </button>
          <button
            onClick={() => {
              setCurrentProduct({ name: '', brand: 'Hot Wheels', price: undefined, originalPrice: undefined, discount: undefined, description: '', imageUrl: '', stock: undefined, tags: [], featured: false });
              setShowAddModal(true);
            }}
            className="bg-[#fb641b] text-white px-6 py-2.5 font-bold rounded-sm shadow-md hover:brightness-105 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> ADD PRODUCT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-sm border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-sm">
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-[#212121]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border border-slate-100 rounded-sm overflow-hidden">
        <div className="flex border-b border-slate-50 overflow-x-auto">
          {(['products', 'users', 'orders', 'banners'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab ? 'border-[#2874f0] text-[#2874f0] bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === 'products' && (
            <>
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <input 
                    type="text"
                    placeholder="Search by product name or brand..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#D72638] transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={16} />
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative">
                            <Image src={product.imageUrl} fill className="rounded-sm object-cover border border-slate-100" alt="" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#212121] text-sm">{product.name}</span>
                          {product.featured && (
                            <span className="bg-yellow-100 text-yellow-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm w-fit mt-1">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.brand}</td>
                    <td className="px-6 py-4 font-bold text-[#212121] text-sm">₹{product.price}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setCurrentProduct(product);
                            setShowAddModal(true);
                          }}
                          className="p-2 text-[#2874f0] hover:bg-blue-50 rounded-sm transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isActionLoading === `delete-${product.id}`}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
                        >
                          {isActionLoading === `delete-${product.id}` ? '...' : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === 'users' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          {user.name?.[0]}
                        </div>
                        <span className="font-bold text-[#212121] text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-blue-50 text-[#2874f0]' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'orders' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-slate-400 font-bold">#{order.id?.slice(-8).toUpperCase()}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase" suppressHydrationWarning>
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt as any).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1A1A1B] text-sm uppercase">{(order as any).deliveryAddress?.name || 'N/A'}</span>
                        <span className="text-xs text-slate-500 font-bold">{(order as any).deliveryAddress?.phone || order.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      {(order as any).deliveryAddress ? (
                        <div className="flex flex-col text-[11px] text-slate-500 font-medium leading-tight">
                          <span>{(order as any).deliveryAddress.address}</span>
                          <span>{(order as any).deliveryAddress.locality}, {(order as any).deliveryAddress.city}</span>
                          <span>{(order as any).deliveryAddress.state} - <span className="font-bold text-[#1A1A1B]">{(order as any).deliveryAddress.pincode}</span></span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No address provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {order.products.map((p, i) => (
                          <div key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-100 flex justify-between gap-4">
                            <span className="truncate max-w-[80px]">{p.name}</span>
                            <span className="text-[#D72638]">x{p.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-[#1A1A1B] text-sm">₹{order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        disabled={isActionLoading === `status-${order.id}`}
                        onChange={(e) => handleUpdateOrderStatus(order.id!, e.target.value)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest outline-none cursor-pointer border-2 transition-all ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-200' : 
                          order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-yellow-50 text-yellow-600 border-yellow-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'banners' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Banner Preview</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {banners.map(banner => (
                  <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-16 w-32 relative">
                        <Image src={banner.imageUrl} fill className="object-cover rounded-sm border border-slate-100" alt="" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#212121]">{banner.title || 'Untitled'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setCurrentBanner(banner);
                            setShowBannerModal(true);
                          }}
                          className="p-2 text-[#2874f0] hover:bg-blue-50 rounded-sm transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id!)}
                          disabled={isActionLoading === `delete-banner-${banner.id}`}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50"
                        >
                          {isActionLoading === `delete-banner-${banner.id}` ? '...' : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-[#2874f0] p-6 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-wider">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>

              <form onSubmit={handleAddProduct} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Name</label>
                  <input
                    type="text" required
                    value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand / Category</label>
                  <input
                    list="brand-options"
                    required
                    placeholder="Type or select brand"
                    value={currentProduct.brand} onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                  />
                  <datalist id="brand-options">
                    {Array.from(new Set(products.map(p => p.brand))).map(brand => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Price (₹)</label>
                    <input
                      type="number" required
                      value={currentProduct.originalPrice ?? ''} 
                      onChange={e => handleOriginalPriceChange(parseFloat(e.target.value))}
                      className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount (%)</label>
                    <input
                      type="number" required
                      value={currentProduct.discount ?? ''} 
                      onChange={e => handleDiscountChange(parseFloat(e.target.value))}
                      className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selling Price (₹)</label>
                    <input
                      type="number" required
                      value={currentProduct.price ?? ''} 
                      onChange={e => handleSellingPriceChange(parseFloat(e.target.value))}
                      className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                  <input
                    type="text" required
                    value={currentProduct.imageUrl} onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Best of Toys, Trending, New Arrival"
                    value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea
                    rows={3}
                    value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock</label>
                  <input
                    type="number" required
                    value={currentProduct.stock ?? ''} onChange={e => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={currentProduct.featured || false}
                    onChange={e => setCurrentProduct({...currentProduct, featured: e.target.checked})}
                    className="w-4 h-4 text-[#2874f0] rounded-sm focus:ring-[#2874f0]"
                  />
                  <label htmlFor="featured-check" className="text-sm font-bold text-[#212121] cursor-pointer">
                    Feature on Home (Trending Product)
                  </label>
                </div>
                <button type="submit" 
                  disabled={isActionLoading === 'save-product'}
                  className="w-full bg-[#fb641b] text-white py-4 font-bold uppercase tracking-widest text-sm shadow-lg hover:brightness-105 transition-all mt-4 disabled:opacity-70">
                  {isActionLoading === 'save-product' ? 'Processing...' : (currentProduct.id ? 'Save Changes' : 'Confirm & Add')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Banner Modal */}
      <AnimatePresence>
        {showBannerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold uppercase tracking-wider">{currentBanner.id ? 'Edit Banner' : 'Add New Banner'}</h3>
                <button onClick={() => setShowBannerModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
              </div>

              <form onSubmit={handleSaveBanner} className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Banner Title</label>
                  <input
                    type="text" required
                    value={currentBanner.title} onChange={e => setCurrentBanner({...currentBanner, title: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="e.g. Summer Sale"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                  <input
                    type="text" required
                    value={currentBanner.imageUrl} onChange={e => setCurrentBanner({...currentBanner, imageUrl: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Link to high-res banner image"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link (Optional)</label>
                  <input
                    type="text"
                    value={currentBanner.link} onChange={e => setCurrentBanner({...currentBanner, link: e.target.value})}
                    className="w-full border-b-2 border-slate-100 p-2 text-sm text-[#212121] focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="Where should clicking this banner go?"
                  />
                </div>
                <button type="submit" 
                  disabled={isActionLoading === 'save-banner'}
                  className="w-full btn-buy py-4">
                  {isActionLoading === 'save-banner' ? 'Processing...' : (currentBanner.id ? 'Save Changes' : 'Save Banner')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
