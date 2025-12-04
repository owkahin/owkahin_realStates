import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
// Import models in correct order to ensure schemas are registered
import User from '@/models/User';
import Property from '@/models/Property';
import ContactRequest from '@/models/ContactRequest';
import Conversation from '@/models/Conversation';

// Accept or reject contact request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json(); // 'accept' or 'reject'
    
    console.log(`[ContactRequest] Processing ${action} for ID: ${id}`);

    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
      console.log(`[ContactRequest] Request not found for ID: ${id}`);
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Verify user is the receiver
    if (contactRequest.receiver.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'accept') {
      contactRequest.status = 'accepted';
      await contactRequest.save();

      // Create conversation
      const conversation = await Conversation.create({
        participants: [contactRequest.sender, contactRequest.receiver],
        property: contactRequest.property,
        lastMessage: contactRequest.message,
      });

      const populated = await Conversation.findById(conversation._id)
        .populate('participants', 'name email profilePic')
        .populate('property', 'title image');

      return NextResponse.json({
        success: true,
        data: { request: contactRequest, conversation: populated },
      });
    } else if (action === 'reject') {
      contactRequest.status = 'rejected';
      await contactRequest.save();

      return NextResponse.json({ success: true, data: contactRequest });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
