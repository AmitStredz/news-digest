import React, { useState } from 'react';
import { useSignUpEmailPassword } from '@nhost/react';
import { Navigate } from 'react-router-dom';
import { Newspaper, Mail, Lock, User, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
    
  // Use Nhost's sign up hook
  const { signUpEmailPassword, isLoading, isSuccess, needsEmailVerification, isError, error } = useSignUpEmailPassword();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Sign up with Nhost
    await signUpEmailPassword(formData.email, formData.password, {
      displayName: formData.fullName,
      metadata: {
        fullName: formData.fullName
      }
    });
  };

  // Show success message if registration successful but needs email verification
  if (needsEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify your email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to <span className="font-medium text-blue-600">{formData.email}</span>.
              <br />
              Please check your inbox and click the link to complete your registration.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to login
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // If sign up was successful and no verification needed, redirect to dashboard
  if (isSuccess && !needsEmailVerification) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Newspaper className="h-12 w-12 text-blue-600 mb-2" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            News Digest
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account to get started
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>
          
          {isError && (
            <div className="flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm">
                {error?.message || 'An error occurred during sign up'}
              </span>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer">
                Terms and Conditions
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-3">Create Account</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              Sign in
            </a>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-blue-500 transition-colors cursor-pointer">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 