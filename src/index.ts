import express, {Application, Request, Response, NextFunction} from 'express'
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './config';
import {uploadRouter} from './apis/upload.apis'
import { config } from './config/config';
import mongoose from 'mongoose';
import { fileRouter } from './apis/file.apis';
dotenv.config()



const app: Application = express();

mongoose
  .connect(config.mongo.url)
  .then(()=>{
    logger.debug('mongodb connected')
    startServer()
  })
  .catch((error)=>{
    logger.debug(error)
  })

const startServer = () => {
  
  app.use(express.urlencoded({extended: false}))
  app.use(express.json())
  app.use("/api/upload", uploadRouter);
  app.use("/api/file", fileRouter);
  app.get('/ping', (req, res, next)=>{
    res.status(200).json({message: 'pong'})
  })

  app.use((req, res, next)=>{
    const error = new Error('Not Found')
    res.status(200).json({message: error.message})
  })

  app.listen(config.server.port, () => {
    console.log('server is running on port '+ process.env.PORT)
    console.log(`http://localhost:${process.env.PORT}`)
  });

}