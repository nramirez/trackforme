import AWS from 'aws-sdk';
import hat from 'hat';
import config from '../../config';

class S3 {
    constructor() {
        AWS.config.update({
            accessKeyId: config.AWS.S3.key,
            secretAccessKey: config.AWS.S3.secret,
            region: config.AWS.S3.region
        });

        this._s3 = new AWS.S3();
    }

    postImage(image) {
        return new Promise((resolve, reject) => {
                var params = {
                    Bucket: 'trackforme',
                    Key: hat(),
                    Body: buf,
                    ContentType: 'image/jpeg'
                };

        s3.putObject(params, function (err, data) {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });

    };

};