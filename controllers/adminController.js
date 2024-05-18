require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretKey = process.env.JWT_SECRET_KEY;       
const Msg = require("../helpers/message");
const { mail } = require("../helpers/emailOtp");
const { hashPassword } = require("../helpers/middleware");
const {
  fetchAdminByEmail,
  fetchAdminById,
  getAllPpeRequests,
  getAllIncidentReports,
  getAllApplication,
  setPpeRequestStatus,
  getAllDriverApplication,
  getBankDetail,
  getConditionDetail,
  setLoginStatus,
  driverApplicationStatusCount,
  setDrivingStatus,
  getLatestApplications,
  getVehicleExperienceDetail,
  ppeRequests,
  updateApprovedDate,
  getBankDetailById,
  getConditionInformationById,
  getPoliceInformationById,
  getDamagePropertyById,
  getDriverStatementById,
  updateAdminOTPByEmail,
  updateAdminPasswordByEmail,
  updateAdminOtpToNullByEmail,
  addLogs,
  getIncidentReportImagesByUserId
} = require("../models/admin.modal");

const {
  getAllAboutYouForm,
  getAllBackgroundInformation,
  getAllVehicleExperience,
  getAllPersonalDetails,
  getAllBankDetails,
  getAllAcknowledgeDetails,
} = require("../models/user.model");

const baseurl = require("../config").base_url;


const checkIsAdmin = async (req) => {
  const { adminId } = req.decoded;

  const adminResp = await fetchAdminById(adminId);

  if (adminResp[0].roll !== "superAdmin" && adminResp[0].roll !== "admin") {
    return res
      .status(201)
      .json({ success: false, message: "you are not authorized" });
  }
};
// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        status: false,
        msg: Msg.allFieldsRequired,
      });
    }
    const checkEmail = await fetchAdminByEmail(email);

    if (checkEmail[0].email !== email) {
      return res.status(201).send({
        status: false,
        msg: Msg.invalidCread,
      });
    }

    if (checkEmail[0].status == 0) {
      return res.status(201).send({
        status: false,
        msg: Msg.accountDeactiveated,
      });
    }

    let Password = await checkEmail[0].password;

    let checkPassword = await bcrypt.compare(password, Password);
    if (!checkPassword) {
      return res.status(201).send({
        status: false,
        msg: Msg.invalidCread,
      });
    }
    const id = { adminId: checkEmail[0].id };
    const token = jwt.sign(id, secretKey, { expiresIn: "1h" });

    const loginTime = new Date();
    await setLoginStatus(loginTime, email);

    return res.status(200).send({
      status: true,
      msg: Msg.loginSuccesfully,
      token: token,
      roll: checkEmail[0].roll,
      name: checkEmail[0].name
    });
  } catch (error) {
    console.log(error);
    return res.status(201).send({
      status: false,
      msg: Msg.err,
    });
  }
};

// ALL PPE REQUESTS

