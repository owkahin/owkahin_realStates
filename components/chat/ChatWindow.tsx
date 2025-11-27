import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User } from 'lucide-react';

interface ChatWindowProps {
    currentUser: any;
    recipient: any;
    onBack: () => void;
}

export const ChatWindow = ({ currentUser, recipient, onBack }: ChatWindowProps) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling for new messages
        return () => clearInterval(interval);
    }, [recipient._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages/${recipient._id}`, {
                credentials: 'include' // Include cookies for authentication
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({
                    receiverId: recipient._id,
                    content: newMessage,
                }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white absolute inset-0 z-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {recipient.profilePic ? (
                        <img src={recipient.profilePic} alt={recipient.username} className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-gray-400" />
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{recipient.fullName}</h3>
                    <p className="text-xs text-gray-500">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="text-center text-gray-400 mt-10">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        Say hello to {recipient.fullName}!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender === currentUser._id;
                        return (
                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe
                                        ? 'bg-black text-white rounded-tr-none'
                                        : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 pb-8">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
