const mongoose = require("mongoose");

// Define a schema
const task = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    dueDate: {
        type: Date,
        required: false
    },
    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        permission: {
            type: String,
            enum: ["view", "edit"],
            default: "edit"
        }
    }],
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    status: {
        type: String,
        enum: ["Inprogress", "Finished", "Not Started"],
        default: "Not Started"
    }
}, { timestamps: true });

const taskModel = mongoose.model('task', task);

module.exports = taskModel;
