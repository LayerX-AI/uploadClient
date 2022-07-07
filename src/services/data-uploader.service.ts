import AWS, { S3 } from 'aws-sdk';
import { logger } from '../config';
import {AWSProviderService} from './aws-provider.service';
import { StorageProviderService } from './storage-provider.service';

export class DataUploaderService{
	constructor(storageType: string, keys: StorageKeys) {
    switch(storageType){
			case 'AWS_S3':
				this.storageServiceProvider = new AWSProviderService(keys);
        this.keys = keys;
        //this.s3Bucket = this.storageServiceProvider.initAWS(keys)
        break;

			// case 'AZURE_BOLB':
			// 	break;

      default:
        this.storageServiceProvider = new StorageProviderService();
        break;
		}
  }
	public storageServiceProvider: StorageProviderService;
  public keys: StorageKeys = {}
  public s3Bucket: S3 | undefined
  
//   /**
//   * Use for Initialize the s3Bucket
//   * @returns initialized s3Bucket
//   */
//   async initAWS(awsKeys: StorageKeys) {
//     logger.debug('initAWS:', awsKeys)
//     const s3Bucket = new AWS.S3({
//       accessKeyId: awsKeys.accessKeyId,
//       secretAccessKey: awsKeys.secretAccessKey,
//       signatureVersion: 'v4',
//       region: awsKeys.region,
//     });
//     this.s3Bucket = s3Bucket
//  }


  // /**
  //  * Use to initialize the storage provider class and relevent keys
  //  * @param storageType {string} storage provider
  //  * @param keys {object} key object for storage provider
  //  */
	// async init(storageType: string, keys: StorageKeys){
	// 	switch(storageType){
	// 		case 'AWS_S3':
	// 			this.storageServiceProvider = new AWSProviderService(keys);
  //       this.keys = keys;
  //       //this.s3Bucket = await this.storageServiceProvider.initAWS(keys)
  //       break;

	// 		// case 'AZURE_BOLB':
	// 		// 	break;

  //     default:
  //       this.storageServiceProvider = new StorageProviderService();
  //       break;
	// 	} 
	// }


  /**
   * Use to upload file to the storage
   * @param filePath {string} path of the file
   * @returns {object} objectKey
   */
	async uploadObjectToStorage(filePath: string){
    logger.debug('keys: ', this.keys)
    //logger.debug(this.s3Bucket)
    let keysObject
    if(this.storageServiceProvider){
      keysObject = await this.storageServiceProvider.uploadObjectToStorage(filePath, this.keys.bucket || '')
    }
    
    return keysObject
	}


  /**
   * Use to upload folder to the storage
   * @param folderPath {string} path of the file
   * @returns {object} objectKeys
   */
  async uploadFolderToStorage(folderPath: string){
    let keysObject
    if(this.storageServiceProvider){
      keysObject = await this.storageServiceProvider.uploadFolderToStorage(folderPath, this.keys.bucket || '')
    } 

    return keysObject
	}

  /**
   * Use to upload folder recursively to the storage
   * @param folderPath {string} path of the folder
   * @returns {object} objectKeys
   */
  async uploadFolderRecursivelyToStorage(folderPath: string){
    let keyList: string[] = []
    if(this.storageServiceProvider){
      await this.storageServiceProvider.uploadFolderRecursivelyToStorage(folderPath, keyList, this.keys.bucket || '')
    }
    return {
      success: true,
      objectKeys: keyList
    }
	}
}

export interface StorageKeys{
  accessKeyId?: string,
  secretAccessKey?: string,
  signatureVersion?: string,
  region?: string,
  bucket?: string
}
