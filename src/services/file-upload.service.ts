import { logger } from '../config';
import fs from 'fs-extra';
import {AwsCloudService} from '../services/aws-storage.service';
import MongoDBCurdService from './mongodb-curd.service';
import * as ffmpeg from "fluent-ffmpeg";



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
    //await awsCloudService.uploadFileFromLoaclStorage(filePath, key);
    
    ffmpeg.ffprobe(filePath, (err, metaDataDetails)=>{
      if(err){
        logger.debug(err)
      }
      logger.debug(metaDataDetails)
      let frameRateArray = metaDataDetails.streams[0].avg_frame_rate ? metaDataDetails.streams[0].avg_frame_rate.split('/') : [0, 1];
      let metaData = {
        fileName: fileName,
        objectKey: key,
        objectType: metaDataDetails.streams[0].codec_type || '',
        fileSize: metaDataDetails.format.size || 0,
        duration: metaDataDetails.format.duration || 0,
        createdDate: new Date(),
        resolution: {
          height: metaDataDetails.streams[0].height || 0,
          width: metaDataDetails.streams[0].width || 0
        },
        frameRate: Number(frameRateArray[0])/Number(frameRateArray[1]) || 0,
        sourceLocation: key,
        sourceName: fileName
      }
      mongoDBCurdService.createMetaData(metaData)
    })
    
    
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
    for(let file of files){
      let fileNameArray = file.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      //logger.debug(file, extention);
      if(types.includes(extention)){
        logger.debug(file, 'include');
        let key = `folderTwo/${file}`
        await awsCloudService.uploadFileFromLoaclStorage(`${folderPath}/${file}`, key);
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
    for(let file of files){
      let fileNameArray = file.split('.');
      let extention = fileNameArray[fileNameArray.length - 1]
      logger.debug(file, extention);
      if(types.includes(extention)){
        logger.debug(file, 'include');
        let key = `folder/${file}`
        await awsCloudService.uploadFileFromLoaclStorage(`${folderPath}/${file}`, key);
      }
      if(fileNameArray.length == 1){
        await this.uploadFolderRecursivelyToStorage(`${folderPath}/${file}`);
      }
    }
  };
}