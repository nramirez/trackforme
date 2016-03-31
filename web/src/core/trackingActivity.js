'use strict';

import Tracker from './tracker.js';
import Site from '../models/site.js';
import "babel-polyfill";

class TrackingActivity {
    constructor() {
        this.sites = [];
        //Determines the current site being evaluated
        this.siteIndex = 0;
        //Push site changes to this variable,
        //which at the end will be the response
        this.siteUpdates = [];
    }

    //This is the main process
    run() {
        return new Promise((resolve, reject) => {
            this.setSites()
                .then(s => this.evaluateSites(resolve, reject))
                .catch(err => reject(err));
        });
    }

    //Here resides the filter for the sites that will be evaluated
    setSites() {
        return new Promise((resolve, reject) => {
            //Add the filter criteria for the sites to inspect
            Site.find({}, (err, sites) => {
                if (err) {
                    reject(err);
                } else {
                    this.sites = sites;
                    this.currentSitesGen = this.sitesGenerator();
                    resolve(sites)
                }
            });
        });
    }

    //Returns the currentSite being evaluated and jump to the next one
    * sitesGenerator() {
        while(this.siteIndex < this.sites.length) {
            yield this.sites[this.siteIndex];
            this.siteIndex++;
        }
    }

    //After the sites have been setSites
    //This method will iterate for all of then evaluating the changes
    //This method resolve the promise
    evaluateSites(resolve, reject) {
        let currentSite = this.currentSitesGen.next().value;
        if (currentSite) {
            let tracker = new Tracker(currentSite.url);
            tracker.fetchPage()
                .then(f => {
                    let status = tracker.checkElementStatus(currentSite.elementContent, 
                        currentSite.elementPath);
                    this.siteUpdates.push(status);
                    this.evaluateSites(resolve, reject);
                }).catch(err => reject(err));
        } else {
            resolve(this.siteUpdates);
        }
    }
}

export default TrackingActivity;
