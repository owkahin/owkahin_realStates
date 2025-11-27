import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authenticateToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const authResult = await authenticateToken(req);
    
    // If authentication failed, return error response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;

    // Get update data from request body
    const updateData = await req.json();
    const { fullName, username, email, bio, phone, location, profilePic } = updateData;

    // Validate required fields
    if (!fullName || !username || !email) {
      return NextResponse.json(
        { error: 'Full name, username, and email are required' },
        { status: 400 }
      );
    }

    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: new mongoose.Types.ObjectId(userId) } },
        { $or: [{ email }, { username }] }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already taken' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        username,
        email,
        bio: bio || '',
        phone: phone || '',
        location: location || '',
        profilePic: profilePic || '',
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current user profile
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const authResult = await authenticateToken(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;

    // Get user data
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
