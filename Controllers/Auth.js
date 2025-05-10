const User = require("../Model/User");
const OTPModel = require("../Model/OTP");
const profileModel = require("../Model/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../Utilis/mailSender");
const taskModel = require("../Model/Tasks");
require("dotenv").config();

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


// sendOTP
exports.sendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            //console.log("req.body..........", email);
            return res.status(403).json({
                success: false,
                message: `All fileds are required`
            })
        }

        const isUserExist = await User.findOne({ email });

        // //console.log(`is user exist with this email : ${isUserExist}`);

        if (!isValidEmail(email)) {
            throw new Error('Invalid email address format');
        }

        if (isUserExist) {
            return res.status(404).json({
                success: false,
                message: "User already register",
                isUserExist
            })
        }


        let generateOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        //console.log(`Generated OTP : ${generateOTP}`);

        let result = await OTPModel.findOne({ otp: generateOTP });

        while (result) {
            generateOTP = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTPModel.findOne({ otp: generateOTP });
            //console.log(`Result : ${result}`);
        }

        const otpPaylod = await OTPModel.create({ email, otp: generateOTP });
        //console.log(`OTP store in db: ${otpPaylod}`);

        return res.status(200).json({
            success: true,
            message: `OTP sent successfully`,
            generateOTP
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}


// signup
exports.signup = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            otp
        } = req.body;

        //console.log("request body", req.body);

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: `All fileds are required`
            })
        }


        const isUserExist = await User.findOne({ email });

        if (isUserExist) {
            return res.status(401).json({
                success: false,
                message: "User already register",
                isUserExist
            })
        }

        //console.log(`User exist : ${isUserExist}`);


        let recentOtp = await OTPModel.find({ email }).sort({ createdAt: -1 }).limit(1);
        //console.log(`Recent Otp : ${recentOtp}`);

        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        }
        if (otp !== recentOtp[0].otp) {
            return res.status(403).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profile = await profileModel.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        const tasks = [];

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            additionDetails: profile._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName[0] + lastName[0]}&radius=50`,
            tasks
        })


        const payload = {
            email: user.email,
            id: user._id
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "12h"
        })

        user.password = null;
        user.token = token;

        return res.status(200).json({
            success: true,
            message: 'User is registered successfully',
            user
        })

    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            message: `User is not registered. please try again`
        })
    }
}

// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: `All fileds are required`
            })
        }

        const existingUser = await User.findOne({ email }).populate("additionDetails").exec();

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup"
            })
        }

        const payload = {
            email: existingUser.email,
            id: existingUser._id
        }

        if (await bcrypt.compare(password, existingUser.password)) {

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "12h"
            })

            existingUser.token = token;
            existingUser.password = null;

            // let option = {
            //     expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            //     httpOnly: true
            // }

            let option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // expires in 3 days
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // set to true in production for secure cookies
                sameSite: "strict", // helps prevent CSRF attacks
            };

            const { password, ...userWithoutPassword } = existingUser.toObject(); // Exclude password


            return res.cookie("token", token, option).status(200).json({
                success: true,
                user: userWithoutPassword,  // Send the user object without the password and token
                message: "Logged in",
            });

        }

        return res.status(401).json({
            success: false,
            message: `Password is incorrect`
        })


    } catch (error) {
        //console.log(error);

        return res.status(500).json({
            success: false,
            message: `Login Failure, please try again.`
        })
    }
}

// logout
exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};



// change password
exports.changePassword = async (req, res) => {
    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
                .status(401)
                .json({
                    success: false,
                    message: "The password is incorrect"
                });
        }

        // Match new password and confirm new password
        if (newPassword !== confirmNewPassword) {
            // If new password and confirm new password do not match, return a 400 (Bad Request) error
            return res.status(400).json({
                success: false,
                message: "The password and confirm password does not match",
            });
        }

        if (newPassword === oldPassword) {
            return res.status(400).json({
                success: false,
                message: "The new password and old password are same...",
            });
        }

        // Update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Your Password Has Been Successfully Changed",
                `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Changed Successfully</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f6f6;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333333;
      text-align: center;
    }
    p {
      color: #555555;
      line-height: 1.6;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #888888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Password Has Been Successfully Changed</h1>
    <p>Dear ${updatedUserDetails.firstName},</p>
    <p>We wanted to let you know that your account password has been successfully updated.</p>
    <p>If you made this change, no further action is needed.</p>
    <p>If you did not request a password change, please take appropriate action to secure your account immediately.</p>
    <p>Thank you for keeping your account secure.</p>
    <p>Best regards,<br><strong>Alendei Platforms</strong></p>
    <div class="footer">
      &copy; 2025 Alendei Platforms. All rights reserved.
    </div>
  </div>
</body>
</html>
`,

            );
            //console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        // Return success response
        return res.status(200)
            .json({
                success: true, message: "Password updated successfully"
            });

    } catch (error) {
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
};



/*  
********* bcrypt **********

for hashing password : hash()
for compare password : compare()

*/

/*
----------- JWT TOKEN -----------

To create token :  sign()
            
            sign(payload,process.env.JWT_SECRET,{
                expiresIn:"12h"
            })
 */
