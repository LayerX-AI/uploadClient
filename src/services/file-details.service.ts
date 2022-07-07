import { logger } from '../config';
import * as ffmpeg from "fluent-ffmpeg";
import { IMetaData } from '../model/metaData';
import DataLakeAPIService from './dataLake-api.service';

const dataLakeAPIService = new DataLakeAPIService()

export class FileDetailsService{
	
  /**
   * Use to get meta data of the file in local storage
   * @param filePath {string} path to the file
   * @returns {object} metaData details object
   */
	async getFileDetails(filePath: string): Promise<object>{
    let metaData: object = new Promise(function(resolve, reject) {

      //get meta data of the file by ffmpeg library
      ffmpeg.ffprobe(filePath, (err, metaDataDetails)=>{
        let metaData: IMetaData = {}
        let filePathArray = filePath.split(/\//)
        let fileName = filePathArray[filePathArray.length - 1]
        let objectType = 0;
        if(fileName){
          let imageList = ['jpg', 'jpeg', 'png'];
          let videoList = ['mp4', 'mkv'];
          let fileNameSplitted = fileName.split('.')
          let extention = fileNameSplitted[fileNameSplitted.length - 1];
          if(imageList.includes(extention)){
            objectType = 1
          }
          else if(videoList.includes(extention)){
            objectType = 2
          }
        }
        if(err){
          logger.debug(err)
          metaData = {
            name: fileName,
            createdDate: new Date(),
          }
        }else{
          let frameRateArray = metaDataDetails.streams[0].avg_frame_rate ? metaDataDetails.streams[0].avg_frame_rate.split('/') : [0, 1];
          metaData = {
            name: fileName,
            objectType: objectType,
            fileSize: metaDataDetails.format.size || 0,
            duration: metaDataDetails.format.duration || 0,
            resolution: {
              height: metaDataDetails.streams[0].height || 0,
              width: metaDataDetails.streams[0].width || 0
            },
            frameRate: Number(frameRateArray[0])/Number(frameRateArray[1]) || 0,
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
      let metaDataObject: IMetaData = {
        objectKey: objectKey,
        ...metaInfo
      }
      await dataLakeAPIService.updateMetaData(
        {
          objectKey: objectKey,
          ...metaInfo
        }
      )
      logger.debug('update MetaData successed')
      return metaDataObject
    }catch(err){
      logger.error('update MetaData failed',err)
      return err
    }
  }
}