'use strict';

import BaseTracker from './baseTracker';
import $ from 'jquery';

class ClientTracker extends BaseTracker {
    fetchPage = () => new Promise((resolve, reject) =>
        $.get(this.url, (body) => {
            this.document = $(body);
            resolve(body);
        }).fail(reject)
    );

    getElementByPath = path => {
        let element = this.document.find(path);
        return element ? element[0] : null;
    };
}

export default ClientTracker;
