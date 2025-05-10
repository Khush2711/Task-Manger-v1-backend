const taskModel = require("../Model/Tasks");
const userModel = require("../Model/User");


exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, assignedTo } = req.body;
        const assignedBy = req.user.id; // The ID of the user creating the task

        // Validation: Title and description are required
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and Description are required."
            });
        }

        // Ensure assignedTo is an array and contains valid userId entries
        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({
                success: false,
                message: "assignedTo should be an array."
            });
        }

        // Map assignedTo to usersList format
        let usersList = assignedTo
            .filter(item => item && item.userId)  // Filter out invalid entries (null or undefined)
            .map(item => ({
                user: item.userId,
                permission: item.permission || "view"  // Default permission "view" if not specified
            }));

        // Ensure the creator is included with 'edit' rights by default
        const creatorAlreadyIncluded = usersList.some(u => u.user.toString() === assignedBy.toString());

        if (!creatorAlreadyIncluded) {
            usersList.push({
                user: assignedBy,
                permission: "edit"  // Creator gets 'edit' permission
            });
        }

        // Create the task
        const newTask = await taskModel.create({
            title,
            description,
            dueDate,
            users: usersList,
            assignedBy
        });

        // Add task reference to all assigned users
        const userIds = usersList.map(u => u.user);
        await userModel.updateMany(
            { _id: { $in: userIds } },
            { $push: { tasks: newTask._id } } // Push the task reference to the user's tasks array
        );

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: newTask
        });

    } catch (error) {
        console.error("Error occurred while creating task:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const userIds = req.body.userIds;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "userIds must be a non-empty array in body."
            });
        }

        const tasks = await taskModel.find({
            $or: [
                { assignedBy: { $in: userIds } },
                { "users.user": { $in: userIds } }
            ]
        }).populate("assignedBy", "firstName lastName email image")
            .populate("users.user", "firstName lastName email image");

        res.status(200).json({
            success: true,
            message: "Fetch Task based on users...",
            tasks
        });
    } catch (error) {
        console.error("Error occured at the time of filtering task based on users : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        //console.log("status", status);

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required..."
            });
        }

        const tasks = await taskModel.find({
            status
        }).populate("assignedBy", "firstName lastName email image")
            .populate("users.user", "firstName lastName email image");

        res.status(200).json({
            success: true,
            message: "Fetch Task based on task status...",
            tasks
        });

    } catch (error) {
        console.error("Error occured in getTaskByStatus controller : ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { _id, status } = req.body;

        if (!status || !_id) {
            return res.status(400).json({
                success: false,
                message: "All fileds are required..."
            });
        }

        // Check if the status value is valid
        const validStatuses = ["Inprogress", "Finished", "Not Started"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed statuses are: ${validStatuses.join(", ")}`
            });
        }

        const tasks = await taskModel.findByIdAndUpdate(_id,
            { status },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Status updated successfully....",
            tasks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.updateTask = async (req, res) => {
    try {
        
        const userId = req.user.id;
        const { title, description, dueDate, status, users, taskId } = req.body;

        const task = await taskModel.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check permission
        if (String(task.assignedBy) !== userId) {
            const userPermission = task.users.find(u => String(u.user) === userId);
            if (!userPermission || userPermission.permission !== "edit") {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to edit this task"
                });
            }
        }

        // Validate and Update fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (dueDate) task.dueDate = dueDate;

        if (status) {
            const validStatuses = ["Inprogress", "Finished", "Not Started"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed statuses are: ${validStatuses.join(", ")}`
                });
            }
            task.status = status;
        }

        await task.save();

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        const userId = req.user.id;

        const task = await taskModel.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (String(task.assignedBy) !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this task"
            });
        }

        const userIds = task.users.map(u => u.user);

        await userModel.updateMany(
            { _id: { $in: userIds } },
            { $pull: { tasks: task._id } }
        );

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.getAllTask = async (req, res) => {
    try {

        const tasks = await taskModel.find()
            .populate("assignedBy", "firstName lastName email image")
            .populate("users.user", "firstName lastName email image");

        res.status(200).json({
            success: true,
            message: "Fetch Task successfully...",
            tasks
        });
    }
    catch (error) {
        //console.log("Error occured in getAllTask controller : ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

exports.getAllTaskCount = async (req, res) => {
    try {

        // ["Inprogress", "Finished", "Not Started"]
        const progress = await taskModel.countDocuments({ status: "Inprogress" });
        const finished = await taskModel.countDocuments({ status: "Finished" });
        const notStarted = await taskModel.countDocuments({ status: "Not Started" });

        res.status(200).json({
            success: true,
            message: "Fetch Task successfully...",
            data: {
                Inprogress: progress,
                Finished: finished,
                Not_Started: notStarted
            }
        });
    }
    catch (error) {
        //console.log("Error occured in getAllTask controller : ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

exports.getTasksByFiltersAndUser = async (req, res) => {
    try {
        const { status, userId } = req.body;

        if (!status && !userId) {
            return res.status(400).json({
                success: false,
                message: "At least one of 'status' or 'userId' is required"
            });
        }

        // Build dynamic query
        const filterQuery = {};

        if (status) {
            filterQuery.status = status;
        }

        if (userId) {
            filterQuery["users.user"] = userId;
        }

        const tasks = await taskModel
            .find(filterQuery)
            .populate("assignedBy", "firstName lastName email image")
            .populate("users.user", "firstName lastName email image");

        res.status(200).json({
            success: true,
            message: "Tasks fetched successfully based on filters",
            tasks
        });

    } catch (error) {
        console.error("Error in getTasksByFilters controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
