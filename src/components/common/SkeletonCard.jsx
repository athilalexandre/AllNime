// src/components/common/SkeletonCard.jsx
import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div> {/* Imagem */}
      <div className="p-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div> {/* Título */}
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div> {/* Gênero/Nota */}
      </div>
    </div>
  );
};
export default SkeletonCard;
