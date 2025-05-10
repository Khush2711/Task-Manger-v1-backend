const mongoose = require("mongoose");

// Define a schema
const user = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "task"
    }],
    token: {
        type: String
    },
    image: {
        type: String,
        required: true
    },
    additionDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "profile" // Model Name
    }
})

// Create a model
const userModel = mongoose.model('user', user);

module.exports = userModel;