
import express, { Router,  Request, Response, NextFunction} from "express";
import { logger } from "../config";
import { FileUploadService } from "../services/file-upload.service";


const uploadRouter = Router();
const fileUploadService = new FileUploadService()

/**
 * API end point for upload single file from local storage
 */
uploadRouter.post('/uploadOneFile', async (req: Request, res: Response)=> {
  logger.debug('testing')
  
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



/**
 * API end point for upload files inside single folder from local storage
 */
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


/**
 * API end point for upload files inside single folder recursively from local storage
 */
uploadRouter.post('/uploadFolderRecursively', async (req: Request, res: Response)=> {
  logger.debug('upload folder to storage')

  if(req.query.folderPath && typeof req.query.folderPath == "string"){

    let folderPath: string = req.query.folderPath
    try{
      await fileUploadService.uploadFolderRecursivelyToStorage(folderPath)
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
