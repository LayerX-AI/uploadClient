/**
 * @class AWSProviderService
 * purpose of AWSProviderService is to handle upload of files to storages
 * @description AWSProviderService handle AWS S3 uploads for single file, single folder and single folder with recursivley
 * @author chathushka
 */
import { logger } from '../config';
import fs from 'fs-extra';
import {AwsStorageService} from './aws-storage.service';
import { StorageKeys } from './data-uploader.service';
import { StorageProviderService } from './storage-provider.service';
import AWS, { S3 } from 'aws-sdk';



const awsStorageService = new AwsStorageService()

export class AWSProviderService extends StorageProviderService{
  public s3Bucket: AWS.S3
  constructor(
    awsKeys: StorageKeys
  ) {
    super();
    this.s3Bucket = new AWS.S3({
      accessKeyId: awsKeys.accessKeyId,
      secretAccessKey: awsKeys.secretAccessKey,
      signatureVersion: 'v4',
      region: awsKeys.region,
    });
  }

  // async init(awsKeys: StorageKeys){
  //   logger.debug('initAWS:', awsKeys)
  //   const _s3Bucket = new AWS.S3({
  //     accessKeyId: awsKeys.accessKeyId,
  //     secretAccessKey: awsKeys.secretAccessKey,
  //     signatureVersion: 'v4',
  //     region: awsKeys.region,
  //   });
  //   //_s3Bucket
  // }

  /**
   * Use to process key and files paths of uploading one file to storage
   * @param filePath {string} path of the file
   * @returns 
   */
  async uploadObjectToStorage(filePath: string, bucket: string){

    logger.debug('file path: ', filePath)
    let filePathArray = filePath.split(/\//);
    let fileName = filePathArray[filePathArray.length - 1]
    let key = `${fileName}`
    try{
      await awsStorageService.uploadFileFromLoaclStorage(filePath, key, this.s3Bucket, bucket);
      logger.debug('file upload success', key)
      return {
        sucess: true,
        objectKeys: [key]
      }
    }catch(error){
      logger.error('file upload failed', error)
      return {
        sucess: false,
        objectKeys: ['']
      }
    }
  };

  /**
   * Use to process key and files paths of uploading files of folder to storage
   * @param folderPath {string} path of the folder
   * @returns 
   */
  async uploadFolderToStorage(folderPath: string, bucket: string){

    var files = fs.readdirSync(folderPath);
    logger.debug(files);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']
    let keys = []
    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      //logger.debug(file, extention);
      if(types.includes(extention)){
        logger.debug(fileName, 'include');
        let key = `${fileName}`
        let filePath = `${folderPath}/${fileName}`
        try{
          await awsStorageService.uploadFileFromLoaclStorage(filePath, key, this.s3Bucket, bucket);
          keys.push(key)
          logger.debug('file upload success', key)
        }catch(error){
          logger.error(`file path ${filePath} upload failed`, error)
          continue
        }
      }
    }
    return {
      sucess: true,
      objectKeys: keys
    }
  };

  /**
   * Use to process key and files paths of uploading files of folder recusively to storage
   * @param folderPath {string} path of the folder
   * @returns 
   */
  async uploadFolderRecursivelyToStorage(folderPath: string, keys: string[], bucket: string){

    var files = fs.readdirSync(folderPath);
    logger.debug(files);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']
    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      logger.debug(fileName, extention);

      
      if(types.includes(extention)){
        logger.debug(fileName, 'include');
        let key = `${fileName}`
        let filePath = `${folderPath}/${fileName}`

        try{
          await awsStorageService.uploadFileFromLoaclStorage(`${folderPath}/${fileName}`, key, this.s3Bucket, bucket);
          logger.debug(`file path ${filePath}  upload success`, key)
          keys.push(key)
        }catch(error){
          logger.error(`file path ${filePath} upload failed`, error)
          continue
        }
        //await this.updateDataLakeMetadata(key, fileName, filePath);
      }
      if(fileNameArray.length == 1){
        await this.uploadFolderRecursivelyToStorage(`${folderPath}/${fileName}`, keys, bucket);
      }
    }
  };
}