exports.allPpeRequests = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const resp = await getAllDriverApplication();

    const response = await ppeRequests();
    const mergedData = resp.map((application) => {
      const ppeRequest = response.find(
        (request) => request.userId === application.userId
      );
      return {
        id: ppeRequest ? ppeRequest.id : null,
        requestNo: ppeRequest ? ppeRequest.requestNo : null,
        totalItems: ppeRequest
          ? Object.values(ppeRequest)
              .filter((item) => typeof item === "object" && item !== null)
              .reduce(
                (acc, curr) =>
                  acc + (curr.numberRequired ? parseInt(curr.numberRequired) : 0),
                0
              ) // Use 0 if numberRequired is null or undefined
          : null,
        driverName: `${application.firstName} ${application.lastName}`,
        submissionDate: ppeRequest
          ? ppeRequest.submissionDate.toISOString().split("T")[0]
          : null,
        actionDate: "N/A",
        status: ppeRequest ? ppeRequest.status : null,

      };
    });
    

    return res.status(200).json({
      success: true,
      data: mergedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};
// PPE REQUEST BY ONE
exports.ppeRequestOnlyOne = async (req, res) => {
  try {
    await checkIsAdmin(req);
    // const resp = await getDriverApplicationById(id);
    const response = await ppeRequests();
    console.log(response);

    const { id } = req.query;
    console.log("id", id); // Assuming the ID is passed as a parameter in the request

    const ppeRequest = response.find((request) => request.id === parseInt(id));
    console.log(ppeRequest);

    const { userId, requestNo, status } = ppeRequest;
    const submissionDateFormat = new Date(ppeRequest.submissionDate)
      .toISOString()
      .split("T")[0]; // Format submission date as YYYY-MM-DD
    const approvedAtFormat = new Date(ppeRequest.approvedAt)
      .toISOString()
      .split("T")[0]; // Format submission date as YYYY-MM-DD

    const ppeDetails = Object.keys(ppeRequest)
      .filter(
        (key) =>
          ![
            "id",
            "userId",
            "submissionDate",
            "size",
            "requestNo",
            "approvedAt",
            "status",
          ].includes(key)
      )
      .map((key) => ({
        name:
          key.charAt(0).toUpperCase() +
          key
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim(), // Convert camelCase to human readable format
        ...ppeRequest[key],
      }))
      .map((item) => {
        if (item.size === "Select Size") {
          // If size is "Select Size", set it to null
          item.size = null;
        }
        return item;
      });

    return res.status(200).json({
      success: true,
      message: "PPE request details",
      data: {
        id: ppeRequest.id,
        userId: userId,
        submissionDate: submissionDateFormat,
        requestNo: requestNo,
        status: status,
        approvedAt: approvedAtFormat,
        ppeDetails: ppeDetails,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};

// PPE REPORT SORT BY DATE
exports.ppeReportSortByDate = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const resp = await getAllDriverApplication();
    const response = await ppeRequests();

    const mergedData = resp.map((application) => {
      const ppeRequest = response.find(
        (request) => request.userId === application.userId
      );

      console.log('ppeRequest:', ppeRequest); // Add this line for debugging

      return {
        id: ppeRequest ? ppeRequest.id : null,
        requestNo: ppeRequest ? ppeRequest.requestNo : null,
        totalItems: ppeRequest
        ? Object.values(ppeRequest)
            .filter((item) => typeof item === "object" && item !== null) // Filter out null items
            .reduce((acc, curr) => acc + parseInt(curr.numberRequired || 0), 0)
        : null,
      
        driverName: `${application.firstName} ${application.lastName}`,
        submissionDate: ppeRequest && ppeRequest.submissionDate
          ? ppeRequest.submissionDate.toISOString().split("T")[0]
          : null,
        action: "", // Add action data here
        status: ppeRequest ? ppeRequest.status : null,
      };
    });

    // Sort mergedData by submissionDate in ascending order
    mergedData.sort((a, b) => {
      if (a.submissionDate < b.submissionDate) return -1;
      if (a.submissionDate > b.submissionDate) return 1;
      return 0;
    });

    return res.status(200).json({
      success: true,
      data: mergedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: Msg.err,
    });
  }
};


// ALL INCIDENT REPORTS

exports.allIncidentReports = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const applications = await getAllDriverApplication();
    const bankDetails = await getBankDetail();
    const conditionDetails = await getConditionDetail();

    const formattedData = applications.map((application) => {
      const bankRecord = bankDetails.find(
        (record) => record.id === application.id
      );
      const conditionRecord = conditionDetails.find(
        (record) => record.id === application.id
      );
      const recordNo = bankRecord ? bankRecord.recordNo : null;

      return {
        id: application.id || null,
        recordNo: recordNo,
        location: conditionRecord ? conditionRecord.location || "" : "",
        driverName: `${application.firstName || ""} ${application.lastName || ""}`,
        clientName: bankRecord ? bankRecord.clientName || "" : "",
        vehicleNumber: bankRecord ? bankRecord.vehicleRegistrationNumber || "" : "",
      };
    });

    return res.status(200).json({
      success: true,
      message: Msg.allDriverApplications,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: Msg.err });
  }
};

exports.incidentReportOnlyOne = async (req, res) => {
  try {
    const { id } = req.query;
    await checkIsAdmin(req);
    const imgResp = await getIncidentReportImagesByUserId(id)
    const images = imgResp.map(record => record.images);

   // `${application.firstName || ""} ${application.lastName || ""}`
    const [
      allDriverResp,
      policeResp,
      damageResp,
      bankResp,
      conditionResp,
      driverResp
    ] = await Promise.all([
      getAllDriverApplication(id),
      getPoliceInformationById(id),
      getDamagePropertyById(id),
      getBankDetailById(id),
      getConditionInformationById(id),
      getDriverStatementById(id),
    ]);
    const allDriverRecord = allDriverResp.find((item) => item.id === parseInt(id));

    const bankRecord = bankResp.find((item) => item.id === parseInt(id));
    const policeRecord = policeResp.find((item) => item.id === parseInt(id));
    const damageRecord = damageResp.find((item) => item.id === parseInt(id));
    const conditionRecord = conditionResp.find((item) => item.id === parseInt(id));
    const driverRecord = driverResp.find((item) => item.id === parseInt(id));

    const formattedData = {
      id: bankRecord ? bankRecord.id : null,
      recordNo: bankRecord ? bankRecord.recordNo : null,
      clientName: allDriverRecord ? `${allDriverRecord.firstName || ""} ${allDriverRecord.lastName || ""}` : null,
      vehicleRegistrationNumber: bankRecord ? bankRecord.vehicleRegistrationNumber : null,
      incidentReportedTo: bankRecord && bankRecord.incidentReportedTo ? bankRecord.incidentReportedTo.join(", ") : null,
      dateTimeOfIncident: conditionRecord && conditionRecord.dateTimeOfIncident ? new Date(conditionRecord.dateTimeOfIncident).toDateString() : null,
      roadNumber: conditionRecord ? conditionRecord.roadNumber : null,
      location: conditionRecord ? conditionRecord.location || "" : "",
      speedInMPH: conditionRecord ? conditionRecord.speedInMPH : null,
      lightLevel: conditionRecord ? conditionRecord.lightLevel : null,
      weather: conditionRecord && conditionRecord.weather ? conditionRecord.weather.join(", ") : null,
      roadCondition: conditionRecord ? conditionRecord.roadCondition : null,
      PoliceInvolved: policeRecord && policeRecord.PoliceInvolved === "1" ? "Yes" : "No",
      statementGiven: policeRecord && policeRecord.statementGiven === "1" ? "Yes" : "No",
      isVehicleDriveable: damageRecord && damageRecord.isVehicleDriveable === "1" ? "Yes" : "No",
      didTakePhotos: damageRecord ? damageRecord.didTakePhotos : null,
      photos: damageRecord?.didTakePhotos === "Yes" ? images.map((img)=>`${baseurl}/temp/${img}`) : null,
      wereYouInjured: damageRecord ? damageRecord.wereYouInjured : null,
      wereThereWitnesses: damageRecord && damageRecord.wereThereWitnesses === "1" ? "Yes" : "No",
      witnesses: damageRecord ? damageRecord.witnesses || "" : "",
      liability: damageRecord ? damageRecord.liability || "" : "",
      vehiclesInvolved: damageRecord && damageRecord.vehiclesInvolved === "1" ? "Yes" : "No",
      wereYouOnMobile: damageRecord && damageRecord.wereYouOnMobile === "Yes" ? "Yes" : "No",
      driverStatement: driverRecord ? driverRecord.driverStatement : null,
      signatureUrl: driverRecord ? driverRecord.signatureUrl : null,
    };

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: Msg.err });
  }
};

