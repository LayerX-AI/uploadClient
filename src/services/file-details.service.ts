import { logger } from '../config';
import * as ffmpeg from "fluent-ffmpeg";
import { IMetaData } from '../model/metaData';
import MongoDBCurdService from './mongodb-curd.service';

const mongoDBCurdService = new MongoDBCurdService()

export class FileDetailsService{
	
  /**
   * Use to get meta data of the file in local storage
   * @param filePath {string} path to the file
   * @returns {object} metaData details object
   */
	async getFileDetails(filePath: string){
    let metaData = new Promise(function(resolve, reject) {
      ffmpeg.ffprobe(filePath, (err, metaDataDetails)=>{
        let metaData: IMetaData = {}
        let filePathArray = filePath.split(/\//)
        let fileName = filePathArray[filePathArray.length - 1]
        if(err){
          logger.debug(err)
          metaData = {
            fileName: fileName,
            createdDate: new Date(),
          }
        }else{
          //logger.debug(metaDataDetails)
          let frameRateArray = metaDataDetails.streams[0].avg_frame_rate ? metaDataDetails.streams[0].avg_frame_rate.split('/') : [0, 1];
          metaData = {
            fileName: fileName,
            objectType: metaDataDetails.streams[0].codec_type || '',
            fileSize: metaDataDetails.format.size || 0,
            duration: metaDataDetails.format.duration || 0,
            resolution: {
              height: metaDataDetails.streams[0].height || 0,
              width: metaDataDetails.streams[0].width || 0
            },
            frameRate: Number(frameRateArray[0])/Number(frameRateArray[1]) || 0,
            //sourceLocation: key,
            //sourceName: fileName
          }
        }
        
        resolve({
          summerizedMetaData: metaData,
          detailedMetaData: metaDataDetails
        }) 
      })
    })
    return metaData
  }

  /**
   * Use to update or create the metaData of file
   * @param objectKey {string} key of the file
   * @param metaInfo {object} meta data details of the file
   */
  async updateDataLakeMetadata(objectKey: string, metaInfo: IMetaData){
    try{
      let oldMetaData = await mongoDBCurdService.findMetaData(objectKey);
      if(oldMetaData){
        await mongoDBCurdService.updateMetaData(objectKey, metaInfo)
        return {
          objectKey: objectKey,
          ...metaInfo
        }
      }else{
        let metaData: IMetaData = {
          objectKey: objectKey,
          ...metaInfo
        }
        await mongoDBCurdService.createMetaData(metaData)
        return metaData
      }
    }catch(err){

    }
  }
}