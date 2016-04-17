'use strict';
const COLLECTION = 'Trackings';

export default (mongoose) => {
    try {
        if (mongoose.model(COLLECTION))
            return mongoose.model(COLLECTION);
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
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

            return mongoose.model(COLLECTION, Tracking);
        }
    }
};
