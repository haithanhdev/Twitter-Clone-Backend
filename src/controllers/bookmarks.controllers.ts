import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkService from '~/services/bookmarks.services'
export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { tweet_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGE.BOOKMARK_SUCCESSFULLY,
    result
  })
  return
}

export const unbookmarkTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { tweet_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.unbookmarkTweet(user_id, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGE.UNBOOKMARK_SUCCESSFULLY,
    result
  })
  return
}
