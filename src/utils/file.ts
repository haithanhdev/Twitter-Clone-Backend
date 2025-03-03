import { Request } from 'express'
import fs from 'fs'
import path from 'path'
export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads/images')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // mục đích là để tạo folder nested
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  // Sử dụng câu lệnh sau nếu gặp lỗi require of ESModule
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 5,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 1024, //300MB,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('Image is required'))
      }
      resolve({
        files
      })
    })
  })
}
