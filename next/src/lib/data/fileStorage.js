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
    try{
      await s3.createBucket({ Bucket: bucketName }).promise();
      console.log("Bucket created:", bucketName);
      await enableCors(bucketName);
    }catch (createErr) {
      if (
        createErr.code === "BucketAlreadyOwnedByYou" ||
        createErr.code === "BucketAlreadyExists"
      ) {
        console.log("Bucket already exists (caught during create). OK.");
      } else {
        console.error("Failed to create bucket:", createErr);
        throw createErr;
      }
    }
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

  const newId = parseInt(key.split("v")[1]) - 1;
  const newKey = key.replace("v"+(newId+1),"v"+newId);

  oldFile = await getFile(bucketName,newKey);
  if((oldFile != undefined && oldFile != null) && oldFile.ContentType != contentType){
    throw Error("Content type is not correct");
  }

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
  return url;
}

function localstackUrlForBrowser(url) {
  return url.replace('http://localstack:4566', 'http://localhost:4566');
}

async function getFile(bucketName, key) {
  try{
    return await s3.getObject({
      Bucket: bucketName,
      Key: key,
    }).promise();
  }catch{
    return null;
  }
}

async function deleteFile(bucketName, key) {
  return s3.deleteObject({
    Bucket: bucketName,
    Key: key,
  }).promise();
}

module.exports = {initBucket,addFile,getFile,deleteFile, getPresignedUrl}