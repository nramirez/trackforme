'use strict';

import BaseTracker from './baseTracker';
import request from 'request';
import { jsdom } from 'jsdom';

class ServerTracker extends BaseTracker {
    fetchPage() {
        return new Promise((resolve, reject) =>
            request(this.url, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    this.document = jsdom(body);
                    resolve(body);
                }
            })
        );
    }

    getElementByPath(path) {
        return this.document.querySelector(path);
    }
}

export default ServerTracker;
