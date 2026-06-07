import {Schema, model} from 'mongoose';

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  content: {
    type: String,
    require: true
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        require: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('Post', postSchema);