// INCIDENT REPORT SORT BY DATE
exports.incidentReportsSortbyDate = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const applications = await getAllDriverApplication();
    const bankDetails = await getBankDetail();
    const conditionDetails = await getConditionDetail();

    // Calculate the date 15 days ago from the current date
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const formattedData = applications
      .map((application) => {
        const bankRecord = bankDetails.find(
          (record) => record.userId === application.userId
        );
        const conditionRecord = conditionDetails.find(
          (record) => record.userId === application.userId
        );

        return {
          id: application.id,
          recordNo: bankRecord ? bankRecord.recordNo: "" ,
          location: conditionRecord ? conditionRecord.location : "",
          driverName: `${application.firstName} ${application.lastName}`,
          clientName: bankRecord ? bankRecord.clientName: "",
          vehicleNumber:bankRecord ? bankRecord.vehicleRegistrationNumber: "",
          createdAt: application ? application.createdAt: "", // Assuming createdAt is the submission date
        };
      })
      .filter((report) => new Date(report.createdAt) > fifteenDaysAgo); // Filter reports submitted in the last 15 days

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};

// ALL REQUESTS
exports.allRequests = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const rep = await getAllPpeRequests();
    const resp1 = await getAllIncidentReports();
    const resp2 = await getAllApplication();
    const resp3 = await driverApplicationStatusCount();

    const allPpe = rep[0].totalEntries;
    const allInci = resp1[0].totalEntries;
    const allApp = resp2[0].totalEntries;
    const approvedRq = resp3[0].total;

    let total = allApp + allPpe + allInci + approvedRq;

    return res.status(200).send({
      status: true,
      msg: "All Requests",
      ppeCoount: allPpe,
      allInciCount: allInci,
      allAppCoount: allApp,
      approvedRequest: approvedRq,
      total: total,
    });
  } catch (error) {
    console.log(error);
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};

