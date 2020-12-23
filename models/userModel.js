const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
    },

    email: {
      type: String,
      unique: true,
      required: [true, 'Please enter your email address'],
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Please enter a password'],
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please consfirm your password'],
      validate: {
        validator: function (inputValue) {
          return inputValue === this.password;
        },

        message: "Password didn't match!",
      },
    },

    role: {
      type: String,
      default: 'user',
      enum: ['admin', 'dba', 'user'],
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt Password
// If password is not modified, then move forward
// Else encrypt the password before saving the document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// Check user password
userSchema.methods.checkPassword = async (inputPassword, dbPassword) => {
  return await bcrypt.compare(inputPassword, dbPassword);
};

// Check if password is changed after JWT was issued
userSchema.methods.passwordChangedAfterJWT = (jwtTimestamp) => {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt > jwtTimestamp;
  }

  return false;
};

// User Model
const User = mongoose.model('User', userSchema);

// Exports
module.exports = User;
