const express = require("express");
const route = new express.Router();
const Auth = require("../Authentication/Auth");
const Task = require("../Models/TaskModel");
const User = require("../Models/UserModel");

// -------------------------- CREATE TASK ----------------------------------------
route.post("/tasks", Auth, async (req, res) => {
    try {
        const user = req.user;
        const task = req.body;

        // if user doesn't  provide task
        if (!task) {
            return res.status(400).send("Input Is Empty !");
        }

        // if user provide task
        const newTask = new Task({
            ...task,
            owner: user._id
        });

        // save the task into the database
        const saveTask = await newTask.save();

        // update user with task
        res.status(201).send(saveTask);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

// ------------------------ GET THE TASKS ----------------------------------
route.get("/tasks", Auth, async (req, res) => {
    const user = req.user;
    const searchQuery = req.query;
    const match = {};
    const sort = {};

    if(searchQuery.completed){
        match.completed = searchQuery.completed == "true"
    }

    if(searchQuery.sort){
        const parts = req.query.sort.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await user.populate({
            path:"tasks",
            match,
            options:{
                sort:sort,
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip)
            }
        });
        // if tasks returns
        res.status(200).send(user.tasks);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

route.get("/tasks/:id", Auth, async (req, res) => {
    try {
        const user = req.user;
        const id = req.params.id;
        // get the tasks by using its owner property
        const getTasks = await Task.findOne({ _id:id,owner: user._id });
        // if there is not any tasks return
        if (!getTasks) {
           throw "Task not found"
        }
        // if tasks returns
        res.status(200).send(getTasks);
       
    }
    catch (e) {
        res.status(400).send(e);
    }
});



// ------------------------- UPDATE TASK -----------------------------------------
route.patch("/tasks/:id", Auth, async (req, res) => {
    // chekc that user provided fields are valid or not ?
    const keys = Object.keys(req.body);
    const validFileds = ["description", "completed"];
    const isValid = keys.every((k) => {
        return validFileds.includes(k);
    });
    // if it is not valid
    if (!isValid) {
        return res.status(400).send({ "Error": "Not valid ! " });
    }
    // if it is valid 
    try {
        const user = req.user;
        const updateTaskId = req.params.id;

        const getTasks = await Task.find({ _id: updateTaskId,owner:user._id});
        // if task is not found
    
        if (getTasks == []) {
          throw new Error("Task is not found !");
        }

        // if taks is found then update the task
        keys.forEach((k) => {
            getTasks[k] = req.body[k];
        });

        await getTasks.save();

        res.status(200).send(getTasks);

    }
    catch (e) {
        res.status(400).send(e.message);
    }
});

// -------------------------------- DELETE TASK ---------------------------------
route.delete("/tasks/:id", Auth, async (req, res) => {
    try {
        const user = req.user;
        const taskId = req.params.id;

        const getTasks = await Task.deleteOne({ _id: taskId,owner:user._id});
        // if tasks is not found
        if (!getTasks) {
            return res.status(401).send({ "Error": "No Task Found" });
        }
        // if task is found
        res.status(200).send(getTasks);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

module.exports = route;