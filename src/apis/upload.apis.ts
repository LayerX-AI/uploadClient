import express, { Router,  Request, Response, NextFunction} from "express";
import path from "path";
import { logger } from "../config";
import { AwsCloudService } from "../services/aws-storage.service";
import { FileUploadService } from "../services/file-upload.service";
import HttpError from 'http-errors'


const uploadRouter = Router();
const awsCloudService = new AwsCloudService()
const fileUploadService = new FileUploadService()

uploadRouter.post('/uploadOneFile', async (req: Request, res: Response)=> {
  logger.debug('testing')
  

  // let filePath = path.join(
  //   __dirname,
  //   '../../src/services/test.mp4'
  // );
  //if(!req.query.filePath)
  //let filePath: string = req.query.filePath
  if(typeof req.query.filePath == "string"){

    let filePath: string = req.query.filePath
    try{
      await fileUploadService.uploadObjectToStorage(filePath)
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


uploadRouter.post('/uploadFolder', async (req: Request, res: Response)=> {
  logger.debug('upload folder to storage')

  if(req.query.folderPath && typeof req.query.folderPath == "string"){

    let folderPath: string = req.query.folderPath
    try{
      await fileUploadService.uploadFolderToStorage(folderPath)
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


uploadRouter.get('/', (req: Request, res: Response, next: NextFunction)=> {
  res.send('hello')
})

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
