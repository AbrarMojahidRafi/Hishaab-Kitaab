const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
      minLength: [3, 'Name must be at least 3 characters'],
      maxLength: [50, 'Name cannot exceed 50 characters'],
      index: true
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must be at least 8 characters'],
      select: false // Hide password by default when querying
    }
  });

  function validateUserModel(data){
    console.log(data);
    const userSchema = Joi.object({
        name: Joi.string()
          .min(3)
          .max(50)
          .required(),
      
        email: Joi.string()
          .email({ tlds: { allow: true } })
          .lowercase()
          .required(),
      
        password: Joi.string()
          .min(8)
          .max(128)
          .required()
      });      

    let {error} = userSchema.validate(data);
    return error;
}

let newUserModel = mongoose.model("NewUser", userSchema); 
module.exports = {validateUserModel, newUserModel};