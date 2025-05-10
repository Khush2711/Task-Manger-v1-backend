const resetPasswordToken = (url) => {
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #1D4ED8; color: white; padding: 20px; text-align: center; font-size: 24px;">
        Password Reset Request
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; text-align: center;">
        <p style="font-size: 16px; color: #555;">You recently requested to reset your password.</p>
        <p style="font-size: 16px; color: #555;">Click the button below to reset it:</p>
        <a href="${url}" 
           style="display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #1D4ED8; color: white; text-decoration: none; font-size: 16px; border-radius: 4px;">
          Reset Password
        </a>
        <p style="font-size: 14px; color: #999;">If the button doesn't work, copy and paste the following link into your browser:</p>
        <p style="font-size: 14px; color: #1D4ED8; word-break: break-all;">
          ${url}
        </p>
        <p style="font-size: 14px; color: #999;">This link is valid for <strong>15 minutes</strong>.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        If you did not request a password reset, please ignore this email or contact support.<br><br>
        &copy; 2025 Alendei Platforms. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>

`;
};

module.exports = resetPasswordToken;