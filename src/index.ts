import express, {Application, Request, Response, NextFunction} from 'express'
import {AwsCloudService} from './services/aws-storage.service';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './config';
import {uploadRouter} from './apis/upload.apis'
dotenv.config()



const app: Application = express();

// app.use(router)
app.use("/api/upload", uploadRouter);
// app.use(express.urlencoded({extended: false}))
// app.use(express.json())

app.listen(process.env.PORT, () => {
  console.log('server is running on port '+ process.env.PORT)
  console.log(`http://localhost:${process.env.PORT}`)
});


// app.get('/home', (req: Request, res: Response)=> {
//   logger.debug('testing')
//   res.send('hello home')

//   let fileName = path.join(
//     __dirname,
//     '../src/services/test.mp4'
//   );
//   let key = 'test1/video111.mp4'
//   awsCloudService.uploadFileFromLoaclStorage(fileName, key)
// })

// export class server {
//   constructor(
//     public awsCloudService: AwsCloudService,
//   ) {
//     this.init()
//   }
//   init(){

//   }
//   useMiddleweres(){

//   }

//   addRoute(){
//     app.get('/home', (req: Request, res: Response)=> {
//       logger.debug('testing')
//       res.send('hello home')

//       let fileName = path.join(
//         __dirname,
//         '../src/services/test.mp4'
//       );
//       let key = 'test1/video111.mp4'
//       this.awsCloudService.uploadFileFromLoaclStorage(fileName, key)
//     })

//   }

//   listenServer(){
//     app.listen(process.env.PORT, () => {
//       console.log('server is running on port '+ process.env.PORT)
//       console.log(`http://localhost:${process.env.PORT}`)
//     });
//   }

// }

// new server()