import {Schema, model} from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    require: true,
    unique: true
  }, 
  email: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

export default model('User', userSchema);