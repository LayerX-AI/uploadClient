
import express, { Router,  Request, Response, NextFunction} from "express";
import { json } from "stream/consumers";
import { logger } from "../config";
import { DataUploaderService, StorageKeys } from "../services/data-uploader.service";

const uploadRouter = Router();
let dataUploaderService: DataUploaderService

/**
 * API end point for upload single file from local storage
 */
uploadRouter.post('/uploadOneFile', async (req: Request, res: Response)=> {
  logger.debug('upload file to storage')
  
  if(typeof req.query.filePath == "string"){

    let filePath: string = req.query.filePath
    try{
      let returnObj = await dataUploaderService.uploadObjectToStorage(filePath)
      res.send(returnObj)
    }catch(err){
      logger.error('file upload failded',err)
      res.send({
        success: false,
        error: String(err)
      })
    }
  }else{
    res.send({
      success: false,
      error: 'request doesnt have file path'
    })
  }
  
})



/**
 * API end point for upload files inside single folder from local storage
 */
uploadRouter.post('/uploadFolder', async (req: Request, res: Response)=> {
  logger.debug('upload folder to storage')

  if(req.query.folderPath && typeof req.query.folderPath == "string"){

    let folderPath: string = req.query.folderPath
    logger.debug(folderPath)
    try{
      let returnObj = await dataUploaderService.uploadFolderToStorage(folderPath)
      res.send(returnObj)
    }catch(err){
      logger.error('folder upload failded',err)
      res.send({
        success: false,
        error: String(err)
      })
    }
  }else{
    res.send({
      success: false,
      error: 'request doesnt have folder path'
    })
  }
  
})


/**
 * API end point for upload files inside single folder recursively from local storage
 */
uploadRouter.post('/uploadFolderRecursively', async (req: Request, res: Response)=> {
  logger.debug('upload folder to storage')

  if(req.query.folderPath && typeof req.query.folderPath == "string"){

    let folderPath: string = req.query.folderPath
    try{
      let returnObj = await dataUploaderService.uploadFolderRecursivelyToStorage(folderPath)
      res.send(returnObj)
    }catch(err){
      logger.error('folder upload failded',err)
      res.send({
        success: false,
        error: String(err)
      })
    }
  }else{
    res.send({
      success: false,
      error: 'request doesnt have folder path'
    })
  }
  
})


/**
 * API end point for upload files inside single folder recursively from local storage
 */
 uploadRouter.post('/initializeStorage', async (req: Request, res: Response)=> {
  logger.debug('set storage keys')
  logger.debug(req.body)

  if(
    req.body.storageType && typeof req.body.storageType == "string" &&
    req.body.accessKeyId && typeof req.body.accessKeyId == "string" &&
    req.body.secretAccessKey && typeof req.body.secretAccessKey == "string" &&
    req.body.region && typeof req.body.region == "string" &&
    req.body.bucket && typeof req.body.bucket == "string"
  ){

    let storageType: string = req.body.storageType
    let keys: StorageKeys = {
      accessKeyId: req.body.accessKeyId,
      secretAccessKey: req.body.secretAccessKey,
      region: req.body.region,
      bucket: req.body.bucket
    }
    try{
      dataUploaderService = new DataUploaderService(storageType, keys)
      res.send({
        success: true
      })
    }catch(err){
      res.send({
        success: false,
        error: err
      })
    }
  }else{
    res.send({
      success: false
    })
  }
  
})

/**
 * test API end point
 */
uploadRouter.post('/next/:id', (req: Request, res: Response, next: NextFunction)=> {
  logger.debug(req.query)
  logger.debug(req.params)
  logger.debug(req.body)
  logger.debug(req.path)
  logger.debug(req.headers)
  logger.debug(req)
  res.send({
    data: 1
  })
})

export {uploadRouter};
