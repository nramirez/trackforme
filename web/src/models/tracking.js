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
  enabled: {
    type: Boolean,
    default: true
  },
  deleted: Boolean,
  elementPath: String,
  elementContent: String
});

export default mongoose.model('Trackings', Tracking);
