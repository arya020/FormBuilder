const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['categorize', 'cloze', 'comprehension'],
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 1
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  maxTotalScore: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  userInfo: {
    name: String,
    email: String
  }
});

module.exports = mongoose.model('Response', responseSchema);