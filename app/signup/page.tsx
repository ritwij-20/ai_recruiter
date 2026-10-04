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
  Briefcase, 
  UserPlus, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/recruiter';

  const { user, signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please provide a valid company email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Sign-up failed:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in.');
      } else {
        setError(err.message || 'Unable to register account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Talent Acquisition Platform</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Recruiter Account
        </h1>
        <p className="text-xs text-slate-500">
          Publish jobs and review candidate applications in real time.
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
            label="Full Name"
            required
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Work Email"
            type="email"
            required
            placeholder="jane.smith@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password (min 6 characters)"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Recruiter Account
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <Suspense fallback={
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading registration form...</p>
          </div>
        }>
          <SignupForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
