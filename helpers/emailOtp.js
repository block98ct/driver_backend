// Import nodemailer module
const nodemailer = require('nodemailer');
const baseurl = require('../config').base_url;

// Define a function named 'mail' to send an email with OTP
module.exports.mail = async function (email, otp) {
    // Create a transporter object
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "testing26614@gmail.com",
            pass: "ibxakoguozdwqtav",
          },
    });

    // Define email options
    let mailOptions = {
        from: "mkdteamcti@gmail.com", // Sender's email address
        to: email, // Recipient's email address
        subject: "OTP for Password Reset", // Email subject
        html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`, // Email content with OTP
    };

    // Send email using transporter
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) { // If error occurs while sending email
            console.log("Error " + err); // Log the error
        } else { // If email sent successfully
            console.log("Email sent successfully", info.response); // Log the success message with email response info
        }
    });
};
