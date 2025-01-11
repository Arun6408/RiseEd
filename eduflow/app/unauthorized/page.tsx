import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div className="h-screen flex gap-10 justify-center items-center bg-gray-50">
      <div className='flex flex-col justify-center items-center'>

      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
        Oops! Access Denied
      </h1>
      <p className="text-gray-600 text-center text-lg mb-6 max-w-md">
        It seems you don’t have the necessary permissions to view this page. 
        Please log in to access your account or contact support if you think this is a mistake.
      </p>
      <div>
      <a
        href="/auth/login"
        className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 transition"
        >
        Go to Login
      </a>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Need help? <a href="/support" className="text-blue-600 underline">Contact Support</a>
      </p>
        </div>
      <img 
        src="/images/unauthorised.jpg" 
        alt="Unauthorized Access"
        className="w-96 mb-6"
      />
    </div>
  );
};

export default UnauthorizedPage;
