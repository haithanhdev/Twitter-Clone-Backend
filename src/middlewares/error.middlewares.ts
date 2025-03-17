import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      res.status(err.status).json(omit(err, ['status']))
      return
    }
    //Sửa đổi thuộc tính của object err => Mong muốn xuất hiện khi JSON.stringify sử dụng enumrable: true
    //Nếu thuộc tính có configurable: false thì không defineProperty => chuyển thành true thì OK
    // console.log(Object.getOwnPropertyNames(err)) // dùng để check xem có bao nhiêu key
    const finalError: any = {}
    Object.getOwnPropertyNames(err).forEach((key) => {
      // console.log(Object.getOwnPropertyDescriptor(err, key)) //Dùng để check cụ thể từng key
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.configurable ||
        !Object.getOwnPropertyDescriptor(err, key)?.writable
      ) {
        return
      }
      finalError[key] = err[key]
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      errorInfo: omit(finalError, 'stack')
    })
    return
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
      errorInfo: omit(error as any, 'stack')
    })
    return
  }
}
