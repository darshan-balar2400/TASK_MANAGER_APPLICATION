const {
    user_id,
    user_id_two,
    dummyUser,
    dummyUserTwo,
    taskone,
    tasktwo,
    taskfour,
    taskfive,
    taskseven,
    tasksix,
    taskthree,
    setupDatabase
} = require("./fixtures/db");

const Task = require("../src/Models/TaskModel");
const request = require("supertest");
const app = require("../src/app");


//test case for creating task
beforeEach(setupDatabase)

// -------------------------- TEST CASES FOR CREATING TASK --------------------------
describe("Create Task TestCases", () => {
    test("Should Create Task", async () => {
        const response = await request(app).post("/tasks")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send({
                description: "This is the my second task"
            })
            .expect(201);

        const task = await Task.findById(response.body._id);
        expect(task).not.toBeNull();
    });

    test("Should not create task with unauthenticated", async () => {
        await request(app).post("/tasks")
            .send({
                description: "My Five Task"
            })
            .expect(401)
    });

    test("Should not create task with invalid description/completed", async () => {
        await request(app).post('/tasks')
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send({
                description: true,
                completed: "This is the task"
            })
            .expect(400);
    });
});



// --------------------------- TEST CASES FOR GET THE TASKS --------------------------

describe("Get Tasks TestCases", () => {
    test("Should get the tasks of user", async () => {

        const response = await request(app).get("/tasks")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);

        console.log(response.body);
        expect(response.body.length).toEqual(4);
    });

    test("Should fetch user task by id", async () => {
        const response = await request(app).get(`/tasks/${taskone._id}`)
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);

        expect(response.body.description).toEqual("First Task");
    });

    test("Should not fetch user task by id if unauthenticated", async () => {
        await request(app).get(`/tasks/${taskone._id}`)
            .send()
            .expect(401)
    });

    test("Should not fetch other users task by id", async () => {
        await request(app).get(`/tasks/${taskone._id}`)
            .set("Authorization", `Bearer ${dummyUserTwo.tokens[0].token}`)
            .send()
            .expect(400)
    });

    test("Should fetch only completed tasks", async () => {

        const response = await request(app).get("/tasks?completed=true")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);

        expect(response.body.length).toEqual(3);

    });

    test("Should fetch only incompleted tasks", async () => {
        const response = await request(app).get("/tasks?completed=false")
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);

        expect(response.body.length).toEqual(1);
    });

    test("Should sort tasks by description/completed/createdAt/updateAt", async () => {
        const response = await request(app).get('/tasks?sort=description:desc')
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);

    });

    test("Should fetch page of tasks", async () => {
        const response = await request(app).get('/tasks?limit=2&skip=2&sort=createdAt:desc')
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);
    });
});

// ---------------------- TEST CASES FOR THE DELETE THE TASKS -----------------------

describe("Delete Task Testcases", () => {
    test("Should Delete the task", async () => {
        const response = await request(app).delete(`/tasks/${taskone._id}`)
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send()
            .expect(200);

        const task = await Task.findById(taskone._id);
        expect(task).toBeNull();
    });

    test("Should not delete the task if unauthenticated", async () => {
        const response = await request(app).delete(`/tasks${tasktwo._id}`)
            .send()
            .expect(404)

        const task = await Task.findById(tasktwo._id);
        expect(task).not.toBeNull();
    })
})


// ----------------------- TEST CASES FOR UPDATE TASKS ----------------------------------

describe("Update Task TestCases", () => {
    test("Should not update other users task", async () => {
        const response = await request(app).patch(`/tasks/${taskone._id}`)
            .set("Authorization", `Bearer ${dummyUserTwo.tokens[0].token}`)
            .send({
                completed: true
            })
            .expect(400)

        const task = await Task.findById(taskone._id);
        expect(task.completed).not.toEqual(true);
    });

    test("Should not update task with invalid description/complete", async () => {
        await request(app).patch(`/tasks/${taskone._id}`)
            .set("Authorization", `Bearer ${dummyUser.tokens[0].token}`)
            .send({
                description: true,
                completed: "This is my first task"
            })
            .expect(400);
    });
});


//
