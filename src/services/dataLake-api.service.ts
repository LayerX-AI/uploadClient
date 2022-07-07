/**
 * @class DataLakeAPIService
 * purpose of DataLakeAPIService is to handle API requests to dataLake
 * @description DataLakeAPIService is to handle API requests to dataLake
 * @author chathushka
 */
import { logger } from '../config';
import { IMetaData } from '../model/metaData';
import axios from 'axios';

export default class DataLakeAPIService{
  constructor(
  ) {}
  async updateMetaData(newMetaData: IMetaData){

    let requestBody = {
      apiKey: "testApiKey1",
      metaDataList: [
        {metaDataObject: newMetaData}
      ],
    }
    const data = await axios.post('http://104.154.225.244:3000/api/metadata/uploadMetadata', requestBody);
    logger.debug(data)
  }
}