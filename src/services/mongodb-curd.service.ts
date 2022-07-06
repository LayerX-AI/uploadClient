/**
 * @class MongoDBCurdService
 * purpose of MongoDBCurdService is to handle CURD operations for create and update MetaData
 * @description MongoDBCurdService is to handle CURD operations for create and update MetaData
 * @author chathushka
 */
import mongoose from 'mongoose';
import { logger } from '../config';
import MetaData, { IMetaData } from '../model/metaData'

export default class MongoDBCurdService{
  constructor(
  ) {}



  async findMetaData(objectKey: string){
    return MetaData.findOne({objectKey: objectKey})
  }

  async updateMetaData(objectKey: string, newMetaData: IMetaData){
    return MetaData
            .updateOne({objectKey: objectKey}, newMetaData)
            .then(()=>{logger.debug('metaData update successed')})
            .catch(()=>{logger.debug('metaData update failed')})
  }

  async createMetaData(newMetaData: IMetaData){
    return MetaData
            .create(newMetaData)
            .then(()=>{logger.debug('metaData create successed')})
            .catch(()=>{logger.debug('metaData create failed')})
  }
}