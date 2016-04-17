'use strict';
const COLLECTION = 'Users';

export default (mongoose) => {
    try {
        if (mongoose.model(COLLECTION))
            return mongoose.model(COLLECTION);
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
            const User = new mongoose.Schema({
                email: String,
                trackingTime: Number
            });

            return mongoose.model(COLLECTION, User);
        }
    }
};
