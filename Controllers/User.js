const User = require("../Model/User");

exports.getUser = async (req, res) => {
    try {

        const usersList = await User.find().select('firstName lastName email image');

        return res.status(200).json({
            success: true,
            message: "user fetch successfully....",
            usersList
        })


    } catch (err) {
        //console.log(`error occured while fetching users...`);

        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}