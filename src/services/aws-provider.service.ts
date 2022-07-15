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
import DataLakeAPIService from './dataLake-api.service';

const thumbnailGenerator = new ThumbnailGenerator()
const fileDetailsService = new FileDetailsService()
const dataLakeAPIService = new DataLakeAPIService()
let imageExtensionList = ['jpg', 'jpeg', 'png'];
let videoExtensionList = ['mp4', 'mkv'];
let FILE_SET_SIZE = 2

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

    let imageMetaDataList: object[] | undefined = []
    let videoMetaDataList: object[] | undefined = []

    logger.debug('file path: ', filePath)
    let filePathArray = filePath.split(/\//);
    let fileName = filePathArray[filePathArray.length - 1]
    let key = `${fileName}`
    try{
      await this.uploadFileFromLoaclStorage(filePath, key, bucket);
      await this.uploadThumbnailImage(filePath, fileName, key, bucket, undefined, imageMetaDataList, videoMetaDataList);
      logger.debug('file upload success', key)

      if(imageMetaDataList.length > 0){
        logger.debug('image meta list', imageMetaDataList)
        let response = await dataLakeAPIService.updateMetaData(imageMetaDataList)
        logger.debug('response', response)
        return response
      }
      if(videoMetaDataList.length > 0){
        logger.debug('video meta list', videoMetaDataList)
        let response = await dataLakeAPIService.updateMetaData(videoMetaDataList)
        logger.debug('response', response)
        return response
      }
      return {
        success: true,
        objectKeys: [key]
      }
    }catch(error){
      logger.error('file upload failed', error)
      return {
        success: false,
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
    //logger.debug(files);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']
    let keys: string[] = []
    let imageCollectionId: string = ''
    let videoCollectionId: string = ''

    
    let folderPathArray = folderPath.split(/\//);
    let collectionName = folderPathArray[folderPathArray.length - 1]

    let videoFileArray = []
    let imageFileArray = []
    let _videoFileArray = []
    let _imageFileArray = []
    let count = 0
    for(let fileName of files){
      
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      //logger.debug(fileNameArray)
      if(imageExtensionList.includes(extention)) _imageFileArray.push(fileName)
      else if(videoExtensionList.includes(extention)) _videoFileArray.push(fileName)
      count += 1
      if(_videoFileArray.length == FILE_SET_SIZE || count == files.length){
        videoFileArray.push(_videoFileArray)
        _videoFileArray = []
      }
      if(_imageFileArray.length == FILE_SET_SIZE || count == files.length){
        //logger.debug(_imageFileArray.length == 10, count == files.length)
        imageFileArray.push(_imageFileArray)
        _imageFileArray = []
      }
    }
    logger.debug(videoFileArray, imageFileArray)
    for(let fileList of videoFileArray){
      let collectionNameTemp = `${collectionName}_video`
      let response = await this.uploadFileSet(
        folderPath, 
        fileList, 
        keys, 
        bucket, 
        collectionNameTemp,
        videoCollectionId
      )
      if(response && response.collectionId) videoCollectionId = response.collectionId
    }
    for(let fileList of imageFileArray){
      let collectionNameTemp = `${collectionName}_image`
      let response = await this.uploadFileSet(
        folderPath, 
        fileList, 
        keys, 
        bucket, 
        collectionNameTemp,
        imageCollectionId
      )
      if(response && response.collectionId) imageCollectionId = response.collectionId
    }
    return {
      success: true,
      objectKeys: keys
    }
  };

  async uploadFileSet(
    folderPath: string, 
    files: string[], 
    keys: string[], 
    bucket: string, 
    collectionNameTemp: string,
    collectionId: string
  )
  {
    
    let imageMetaDataList: object[] | undefined = []
    let videoMetaDataList: object[] | undefined = []
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']
    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      
      if(types.includes(extention)){

        logger.debug(fileName, 'include');
        let key = `${collectionNameTemp}/${fileName}`
        let filePath = `${folderPath}/${fileName}`

        try{
          await this.uploadFileFromLoaclStorage(filePath, key, bucket);
          
          await this.uploadThumbnailImage(filePath, fileName, key, bucket, collectionNameTemp, imageMetaDataList, videoMetaDataList);
          keys.push(key)
          logger.debug('file upload success', key)
        }catch(error){
          logger.error(`file path ${filePath} upload failed`, error)
          continue
        }
      }
    }
    if(imageMetaDataList.length > 0){
      logger.debug('image meta list', imageMetaDataList)
      let response = await dataLakeAPIService.updateMetaData(imageMetaDataList, `${collectionNameTemp}_image`, 2, collectionId)
      logger.debug('response', response)
      return response
    }
    if(videoMetaDataList.length > 0){
      logger.debug('video meta list', videoMetaDataList)
      let response = await dataLakeAPIService.updateMetaData(videoMetaDataList, `${collectionNameTemp}_video`, 1, collectionId)
      logger.debug('response', response)
      return response
    }
  }


  async uploadFolderRecursively(folderPath: string, keys: string[], bucket: string){
    let imageCollectionId: string = ''
    let videoCollectionId: string = ''
    let folderPathArray = folderPath.split(/\//);
    let collectionName = folderPathArray[folderPathArray.length - 1]
    let fileList: string[] = []
    try{
      await this.getFilesRecursively(folderPath, fileList)
      //logger.debug(fileList)

      
      for(let i in fileList){
        let filePathArray = fileList[i].split(/\//)
        
        let index = filePathArray.findIndex(name => name == collectionName)
        //logger.debug(index)
        fileList[i] = filePathArray.slice(index+1).join('/')
        
        
      }
      logger.debug(fileList)
      let videoFileArray = []
      let imageFileArray = []
      let _videoFileArray = []
      let _imageFileArray = []
      let count = 0
      for(let fileName of fileList){
        
        let fileNameArray = fileName.split('.');
        let extention = fileNameArray[fileNameArray.length - 1]
        //logger.debug(fileNameArray)
        if(imageExtensionList.includes(extention)) _imageFileArray.push(fileName)
        else if(videoExtensionList.includes(extention)) _videoFileArray.push(fileName)
        count += 1
        if(_videoFileArray.length == FILE_SET_SIZE || count == fileList.length){
          videoFileArray.push(_videoFileArray)
          _videoFileArray = []
        }
        if(_imageFileArray.length == FILE_SET_SIZE || count == fileList.length){
          //logger.debug(_imageFileArray.length == 10, count == files.length)
          imageFileArray.push(_imageFileArray)
          _imageFileArray = []
        }
      }

      logger.debug(videoFileArray, imageFileArray)
      for(let fileList of videoFileArray){
        let collectionNameTemp = `${collectionName}_video`
        let response = await this.uploadFileSet(
          folderPath, 
          fileList, 
          keys, 
          bucket, 
          collectionNameTemp,
          videoCollectionId
        )
        if(response && response.collectionId) videoCollectionId = response.collectionId
      }
      for(let fileList of imageFileArray){
        let collectionNameTemp = `${collectionName}_image`
        let response = await this.uploadFileSet(
          folderPath, 
          fileList, 
          keys, 
          bucket, 
          collectionNameTemp,
          imageCollectionId
        )
        if(response && response.collectionId) imageCollectionId = response.collectionId
      }
      
      return {
        success: true,
        objectKeys: keys,
      }
    }catch(err){
      return {
        success: false,
        error: String(err),
        objectKeys: ['']
      }
    }
  }


  async getFilesRecursively(folderPath: string, fileList: string[]){
    var files = fs.readdirSync(folderPath);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']

    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]

      if(types.includes(extention)){
        fileList.push(`${folderPath}/${fileName}`)
      }
      if(fileNameArray.length == 1){
        await this.getFilesRecursively(`${folderPath}/${fileName}`, fileList);
      }
    }

    
  }

  /**
   * Use to process key and files paths of uploading files of folder recusively to storage
   * @param folderPath {string} path of the folder
   * @returns 
   */
  async uploadFolderRecursivelyToStorage(folderPath: string, keys: string[], bucket: string, collectionName: string, imageMetaDataList?: object[], videoMetaDataList?: object[]){

    var files = fs.readdirSync(folderPath);
    logger.debug(files);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']

    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      logger.debug(fileName, extention);
      let collectionNameTemp: string = collectionName

      if(types.includes(extention)){

        let imageList = ['jpg', 'jpeg', 'png'];
        let videoList = ['mp4', 'mkv'];
        if(imageList.includes(extention)) collectionNameTemp = `${collectionNameTemp}_image`
        else if(videoList.includes(extention)) collectionNameTemp = `${collectionNameTemp}_video`

        logger.debug(fileName, 'include');
        let key = `${collectionNameTemp}/${fileName}`
        let filePath = `${folderPath}/${fileName}`

        try{
          await this.uploadFileFromLoaclStorage(`${folderPath}/${fileName}`, key, bucket);
          await this.uploadThumbnailImage(filePath, fileName, key, bucket, collectionNameTemp, imageMetaDataList, videoMetaDataList);
          logger.debug(`file path ${filePath}  upload success`, key)
          keys.push(key)
        }catch(error){
          logger.error(`file path ${filePath} upload failed`, error)
          continue
        }
        //await this.updateDataLakeMetadata(key, fileName, filePath);
      }
      if(fileNameArray.length == 1){
        await this.uploadFolderRecursivelyToStorage(`${folderPath}/${fileName}`, keys, bucket, collectionName,imageMetaDataList, videoMetaDataList);
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
  async uploadThumbnailImage(
    filePath: string, 
    fileName: string, 
    key: string, 
    bucket: string, 
    collectionName?: string,
    imageMetaDataList?: object[],
    videoMetaDataList?: object[]
  ){

    let imageList = ['jpg', 'jpeg', 'png'];
    let videoList = ['mp4', 'mkv'];
    let fileNameSplitted = fileName.split('.')
    let extention = fileNameSplitted[fileNameSplitted.length - 1];
    let details: any
    let collectionType = 0
    if(imageList.includes(extention)){
      details  = await thumbnailGenerator.imageThumbnailGenerator(filePath)
      collectionType = 2
    }
    else if(videoList.includes(extention)){
      details  = await thumbnailGenerator.videoThumbnailGenerator(filePath, fileName)
      collectionType = 1
    }
    //logger.debug('thumb details: ', details)
    let thumbnailKey = details.fileName
    if(collectionName) thumbnailKey = `${collectionName}/${thumbnailKey}`
    await this.uploadFileFromLoaclStorage(details.filePath, thumbnailKey, bucket);

    let fileDetails: any = await fileDetailsService.getFileDetails(filePath)
    //logger.debug('file details: ', fileDetails)
    let metaDataObject: any = {}
    if(fileDetails && fileDetails.summerizedMetaData){
      metaDataObject = {
        objectKey: key,
        thumbnailKey: thumbnailKey,
        ...fileDetails.summerizedMetaData
      }
      //await dataLakeAPIService.updateMetaData([{metaDataObject: metaDataObject}], collectionName, collectionType)
    }else{
      metaDataObject = {
        objectKey: key,
        thumbnailKey: thumbnailKey
      }
      //await dataLakeAPIService.updateMetaData([{metaDataObject: metaDataObject}], collectionName, collectionType)
    }

    if(collectionType == 2 && imageMetaDataList){
      imageMetaDataList.push({metaDataObject: metaDataObject})
    }
    if(collectionType == 1 && videoMetaDataList){
      videoMetaDataList.push({metaDataObject: metaDataObject})
    }
    logger.debug('remove path', details.filePath)

    fs.unlinkSync(details.filePath);
    return
  }
}