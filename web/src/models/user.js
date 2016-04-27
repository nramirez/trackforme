import mongoose from 'mongoose';

const User = new mongoose.Schema({
    email: String,
    name: String,
    trackingTime: Number,
    google: Object
});

export default mongoose.model('User', User);
