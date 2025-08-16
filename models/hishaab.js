const Joi = require("joi");
const mongoose = require("mongoose");

const hishaabSchema = mongoose.Schema({
    hishaabName: {
        type: String,
        trim: true,
        required: [true, 'Hishaab name is required'],
        maxLength: [100, 'Hishaab name cannot exceed 100 characters'],
        index: true
    },
    hishaabDescription: {
        type: String,
        trim: true,
        required: [true, 'Hishaab description is required'],
        minLength: [10, 'Hishaab description must be at least 10 characters'],
        maxLength: [500, 'Hishaab description cannot exceed 500 characters']
    },
    hishaab_creator: {
        type: String,
        required: [true, 'Hishaab creator is required']
    }
});

function validateHishaabModel(data) {
    const hishaabSchema = Joi.object({
        hishaabName: Joi.string()
            .max(100)
            .required(),
        
        hishaabDescription: Joi.string()
            .min(10)
            .max(500)
            .required(),
        
        hishaab_creator: Joi.string()
            .required()
    });

    let { error } = hishaabSchema.validate(data);
    return error;
}

let HishaabModel = mongoose.model("Hishaab", hishaabSchema);
module.exports = { validateHishaabModel, HishaabModel };