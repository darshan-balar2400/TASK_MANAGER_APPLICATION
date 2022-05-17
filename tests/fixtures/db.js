const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const User = require("../../src/Models/UserModel");
// const Tasks = require("../../src/Models/TaskModel");
const Task = require('../../src/Models/TaskModel');

const user_id = new mongoose.Types.ObjectId;
const dummyUser = {
    _id:user_id,
    firstname:"DB",
    lastname:"Balar",
    email:"balardarshan40@gmail.com",
    password:"Balar123$",
    phno:9825386686,
    tokens:[
        {
            token:jwt.sign({_id:user_id},process.env.SECRET_KEY)
        }
    ]
}

const user_id_two = new mongoose.Types.ObjectId;
const dummyUserTwo = {
    _id:user_id_two,
    firstname:"Samay",
    lastname:"Balar",
    email:"samaybalar@gmail.com",
    password:"Samay123$",
    phno:9825386686,
    tokens:[
        {
            token:jwt.sign({_id:user_id_two},process.env.SECRET_KEY)
        }
    ]
}

const taskone = {
    _id:new mongoose.Types.ObjectId,
    description:"First Task",
    completed:false,
    owner:user_id
}

const tasktwo = {
    _id:new mongoose.Types.ObjectId,
    description:"Second Task",
    completed:true,
    owner:user_id_two
}

const taskfour = {
    _id:new mongoose.Types.ObjectId,
    description:"Four Task",
    completed:true,
    owner:user_id
}
const taskfive = {
    _id:new mongoose.Types.ObjectId,
    description:"Five Task",
    completed:true,
    owner:user_id_two
}

const tasksix = {
    _id:new mongoose.Types.ObjectId,
    description:"Six Task",
    completed:true,
    owner:user_id
}
const taskseven = {
    _id:new mongoose.Types.ObjectId,
    description:"Seven Task",
    completed:true,
    owner:user_id_two
}

const taskthree = {
    _id:new mongoose.Types.ObjectId,
    description:"Third Task",
    completed:true,
    owner:user_id
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(dummyUser).save();
    await new User(dummyUserTwo).save();
    await new Task(taskone).save();
    await new Task(tasktwo).save();
    await new Task(taskthree).save();
    await new Task(taskfour).save();
    await new Task(taskfive).save();
    await new Task(tasksix).save();
    await new Task(taskseven).save();
}

module.exports = {
    user_id,
    user_id_two,
    dummyUser,
    taskone,
    taskthree,
    tasktwo,
    taskfour,
    taskfive,
    tasksix,
    taskseven,
    dummyUserTwo,
    setupDatabase
}