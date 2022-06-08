
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const cred = new AWS.SharedIniFileCredentials({
    profile: "blind-chat-prod",
});
AWS.config.credentials = cred;
process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;
AWS.config.update({region: 'us-east-1', credentials: cred});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Create params for S3.deleteBucket


const emptyBucket = async (Bucket, NextContinuationToken, list = []) => {
    if (NextContinuationToken || list.length === 0) {
        return await s3
          .listObjectsV2({ Bucket, ContinuationToken: NextContinuationToken })
          .promise()
          .then(async ({ Contents, NextContinuationToken }) => {
              if (Contents.length) {
                  await s3
                    .deleteObjects({
                        Bucket,
                        Delete: {
                            Objects: Contents.map((item) => ({ Key: item.Key })),
                        },
                    })
                    .promise();
                  if (NextContinuationToken) {
                      console.log('deleted', NextContinuationToken);
                  }
                  return await emptyBucket(Bucket, NextContinuationToken, [
                      ...list,
                      ...Contents.map((item) => item.Key),
                  ]);
              }
              return list;
          });
    }
    return list;
};

(async ()=>{
    await s3.createBucket({
        Bucket: 'orr-test-2',
    }).promise();
    await s3.putObject({
        Bucket: 'orr-test-2',
        Body: JSON.stringify({a: "D"}),
        Key: `static/questions-updated.json`,
    }).promise();
    await emptyBucket('orr-test-2');
    await s3.deleteBucket({
        Bucket: 'orr-test-2',
    }).promise();
})()


