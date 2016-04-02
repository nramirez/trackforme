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
      const buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""),'base64');

      const params = {
        Bucket: 'trackforme',
        Key: hat(),
        Body: buf,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };

      this._s3.upload(params, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  };
};

export default S3;
