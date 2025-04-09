import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  console.log("NotFoundPage component rendering");
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 