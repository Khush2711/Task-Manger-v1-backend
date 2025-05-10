require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 4000;
const app = express();
const mongodb = require("./Config/Mongodb_Connection");
const userRoutes = require("./Routes/User");
const taskRoutes = require("./Routes/Task");
const cors = require("cors");


app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("CORS policy: Origin not allowed"), false); // Deny the request
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.send("sever is running");
})



app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/task", taskRoutes);


app.listen(port, () => {
    //connect mongodb
    mongodb()
    //console.log(`Server is running on http://localhost:${port}`);
})