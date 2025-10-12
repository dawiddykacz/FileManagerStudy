const AWS = require("aws-sdk");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const mime = require("mime-types")

dotenv.config();

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({ storage: multer.memoryStorage() });

async function initBucket(bucketName) {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log("Bucket exists");
  } catch {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log("Bucket created:", bucketName);
    await enableCors(bucketName);
  }
}

async function enableCors(bucketName) {
  const corsParams = {
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "HEAD"],
          AllowedOrigins: ["http://localhost:3000"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000
        },
      ],
    },
  };

  await s3.putBucketCors(corsParams).promise();
  console.log("CORS enabled for bucket:", bucketName);
}

async function addFile(bucketName, key, file) {
  if (!file.filepath) throw new Error("File path is undefined");
  const buffer = fs.readFileSync(file.filepath);
  if(!buffer) throw new Error("File size is 0");
  const contentType = mime.lookup(file.filepath) || 'application/octet-stream';
  await s3.putObject({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType, 
  }).promise();
  console.log(`Uploaded: ${key} ${contentType}`);
}

async function getPresignedUrl(key) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: 60 * 5,
  };
  const url = localstackUrlForBrowser(s3.getSignedUrl('getObject', params));
  console.log(url)
  return url;
}

function localstackUrlForBrowser(url) {
  return url.replace('http://localstack:4566', 'http://localhost:4566');
}

async function getFile(bucketName, key) {
  return await s3.getObject({
    Bucket: bucketName,
    Key: key,
  }).promise();
}

async function deleteFile(bucketName, key) {
  return s3.deleteObject({
    Bucket: bucketName,
    Key: key,
  }).promise();
}

module.exports = {initBucket,addFile,getFile,deleteFile, getPresignedUrl}