import React, { useState, useEffect } from 'react';
import { Check, X, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContactRequestListProps {
    currentUser: any;
    onRequestProcessed: () => void;
}

export const ContactRequestList = ({ currentUser, onRequestProcessed }: ContactRequestListProps) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [currentUser]);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/contact-requests', {
                credentials: 'include' // Include cookies for authentication
            });
            const data = await res.json();
            if (data.success) {
                // Filter for received requests that are pending
                const received = data.data.filter((req: any) =>
                    req.receiver._id === currentUser._id && req.status === 'pending'
                );
                setRequests(received);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`/api/contact-requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ status: action })
            });

            if (res.ok) {
                // Remove from list
                setRequests(prev => prev.filter(req => req._id !== requestId));
                // Notify parent to refresh conversations if accepted
                if (action === 'accept') {
                    onRequestProcessed();
                }
            }
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <p>No pending contact requests</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <div key={request._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900">{request.sender.name}</h4>
                                    <p className="text-sm text-gray-500">{request.sender.email}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {request.property && (
                                <div className="flex items-center gap-2 mt-2 bg-gray-50 p-2 rounded-lg">
                                    <Home className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 truncate">{request.property.title}</span>
                                </div>
                            )}

                            {request.message && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg italic">
                                    "{request.message}"
                                </p>
                            )}

                            <div className="flex gap-2 mt-4">
                                <Button
                                    onClick={() => handleAction(request._id, 'accept')}
                                    className="flex-1 bg-black text-white py-2 text-sm h-auto"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => handleAction(request._id, 'reject')}
                                    variant="outline"
                                    className="flex-1 py-2 text-sm h-auto border-gray-200"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
