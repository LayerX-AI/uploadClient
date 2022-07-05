import dotenv from 'dotenv';
dotenv.config()

const MONGO_USERNAME = process.env.DB_USER || '';
const MONGO_PASSWORD = process.env.DB_PASS || '';
const MONGO_HOST = process.env.DB_HOST || '';
const MONGO_PORT = process.env.DB_PORT || '';
const MONGO_DATABASE = process.env.DATABASE || '';
const MONGO_URL = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`

const SEVER_PORT = process.env.PORT ? Number(process.env.PORT) : 7070;

export const config = {
  mongo: {
    url: MONGO_URL
  },
  server: {
    port: SEVER_PORT
  }
}