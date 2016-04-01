import mongoose from 'mongoose';

const User = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        index: {
            unique: true,
            dropDups: true
        }
    }
});

export default mongoose.model('User', User);
