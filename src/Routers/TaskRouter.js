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
        user.tasks = user.tasks.concat(saveTask._id);
        // save the use
        await new User(user).save();
        res.status(200).send(saveTask);
    }
    catch (e) {
        res.status(500).send(e);
    }
});

// ------------------------ GET THE TASKS ----------------------------------
route.get("/tasks", Auth, async (req, res) => {
    try {
        const user = req.user;
        // get the tasks by using its owner property
        const getTasks = await Task.find({ owner: user._id });
        // if there is not any tasks return
        if (!getTasks) {
            return res.status(404).send({ "Error": "Not Tasks" });
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

        const getTasks = await Task.findById({ _id: updateTaskId });
        // if task is not found
        if (!getTasks) {
            return res.status(404).send({ "Error": "No Task Found" });
        }
        // if taks is found then update the task
        keys.forEach((k) => {
            getTasks[k] = req.body[k];
        });

        await getTasks.save();

        res.status(200).send(getTasks);

    }
    catch (e) {
        res.status(400).send(e);
    }
});

// -------------------------------- DELETE TASK ---------------------------------
route.delete("/tasks/:id", Auth, async (req, res) => {
    try {
        const user = req.user;
        const taskId = req.params.id;

        const getTasks = await Task.findByIdAndDelete({ _id: taskId });
        // if tasks is not found
        if (!getTasks) {
            return res.status(404).send({ "Error": "No Task Found" });
        }
        // if task is found
        res.status(200).send(getTasks);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

module.exports = route;