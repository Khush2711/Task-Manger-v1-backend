const User = require("../Model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth | verifiy token
exports.auth = async (req, res, next) => {
    try {
        // Extract Token From cookie || body || header
        const token =
            req.cookies?.token ||
            req.body?.token ||
            (req.header("Authorization")?.startsWith("Bearer ")
                ? req.header("Authorization").replace("Bearer ", "")
                : null);


        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (err) {
            //console.log("Error Occured while decoding token : ",err);
            return res.status(401).json({
                success: false,
                message: `token is invalid`
            })
        }

        next();

    } catch (error) {
        //console.log(error);

        return res.status(401).json({
            success: false,
            message: `something went wrong while validating the token`
        })
    }
}