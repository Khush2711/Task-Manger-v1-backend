require("dotenv").config();
const mongoose = require("mongoose");


module.exports = async () => {
    try {
        const DB_URL = process.env.DB;
        await mongoose.connect(DB_URL);
        //console.log(`Database connected successfully....`);
    } catch (error) {
        //console.log(`Error occured at the time of connecting mongodb`);
    }
}