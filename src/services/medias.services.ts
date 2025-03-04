import { Request } from 'express'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
config()
class MediasService {
  async handleUploadSingleImage(req: Request) {
    //upload raw file to temp
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    //process and upload to new path
    await sharp(file.filepath).jpeg().toFile(newPath)
    //delete temp file
    fs.unlinkSync(file.filepath)
    return isProduction
      ? `${process.env.HOST}/static/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
