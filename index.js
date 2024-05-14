// Import required modules
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const route = require('./routes/index');
require('dotenv').config();
var app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"))

/**------routes call--------- */
app.use('/api', route);

/**--------server start-------- */
let port = process.env.PORT || 4000;
// "192.168.29.216"
app.listen(port, "192.168.1.12",() => {
    console.log(`Server started at http://localhost:${port}`); // Log server start message with port number
});
