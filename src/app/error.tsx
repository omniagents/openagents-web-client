'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Something went wrong!</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 