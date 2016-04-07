import mongoose from 'mongoose';

const User = new mongoose.Schema({
    email: String,
    trackingTime: Number
});

export default mongoose.model('User', User);
