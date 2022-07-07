/**
 * @class AwsStorageService
 * purpose of AwsStorageService is to handle upload of files to S3 bucket
 * @description AwsStorageService handle AWS S3 upload from local storage
 * @author chathushka
 */
import * as AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';
import fs from 'fs-extra';
import { logger } from '../config';
import { StorageKeys } from './data-uploader.service';

export class AwsStorageService {
  constructor(
  ) {}

  // /**
  //  * Use for Initialize the s3Bucket
  //  * @returns initialized s3Bucket
  //  */
  //  async initAWS(awsKeys: StorageKeys) {
  //    logger.debug('initAWS:', awsKeys)
  //   const s3Bucket = new AWS.S3({
  //     accessKeyId: awsKeys.accessKeyId,
  //     secretAccessKey: awsKeys.secretAccessKey,
  //     signatureVersion: 'v4',
  //     region: awsKeys.region,
  //   });
  //   return s3Bucket;
  // }

  /**
   * Use to upload single file from the local storage to AWS S3 bucket
   * @param filePath {string} path of the file
   * @param key {string} AWS S3 key
   */
  async uploadFileFromLoaclStorage(filePath: string, key: string, s3Bucket: S3, bucket: string){
    //let s3Bucket = await this.initAWS(awsKeys);

    logger.debug(filePath)
    const params = {
        Bucket: bucket ?  bucket : 'testbucketdatalake', // pass your bucket name
        Key: key, // file will be saved as key
        Body: fs.createReadStream(filePath)
    };
    await s3Bucket.upload(params).promise();
  };
}