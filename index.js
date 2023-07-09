const serverless = require("serverless-http");
const express = require("express");
const app = express();
const {Pool} = require("pg");

const pgConfig = {
    user: '--username--',
    host: '--host--',
    database: '--database--',
    password: '--password--',
    port: 5432,
};

app.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Hello from root!",
    });
});

app.post("/courses", async (req, res, next) => {
    try {
        const {courseName, instructor} = req.body;
        const id = Math.floor(Math.random() * 1000000);

        const pgPool = new Pool(pgConfig);
        const pgClient = await pgPool.connect();
        const pgQuery = 'INSERT INTO courses (id, name, instructor) VALUES ($1, $2, $3) RETURNING id';
        const pgValues = [courseName, instructor];
        const pgResult = await pgClient.query(pgQuery, pgValues);
        const courseId = pgResult.rows[0].id;

        pgClient.release();

        res.json({message: 'Course created successfully!', courseId});
    } catch (error) {
        res.status(500).json({error: 'An error occurred'});
    }
});

app.get('/courses', async (req, res) => {
    try {
        const pgPool = new Pool(pgConfig);
        const pgClient = await pgPool.connect();
        const pgQuery = 'SELECT * FROM courses';
        const pgResult = await pgClient.query(pgQuery);
        const courses = pgResult.rows;

        pgClient.release();

        res.json({courses});

    } catch (error) {
        res.status(500).json({error: 'An error occurred'});
    }
});

app.get('/course/:courseId', async (req, res) => {
    try {
        const {courseId} = req.params;

        const pgPool = new Pool(pgConfig);
        const pgClient = await pgPool.connect();
        const pgQuery = 'SELECT * FROM courses WHERE id = $1';
        const pgValues = [courseId];
        const pgResult = await pgClient.query(pgQuery, pgValues);
        const course = pgResult.rows[0];

        pgClient.release();

        res.json({course});

    } catch (error) {
        res.status(500).json({error: 'An error occurred'});
    }
});

app.put('/course/:courseId', async (req, res) => {
    try {
        const {courseId} = req.params;
        const {courseName, instructor} = req.body;

        const pgPool = new Pool(pgConfig);
        const pgClient = await pgPool.connect();
        const pgQuery = 'UPDATE courses SET name = $1, instructor = $2 WHERE id = $3';
        const pgValues = [courseName, instructor, courseId];
        const pgResult = await pgClient.query(pgQuery, pgValues);

        pgClient.release();

        res.json({message: 'Course updated successfully!'});

    } catch (error) {
        res.status(500).json({error: 'An error occurred'});
    }
});

app.delete('/course/:courseId', async (req, res) => {
    try {
        const {courseId} = req.params;

        const pgPool = new Pool(pgConfig);
        const pgClient = await pgPool.connect();
        const pgQuery = 'DELETE FROM courses WHERE id = $1';
        const pgValues = [courseId];
        const pgResult = await pgClient.query(pgQuery, pgValues);

        pgClient.release();

        res.json({message: 'Course deleted successfully!'});

    } catch (error) {
        res.status(500).json({error: 'An error occurred'});
    }
})

app.enroll('/course/:courseId', async (req, res) => {
    try {
        const {courseId} = req.params;
        const {studentId} = req.body;

        const pgPool = new Pool(pgConfig);
        const pgClient = await pgPool.connect();
        const pgQuery = 'INSERT INTO enrollments (course_id, student_id) VALUES ($1, $2) RETURNING id';
        const pgValues = [courseId, studentId];
        const pgResult = await pgClient.query(pgQuery, pgValues);
        const enrollmentId = pgResult.rows[0].id;

        pgClient.release();

        res.json({message: 'Enrollment created successfully!', enrollmentId});

    } catch (error) {
        res.status(500).json({error: 'An error occurred'});
    }
})


module.exports.handler = serverless(app);