// SET PPR REQUEST STATUS
exports.setPpeStatus = async (req, res) => {
  const { id, status } = req.body;
  await checkIsAdmin(req);
  const { adminId } = req.decoded;
  const adminResp = await fetchAdminById(adminId);


  // if (adminResp[0].roll !== "superAdmin" && adminResp[0].roll !== "admin") {
  //   return res
  //     .status(201)
  //     .json({ success: false, message: "you are not authorized" });
  // }

  if (!id || !status) {
    return res.status(201).json({ success: false, message: Msg.setStatusCred });
  }

  try {
    await setPpeRequestStatus(status, id);
    const approvedTime = new Date();
    let logObj={
      name: adminResp[0].name,
      authority: adminResp[0].roll,
      effectedData: `${status == 0?"Rejected": "Approved"} ppe request`,
      timestamp: approvedTime,
      action: "updated"

    }
    // adding logs
    await addLogs(logObj)
    await updateApprovedDate(approvedTime, id);
    

    
    return res
      .status(200)
      .json({ success: true, message: Msg.ppeRequestUpdated });
  } catch (error) {
    console.error("Error setting PPE request status:", error);
    return res.status(500).json({ success: false, message: Msg.err });
  }
};

// exports.searchData = async (req, res) => {
//   try {
//     await checkIsAdmin(req);
//     const { response, fields } = req.body; // Assuming the request body contains the response data and fields to search

//     // Validate request body
//     if (!response || !fields) {
//       return res.status(400).json({ success: false, message: "Invalid request body" });
//     }

//     const queryParams = req.query;
//     let filteredData = response;

//     for (const field of fields) {
//       const queryValue = queryParams[field];
//       if (queryValue) {
//         filteredData = filteredData.filter(app => {
//           if (!app[field]) return false;
//           if (typeof app[field] === 'string') {
//             return app[field].toLowerCase().includes(queryValue.toLowerCase());
//           }
//           return app[field] === queryValue;
//         });
//       }
//     }

//     // Format the filtered data
//     const formattedData = filteredData.map(item => {
//       const formattedItem = {};
//       for (const field of fields) {
//         formattedItem[field] = item[field];
//       }
//       return formattedItem;
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Search results",
//       data: formattedData
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// }

