/**
 * @class DataLakeAPIService
 * purpose of DataLakeAPIService is to handle API requests to dataLake
 * @description DataLakeAPIService is to handle API requests to dataLake
 * @author chathushka
 */
import { logger } from '../config';
import { IMetaData } from '../model/metaData';
import axios from 'axios';
import { config } from '../config/config';

export default class DataLakeAPIService{
  constructor(
  ) {}
  async updateMetaData(newMetaDataList: any[], collectionName?: string, collectionType?: number, collectionId?: string){

    let requestBody: any = {
      apiKey: "testApiKey1",
      metaDataList: newMetaDataList,
    }
    if(collectionId){
      requestBody.collectionId = collectionId
    }
    else if(collectionName && collectionType){
      requestBody.collectionName = collectionName
      requestBody.collectionType = collectionType
    } 
    logger.debug('request body: ', requestBody)
    try{
      let response: any = await axios.post(`${config.dataLake.baseUrl}/api/metadata/uploadMetadata`, requestBody, );
      
      if(response && response.data){
        logger.debug('response', response.data)
        return response.data
      } 
      else null
    }catch(err){
      logger.error('axios error', err)
    }
    
  }
}