const express = require('express')
const app = express()
const controller = require('../controllers/index')
const { userLogin, userSighUp, passwordVallidate, handleValidationErrors } = require('../helpers/vallidation')
const { authenticateToken } = require('../helpers/middleware')
// const uploads = require('../helper/fileUpload').upload

app.post('/sighUp', userSighUp, handleValidationErrors, controller.userController.userRegister)
app.post('/userLogin', userLogin, handleValidationErrors, controller.userController.userLogin)
app.post('/forgetPasswordFn', controller.userController.forgetPasswordFn)
app.get('/verifyUser/:id', controller.userController.verifyUser)
app.get('/verifyPassword/:id', controller.userController.verifyPasswordFn)

app.post('/editProfile', authenticateToken, controller.userController.editProfile)

app.post("/changePassword", passwordVallidate, handleValidationErrors, controller.userController.changePassword);
app.post('/driverApplicationForm', authenticateToken, controller.userController.registerDriverApplicationForm)
app.post("/driverReport", authenticateToken, controller.userController.driverIncidentReportHandle)
app.post("/ppeRecord", authenticateToken, controller.userController.ppeRecordHandle )

//app.get("/driverApplication", authenticateToken, controller.userController.getDriverApplicationHandle)

app.get("/driverReports", authenticateToken, controller.userController.getDriverIncidentReportsHandle) 
app.get("/driverReport", authenticateToken, controller.userController.getDriverIncidentReportHandle) 

app.get("/ppeRecords", authenticateToken, controller.userController.getPpeRecordsHandle) 
app.get("/ppeRecord", authenticateToken, controller.userController.getPpeRecordHandle) 


    
// app.post('/withdrawal', authenticateToken, controller.userController.withdraw)
// app.get('/gameList', authenticateToken,controller.userController.gamesList)

module.exports = app