// GET ALL DRIVER APPLICATIONS
exports.allApplications = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const response = await getAllDriverApplication();
    const formatedData = response.map((item) => ({
      id: item.id,
      driverName: `${item.firstName} ${item.lastName}`,
      country: item.country,
      emailAddress: item.email,
      contract: item.nationalInsuranceNumber,
      city: item.townCity,
      status: item.status,
      userId: item.userId,
    }));

    return res.status(200).json({
      success: true,
      message: Msg.allDriverApplications,
      data: formatedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};

// FILETER DRIVING APPLICATION
exports.filterDrivingApplication = async (req, res) => {
  try {
    await checkIsAdmin(req);
    // const aboutYouData = await getAllAboutYouForm();
    // console.log("All about you form:", aboutYouData);

    // const backgroundData = await getAllBackgroundInformation();
    // console.log("All background information:", backgroundData);

    // const vehicleExperienceData = await getAllVehicleExperience();
    // console.log("All vehicle experience:", vehicleExperienceData);

    // const personalDetailsData = await getAllPersonalDetails();
    // console.log("All personal details:", personalDetailsData);

    // const bankDetailsData = await getAllBankDetails();
    // console.log("All bank details:", bankDetailsData);

    // const acknowledgeDetailsData = await getAllAcknowledgeDetails();
    // console.log("All acknowledge details:", acknowledgeDetailsData);

    const aboutYouData = await getAllAboutYouForm();
    const backgroundData = await getAllBackgroundInformation();
    const vehicleExperienceData = await getAllVehicleExperience();
    const personalDetailsData = await getAllPersonalDetails();
    const bankDetailsData = await getAllBankDetails();
    const acknowledgeDetailsData = await getAllAcknowledgeDetails();

    // Combine data from different tables based on userId
    const combinedData = aboutYouData.map((user) => ({
      ...user,
      backgroundInfo: backgroundData.find(
        (info) => info.userId === user.userId
      ),
      vehicleExperience: vehicleExperienceData.find(
        (exp) => exp.userId === user.userId
      ),
      personalDetails: personalDetailsData.find(
        (details) => details.userId === user.userId
      ),
      bankDetails: bankDetailsData.find(
        (details) => details.userId === user.userId
      ),
      acknowledgeDetails: acknowledgeDetailsData.find(
        (details) => details.userId === user.userId
      ),
    }));

    // Extract query parameters
    const {
      convictions,
      incidents,
      addiction,
      companyRestriction,
      accountStatus,
      vehicleExperience,
      vehicleSkills,
      penaltyPoints,
      licenseExpiryIn6Weeks,
    } = req.query;

    // Filter the combined data based on query parameters
    const filteredData = combinedData.filter((driver) => {
      let meetsCriteria = true;

      // Apply filters based on the combined data
      if (
        convictions &&
        driver.backgroundInfo.hasCriminalConvictions !== "Yes"
      ) {
        meetsCriteria = false;
      }

      if (
        incidents &&
        driver.backgroundInfo.hasAccidentsLast12Months !== "Yes"
      ) {
        meetsCriteria = false;
      }

      if (addiction && driver.backgroundInfo.drugAlcoholTest !== "Yes") {
        meetsCriteria = false;
      }

      if (
        companyRestriction &&
        driver.backgroundInfo.preferNotPlaced !== "Yes"
      ) {
        meetsCriteria = false;
      }

      if (accountStatus && driver.status !== parseInt(accountStatus)) {
        meetsCriteria = false;
      }

      if (
        vehicleExperience &&
        !driver.vehicleExperience.vehicleExperience.includes(vehicleExperience)
      ) {
        meetsCriteria = false;
      }

      if (
        vehicleSkills &&
        !driver.vehicleExperience.vehicleSkills.includes(vehicleSkills)
      ) {
        meetsCriteria = false;
      }

      if (penaltyPoints && driver.vehicleExperience.panaltyPoints !== "Yes") {
        meetsCriteria = false;
      }

      if (licenseExpiryIn6Weeks) {
        const today = new Date();
        const sixWeeksLater = new Date(
          today.getTime() + 6 * 7 * 24 * 60 * 60 * 1000
        );
        const licenseExpiryDate = new Date(
          driver.vehicleExperience.licenseExpiryDate
        );
        if (licenseExpiryDate > today && licenseExpiryDate <= sixWeeksLater) {
          meetsCriteria = false;
        }
      }

      return meetsCriteria;
    });

    // Format the filtered data
    const formattedData = filteredData.map((driver) => ({
      id: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      country: driver.country,
      emailAddress: driver.email,
      contract: driver.nationalInsuranceNumber,
      city: driver.townCity,
      status: driver.status,
      userId: driver.userId,
    }));

    // Return the filtered data
    return res.status(200).json({
      success: true,
      message: Msg.filteredDriverApplications,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};
// lATEST APPLICATIONS
exports.latestApplications = async (req, res) => {
  try {
    await checkIsAdmin(req);

    const response = await getLatestApplications();
    const formattedData = response.map((item) => ({
      id: item.id,
      driverName: `${item.firstName} ${item.lastName}`,
      country: item.country,
      emailAddress: item.email,
      contactNo: item.nationalInsuranceNumber,
      city: item.townCity,
      status: item.status,
      userId: item.userId,
    }));
    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error setting PPE request status:", error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};

// SET DRIVING APPLICATION STATUS
exports.setDrivingApplicationStatus = async (req, res) => {
  try {
    const { adminId } = req.decoded;
    const userResp = await fetchAdminById(adminId)
    const { id, status } = req.query;
    await checkIsAdmin(req);

    await setDrivingStatus(status, id);

    let logObj={
      name: userResp[0].name,
      authority: userResp[0].roll,
      effectedData: `${status == 2? "Approved": "Rejected"} driving application `,
      timestamp: new Date(),
      action: "updated"

    }
    await addLogs(logObj)

    return res
      .status(200)
      .json({ success: true, message: Msg.ppeRequestUpdated });
  } catch (error) {
    console.error( error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};

// SEARCH APPLICATION
exports.searchData = async (req, res) => {
  try {
    await checkIsAdmin(req);

    const { driverName, country, townCity, email, status } = req.query;

    const response = await getAllDriverApplication();

    let filteredData = response;

    if (driverName) {
      const searchName = driverName.toLowerCase();
      filteredData = filteredData.filter((app) => {
        if (!app.firstName || !app.lastName) return false;
        const fullName = `${app.firstName.toLowerCase()} ${app.lastName.toLowerCase()}`;
        return fullName.includes(searchName);
      });
    }

    if (country) {
      filteredData = filteredData.filter(
        (app) => app.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (email) {
      filteredData = filteredData.filter((app) =>
        app.email.toLowerCase().includes(emailAddress.toLowerCase())
      );
    }

    if (status) {
      filteredData = filteredData.filter(
        (app) => app.status === parseInt(status)
      );
    }

    if (townCity) {
      filteredData = filteredData.filter((app) => {
        if (!app.townCity) return false;
        return app.townCity.toLowerCase().includes(townCity.toLowerCase());
      });
    }

    // Format the filtered data
    const formattedData = filteredData.map((item) => ({
      id: item.id,
      driverName: `${item.firstName} ${item.lastName}`,
      country: item.country,
      emailAddress: item.email,
      contact: item.nationalInsuranceNumber,
      city: item.townCity,
      status: item.status,
      userId: item.userId,
    }));

    return res.status(200).json({
      success: true,
      message: "Driver applications search results",
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};

// SEARCH INCIDENT REPORTS
exports.searchIncidentReports = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const { recordNo, location, driverName, clientName, vehicleNumber } =
      req.query;

    const applications = await getAllDriverApplication();
    const bankDetails = await getBankDetail();
    const conditionDetails = await getConditionDetail();

    const formattedData = applications.map((application) => {
      const bankRecord = bankDetails.find(
        (record) => record.userId === application.userId
      );
      const conditionRecord = conditionDetails.find(
        (record) => record.userId === application.userId
      );

      return {
        id: applications.id,
        recordNo: bankRecord.recordNo,
        location: conditionRecord.location,
        driverName: `${application.firstName} ${application.lastName}`,
        clientName: bankRecord.clientName,
        vehicleNumber: bankRecord.vehicleRegistrationNumber,
      };
    });

    let filteredData = formattedData;

    if (driverName) {
      const searchName = driverName.toLowerCase();
      filteredData = filteredData.filter((report) => {
        const fullName = report.driverName.toLowerCase();
        return fullName.includes(searchName);
      });
    }

    if (recordNo) {
      filteredData = filteredData.filter(
        (report) => report.recordNo === parseInt(recordNo)
      );
    }

    if (location) {
      filteredData = filteredData.filter((report) =>
        report.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (clientName) {
      filteredData = filteredData.filter((report) =>
        report.clientName.toLowerCase().includes(clientName.toLowerCase())
      );
    }

    if (vehicleNumber) {
      filteredData = filteredData.filter(
        (report) => report.vehicleNumber === vehicleNumber
      );
    }

    return res.status(200).json({
      success: true,
      message: "Incident reports search results",
      data: filteredData,
    });
  } catch (error) {
    console.error(error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};

// DRIVING LICENSE EXPRIED
exports.licenseStatus = async (req, res) => {
  try {
    await checkIsAdmin(req);
    const resp = await getAllDriverApplication();
    const resp1 = await getVehicleExperienceDetail();

    const mergedData = resp.map((application) => {
      const licenseInfo = resp1.find(
        (detail) => detail.userId === application.userId
      );
      const expDate = licenseInfo
        ? licenseInfo.CPC_CardExpiryDate.toISOString().split("T")[0]
        : null;
      const status = expDate ? (new Date(expDate) > new Date() ? 1 : 0) : null;

      return {
        driverName: `${application.firstName} ${application.lastName}`,
        country: application.country,
        licenseNumber: licenseInfo ? licenseInfo.licenseNumber : null,
        contactNumber: application.mobileNumber,
        expDate: expDate,

        status: status,
      };
    });

    return res.status(200).json({
      success: true,
      message: "License status",
      data: mergedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(201).json({ success: false, message: Msg.err });
  }
};

// ADMIN FORGOT PASSWORD
async function generateOTP () {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

// Controller to handle forgot password request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const admin = await fetchAdminByEmail(email);

  if (admin.length <= 0) {
    return res
      .status(201)
      .json({ success: false, message: Msg.adminNotFound });
  }

  try {
    const otp = await generateOTP();

    await mail(email, otp);

    await updateAdminOTPByEmail(email, otp);

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: Msg.otpSent, data: otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: Msg.err });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await fetchAdminByEmail(email);

    if (admin.length <= 0) {
      return res
        .status(201)
        .json({ success: false, message: Msg.adminNotFound });
    }
  
    if (admin[0].otp !== otp) {
      return res.status(201).json({ success: false, message: Msg.invalidOtp });
    }

    await updateAdminOtpToNullByEmail(email);
    return res.status(200).json({ success: true, message: Msg.otpMatched });
  } catch (error) {
    console.error(":", error);
    return res
      .status(201)
      .json({ success: false, message: Msg.failedToResest });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, email } = req.body;
    const userResp = await fetchAdminByEmail(email)
    if (!password && !confirmPassword) {
      return res
        .status(201)
        .json({ success: false, message: Msg.allFieldsRequired });
    }

    if (password !== confirmPassword) {
      return res.status(201).json({ success: false, message: Msg.passMatch });
    }
    const hashPass = await hashPassword(password);
    let obj = {
      email,
      password: hashPass,
    };
    await updateAdminPasswordByEmail(obj);
    let logObj={
      name: userResp[0].name,
      authority: userResp[0].roll,
      effectedData: "reset password",
      timestamp: new Date(),
      action: "updated"

    }
    await addLogs(logObj)
    return res
      .status(200)
      .json({ success: true, message: Msg.passwordUpdated });
  } catch (error) {
    console.error("error while updating password", error);
    return res.status(500).json({ success: false, message: error });
  }
};
