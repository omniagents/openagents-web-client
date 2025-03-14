import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we set things up</p>
      </div>
    </div>
  );
} 