export default (Tracking) => {
    let ServerStore = {
        updateTrackingsStatus(trackings) {
            trackings.forEach(t => t.save());
        },
        Tracking: Tracking
    };

    return ServerStore;
};
