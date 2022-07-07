/**
 * @class StorageProviderService
 * purpose of StorageProviderService is to handle upload of files to storages
 * @description StorageProviderService handle uploads for single file, single folder and single folder with recursivley
 * @author chathushka
 */
import { S3 } from 'aws-sdk';
import { StorageKeys } from './data-uploader.service';




export class StorageProviderService {
  constructor(
  ) {}

  async init(awsKeys: StorageKeys) {
    //return new S3
  }

  /**
  * Use to process key and files paths of uploading one file to storage
  * @param filePath {string} path of the file
  * @returns 
  */
  async uploadObjectToStorage(filePath: string, bucket: string){
    return {
      sucess: true,
      objectKeys: ['']
    }
  };

  /**
  * Use to process key and files paths of uploading files of folder to storage
  * @param folderPath {string} path of the folder
  * @returns 
  */
  async uploadFolderToStorage(folderPath: string, bucket: string){
    return {
      sucess: true,
      objectKeys: ['']
    }
  };

  /**
  * Use to process key and files paths of uploading files of folder recusively to storage
  * @param folderPath {string} path of the folder
  * @returns 
  */
  async uploadFolderRecursivelyToStorage(folderPath: string, keys: string[], bucket: string){

  }

}