import mongoose from 'mongoose';

// Ensure User model is registered first
// This prevents "Schema hasn't been registered for model 'User'" error
if (!mongoose.models.User) {
  require('./User');
}

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  price: {
    type: String, // Using String to allow formats like "ETB 1,000/mo" or "ETB 500,000"
    required: [true, 'Please provide a price'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
  },
  type: {
    type: String,
    enum: ['Buy', 'Rent', 'Sell', 'New Projects'],
    required: [true, 'Please provide a property type'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Keep string for now, but ensure User is imported
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

console.log('Registering Property model');
export default mongoose.models.Property || mongoose.model('Property', PropertySchema);
