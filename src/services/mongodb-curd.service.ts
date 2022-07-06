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

  async createMetaData(data: IMetaData) {
    const metaData = new MetaData({
      _id: new mongoose.Types.ObjectId(),
      ...data
    })
    metaData
      .save()
      .then(()=>{
        logger.debug('metaData updated')
      })
      .catch(()=>{
        logger.debug('metaData failed')
      })
  }
}