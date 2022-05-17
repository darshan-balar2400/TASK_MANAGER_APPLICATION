const User = require("../src/Models/UserModel");
// const jwt = require("jsonwebtoken");
const request = require('supertest');
const app = require("../src/app");
// const mongoose = require("mongoose");
const { user_id, dummyUser, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

// ----------------------TEST CASES FOR SIGN UP ---------------------------------------

// Should SignUp
describe("SignUp User TestCases", () => {
    test("Should SignUp", async () => {
        const response = await request(app).post("/users").send({
            firstname: "Roshan",
            lastname: "Balar",
            email: "roshanbalar12344@gmail.com",
            password: "Balar123$",
            phno: 9825386686
        }).expect(201);

        const user = await User.findById(response.body.newUser._id);
        expect(user).not.toBeNull();

        expect(response.body).toMatchObject({
            newUser: {
                firstname: "Roshan"
            }
        });

        expect(user.password).not.toBe("Balar123$")

    });

    // Should Not SignUp User With Invalid name/email/password
    test("Should Not Signup User With Invalid name/email/password", async () => {
        await request(app).post('/users')
            .send({
                email: "dinain34innw93nne",
                password: "dinain"
            })
            .expect(400)
    });
})



//----------------------------- TEST CASES FOR LOGIN ---------------------------------

describe("Login User TestCases", () => {
    //testcase for the login
    test("Should Login", async () => {
        const response = await request(app).post("/users/login").send({
            email: dummyUser.email,
            password: dummyUser.password
        })
            .expect(200);

        const user = await User.findById(response.body.checkCredentials._id);
        expect(user).not.toBeNull();

        expect(response.body.token).toBe(user.tokens[1].token)
    });

    // Should Not Login Witn Invalid email/password
    test("Should not login with invalid email/password", async () => {
        await request(app).post("/users/login")
            .send({
                email: dummyUser.email,
                password: "Dindin"
            }).expect(400);
    });
})


//  ------------------------ TEST CASESE FOR GET USER --------------------------------

describe("GetUser TestCases", () => {
    test("Should get user", async () => {
        await request(app).get("/users")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send().expect(200);
    });

    test("Should not get user", async () => {
        await request(app).get("/users")
            .send().expect(401);
    });
})

// -------------------------  TEST CASES FOR DELETE ---------------------------------
describe("Delete User TestCases", () => {
    test("Should Delete the user", async () => {
        const response = await request(app).delete("/users")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send().expect(200);

        const user = await User.findById(response.body._id);
        expect(user).toBeNull();
    });

    test("Should not delete the user if unauthenticated", async () => {
        await request(app).delete("/users")
            .send().expect(401);

        const user = await User.findById(user_id);
        expect(user).not.toBeNull();
    });
});

// --------------------------- TEST CASES FOR UPDATE USER -----------------------------
describe("Update User TestCases", () => {
    test("Should Update the user", async () => {
        const response = await request(app).patch("/users")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send({
                firstname: "Darshan"
            })
            .expect(200);

        const user = await User.findById(response.body._id);
        expect(user).not.toBeNull();

        expect(user.firstname).toEqual("Darshan");
    });

    test("Should not update the user with field not exist !", async () => {
        await request(app).patch("/users")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send({
                firstnamdde: "Darshan"
            })
            .expect(400);
    });

    test("Should not update the user with invalid email/password/name", async () => {
        await request(app).patch("/users")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send({
                email: "dinaind"
            })
            .expect(400)

        const user = await User.findById(user_id);
        expect(user.email).not.toEqual("dinaind");
    });

    test("Should not update the user if unauthenticated", async () => {
        await request(app).patch('/users')
            .send({
                firstname: "balar40"
            })
            .expect(401);

        const user = await User.findById(user_id);
        expect(user.firstname).not.toEqual("balar40");
    })
})


// -------------------- UPLOAD AVATAR ---------------------------------

test("Should Upload Avatar", async () => {
    await request(app).post("/users/me/avatar")
        .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/avatar.png")
        .expect(200)

    const user = await User.findById(user_id);
    expect(user.avatar).toStrictEqual(expect.any(Buffer));
});

