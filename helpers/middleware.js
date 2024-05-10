// Importing the bcryptjs library for password hashing
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Function to hash the given password using bcrypt
exports.hashPassword = async (password, saltRounds = 10) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.log(error);
    }
    return null;
}

// Function to compare the given password with a hash using bcrypt
exports.comparePassword = async (pass, hash) => {
    try {
        const match = await bcrypt.compare(pass.toString(), hash);
        if (match) {
            return match;
        }
    } catch (error) {
        console.log(error);
    }
    return false;
}

// Middleware function to authenticate a token
exports.authenticateToken = async (req, res, next) => {
    const authToken = req.header('Authorization');
    if (!authToken) return res.status(401).send('Please provide a token');
    let token = authToken.split(' ').slice(-1)[0];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.decoded = decoded;
        next();
    } catch (error) {
        res.status(403).send('Invalid token');
    }
}

//**-----------generate random number---------- */
exports.generateRandomString = async (length) => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}



exports.generateRandomPassword = async (length) => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


exports.generateOTP = async() =>{
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  }
  

