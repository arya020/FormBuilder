const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  headerImage: {
    type: String,
    default: null
  },
  backgroundColor: {
    type: String,
    trim: true
  },
  questions: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['categorize', 'cloze', 'comprehension'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    points: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);