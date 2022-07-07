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
  async updateMetaData(newMetaData: IMetaData){

    let requestBody = {
      apiKey: "testApiKey1",
      metaDataList: [
        {metaDataObject: newMetaData}
      ],
    }
    await axios.post(`${config.dataLake.baseUrl}/api/metadata/uploadMetadata`, requestBody);
  }
}