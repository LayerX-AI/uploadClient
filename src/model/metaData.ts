import mongoose, { Document, Schema } from 'mongoose';

export interface IMetaData {
    sourceName?: string;
    objectKey?: string;
    sourceId?: string;
    collectionName?: string;
    sourceLocation?: string;
    objectType?: string;
    parentList?: string[];
    fileName?: string;
    url?: string;
    frameRate?: number;
    resolution?: object;
    fileSize?: number;
    createdDate?: Date;
    frameCount?: number;
}

export interface MetaDataModel extends IMetaData, Document {}

const MetaDataSchema: Schema = new Schema(
    {
      sourceName: { type: String, required: false },
      objectKey: { type: String, required: false },
      sourceId: { type: String, required: false },
      collectionName: { type: String, required: false },
      sourceLocation: { type: String, required: false },
      objectType: { type: String, required: false },
      parentList: { type: Array, required: false },
      fileName: { type: String, required: false },
      url: { type: String, required: false },
      frameRate: { type: Number, required: false },
      resolution: { type: Object, required: false },
      fileSize: { type: Number, required: false },
      createdDate: { type: Date, required: false },
      frameCount: { type: Number, required: false },
    },
    {
        versionKey: false
    }
);

export default mongoose.model<MetaDataModel>('MetaData', MetaDataSchema, 'MetaData');