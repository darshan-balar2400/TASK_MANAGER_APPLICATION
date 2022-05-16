const User = require("../src/Models/UserModel");
const jwt = require("jsonwebtoken");
const request = require('supertest');
const app = require("../src/app");
const mongoose = require("mongoose");
const async = require("hbs/lib/async");

// dummy data for the login

const user_id = new mongoose.Types.ObjectId;

const dummyUser = {
    _id:user_id,
    firstname:"Darshan",
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

beforeEach(async () => {
    await User.deleteMany();
    await new User(dummyUser).save();
});

// --------------------------------- SIGN UP ---------------------------------------

// test case 1 for signup
test("Should SignUp",async() => {
    await request(app).post("/users").send({
        firstname:"Roshan",
        lastname:"Balar",
        email:"roshanbalar123@gmail.com",
        password:"Balar123$",
        phno:9825386686
    }).expect(201);
}) ;


// ------------------------------- LOGIN ---------------------------------

//testcase for the login
test("Should Login",async() => {
    await request(app).post("/users/login").send({
        email:dummyUser.email,
        password:dummyUser.password
    })
    .expect(200);
});

// testcase for not to login
test("Should not login",async() => {
    await request(app).post("/users/login")
    .send({
        email:dummyUser.email,
        password:"Dindin"
    }).expect(400);
});

//  ------------------------------------GET USER ----------------------------------

// testcase for the get the user
test("Should get user",async() => {
    await request(app).get("/users")
    .set("Authorization",`Bearer ${dummyUser.tokens[0].token}`)
    .send().expect(200);
});

// testcase for not get the login
test("Should not get user",async() => {
    await request(app).get("/users")
    .send().expect(401);
});

// ---------------------------- DELETE ------------------------------------

// testcase for the delete the user
test("Should Delete the user",async() => {
    await request(app).delete("/users")
    .set("Authorization",`Bearer ${dummyUser.tokens[0].token}`)
    .send().expect(200);
});

// testcase for not delete the user
test("Should not delete the user",async() => {
    await request(app).delete("/users")
    .send().expect(401);
});

// ------------------------------ UPDATE USER -----------------------------

test("Should Update the user",async() => {
    await request(app).patch("/users")
    .send({
        firstname:"DB"
    })
    .set("Authorization",`Bearer ${dummyUser.tokens[0].token}`)
    .send().expect(200);
});

test("Should not update the user",async() => {
    await request(app).patch("/users")
    .send()
    .expect(401)
});

