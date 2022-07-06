/**
 * @class FileUploadService
 * purpose of FileUploadService is to handle upload of files to storages
 * @description FileUploadService handle AWS S3,... uploads for single file, single folder and single folder with recursivley
 * @author chathushka
 */
import { logger } from '../config';
import fs from 'fs-extra';
import {AwsCloudService} from '../services/aws-storage.service';
import MongoDBCurdService from './mongodb-curd.service';
import * as ffmpeg from "fluent-ffmpeg";
import { IMetaData } from '../model/metaData';



const awsCloudService = new AwsCloudService()
const mongoDBCurdService = new MongoDBCurdService()

export class FileUploadService {
  constructor(
  ) {}

  /**
   * Use to process key and files paths of uploading one file to storage
   * @param filePath {string} path of the file
   * @returns 
   */
  async uploadObjectToStorage(filePath: string){

    logger.debug('file path: ', filePath)
    let filePathArray = filePath.split(/\//);
    let fileName = filePathArray[filePathArray.length - 1]
    let key = `${fileName}`
    try{
      await awsCloudService.uploadFileFromLoaclStorage(filePath, key);
      logger.debug('file upload success', key)
    }catch(error){
      logger.error('file upload failed', error)
      return
    }
    await this.updateDataLakeMetadata(key, fileName, filePath);
  };

  /**
   * Use to process key and files paths of uploading files of folder to storage
   * @param folderPath {string} path of the folder
   * @returns 
   */
  async uploadFolderToStorage(folderPath: string){
    if(!folderPath) return

    var files = fs.readdirSync(folderPath);
    logger.debug(files);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']
    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      //logger.debug(file, extention);
      if(types.includes(extention)){
        logger.debug(fileName, 'include');
        let key = `folderTwo/${fileName}`
        let filePath = `${folderPath}/${fileName}`
        try{
          await awsCloudService.uploadFileFromLoaclStorage(filePath, key);
          logger.debug('file upload success', key)
        }catch(error){
          logger.error(`file path ${filePath} upload failed`, error)
          continue
        }
        await this.updateDataLakeMetadata(key, fileName, filePath);
      }
    }
  };

  /**
   * Use to process key and files paths of uploading files of folder recusively to storage
   * @param folderPath {string} path of the folder
   * @returns 
   */
  async uploadFolderRecursivelyToStorage(folderPath: string){
    if(!folderPath) return

    var files = fs.readdirSync(folderPath);
    logger.debug(files);
    let types = ['mp4', 'jpg', 'jpeg', 'png', 'mkv']
    for(let fileName of files){
      let fileNameArray = fileName.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      logger.debug(fileName, extention);

      
      if(types.includes(extention)){
        logger.debug(fileName, 'include');
        let key = `multiples/${fileName}`
        let filePath = `${folderPath}/${fileName}`

        try{
          await awsCloudService.uploadFileFromLoaclStorage(`${folderPath}/${fileName}`, key);
          logger.debug(`file path ${filePath}  upload success`, key)
        }catch(error){
          logger.error(`file path ${filePath} upload failed`, error)
          continue
        }
        await this.updateDataLakeMetadata(key, fileName, filePath);
      }
      if(fileNameArray.length == 1){
        await this.uploadFolderRecursivelyToStorage(`${folderPath}/${fileName}`);
      }
    }
  };

  /**
   * Use for get metadata and update them to database
   * @param objectKey {string} S3 key of the file
   * @param fileName {string} name of the file
   * @param filePath {string} path of the file
   */
  async updateDataLakeMetadata(objectKey: string, fileName: string, filePath: string){
    ffmpeg.ffprobe(filePath, (err, metaDataDetails)=>{
      let metaData: IMetaData = {}
      if(err){
        logger.debug(err)
        metaData = {
          fileName: fileName,
          objectKey: objectKey,
          createdDate: new Date(),
        }
      }else{
        logger.debug(metaDataDetails)
        let frameRateArray = metaDataDetails.streams[0].avg_frame_rate ? metaDataDetails.streams[0].avg_frame_rate.split('/') : [0, 1];
        metaData = {
          fileName: fileName,
          objectKey: objectKey,
          objectType: metaDataDetails.streams[0].codec_type || '',
          fileSize: metaDataDetails.format.size || 0,
          duration: metaDataDetails.format.duration || 0,
          createdDate: new Date(),
          resolution: {
            height: metaDataDetails.streams[0].height || 0,
            width: metaDataDetails.streams[0].width || 0
          },
          frameRate: Number(frameRateArray[0])/Number(frameRateArray[1]) || 0,
          //sourceLocation: key,
          //sourceName: fileName
        }
      }
      
      mongoDBCurdService.createMetaData(metaData)
    })
  }
}