'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
    CredentialsSignin: 'Invalid password. Please try again.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center text-slate-800 mb-2">
          Authentication Error
        </h1>

        <p className="text-slate-600 text-center mb-6">
          {errorMessage}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-500 font-mono">
              Error code: {error}
            </p>
          </div>
        )}

        <Link
          href="/auth/signin"
          className="block w-full py-3 bg-columbia-600 text-white rounded-lg hover:bg-columbia-700 transition-colors font-medium text-center"
        >
          Try Again
        </Link>

        <p className="text-xs text-slate-400 text-center mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
