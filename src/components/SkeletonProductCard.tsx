import React from 'react';

const SkeletonProductCard: React.FC = () => {
  return (
    <div className="bg-white flex flex-col h-full border border-transparent p-4 animate-pulse">
      <div className="aspect-square bg-slate-100 rounded-sm mb-4" />
      <div className="space-y-3 flex-1">
        <div className="h-2 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-5 bg-slate-100 rounded w-1/2 mt-4" />
        <div className="flex gap-2 mt-auto pt-4">
          <div className="h-6 bg-slate-100 rounded w-20" />
          <div className="h-6 bg-slate-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;
