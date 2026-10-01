'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || '') + '/login' });
    if (error) setError(error.message); else { setMessage('Check your email for a reset link.'); setEmail(''); }
    setLoading(false);
  }
  return (
    <main className="min-h-screen bg-rose-50/40 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
        <h1 className="font-serif text-3xl text-rose-900 mb-2">Reset Password</h1>
        <p className="text-rose-800/70 text-sm mb-6">Enter your email and we&apos;ll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:border-rose-500 outline-none" />
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{message}</div>}
          <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center text-sm text-rose-800/70 mt-6">Remember? <Link href="/login" className="text-rose-600 hover:underline font-medium">Back to login</Link></p>
      </div>
    </main>
  );
}
