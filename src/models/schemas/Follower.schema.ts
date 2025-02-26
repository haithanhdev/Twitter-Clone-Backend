import { ObjectId } from 'mongodb'

//Quy định kiểu mà client truyền lên để tạo mới 1 document Follower
interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
  constructor({ _id, user_id, followed_user_id, created_at }: FollowerType) {
    this._id = _id
    this.user_id = user_id
    this.followed_user_id = followed_user_id
    this.created_at = created_at || new Date()
  }
}
