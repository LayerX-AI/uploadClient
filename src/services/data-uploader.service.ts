import { logger } from '../config';
import {AWSProviderService} from './aws-provider.service';

export class DataUploaderService{
	
	public storageServiceProvider: AWSProviderService | undefined;
  public keys: StorageKeys | undefined


  /**
   * Use to initialize the storage provider class and relevent keys
   * @param storageType {string} storage provider
   * @param keys {object} key object for storage provider
   */
	async init(storageType: string, keys: StorageKeys){
		switch(storageType){
			case 'AWS_S3':
				this.storageServiceProvider = new AWSProviderService();
        this.keys = keys
        break;

			case 'AZURE_BOLB':
				break;
		} 
	}


  /**
   * Use to upload file to the storage
   * @param filePath {string} path of the file
   * @returns {object} objectKey
   */
	async uploadObjectToStorage(filePath: string){
    logger.debug('keys: ', this.keys)
    let keysObject
    if(this.keys && this.storageServiceProvider){
      keysObject = await this.storageServiceProvider.uploadObjectToStorage(filePath, this.keys)
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
    if(this.keys && this.storageServiceProvider){
      keysObject = await this.storageServiceProvider.uploadFolderToStorage(folderPath, this.keys)
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
    if(this.keys && this.storageServiceProvider){
      await this.storageServiceProvider.uploadFolderRecursivelyToStorage(folderPath, this.keys, keyList)
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
