const express = require("express");
const router = express.Router();


const {
    createTask,
    getTasks,
    getTasksByStatus,
    updateTaskStatus,
    updateTask,
    deleteTask,
    getAllTask,
    getAllTaskCount,
    getTasksByFiltersAndUser
} = require("../Controllers/Task");

const { auth } = require("../Middlewares/auth");

// Route for creating task
router.post("/create-task", auth, createTask);

// Route for get task filter based on users
router.post("/task", auth, getTasks);

// Route for get task filter based on status
router.get("/task/:status", auth, getTasksByStatus);

// Route for update task's status
router.patch("/update-status", auth, updateTaskStatus);

// Route for update task
router.put("/update-status", auth, updateTask);

// Route for delete task
router.delete("/delete-task", auth, deleteTask);

// Route for delete task
router.get("/", auth, getAllTask);

// Route for task counts
router.get("/count", auth, getAllTaskCount);

// Route to get task filter based on status and user
router.post("/task/statusAndUser", auth, getTasksByFiltersAndUser);


module.exports = router