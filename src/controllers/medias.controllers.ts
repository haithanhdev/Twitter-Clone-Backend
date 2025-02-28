import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  //Sử dụng câu lệnh sau nếu gặp lỗi require of ESModule
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 1024 //300MB
  })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      fields,
      files
    })
    return
  })
}
