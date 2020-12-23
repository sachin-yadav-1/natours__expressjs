const crypto = require('crypto');
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
      minlength: [8, 'Minimum password length should be 8'],
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

// ENCRYPT PASSWORD
// This middleware does the followings things:
// 1) If password is not modified, then move forward
// 2) Else encrypt the password before saving the document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// CHECK PASSWORD
// This middleware compares the input password with the encrypted password in DB using 'compare' method from bcrypt
// @param {imputPassword}: User input password received in request body
// @param {dbPassword}: Encrypted password stored in DB
userSchema.methods.checkPassword = async (inputPassword, dbPassword) => {
  return await bcrypt.compare(inputPassword, dbPassword);
};

// CHECK IF PASSWORD UPDATED
// This middleware checks if the user user updated password logging in i.e. after JWT was issued
// @param {jwtTimestamp}: The 'iat' or issued at value we get after verifying the jwt token
userSchema.methods.passwordChangedAfterJWT = (jwtTimestamp) => {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt > jwtTimestamp;
  }

  return false;
};

// GENERATE RESET TOKEN
// This instance method is used generating random password reset token
// This does the following steps:
// 1) Generate random '32' bits token using crypto module and then convert it to string
// 2) Encrypt the randomly generated token using 'sha256' encryption and store it in 'passwordResetToken' property
// 3) Set 'passwordResetTokenExpires' to the 10 minutes from now
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// USER MODEL
const User = mongoose.model('User', userSchema);

// EXPORTS
module.exports = User;
