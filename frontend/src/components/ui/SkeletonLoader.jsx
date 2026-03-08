import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div className={`animate-pulse bg-gray-200 ${variants[variant]} ${className}`} />
  );
};

export const CandidateSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="flex items-center mb-4">
      <Skeleton className="w-16 h-16 rounded-2xl" variant="rect" />
      <div className="ml-4 flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" variant="rect" />
        <Skeleton className="h-4 w-1/2" variant="rect" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-4" variant="rect" />
    <Skeleton className="h-2 w-full mb-2" variant="rect" />
    <Skeleton className="h-10 w-full" variant="rect" />
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" variant="rect" />
      </td>
    ))}
  </tr>
);