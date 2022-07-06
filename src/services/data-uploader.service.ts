import { logger } from '../config';
import {AWSProviderService} from './aws-provider.service';

export class DataUploaderService{
	
	public storageServiceProvider: AWSProviderService | undefined;
  public keys: StorageKeys | undefined

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

	async uploadObjectToStorage(filePath: string){
    logger.debug('keys: ', this.keys)
    let keysObject
    if(this.keys && this.storageServiceProvider){
      keysObject = await this.storageServiceProvider.uploadObjectToStorage(filePath, this.keys)
    }
    
    return keysObject
	}

  async uploadFolderToStorage(folderPath: string){
    let keysObject
    if(this.keys && this.storageServiceProvider){
      keysObject = await this.storageServiceProvider.uploadFolderToStorage(folderPath, this.keys)
    } 

    return keysObject
	}

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
