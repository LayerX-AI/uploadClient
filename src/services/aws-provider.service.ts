/**
 * @class AWSProviderService
 * purpose of AWSProviderService is to handle upload of files to storages
 * @description AWSProviderService handle AWS S3 uploads for single file, single folder and single folder with recursivley
 * @author chathushka
 */
import { logger } from '../config';
import fs from 'fs-extra';
import { StorageKeys } from './data-uploader.service';
import { StorageProviderService } from './storage-provider.service';
import AWS, { S3 } from 'aws-sdk';
import { ThumbnailGenerator } from './thumbnail-generation.service';
import { FileDetailsService } from './file-details.service';

const thumbnailGenerator = new ThumbnailGenerator()
const fileDetailsService = new FileDetailsService()

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
      await this.uploadFileFromLoaclStorage(filePath, key, bucket);
      await this.uploadThumbnailImage(filePath, fileName, key, bucket);
      logger.debug('file upload success', key)
      return {
        sucess: true,
        objectKeys: [key]
      }
    }catch(error){
      logger.error('file upload failed', error)
      return {
        sucess: false,
        error: String(error),
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

      let folderPathArray = folderPath.split(/\//);
      let collectionName = folderPathArray[folderPathArray.length - 1]
      //logger.debug(file, extention);
      if(types.includes(extention)){

        let imageList = ['jpg', 'jpeg', 'png'];
        let videoList = ['mp4', 'mkv'];
        if(imageList.includes(extention)) collectionName = `${collectionName}_image`
        else if(videoList.includes(extention)) collectionName = `${collectionName}_video`

        logger.debug(fileName, 'include');
        let key = `${collectionName}/${fileName}`
        let filePath = `${folderPath}/${fileName}`

        try{
          await this.uploadFileFromLoaclStorage(filePath, key, bucket);
          await this.uploadThumbnailImage(filePath, fileName, key, bucket, collectionName);
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

    let folderPathArray = folderPath.split(/\//);
    let collectionName = folderPathArray[folderPathArray.length - 1]

    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      logger.debug(fileName, extention);

      if(types.includes(extention)){

        let imageList = ['jpg', 'jpeg', 'png'];
        let videoList = ['mp4', 'mkv'];
        if(imageList.includes(extention)) collectionName = `${collectionName}_image`
        else if(videoList.includes(extention)) collectionName = `${collectionName}_video`

        logger.debug(fileName, 'include');
        let key = `${collectionName}/${fileName}`
        let filePath = `${folderPath}/${fileName}`

        try{
          await this.uploadFileFromLoaclStorage(`${folderPath}/${fileName}`, key, bucket);
          await this.uploadThumbnailImage(filePath, fileName, key, bucket, collectionName);
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

  /**
   * Use to upload single file from the local storage to AWS S3 bucket
   * @param filePath {string} path of the file
   * @param key {string} AWS S3 key
   */
   async uploadFileFromLoaclStorage(filePath: string, key: string, bucket: string){
    //let s3Bucket = await this.initAWS(awsKeys);

    logger.debug(filePath)
    const params = {
        Bucket: bucket ?  bucket : 'testbucketdatalake', // pass your bucket name
        Key: key, // file will be saved as key
        Body: fs.createReadStream(filePath)
    };
    await this.s3Bucket.upload(params).promise();
  };


  /**
   * Use to upload generated thumbnail for aws s3
   * @param filePath {string} path of the file
   * @param fileName {string} name of the file
   * @param key {string} object key
   * @param bucket {string} name of the bucket
   * @returns 
   */
  async uploadThumbnailImage(filePath: string, fileName: string, key: string, bucket: string, collectionName?: string){

    let imageList = ['jpg', 'jpeg', 'png'];
    let videoList = ['mp4', 'mkv'];
    let fileNameSplitted = fileName.split('.')
    let extention = fileNameSplitted[fileNameSplitted.length - 1];
    let details: any
    if(imageList.includes(extention)){
      details  = await thumbnailGenerator.imageThumbnailGenerator(filePath)
    }
    else if(videoList.includes(extention)){
      details  = await thumbnailGenerator.videoThumbnailGenerator(filePath, fileName)
    }
    //logger.debug('thumb details: ', details)
    let thumbnailKey = details.fileName
    if(collectionName) thumbnailKey = `${collectionName}/${thumbnailKey}`
    await this.uploadFileFromLoaclStorage(details.filePath, thumbnailKey, bucket);

    let fileDetails: any = await fileDetailsService.getFileDetails(filePath)
    //logger.debug('file details: ', fileDetails)
    if(fileDetails && fileDetails.summerizedMetaData){
      await fileDetailsService.updateDataLakeMetadata(key, {
        thumbnailKey: thumbnailKey,
        ...fileDetails.summerizedMetaData
      })
    }else{
      await fileDetailsService.updateDataLakeMetadata(key, {
        thumbnailKey: thumbnailKey,
      })
    }

    
    fs.unlinkSync(details.filePath);
    return
  }
}