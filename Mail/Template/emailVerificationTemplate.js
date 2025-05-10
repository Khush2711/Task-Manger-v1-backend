const otpTemplate = (otp) => {
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; font-size: 24px;">
        Your OTP Code
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center;">
        <!-- <p style="font-size: 18px; color: #333;">Hello Team,</p> -->
        <p style="font-size: 16px; color: #555;">Use the following OTP to complete your action:</p>
        <p style="font-size: 32px; font-weight: bold; margin: 20px 0; color: #4CAF50;">${otp}</p>
        <p style="font-size: 14px; color: #999;">This OTP is valid for <strong> 5 mins</strong>.</p>
        <p style="font-size: 14px; color: #999;">Please do not share this code with anyone.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        If you did not request this OTP, please ignore this email or contact us immediately.<br><br>
        &copy;  2025 Alendei Platforms. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports = otpTemplate;