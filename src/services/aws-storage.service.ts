import * as AWS from 'aws-sdk';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../config';
import { AwsConfiguration } from '../settings/aws-configuration.settings';
import { FileUploadService } from './file-upload.service';

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
   async initAWS() {
    const s3Bucket = new AWS.S3({
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
      signatureVersion: 'v4',
      region: AWS_REGION,
    });
    return s3Bucket;
  }


  async uploadFileFromLoaclStorage(filePath: string, key: string){
    let s3Bucket = await this.initAWS();

    logger.debug(filePath)
    const params = {
        Bucket: AWS_BUCKET_NAME || 'testbucketdatalake', // pass your bucket name
        Key: key, // file will be saved as key
        Body: fs.createReadStream(filePath)
    };
    // (await s3Bucket).upload(params, function(s3Err: any, data: {Location: any;}) {
    //     if (s3Err) throw s3Err
    //     console.log(`File uploaded successfully at ${data.Location}`)
    // });
    try{
      await s3Bucket.upload(params).promise();
      logger.debug('file upload success', key)
    }catch(err){
      logger.error('file upload failed', err)
    }
    
  };


  async uploadFileAPI(data: string, key: string){
    let s3Bucket = this.initAWS();

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