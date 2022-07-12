
import express, { Router,  Request, Response, NextFunction} from "express";
import { logger } from "../config";
import { FileDetailsService } from "../services/file-details.service";
import { ThumbnailGenerator } from "../services/thumbnail-generation.service";

const fileRouter = Router();
const fileDetailsService = new FileDetailsService()
const thumbnailGenerator = new ThumbnailGenerator()

/**
 * API end point to get metaData of the file in local storage
 */
fileRouter.post('/getfileDetails', async (req: Request, res: Response)=> {
  
  if(
    (req.query.filePath && typeof req.query.filePath == "string") ||
    (req.body.filePath && typeof req.body.filePath == "string")
  ){

    let filePath: string = req.query.filePath || req.body.filePath
    try{
      let metaData:any = await fileDetailsService.getFileDetails(filePath)
      //logger.debug(metaData)
      res.send({
        success: true,
        ...metaData
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
 * API end point to update the metaData of the file in local storage 
 * which uploaded to storages
 */
 fileRouter.post('/updateMetaData', async (req: Request, res: Response)=> {
  
  if(
    ((req.query.objectKey && typeof req.query.objectKey == "string") ||
    (req.body.objectKey && typeof req.body.objectKey == "string"))
  ){

    let objectKey: string = req.query.objectKey || req.body.objectKey
    delete req.body.objectKey
    try{
      let metaData: any = await fileDetailsService.updateDataLakeMetadata(objectKey, req.body)
      //logger.debug(metaData)
      res.send({
        success: true,
        details: metaData
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
 * API end point to update the metaData of the file in local storage 
 * which uploaded to storages
 */
 fileRouter.post('/thumbnailGenerator', async (req: Request, res: Response)=> {
  
  if(
    ((req.query.filePath && typeof req.query.filePath == "string") ||
    (req.body.filePath && typeof req.body.filePath == "string"))
  ){

    let filePath: string = req.query.filePath || req.body.filePath
    try{
      let file = await thumbnailGenerator.imageThumbnailGenerator(filePath)
      logger.debug(file)
      res.send({
        success: true,
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
 * API end point to update the metaData of the file in local storage 
 * which uploaded to storages
 */
 fileRouter.post('/saveVideo', async (req: Request, res: Response)=> {
  
  if(
    ((req.query.filePath && typeof req.query.filePath == "string") ||
    (req.body.filePath && typeof req.body.filePath == "string"))
  ){

    let filePath: string = req.query.filePath || req.body.filePath
    try{
      let filePathArray = filePath.split(/\//)
      let fileName = filePathArray[filePathArray.length - 1]
      let file = await thumbnailGenerator.videoThumbnailGenerator(filePath, fileName)
      logger.debug(file)
      res.send({
        success: true,
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

export {fileRouter};