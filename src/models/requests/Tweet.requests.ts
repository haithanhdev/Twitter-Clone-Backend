import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] //Tên của hashtag dạng ['javascripts', 'reactjs']
  mentions: string[] //user_id[]
  medias: Media[]
}
