'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { BottomNav } from '@/components/ui/BottomNav';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AuthForm } from '@/components/auth/AuthForm';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Try to get current user from a "me" endpoint or just check local storage if we were using it
            // For now, we'll assume if we have a user in state, we are logged in.
            // But since we reload, we need to persist. 
            // Let's use a simple localStorage persistence for MVP to avoid complex context
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData: any) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Also call logout API to clear cookie
        // fetch('/api/auth/logout', { method: 'POST' }); 
    };

    const handleUpdateProfile = async (data: any) => {
        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // Preserve email/username if not returned or just merge
                const newUser = { ...user, ...updatedUser };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
            }
        } catch (error) {
            console.error('Failed to update profile', error);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <main className="min-h-screen bg-white pb-20 relative">
            <Navbar />
            <div className="max-w-7xl mx-auto w-full md:px-6 md:py-8">
                {!user ? (
                    <div className="max-w-md mx-auto mt-10">
                        <AuthForm onLogin={handleLogin} />
                    </div>
                ) : (
                    <div className="md:grid md:grid-cols-12 md:gap-8">
                        {/* Sidebar (Profile Info) */}
                        <div className="md:col-span-4 lg:col-span-3">
                            <div className="md:bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-100 md:p-6 md:sticky md:top-24">
                                <ProfileHeader
                                    user={user}
                                    isOwnProfile={true}
                                    onEdit={() => setIsEditOpen(true)}
                                    onLogout={handleLogout}
                                />
                                <ProfileStats
                                    followers={user.followers?.length || 0}
                                    following={user.following?.length || 0}
                                />
                            </div>
                        </div>

                        {/* Main Content (Properties) */}
                        <div className="md:col-span-8 lg:col-span-9 mt-6 md:mt-0">
                            <div className="px-6 md:px-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl md:text-2xl text-gray-900">My Properties</h3>
                                    <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                                </div>

                                <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="flex flex-col items-center">
                                        <p className="text-lg font-medium text-gray-500 mb-2">No properties listed yet</p>
                                        <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                            Start listing your properties to reach millions of potential buyers and renters.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <EditProfileModal
                            user={user}
                            isOpen={isEditOpen}
                            onClose={() => setIsEditOpen(false)}
                            onSave={handleUpdateProfile}
                        />
                    </div>
                )}
            </div>
            <BottomNav />
        </main>
    );
}
