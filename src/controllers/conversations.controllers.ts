import { Request, Response, NextFunction } from 'express'
import { GetConversationParams } from '~/models/requests/Conversation.requests'
import { Pagination } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationsService from '~/services/conversations.services'

export const getConversationsController = async (
  req: Request<GetConversationParams, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await conversationsService.getConversations({
    sender_id: user_id,
    receiver_id,
    limit: limit,
    page: page
  })
  res.json({
    message: 'Get conversations successfully',
    result: {
      conversations: result.conversations,
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(result.total / limit)
    }
  })
  return
}
