const extractFrames = require('ffmpeg-extract-frames')
import fs from 'fs-extra'
import sharp from 'sharp'
import imageSize from 'image-size';
import { logger } from "../config";
import { FileDetailsService } from "./file-details.service";

const fileDetailsService = new FileDetailsService()
const EXTENSION_TYPE = 'png'

export class ThumbnailGenerator{

  /**
   * use to create the thumbnail of the images
   * @param filePath {string} path of the file
   * @returns 
   */
  async imageThumbnailGenerator(filePath: string){
    logger.debug('file path', filePath)
    //ffmpeg(filePath).size('640x480');
    let filePathArray = filePath.split(/\//)
    let fileName = filePathArray[filePathArray.length - 1]
    logger.debug('thumbnail path', filePath, fileName)

    let fileNameArray = fileName.split('.')
    fileName = fileNameArray[0]
    if(fileNameArray.length > 2){
      let newFileNameArray = fileNameArray.slice(0, fileNameArray.length - 1)
      fileName = newFileNameArray.join('.')
    }
    let fileObject: object = await new Promise(function(resolve, reject) {

      
      imageSize(filePath, function (err, dimensions) {
        if(err) return
        if(dimensions) {
          logger.debug(dimensions)
          let width = 350
          let height = 250
          let widthRatio = (dimensions.width || 0 ) / width
          let heightRatio = (dimensions.height || 0 ) / height
          logger.debug('ratios: ', widthRatio, heightRatio)
          if(heightRatio < widthRatio){
            height = Math.round(height * (heightRatio / widthRatio))
          }
          logger.debug(width, height)

          let tumbSaveFilePath = `./tempThumbnailimages/thumb_${fileName}.${EXTENSION_TYPE}`
          sharp(filePath)
          .resize(width, height)
          .toFile(tumbSaveFilePath, function(err, data) {
            if(err){
              logger.error(err)
            }
            if(!err){
              resolve({
                success: true,
                filePath: tumbSaveFilePath,
                fileName: `thumb_${fileName}.${EXTENSION_TYPE}`
              })
            }
            
          });
        }
      })
        
    })

    //console.log(file)
    return fileObject
  }



  /**
   * use to create the thumbnail of the video
   * @param filePath {string} path of the file
   * @param fileName {string} name of the file
   * @returns 
   */
  async videoThumbnailGenerator(filePath: string, fileName: string){
    let fileDetails: any = await fileDetailsService.getFileDetails(filePath)
    logger.debug(fileDetails.summerizedMetaData)
    logger.debug(Number(fileDetails.summerizedMetaData.duration), Number(fileDetails.summerizedMetaData.frameCount))
    let time = Number(fileDetails.summerizedMetaData.duration) / Number(fileDetails.summerizedMetaData.frameCount)
    logger.debug(time)

    let fileNameArray = fileName.split('.')
    let fileNameWithoutExtension = fileNameArray[0]

    if(fileNameArray.length > 2){
      let newFileNameArray = fileNameArray.slice(0, fileNameArray.length - 1)
      fileNameWithoutExtension = newFileNameArray.join('.')
    }
    let outFilePath = `./tempThumbnailimages/${fileNameWithoutExtension}.${EXTENSION_TYPE}`
    await extractFrames({
      input: filePath,
      output: outFilePath,
      offsets: [
        time*1000,
      ]
    })
    let thumbnailDetails = await this.imageThumbnailGenerator(outFilePath)
    logger.debug(thumbnailDetails)
    fs.unlinkSync(outFilePath);
    return thumbnailDetails
  }

}
