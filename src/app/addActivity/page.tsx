"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Footprints, Bike, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/toast/ToastProvider';
import { useActiveTab } from '@/context/activeTabContext';
import { ActivityFormData, FormDataError } from "@/types/types";

// --- MAIN COMPONENT ---
const AddActivityPage = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<ActivityFormData>({
        type: '',
        title: '',
        distance_km: '',
        duration_min: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<FormDataError>>({});
    const { setActiveTab } = useActiveTab();

    const validate = () => {
        const newErrors: Partial<FormDataError> = {};
        if (!formData.type) newErrors.type = 'Activity type is required.';
        if (!formData.title) newErrors.title = 'Title is required.';
        if (Number(formData.distance_km) <= 0) newErrors.distance_km = 'Distance must be positive.';
        if (Number(formData.duration_min) <= 0) newErrors.duration_min = 'Duration must be positive.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            showToast({
                message: 'Please fix the errors before submitting.',
                variant: 'error',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    distance_km: Number(formData.distance_km),
                    duration_min: Number(formData.duration_min),
                }),
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error('Failed to save activity.');
            }

            showToast({
                message: 'Activity saved successfully!',
                variant: 'success',
            });
            setIsSubmitting(false);
            setActiveTab('activities');
            router.replace('/');
        } catch (err) {
            let errorMessage = 'Failed to save activity.';
            if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }
            showToast({
                message: errorMessage,
                variant: 'error',
            });
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('activities');
                        router.replace('/');
                    }}
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={18} /> Back to Activities
                </button>

                <div className="bg-[#0D1321] p-8 rounded-xl border border-slate-800">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white">Add New Activity</h1>
                        <p className="text-slate-400 mt-2">Log your latest effort and stay on track.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Activity Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Activity Type *</label>
                            <div className="grid grid-cols-2 gap-4">
                                <TypeOption type="run" icon={<Footprints />} selectedType={formData.type} setType={(t) => setFormData(p => ({ ...p, type: t }))} />
                                <TypeOption type="ride" icon={<Bike />} selectedType={formData.type} setType={(t) => setFormData(p => ({ ...p, type: t }))} />
                            </div>
                            {errors.type && <p className="text-red-400 text-sm mt-2">{errors.type}</p>}
                        </div>

                        {/* Title */}
                        <InputField label="Title *" name="title" value={formData.title} onChange={handleInputChange} error={errors.title} placeholder="e.g., Morning Park Run" />

                        {/* Distance & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Distance (km) *" name="distance_km" type="number" value={formData.distance_km} onChange={handleInputChange} error={errors.distance_km} placeholder="0.0" />
                            <InputField label="Duration (min) *" name="duration_min" type="number" value={formData.duration_min} onChange={handleInputChange} error={errors.duration_min} placeholder="0" />
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="How did it feel? Any details to remember?"
                                className="w-full bg-[#0A0F24] text-slate-300 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                            {isSubmitting ? 'Saving...' : 'Save Activity'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const TypeOption = ({ type, icon, selectedType, setType }: { type: 'run' | 'ride', icon: React.ReactNode, selectedType: string, setType: (type: 'run' | 'ride') => void }) => (
    <button type="button" onClick={() => setType(type)} className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${selectedType === type ? 'border-orange-500 bg-[#111827]' : 'border-slate-700 bg-[#0A0F24] hover:border-slate-500'}`}>
        {icon}
        <span className="font-semibold capitalize">{type}</span>
    </button>
);

const InputField = ({ label, name, type = 'text', value, onChange, error, placeholder }: { label: string, name: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, placeholder?: string }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-[#0A0F24] text-slate-300 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            min={type === 'number' ? '0' : undefined}
            step={type === 'number' ? 'any' : undefined}
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
);

export default AddActivityPage;