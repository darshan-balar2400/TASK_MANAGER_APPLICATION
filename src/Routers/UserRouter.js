const express = require('express');
const route = new express.Router();
const User = require("../Models/UserModel");
const Auth = require("../Authentication/Auth");
const multer = require("multer");
const sharp = require("sharp");

// ------------------------------- CREATE THE USER --------------------------------
route.post("/users",async(req,res) => {
    try{
        const user = req.body;
        // if user data is provided
        if(!user){
            return res.status(404).send({"Error":"Please Enter Required Information for signup"});
        }
        // if user data is not provided
        const newUser = new User(user);
        const userToken = await newUser.generateAuthToken();

        res.status(201).send({newUser,userToken});
    }
    catch(e){
        res.status(400).send({"Error":`${e}`});
    }
});


// ----------------------------- LOGIN USER  ------------------------------
route.post("/users/login",async(req,res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        // if user doesn't provie email and pasword for login
        if(!email || !password){
            return res.status(404).send({"Error":"Email or Password filed missing ! "})
        }
        // if user provides password and email then go further for checking in databases
        const checkCredentials = await User.checkCredentials(email,password);
        console.log(checkCredentials);
        //  generate the token for user
        const token = await checkCredentials.generateAuthToken();

        res.status(200).send({checkCredentials,token});
    }
    catch(e){
        res.status(400).send(e);
    }
});

// -------------------------------- LOGOUT FROM ONE DEVICE --------------------------
route.post("/users/logout",Auth,async(req,res) => {
    try{
        const user = req.user;
        // remove the token from the user all tokens
        user.tokens = user.tokens.filter((token) => {
            return token.token != req.token;
        });
        // save the user in the database 
        await user.save();
        
        res.status(200).send(user);
    }
    catch(e){
        res.status(404).send(e)
    }
});

//---------------------------------- LOGOUT FROM ALL DEVICES -------------------------
route.post("/users/logoutall",Auth,async(req,res) => {
    try{
        const user = req.user;
        // remove all tokens from the user tokens 
        user.tokens = [];
        // save the user in the database
        await user.save();

        res.status(200).send(user);
    }
    catch(e){
        res.status(404).send({"Error":"Server Error ! "})
    }
});

// -------------------------------- SEE PROFILE ---------------------
route.get("/users",Auth,async(req,res) => {
    if(!req.user){
       return res.status(404).send({"Error":"User is not found ! "});
    }
    // show user data with the tasks that their created 
    const userData = await User.findOne({_id:req.user._id}).populate("tasks");
    const tasks = userData.tasks;
    res.status(200).send(userData);
});

// ------------------------------- UPDATE USER -----------------------------
route.patch("/users",Auth,async(req,res) => {
    // check that user provides fields are valid or not ?
    const keys = Object.keys(req.body);
    const validFileds = ["firstname","lastname","email","password","phno"];
    const isValid = keys.every((k) => {
        return validFileds.includes(k);
    });

    // if is is not valid
    if(!isValid){
        return res.status(404).send({"Error":"Filed is not valid ! "});
    }

    // if it is valid
    try{
        const user = req.user;
        const body = req.body;

        keys.forEach((k) => {
            user[k] = body[k];
        });

        // save the data into the database
        await user.save();
        res.status(200).send(user);
    }
    catch(e){
        res.status(500).send(e);
    }
});

// ---------------------------------------- DELETE USER ---------------------------
route.delete("/users",Auth,async(req,res) => {
    try{
        const user = req.user;
        const deleteUser = await User.findByIdAndDelete({_id:user._id});
        res.status(200).send(deleteUser);
    }
    catch(e){
        res.status(500).send(e);
    }
});

// ------------------------------ UPLOAD AVATAR  ----------------------------------
const upload = multer({
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error("Please Uploadd jpg and png files"));
        }

        cb(undefined,true);
    }
});

// upload 
route.post("/users/me/avatar",Auth,upload.single("avatar"),async(req,res) => {
    try{
        // i am using sharp for resize the image size and convert image into the png file
        const buffer = await sharp(req.file.buffer).resize({
            width:250,
            height:250
        }).png().toBuffer();

        req.user.avatar = buffer;
        await req.user.save();
        res.send(req.user);
    }
    catch(e){res.status(400).send(e)}

},(error,req,res,next) => {
    res.status(400).send({"Error":error.message});    
});

// ----------------- GET THE USER AVATAR BY USING URL -------------------------------
route.get("/users/:id/avatar",async(req,res) => {
    try{
        const id = req.params.id;
        const user = await User.findById({_id:id});

        // if user and avatar is not found
        if(!user || !user.avatar){
            throw new Error();
        }

        res.set("Content-Type","image/png");
        res.send(user.avatar);
    }
    catch(e){
        res.status(404).send(e);
    }
});

module.exports = route;