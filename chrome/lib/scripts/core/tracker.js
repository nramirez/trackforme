'use strict';

import request from 'request';
import status from './trackerStatus';
import $ from 'jquery';

class Tracker {
  constructor(url) {
    if (!url) {
      throw 'Url is required';
    }
    this.url = url;
  }

  fetchPage() {
    return new Promise((resolve, reject) => {
      request(this.url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          this.document = $(body);
          resolve(true);
        }
      });
    });
  }

  checkElementStatus(lastContent, path) {
    if (!lastContent)
      throw 'lastContent is required';

    if (!path)
      throw 'path is required';

    const currentElement = $(this.document).find(path);

    if (!currentElement) {
      return {
        changed: true,
        reason: status.UNEXISTING
      };
    }

    if (lastContent !== currentElement.html()) {
      return {
        changed: true,
        reason: status.CHANGED
      };
    }

    return {
      changed: false,
      reason: status.NOCHANGED
    };
  }
}

export default Tracker;
