const mongoose = require('mongoose');
const validator = require("validator");

const TaskStructure = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
});

const Task = new mongoose.model("Task",TaskStructure);

module.exports = Task;