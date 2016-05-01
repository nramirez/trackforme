'use strict';

import status from './trackingStatus';

class BaseTracker {
    constructor(url) {
        if (!url) {
            throw 'Url is required';
        }
        this.url = url;
    }

    getElementByPath(path) {
        throw 'This must be done in the concreate implementation';
    }

    checkElementStatus(lastContent, path) {
        if (!lastContent)
            throw 'lastContent is required';

        if (!path)
            throw 'path is required';

        const currentElement = this.getElementByPath(path);

        if (!currentElement)
            return status.UNEXISTING;

        if (lastContent !== currentElement.innerHTML)
            return status.CHANGED;

        return status.NOCHANGES;
    }
}

export default BaseTracker;
