/**
 * @class AwsCloudService
 * purpose of AwsCloudService is to handle upload of files to S3 bucket
 * @description AwsCloudService handle AWS S3 upload from local storage
 * @author chathushka
 */
import * as AWS from 'aws-sdk';
import fs from 'fs-extra';
import { logger } from '../config';
import { AwsConfiguration } from '../settings/aws-configuration.settings';
import { StorageKeys } from './data-uploader.service';

const AWS_ACCESS_KEY = AwsConfiguration.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = AwsConfiguration.AWS_SECRET_KEY;
const AWS_REGION = AwsConfiguration.AWS_REGION;
const AWS_BUCKET_NAME = AwsConfiguration.AWS_BUCKET_NAME;
const AWS_BUCKET_S3_FILE_UPLOAD_PREFIX = AwsConfiguration.AWS_BUCKET_S3_FILE_UPLOAD_PREFIX;

export class AwsCloudService {
  constructor(
  ) {}

  /**
   * Use for Initialize the s3Bucket
   * @returns initialized s3Bucket
   */
   async initAWS(awsKeys: StorageKeys) {
     logger.debug('initAWS:', awsKeys)
    const s3Bucket = new AWS.S3({
      accessKeyId: awsKeys.accessKeyId,
      secretAccessKey: awsKeys.secretAccessKey,
      signatureVersion: 'v4',
      region: awsKeys.region,
    });
    return s3Bucket;
  }

  /**
   * Use to upload single file from the local storage to AWS S3 bucket
   * @param filePath {string} path of the file
   * @param key {string} AWS S3 key
   */
  async uploadFileFromLoaclStorage(filePath: string, key: string, awsKeys: StorageKeys){
    let s3Bucket = await this.initAWS(awsKeys);

    logger.debug(filePath)
    const params = {
        Bucket: awsKeys.bucket || 'testbucketdatalake', // pass your bucket name
        Key: key, // file will be saved as key
        Body: fs.createReadStream(filePath)
    };
    // (await s3Bucket).upload(params, function(s3Err: any, data: {Location: any;}) {
    //     if (s3Err) throw s3Err
    //     console.log(`File uploaded successfully at ${data.Location}`)
    // });
    await s3Bucket.upload(params).promise();
  };

  /**
   * Use to upload single file from the API call (Buffer) to AWS S3 bucket
   * @param data {buffer} data buffer
   * @param key {string} AWS S3 key
   */
  async uploadFileAPI(data: string, key: string, awsKeys: StorageKeys){
    let s3Bucket = this.initAWS(awsKeys);

    const params = {
        Bucket: AWS_BUCKET_NAME || 'testbucketdatalake', // pass your bucket name
        Key: key, // file will be saved as key
        Body: data
    };
    (await s3Bucket).upload(params, function(s3Err: any, data: {Location: any;}) {
        if (s3Err) throw s3Err
        console.log(`File uploaded successfully at ${data.Location}`)
    });
  };
}