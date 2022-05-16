const express = require('express');
const UserRouter = require("./Routers/UserRouter");
const TaskRouter = require("./Routers/TaskRouter");
// established the connection to the mongoose database
require("./Connection/Conn");
const app = express();

// set the middleware
app.use(express.json())
app.use(UserRouter);
app.use(TaskRouter);

module.exports = app;