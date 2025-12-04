import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
// Import models in correct order to ensure schemas are registered
import User from '@/models/User';
import Property from '@/models/Property';
import ContactRequest from '@/models/ContactRequest';

// Send contact request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, propertyId, message } = await request.json();

    // Check if request already exists
    const existing = await ContactRequest.findOne({
      sender: decoded.userId,
      receiver: receiverId,
      property: propertyId,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Request already sent', status: existing.status },
        { status: 400 }
      );
    }

    const contactRequest = await ContactRequest.create({
      sender: decoded.userId,
      receiver: receiverId,
      property: propertyId,
      message: message || 'Hi, I\'m interested in your property.',
    });

    const populated = await ContactRequest.findById(contactRequest._id)
      .populate('sender', 'name email profilePic')
      .populate('receiver', 'name email profilePic')
      .populate('property', 'title image');

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Get contact requests (sent and received)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'sent' or 'received'

    const query = type === 'sent'
      ? { sender: decoded.userId }
      : { receiver: decoded.userId };

    const requests = await ContactRequest.find(query)
      .populate('sender', 'name email profilePic')
      .populate('receiver', 'name email profilePic')
      .populate('property', 'title image price location')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
