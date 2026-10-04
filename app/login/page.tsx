'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { 
  ShieldCheck, 
  LogIn, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/recruiter';

  const { user, signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide your recruiter email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. If you are new, please create an account.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Unable to sign in. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Recruiter Authentication</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to Recruiter Hub
        </h1>
        <p className="text-xs text-slate-500">
          Access your job postings, candidate applications, and recruitment dashboard.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Recruiter Email"
            type="email"
            required
            placeholder="recruiter@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don&apos;t have a recruiter account yet?{' '}
          <Link href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`} className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>Looking for open jobs instead?</span>
          <span className="font-semibold underline">Browse Jobs</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <Suspense fallback={
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading login form...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
