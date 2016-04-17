import mongoose from 'mongoose';

const Tracking = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    url: String,
    img: String,
    creationDate: {
        type: Date,
        default: Date.now
    },
    lastScanDate: {
        type: Date,
        default: Date.now
    },
    checkFrequency: {
        type: Number,
        default: 60
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    elementPath: String,
    elementContent: String
});

export default mongoose.model('Trackings', Tracking);
