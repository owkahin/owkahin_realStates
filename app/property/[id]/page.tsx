'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Box, Bed, Bath, Car, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AmenityItem } from '@/components/property/AmenityItem';

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = React.use(params);
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`/api/properties/${unwrappedParams.id}`);
                const data = await res.json();

                if (data.success) {
                    setProperty(data.data);
                } else {
                    setError(data.error || 'Failed to load property');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while fetching the property');
            } finally {
                setLoading(false);
            }
        };

        if (unwrappedParams.id) {
            fetchProperty();
        }
    }, [unwrappedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error || 'Property not found'}</p>
                <Link href="/">
                    <Button variant="outline">Go Back Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white relative md:pt-20">
            <div className="max-w-7xl mx-auto w-full md:grid md:grid-cols-2 md:gap-8 md:px-8">
                {/* Image Section */}
                <div className="relative h-[50vh] w-full md:h-[600px] md:rounded-3xl md:overflow-hidden bg-gray-100">
                    <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 md:hidden">
                        <Link href="/" className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                            <ChevronLeft className="h-6 w-6 text-white" />
                        </Link>
                        <button className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                            <Box className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="absolute top-[45vh] left-0 right-0 bg-white rounded-t-[40px] min-h-[55vh] px-8 pt-10 pb-8 flex flex-col md:static md:min-h-0 md:bg-transparent md:p-0 md:block">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:text-4xl leading-tight">
                                {property.title}
                            </h1>
                            <p className="text-gray-500 font-medium md:text-lg">{property.location}</p>
                        </div>
                        <button className="h-12 w-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center md:bg-gray-50 shrink-0">
                            <Bookmark className="h-5 w-5 text-gray-900" />
                        </button>
                    </div>

                    {property.type && (
                        <div className="mb-6">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                                {property.type}
                            </span>
                        </div>
                    )}

                    <div className="text-gray-500 text-sm leading-relaxed mt-2 mb-8 md:text-base whitespace-pre-wrap">
                        {property.description}
                    </div>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar mb-auto md:mb-8 md:flex-wrap md:overflow-visible">
                        <AmenityItem icon={Bed} label="Bedroom" />
                        <AmenityItem icon={Bath} label="Bathroom" />
                        <AmenityItem icon={Car} label="Parking" />
                    </div>

                    <div className="mt-8 flex items-center justify-between md:mt-auto">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 md:text-3xl">{property.price}</p>
                            <p className="text-gray-400 text-xs md:text-sm">Price</p>
                        </div>
                        <Link href={`/booking?propertyId=${property._id}`}>
                            <Button className="bg-black text-white px-10 py-6 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors">
                                Book Now
                            </Button>
                        </Link>
                    </div>

                    {/* Owner Section */}
                    {property.owner && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-bold mb-4">Property Owner</h3>
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {property.owner.name ? property.owner.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{property.owner.name || 'Property Owner'}</p>
                                        <p className="text-sm text-gray-500">{property.owner.email}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            const userStr = localStorage.getItem('user');
                                            if (!userStr) {
                                                alert('Please login to contact owner');
                                                return;
                                            }
                                            const user = JSON.parse(userStr);

                                            if (user._id === property.owner._id) {
                                                alert('You cannot contact yourself');
                                                return;
                                            }

                                            const res = await fetch('/api/contact-requests', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                credentials: 'include', // Include cookies for authentication
                                                body: JSON.stringify({
                                                    receiverId: property.owner._id,
                                                    propertyId: property._id,
                                                    message: `Hi, I'm interested in ${property.title}`
                                                })
                                            });

                                            const data = await res.json();
                                            if (data.success) {
                                                alert('Contact request sent! 📨');
                                            } else {
                                                alert(data.error || 'Failed to send request');
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            alert('Failed to send request');
                                        }
                                    }}
                                >
                                    Contact Owner
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
