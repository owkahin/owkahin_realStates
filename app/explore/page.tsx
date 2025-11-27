'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { BottomNav } from '@/components/ui/BottomNav';
import { UserList } from '@/components/explore/UserList';
import { AuthForm } from '@/components/auth/AuthForm';

export default function ExplorePage() {
    const [user, setUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user, searchQuery]);

    const checkAuth = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const endpoint = searchQuery
                ? `/api/search?q=${searchQuery}`
                : '/api/explore/users';

            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleFollow = async (targetUserId: string) => {
        try {
            const res = await fetch(`/api/users/${targetUserId}/follow`, {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
            });

            if (res.ok) {
                // Update local user state
                const updatedUser = { ...user, following: [...(user.following || []), targetUserId] };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to follow user', error);
        }
    };

    const handleUnfollow = async (targetUserId: string) => {
        try {
            const res = await fetch(`/api/users/${targetUserId}/unfollow`, {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
            });

            if (res.ok) {
                // Update local user state
                const updatedUser = {
                    ...user,
                    following: user.following.filter((id: string) => id !== targetUserId)
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to unfollow user', error);
        }
    };

    const handleLogin = (userData: any) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-white pb-20 relative max-w-md mx-auto shadow-2xl overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Explore</h1>
                    <p className="text-gray-500 mb-8">Login to discover people.</p>
                    <AuthForm onLogin={handleLogin} />
                </div>
                <BottomNav />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white pb-20 relative max-w-md mx-auto shadow-2xl overflow-hidden">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Explore</h1>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>

                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-4">
                        {searchQuery ? 'Search Results' : 'Recommended for You'}
                    </h3>
                    <UserList
                        users={users}
                        currentUser={user}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                    />
                </div>
            </div>
            <BottomNav />
        </main>
    );
}
