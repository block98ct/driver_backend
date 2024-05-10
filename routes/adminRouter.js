const express = require('express')
const app = express()
const controller = require('../controllers/index')
const { authenticateToken } = require('../helpers/middleware')




app.post('/adminLogin', controller.adminController.adminLogin)
app.post('/forgotPassword', controller.adminController.forgotPassword)
app.post('/verifyOtp', controller.adminController.verifyOTP)
app.post('/resetPassword', controller.adminController.resetPassword)


app.get('/allPpeRequest', authenticateToken, controller.adminController.allPpeRequests )
app.get('/allIncidentReports', authenticateToken, controller.adminController.allIncidentReports )
app.get('/allRequests', authenticateToken, controller.adminController.allRequests )
app.get('/ppeRequestOne', authenticateToken, controller.adminController.ppeRequestOnlyOne)
app.get('/ppeRequestByDate', authenticateToken, controller.adminController.ppeReportSortByDate)

app.post('/filterApplications', authenticateToken, controller.adminController.filterDrivingApplication)


app.get('/allDriversApplications', authenticateToken, controller.adminController.allApplications)
app.get('/latestApplications', authenticateToken, controller.adminController.latestApplications)

//app.get('/allIncidentReports', authenticateToken, controller.adminController.allIncidentReports)
app.get('/incidentReportOne', authenticateToken, controller.adminController.incidentReportOnlyOne)
app.get('/incidentReportByDate', authenticateToken, controller.adminController.incidentReportsSortbyDate)





app.get('/searchApplications', authenticateToken, controller.adminController.searchData)
app.get('/searchIncidentReports', authenticateToken, controller.adminController.searchIncidentReports)

app.get('/licenseStatus', authenticateToken, controller.adminController.licenseStatus)







app.post('/setPpeStatus', authenticateToken, controller.adminController.setPpeStatus )
app.post('/setDrivingApplicationStatus', authenticateToken, controller.adminController.setDrivingApplicationStatus )









module.exports = app