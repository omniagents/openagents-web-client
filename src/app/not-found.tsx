import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
} 