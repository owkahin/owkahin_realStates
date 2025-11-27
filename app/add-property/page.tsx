'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { BottomNav } from '@/components/ui/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export default function AddPropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        type: 'Buy',
        description: '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please select an image');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload Image
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
                body: uploadFormData,
            });

            if (!uploadRes.ok) throw new Error('Image upload failed');
            const { url } = await uploadRes.json();

            // 2. Create Property
            const propertyRes = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({
                    ...formData,
                    image: url,
                }),
            });

            if (propertyRes.status === 401) {
                router.push('/login');
                return;
            }

            if (!propertyRes.ok) throw new Error('Failed to create property');

            alert('Property added successfully!');
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white pb-24">
            <Navbar />
            <div className="max-w-2xl mx-auto px-6 pt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Property</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Property Image</label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                            {imagePreview ? (
                                <div className="relative h-64 w-full">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click or drag to upload image</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <Input
                                placeholder="e.g. Modern Luxury Villa"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <Input
                                    placeholder="e.g. ETB 2,500,000"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full h-12 rounded-xl border border-gray-200 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Buy">Buy</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Sell">Sell</option>
                                    <option value="New Projects">New Projects</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <Input
                                placeholder="e.g. Beverly Hills, CA"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full min-h-[120px] rounded-xl border border-gray-200 p-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                                placeholder="Describe the property..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-600/20"
                        disabled={loading}
                    >
                        {loading ? 'Creating Property...' : 'Add Property'}
                    </Button>
                </form>
            </div>
            <BottomNav />
        </main>
    );
}
