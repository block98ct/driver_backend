const express = require('express')
const app = express()
const controller = require('../controllers/index')
const { authenticateToken } = require('../helpers/middleware')



app.post("/registerUser", authenticateToken, controller.superAdminController.regitserUsers)
app.post("/registerAdmin", authenticateToken, controller.superAdminController.resgisterAdmins)
app.post("/setAdminStatus", authenticateToken, controller.superAdminController.setStatusOfAdmins)
app.get("/allUserData", authenticateToken, controller.superAdminController.allUserData)
app.get("/allAdminData", authenticateToken, controller.superAdminController.allAdminsData)

app.get("/searchAdmin", authenticateToken, controller.superAdminController.searchAdminByData)
//app.get("/sortAdmins", authenticateToken, controller.superAdminController.sortAdminByDate)

app.get("/searchUser", authenticateToken, controller.superAdminController.searchUserByData)
//app.get("/sortUsers", authenticateToken, controller.superAdminController.sortUserByDate)

app.get("/allLogs", authenticateToken, controller.superAdminController.allLogs)
app.get("/logsByAuthority", authenticateToken, controller.superAdminController.logsByAuthority)
app.get("/logsByAction", authenticateToken, controller.superAdminController.logsByAction)
app.get("/searchLogs", authenticateToken, controller.superAdminController.searchLogs)







module.exports= app

//allDriverApplications