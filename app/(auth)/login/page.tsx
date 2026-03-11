'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TrendingUp, Loader2, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type MagicLinkValues = z.infer<typeof magicLinkSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [magicSent, setMagicSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerMagic,
    handleSubmit: handleMagicSubmit,
    formState: { errors: magicErrors, isSubmitting: magicSubmitting },
  } = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
  });

  const onPasswordLogin = async (data: LoginValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Signed in successfully');
    router.push('/dashboard');
    router.refresh();
  };

  const onMagicLink = async (data: MagicLinkValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setMagicSent(true);
    toast.success('Magic link sent — check your email');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Trading Journal</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                mode === 'password'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
                mode === 'magic'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Magic Link
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
            </form>
          ) : magicSent ? (
            <div className="text-center py-4">
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm">
                We sent a magic link to your email. Click the link to sign in.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="text-primary text-sm mt-4 hover:underline"
              >
                Send another link
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleMagicSubmit(onMagicLink)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    {...registerMagic('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-input border border-border rounded-md pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {magicErrors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {magicErrors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={magicSubmitting}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {magicSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Send Magic Link
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
