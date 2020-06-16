const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamKillsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  kills: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lastKillDate: {
    type: Date,
    default: Date.now()
  }
});
module.exports = Item = mongoose.model('teamkills', TeamKillsSchema);