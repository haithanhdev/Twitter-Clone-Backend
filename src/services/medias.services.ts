import { Request } from 'express'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus'
config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)
    //item = /home/user/127467812648721/video.mp4
    const idName = getNameFromFullname(item.split('/').pop() as string)
    await databaseService.videoStatus.insertOne(new VideoStatus({ name: idName, status: EncodingStatus.Pending }))
    console.log(`Enqueue: ${item}\n`)
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) {
      return
    }
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullname(videoPath.split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        { $set: { status: EncodingStatus.Processing }, $currentDate: { updatedAt: true } }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        //Xoá phần tử đầu tiên
        this.items.shift()
        await fsPromise.unlink(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          { $set: { status: EncodingStatus.Success }, $currentDate: { updatedAt: true } }
        )
        console.log(`Encoded video: ${videoPath} successfully`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne({ name: idName }, { $set: { status: EncodingStatus.Failed }, $currentDate: { updatedAt: true } })
          .catch((err) => {
            console.error('Update video status error', err)
          })
        console.error(`Encoded video: ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log(`Encode video queue is empty`)
    }
  }
}

const queue = new Queue()

class MediasService {
  async UploadImage(req: Request) {
    //upload raw file to temp
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        //process and upload to new path
        await sharp(file.filepath).jpeg().toFile(newPath)
        //delete temp file
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async UploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
  async UploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}

const mediasService = new MediasService()

export default mediasService
