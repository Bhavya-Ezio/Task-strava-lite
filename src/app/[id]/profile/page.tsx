"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/toast/ToastProvider";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type UpdateProfileResult } from "../../action";

export default function ProfilePage() {
    const { id } = useParams();
    const userId = String(id);
    const { showToast } = useToast();

    const [state, formAction] = useActionState<UpdateProfileResult, FormData>(updateProfile, { ok: false, message: null });

    useEffect(() => {
        if (!state) return;
        if (state.ok) {
            showToast({ title: "Profile updated!", message: state.message ?? "Your profile details were saved successfully.", variant: "success" });
            window.location.href = "/";
        } else if (state.message) {
            showToast({ title: "Update failed", message: state.message, variant: "error" });
        }
    }, [state, showToast, userId]);

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 font-medium transition-colors w-full sm:w-auto"
            >
                {pending ? "Saving…" : "Save changes"}
            </button>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
            <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add profile details</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Share your name and a short bio to personalize your profile.
                </p>

                <form action={formAction} className="mt-6 space-y-5">
                    <input type="hidden" name="id" value={userId} />
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full name
                        </label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            placeholder="Your full name"
                            defaultValue={""}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            placeholder="Tell others a bit about you"
                            defaultValue={""}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        />
                    </div>

                    <SubmitButton />
                </form>
            </div>
        </main>
    );
}