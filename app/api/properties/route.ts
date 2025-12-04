import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
// Import User model BEFORE Property to ensure it's registered first
import User from '@/models/User';
import Property from '@/models/Property';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const property = await Property.create({
      ...body,
      owner: decoded.userId
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const properties = await Property.find({})
      .populate('owner', 'fullName username email profilePic')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: properties });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
