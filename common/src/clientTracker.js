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

    getElementByPath = path => this.document.find(path);
}

export default ClientTracker;
