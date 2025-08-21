'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/toast/ToastProvider';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signIn, type SignInResult } from '@/app/action';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useToast();
    const router = useRouter();

    const [state, formAction] = useActionState<SignInResult, FormData>(signIn, { ok: false, message: null });

    useEffect(() => {
        if (!state) return;
        if (state.ok) {
            showToast({ variant: 'success', title: 'Signed in', message: state.message ?? 'Welcome back!' });
            router.push('/home');
        } else if (state.message) {
            setErrorMessage(state.message);
            showToast({ variant: 'error', title: 'Sign in failed', message: state.message });
        }
    }, [state, router, showToast]);

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-indigo-400 dark:text-gray-900 dark:hover:bg-indigo-300 px-4 py-2 font-medium transition-colors w-full"
            >
                {pending ? 'Signing in…' : 'Sign in'}
            </button>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="mx-auto max-w-screen-xl min-h-screen flex flex-col md:flex-row">
                <div className="hidden md:block md:w-1/2 relative" aria-hidden="true">
                    <Image
                        src="/running-img1.jpg"
                        alt="Running"
                        fill
                        sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 0px"
                        priority
                        className="object-cover"
                    />
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8">
                    <div className="w-full max-w-md min-h-[480px] flex flex-col justify-center bg-white dark:bg-gray-900 rounded-lg shadow p-6 sm:p-8">
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 my-4 text-center">
                            Strava-Lite
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
                            Track your runs and rides with AI-powered insights
                        </p>
                        <form action={formAction} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={Boolean(errorMessage)}
                                    aria-describedby={errorMessage ? 'login-error' : undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {errorMessage ? (
                                <p id="login-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
                                    {errorMessage}
                                </p>
                            ) : null}
                            <SubmitButton />
                        </form>
                        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/signup"
                                className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}