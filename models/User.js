const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  items: [
    { type: Schema.Types.ObjectId, ref: 'Item' },
  ],
});

module.exports = model('User', UserSchema);
