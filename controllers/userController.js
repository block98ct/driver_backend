// Import necessary modules and dependencies
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");  
const hbs = require("nodemailer-express-handlebars");
const secretKey = process.env.JWT_SECRET_KEY;
const localStorage = require("localStorage");
const Msg = require("../helpers/message");

const path = require("path");

const baseurl = require("../config").base_url;
const { hashPassword, generateRandomString } = require("../helpers/middleware");
const {
  userRegister,
  fetchUserByEmail,
  fetchUserByActToken,
  fetchUserById,
  updateUserByActToken,
  updatePassword,
  aboutYouForm,
  backgroundInformation,
  vehicleExperience,
  personalDetails,
  bankDetails,
  acknowledgeDetails,
  bankDetail,
  conditionInformation,
  policeInformation,
  damageProperty,
  driverStatement,
  ppeRecord,
  getAboutYouForm,
  getPpeRecord,
  getPoliceInformation,
  getDamageProperty,
  getBankDetail,
  getConditionInformation,
  getDriverStatement,
  setUserLoginStatus,
  updateAboutYouFormById,
  updateBackgroundInformationbyId,
  updateVehicleExperienceById,  
  updatePersonalDetailsById,
  updateBankDetailsById,
  updateAcknowledgeDetailsById,
  checkUserInAboutFormById,
  fetchUserByIdInSubmitForm,
  updateNumberById,
  updateNameById,
  incidentReportImages,
  getAllDamageProperty,
  getIncidentReportImagesByUserId,
} = require("../models/user.model");

const { addLogs } = require("../models/admin.modal");
const { log } = require("util");

var transporter = nodemailer.createTransport({
  // service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  // secure: true,
  auth: {
    user: "testing26614@gmail.com",
    pass: "ibxakoguozdwqtav",
  },
});


const handlebarOptions = {
  viewEngine: {
    extName: '.handlebars',
    partialsDir: path.join(__dirname, '../view/'),
    layoutsDir: path.join(__dirname, '../view/'),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, '../view/'),
  extName: '.handlebars',
};

transporter.use("compile", hbs(handlebarOptions));

exports.userRegister = async (req, res) => {
  try {

  //  console.log(path.resolve(__dirname + "../view/"));
    let { name, email, mobileNumber, password } = req.body;
    const act_token = await generateRandomString(8);
    let checkUser = await fetchUserByEmail(email);
    if (checkUser.length !== 0) {
      return res.status(201).send({
        success: false,
        msg: Msg.emailExists,
      });
    } else {
      // await sendMail(email, act_token);
      let mailOptions = {
        from: "mkdteamti@gmail.com",
        to: email,
        subject: "Activate Account",
        template: "signupemail",
        context: {
          href_url: baseurl + `/api/userRouter/verifyUser/` + `${act_token}`,
          msg: `Please click below link to activate your account.`,
        },
      };
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.log(error)
          return res.json({
            success: false,
            message: "Mail Not delivered",
          });
        } else {
          let newPassword = await hashPassword(password);
          let obj = {
            name: name,
            email: email,
            contactNumber: mobileNumber,
            password: newPassword,
            actToken: act_token,
          };
          let userCreated = await userRegister(obj); // Storing the new user
          if (userCreated) {
            // let logObj = {
            //   name: checkUser[0].name,
            //   authority: checkUser[0].roll,
            //   effectedData: `change mobile number`,
            //   timestamp: new Date(),
            //   action: "updated",
            // };
            // await addLogs(logObj);
            return res.status(200).send({
              success: true,
              msg: `${Msg.verifyYourEmail}${email}`,
            });
          } else {
            return res.status(201).send({
              success: false,
              msg: Msg.signUpError,
            });
          }
        }
      });
    }
  } catch (error) {
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};
// Function to handle user login
exports.userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    let checkUser = await fetchUserByEmail(email);
    if (checkUser.length <= 0) {
      return res.status(201).send({
        success: false,
        msg: Msg.inValidEmail,
      });
    }

    if (checkUser[0].status == 0) {
      return res.status(201).send({
        status: false,
        msg: Msg.accountDeactiveated,
      });
    }

    let checkSubmit = await fetchUserByIdInSubmitForm(checkUser[0].id);
    if (checkUser[0]) {
      let Password = checkUser[0].password;
      let checkPassword = await bcrypt.compare(password, Password);
      if (checkPassword) {
        if (checkUser[0].isVerified) {
          const payload = { userId: checkUser[0].id };
          const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
          const loginTime = new Date();
          await setUserLoginStatus(loginTime, email);

          return res.status(200).send({
            success: true,
            msg: Msg.loginSuccesfully,
            token: token,
            submitForm: checkSubmit.length > 0 ? true : false,
          });
        } else {
          return res.status(201).send({
            success: false,
            msg: Msg.notVerifyAccount,
          });
        }
      } else {
        return res.status(201).send({
          success: false,
          msg: Msg.inValidPassword,
        });
      }
    } else {
      return res.status(201).send({
        success: false,
        msg: Msg.inValidEmail,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};
// Function to reset user password
exports.forgetPasswordFn = async (req, res) => {
  try {
    let { email } = req.body;
    let checkUser = await fetchUserByEmail(email);
    if (checkUser.length !== 0) {
      let token = checkUser[0].actToken;
      let mailOptions = {
        from: "secondstagecti@gmail.com",
        to: email,
        subject: "Forget Password",
        template: "forget_template",
        context: {
          href_url: baseurl + `/api/userRouter/verifyPassword/${token}`,
          msg: `Please click below link to change password.`,
        },
      };
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          return res.json({
            success: false,
            message: error,
          });
        } else {
          return res.json({
            success: true,
            message: `${Msg.pwdResetLink}${email}`,
          });
        }
      });
    } else {
      return res.status(400).send({
        success: false,
        msg: Msg.inValidEmail,
      });
    }
  } catch (error) {
    return res.status(201).send({
      success: false,
      msg: Msg.err,
    });
  }
};
//**---------function use to verify a user email--------- */
exports.verifyUser = async (req, res) => {
  try {
    const act_token = req.params.id;
    // const token = generateToken();
    if (!act_token) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByActToken(act_token);
      if (data.length !== 0) {
        const result = await updateUserByActToken(data[0]?.id);
        if (result.affectedRows) {
          return res.sendFile(path.join(__dirname, '../view/signupSucessPage.html'));
        } else {
          return res.sendFile(path.join(__dirname, '../view/notverify.html'));
        }
      } else {
        return res.sendFile(path.join(__dirname, '../view/notverify.html'));
      }
    }
  } catch (error) {
    console.log(error);
    res.send(`<div class="container">
            <p>404 Error, Page Not Found</p>
            </div> `);
  }
};
//**------------function to verify a password and reset ---------- */
exports.verifyPasswordFn = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(201).send({
        success: false,
        msg: Msg.invalidLink,
      });
    } else {
      const result = await fetchUserByActToken(id);
      const token = result[0]?.actToken;
      if (result.length !== 0) {
        localStorage.setItem("vertoken", JSON.stringify(token));
        res.render(path.join(__dirname, "../view/", "forgetPassword.ejs"), {
          msg: "",
        });
      } else {
        res.render(path.join(__dirname, "../view/", "forgetPassword.ejs"), {
          msg: Msg.userNotRegister,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.send(`<div class="container">
              <p>404 Error, Page Not Found</p>
              </div> `);
  }
};

exports.editProfile = async (req, res) => {
  try {
    const { userId } = req.decoded;
    const { name, contactNumber } = req.body;
    if (!name && !contactNumber) {
      return res.status(201).json({ success: false, msg: Msg.atleastRequired });
    }

    const checkUser = await fetchUserById(userId);
    if (checkUser.length <= 0) {
      return res.status(201).send({
        success: false,
        msg: Msg.invalidUser,
      });
    }

    if (!checkUser[0].isVerified) {
      return res.status(201).send({
        success: false,
        msg: Msg.notVerifyAccount,
      });
    }

    if (contactNumber) {
      try {
        await updateNumberById(contactNumber, userId);

        let logObj = {
          name: checkUser[0].name,
          authority: checkUser[0].roll,
          effectedData: `changed contact number`,
          timestamp: new Date(),
          action: "updated",
        };
        await addLogs(logObj);
      } catch (error) {
        console.log(error);
      }
    }

    if (name) {
      try {
        await updateNameById(name, userId);

        let logObj = {
          name: checkUser[0].name,
          authority: checkUser[0].roll,
          effectedData: `changed name`,
          timestamp: new Date(),
          action: "updated",
        };
        await addLogs(logObj);
      } catch (error) {
        console.log(error);
      }
    }

    res.status(201).json({ sucess: true, error: Msg.profileUpdated });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(201).json({ sucess: false, error: Msg.internalError });
  }
};
//**-------function to use change password---------- */
exports.changePassword = async (req, res) => {
  let { password, confirm_password } = req.body;
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //     // Return validation errors as response
  //     return res.status(400).json({ errors: errors.array() });
  // }
  const token = JSON.parse(localStorage.getItem("vertoken"));
  if (password == confirm_password) {
    const data = await fetchUserByActToken(token);
    if (data.length !== 0) {
      let newPassword = await hashPassword(confirm_password);
      const result2 = await updatePassword(newPassword, token);
      if (result2) {
        res.sendFile( path.join(__dirname, '../view/message.html'),{
          msg: "",
        });
      } else {
        res.render(path.join(__dirname, "../view/", "forgetPassword.ejs"), {
          msg: Msg.internalError,
        });
      }
    } else {
      return res.json({
        message: Msg.userNotFound,
        success: false,
        success: 400,
      });
    }
  } else {
    res.render(path.join(__dirname, "../view/", "forgetPassword.ejs"), {
      msg: Msg.pwdNotMatch,
    });
  }
};

const checkUserId = async (userId) => {
  try {
    const [rows] = await checkUserInAboutFormById(userId);
    const count = rows.count;
    console.log(count);
    return count > 0;
  } catch (error) {
    throw error;
  }
};
exports.registerDriverApplicationForm = async (req, res) => {
  let { userId } = req.decoded;
  const userIdExists = await checkUserId(userId);

  const userResp = await fetchUserById(userId);

  // if (!userIdExists) {
  //   try {
  //     const aboutYouData = req.body.find(
  //       (form) => form.formName === "About You"
  //     ).formData;
  //     const backgroundInfoData = req.body.find(
  //       (form) => form.formName === "Background Information"
  //     ).formData;
  //     const vehicleExperienceData = req.body.find(
  //       (form) => form.formName === "Vehicle Experience"
  //     ).formData;
  //     const personalDetailData = req.body.find(
  //       (form) => form.formName === "Personal Detail"
  //     ).formData;
  //     const bankDetailData = req.body.find(
  //       (form) => form.formName === "Bank Detail"
  //     ).formData;
  //     const acknoledgeData = req.body.find(
  //       (form) => form.formName === "Acknowledge Detail"
  //     ).formData;

  //     //   console.log("aboutYourData", aboutYouData.firstName);
  //     //   console.log("backgroundInfoData", backgroundInfoData);
  //     //   console.log("vehicleExperienceData", vehicleExperienceData);
  //     //   console.log("personalDetailData", personalDetailData);
  //     //   console.log("bankDetailData", bankDetailData);
  //     //   console.log("acknoledgeData", acknoledgeData);

  //     //   console.log("backgroundInfoData", backgroundInfoData);
  //     //   console.log("vehicleExperienceData", vehicleExperienceData);
  //     try {
  //       const aboutYouObj = {
  //         firstName: aboutYouData.firstName,
  //         lastName: aboutYouData.lastName,
  //         addressline1: aboutYouData.addressline1,
  //         addressline2: aboutYouData.addressline2,
  //         country: aboutYouData.country,
  //         townCity: aboutYouData.townCity,
  //         postcode: aboutYouData.postcode,
  //         mobileNumber: aboutYouData.mobileNumber,
  //         nationalInsuranceNumber: aboutYouData.nationalInsuranceNumber,
  //         email: aboutYouData.email,
  //         nextofKinfirstname: aboutYouData.nextofKinfirstname,
  //         nextofKinlastname: aboutYouData.nextofKinlastname,
  //         userId: userId,
  //         nextofKinMobileNumber: aboutYouData.nextofKinMobileNumber,
  //       };
  //       await aboutYouForm(aboutYouObj);
  //       // console.log(aboutYouForms)

  //       console.log("about form submitted successfully");

  //       const backgroundInfo = {
  //         hasCriminalConvictions:
  //           backgroundInfoData.hasCriminalConvictions === "Yes",
  //         convictionDetails:
  //           backgroundInfoData.hasCriminalConvictions === "Yes"
  //             ? JSON.stringify(backgroundInfoData.convictionDetails)
  //             : null,
  //         drugAlcoholTest: backgroundInfoData.drugAlcoholTest === "Yes",
  //         participateInRandomSearches:
  //           backgroundInfoData.participateInRandomSearches === "Yes",
  //         preferNotPlaced: backgroundInfoData.preferNotPlaced === "Yes",
  //         companyDetails:
  //           backgroundInfoData.preferNotPlaced === "Yes"
  //             ? JSON.stringify(backgroundInfoData.companyDetails)
  //             : null,
  //         hasAccidentsLast12Months:
  //           backgroundInfoData.hasAccidentsLast12Months === "Yes",
  //         accidentDetails:
  //           backgroundInfoData.hasAccidentsLast12Months === "Yes"
  //             ? JSON.stringify(backgroundInfoData.accidentDetails)
  //             : null,
  //         userId: userId,
  //       };

  //       await backgroundInformation(backgroundInfo);
  //       console.log("backgroundInfo submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     try {
  //       const vehicleExperienceForm = {
  //         vehicleExperience: JSON.stringify(
  //           vehicleExperienceData.vehicleExperience
  //         ),
  //         vehicleSkills: JSON.stringify(vehicleExperienceData.vehicleSkills),
  //         licenseNumber: vehicleExperienceData.licenseNumber,
  //         licenseExpiryDate: vehicleExperienceData.licenseExpiryDate,
  //         digiTachoNumber: parseInt(vehicleExperienceData.digiTachoNumber),
  //         digiTachoExpiryDate: vehicleExperienceData.digiTachoExpiryDate,
  //         CPC_CardExpiryDate: vehicleExperienceData.CPC_CardExpiryDate,
  //         modulesRequired: vehicleExperienceData.modulesRequired === "Yes",
  //         modeDetails:
  //           vehicleExperienceData.modulesRequired === "Yes"
  //             ? JSON.stringify(vehicleExperienceData.modeDetails)
  //             : null,
  //         penaltyPoints: parseInt(vehicleExperienceData.panaltyPoints),
  //         hasPenaltyPending: vehicleExperienceData.hasPanaltyPending === "Yes",
  //         userId: userId,
  //       };

  //       await vehicleExperience(vehicleExperienceForm);

  //       console.log("vehicleExperienceForm submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     try {
  //       const personalDetailForm = {
  //         hasYouSmoke: personalDetailData.hasYouSmoke === "Yes",
  //         smokingOptions:
  //           personalDetailData.hasYouSmoke === "Yes"
  //             ? JSON.stringify(personalDetailData.smokingOptions)
  //             : null,
  //         hasAnyPrescribedMedication:
  //           personalDetailData.hasAnyPrescribedMedication === "Yes",
  //         medicationDetails:
  //           personalDetailData.hasAnyPrescribedMedication === "Yes"
  //             ? JSON.stringify(personalDetailData.medicationDetails)
  //             : null,
  //       };
  //       await personalDetails(personalDetailForm);
  //       console.log("personalDetailForm submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     try {
  //       const bankDetailForm = {
  //         bankOrBuildingSocietyName: bankDetailData.bankOrBuildingSocietyName,
  //         nameOnAccount: bankDetailData.nameOnAccount,
  //         sortCode: bankDetailData.sortCode,
  //         accountNumber: bankDetailData.accountNumber,
  //         employmentHistoryDetails: JSON.stringify(
  //           bankDetailData.employmentHistoryDetails
  //         ),
  //         userId: userId,
  //       };

  //       await bankDetails(bankDetailForm);
  //       console.log("bankDetailForm submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     const acknowledgeForm = {
  //       firstName: acknoledgeData.firstName,
  //       lastName: acknoledgeData.lastName,
  //       signatureUrl: acknoledgeData.signatureUrl,
  //       userId: userId,
  //     };

  //     await acknowledgeDetails(acknowledgeForm);
  //     console.log("acknowledgeForm submitted successfully");
  //     res
  //       .status(201)
  //       .json({ statusCode: 200, success: true, message: Msg.formSubmitted });
  //   } catch (error) {
  //     console.error("Error occurred:", error);
  //     res
  //       .status(501)
  //       .json({ statusCode: 500, sucess: false, error: Msg.internalError });
  //   }

  // }else{
  //   try {
  //     // updateAboutYouFormById,
  //     // updateBackgroundInformationbyId,
  //     // updateVehicleExperienceById,
  //     // updatePersonalDetailsById,
  //     // updateBankDetailsById,
  //     // updateAcknowledgeDetailsById
  //     const aboutYouData = req.body.find(
  //       (form) => form.formName === "About You"
  //     ).formData;
  //     const backgroundInfoData = req.body.find(
  //       (form) => form.formName === "Background Information"
  //     ).formData;
  //     const vehicleExperienceData = req.body.find(
  //       (form) => form.formName === "Vehicle Experience"
  //     ).formData;
  //     const personalDetailData = req.body.find(
  //       (form) => form.formName === "Personal Detail"
  //     ).formData;
  //     const bankDetailData = req.body.find(
  //       (form) => form.formName === "Bank Detail"
  //     ).formData;
  //     const acknoledgeData = req.body.find(
  //       (form) => form.formName === "Acknowledge Detail"
  //     ).formData;

  //     //   console.log("aboutYourData", aboutYouData.firstName);
  //     //   console.log("backgroundInfoData", backgroundInfoData);
  //     //   console.log("vehicleExperienceData", vehicleExperienceData);
  //     //   console.log("personalDetailData", personalDetailData);
  //     //   console.log("bankDetailData", bankDetailData);
  //     //   console.log("acknoledgeData", acknoledgeData);

  //     //   console.log("backgroundInfoData", backgroundInfoData);
  //     //   console.log("vehicleExperienceData", vehicleExperienceData);
  //     try {
  //       const aboutYouObj = {
  //         firstName: aboutYouData.firstName,
  //         lastName: aboutYouData.lastName,
  //         addressline1: aboutYouData.addressline1,
  //         addressline2: aboutYouData.addressline2,
  //         country: aboutYouData.country,
  //         townCity: aboutYouData.townCity,
  //         postcode: aboutYouData.postcode,
  //         mobileNumber: aboutYouData.mobileNumber,
  //         nationalInsuranceNumber: aboutYouData.nationalInsuranceNumber,
  //         email: aboutYouData.email,
  //         nextofKinfirstname: aboutYouData.nextofKinfirstname,
  //         nextofKinlastname: aboutYouData.nextofKinlastname,
  //         userId: userId,
  //         nextofKinMobileNumber: aboutYouData.nextofKinMobileNumber,
  //       };
  //       await updateAboutYouFormById(aboutYouObj, userId);
  //       // console.log(aboutYouForms)

  //       console.log("about form submitted successfully");

  //       const backgroundInfo = {
  //         hasCriminalConvictions:
  //           backgroundInfoData.hasCriminalConvictions === "Yes",
  //         convictionDetails:
  //           backgroundInfoData.hasCriminalConvictions === "Yes"
  //             ? JSON.stringify(backgroundInfoData.convictionDetails)
  //             : null,
  //         drugAlcoholTest: backgroundInfoData.drugAlcoholTest === "Yes",
  //         participateInRandomSearches:
  //           backgroundInfoData.participateInRandomSearches === "Yes",
  //         preferNotPlaced: backgroundInfoData.preferNotPlaced === "Yes",
  //         companyDetails:
  //           backgroundInfoData.preferNotPlaced === "Yes"
  //             ? JSON.stringify(backgroundInfoData.companyDetails)
  //             : null,
  //         hasAccidentsLast12Months:
  //           backgroundInfoData.hasAccidentsLast12Months === "Yes",
  //         accidentDetails:
  //           backgroundInfoData.hasAccidentsLast12Months === "Yes"
  //             ? JSON.stringify(backgroundInfoData.accidentDetails)
  //             : null,
  //         userId: userId,
  //       };

  //       await updateBackgroundInformationbyId(backgroundInfo, userId);
  //       console.log("backgroundInfo submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     try {
  //       const vehicleExperienceForm = {
  //         vehicleExperience: JSON.stringify(
  //           vehicleExperienceData.vehicleExperience
  //         ),
  //         vehicleSkills: JSON.stringify(vehicleExperienceData.vehicleSkills),
  //         licenseNumber: vehicleExperienceData.licenseNumber,
  //         licenseExpiryDate: vehicleExperienceData.licenseExpiryDate,
  //         digiTachoNumber: parseInt(vehicleExperienceData.digiTachoNumber),
  //         digiTachoExpiryDate: vehicleExperienceData.digiTachoExpiryDate,
  //         CPC_CardExpiryDate: vehicleExperienceData.CPC_CardExpiryDate,
  //         modulesRequired: vehicleExperienceData.modulesRequired === "Yes",
  //         modeDetails:
  //           vehicleExperienceData.modulesRequired === "Yes"
  //             ? JSON.stringify(vehicleExperienceData.modeDetails)
  //             : null,
  //         penaltyPoints: parseInt(vehicleExperienceData.panaltyPoints),
  //         hasPenaltyPending: vehicleExperienceData.hasPanaltyPending === "Yes",
  //         userId: userId,
  //       };

  //       await updateVehicleExperienceById(vehicleExperienceForm, userId);

  //       console.log("vehicleExperienceForm submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     try {
  //       const personalDetailForm = {
  //         hasYouSmoke: personalDetailData.hasYouSmoke === "Yes",
  //         smokingOptions:
  //           personalDetailData.hasYouSmoke === "Yes"
  //             ? JSON.stringify(personalDetailData.smokingOptions)
  //             : null,
  //         hasAnyPrescribedMedication:
  //           personalDetailData.hasAnyPrescribedMedication === "Yes",
  //         medicationDetails:
  //           personalDetailData.hasAnyPrescribedMedication === "Yes"
  //             ? JSON.stringify(personalDetailData.medicationDetails)
  //             : null,
  //       };
  //       await updatePersonalDetailsById(personalDetailForm, userId);
  //       console.log("personalDetailForm submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     try {
  //       const bankDetailForm = {
  //         bankOrBuildingSocietyName: bankDetailData.bankOrBuildingSocietyName,
  //         nameOnAccount: bankDetailData.nameOnAccount,
  //         sortCode: bankDetailData.sortCode,
  //         accountNumber: bankDetailData.accountNumber,
  //         employmentHistoryDetails: JSON.stringify(
  //           bankDetailData.employmentHistoryDetails
  //         ),
  //         userId: userId,
  //       };

  //       await updateBankDetailsById(bankDetailForm, userId);
  //       console.log("bankDetailForm submitted successfully");
  //     } catch (error) {
  //       console.log(error);
  //       res.status(501).json({ statusCode: 500, sucess: false, error: error });
  //     }

  //     const acknowledgeForm = {
  //       firstName: acknoledgeData.firstName,
  //       lastName: acknoledgeData.lastName,
  //       signatureUrl: acknoledgeData.signatureUrl,
  //       userId: userId,
  //     };

  //     await updateAcknowledgeDetailsById(acknowledgeForm, userId);
  //     console.log("acknowledgeForm submitted successfully");
  //     res
  //       .status(201)
  //       .json({ statusCode: 200, success: true, message: "form updated" });
  //   } catch (error) {
  //     console.error("Error occurred:", error);
  //     res
  //       .status(501)
  //       .json({ statusCode: 500, sucess: false, error: Msg.internalError });
  //   }

  // }
  const aboutYouData = req.body.find(
    (form) => form.formName === "About You"
  ).formData;
  const backgroundInfoData = req.body.find(
    (form) => form.formName === "Background Information"
  ).formData;
  const vehicleExperienceData = req.body.find(
    (form) => form.formName === "Vehicle Experience"
  ).formData;
  const personalDetailData = req.body.find(
    (form) => form.formName === "Personal Detail"
  ).formData;
  const bankDetailData = req.body.find(
    (form) => form.formName === "Bank Detail"
  ).formData;
  const acknoledgeData = req.body.find(
    (form) => form.formName === "Acknowledge Detail"
  ).formData;

  const aboutYouObj = {
    firstName: aboutYouData.firstName,
    lastName: aboutYouData.lastName,
    addressline1: aboutYouData.addressline1,
    addressline2: aboutYouData.addressline2,
    country: aboutYouData.country,
    townCity: aboutYouData.townCity,
    postcode: aboutYouData.postcode,
    mobileNumber: aboutYouData.mobileNumber,
    nationalInsuranceNumber: aboutYouData.nationalInsuranceNumber,
    email: aboutYouData.email,
    nextofKinfirstname: aboutYouData.nextofKinfirstname,
    nextofKinlastname: aboutYouData.nextofKinlastname,
    userId: userId,
    nextofKinMobileNumber: aboutYouData.nextofKinMobileNumber,
  };

  const backgroundInfo = {
    hasCriminalConvictions: backgroundInfoData.hasCriminalConvictions === "Yes",
    convictionDetails:
      backgroundInfoData.hasCriminalConvictions === "Yes"
        ? JSON.stringify(backgroundInfoData.convictionDetails)
        : null,
    drugAlcoholTest: backgroundInfoData.drugAlcoholTest === "Yes",
    participateInRandomSearches:
      backgroundInfoData.participateInRandomSearches === "Yes",
    preferNotPlaced: backgroundInfoData.preferNotPlaced === "Yes",
    companyDetails:
      backgroundInfoData.preferNotPlaced === "Yes"
        ? JSON.stringify(backgroundInfoData.companyDetails)
        : null,
    hasAccidentsLast12Months:
      backgroundInfoData.hasAccidentsLast12Months === "Yes",
    accidentDetails:
      backgroundInfoData.hasAccidentsLast12Months === "Yes"
        ? JSON.stringify(backgroundInfoData.accidentDetails)
        : null,
    userId: userId,
  };

  const vehicleExperienceForm = {
    vehicleExperience: JSON.stringify(vehicleExperienceData.vehicleExperience),
    vehicleSkills: JSON.stringify(vehicleExperienceData.vehicleSkills),
    licenseNumber: vehicleExperienceData.licenseNumber,
    licenseExpiryDate: vehicleExperienceData.licenseExpiryDate,
    digiTachoNumber: parseInt(vehicleExperienceData.digiTachoNumber),
    digiTachoExpiryDate: vehicleExperienceData.digiTachoExpiryDate,
    CPC_CardExpiryDate: vehicleExperienceData.CPC_CardExpiryDate,
    modulesRequired: vehicleExperienceData.modulesRequired === "Yes",
    modeDetails:
      vehicleExperienceData.modulesRequired === "Yes"
        ? JSON.stringify(vehicleExperienceData.modeDetails)
        : null,
    penaltyPoints: parseInt(vehicleExperienceData.panaltyPoints),
    hasPenaltyPending: vehicleExperienceData.hasPanaltyPending === "Yes",
    userId: userId,
  };

  const personalDetailForm = {
    hasYouSmoke: personalDetailData.hasYouSmoke === "Yes",
    smokingOptions:
      personalDetailData.hasYouSmoke === "Yes"
        ? JSON.stringify(personalDetailData.smokingOptions)
        : null,
    hasAnyPrescribedMedication:
      personalDetailData.hasAnyPrescribedMedication === "Yes",
    medicationDetails:
      personalDetailData.hasAnyPrescribedMedication === "Yes"
        ? JSON.stringify(personalDetailData.medicationDetails)
        : null,
  };

  const bankDetailForm = {
    bankOrBuildingSocietyName: bankDetailData.bankOrBuildingSocietyName,
    nameOnAccount: bankDetailData.nameOnAccount,
    sortCode: bankDetailData.sortCode,
    accountNumber: bankDetailData.accountNumber,
    employmentHistoryDetails: JSON.stringify(
      bankDetailData.employmentHistoryDetails
    ),
    userId: userId,
  };

  const acknowledgeForm = {
    firstName: acknoledgeData.firstName,
    lastName: acknoledgeData.lastName,
    signatureUrl: acknoledgeData.signatureUrl,
    userId: userId,
  };

  if (!userIdExists) {
    try {
      await aboutYouForm(aboutYouObj);
      console.log("about form submitted successfully");

      await backgroundInformation(backgroundInfo);
      console.log("backgroundInfo submitted successfully");

      await vehicleExperience(vehicleExperienceForm);
      console.log("vehicleExperienceForm submitted successfully");

      await personalDetails(personalDetailForm);
      console.log("personalDetailForm submitted successfully");

      await bankDetails(bankDetailForm);
      console.log("bankDetailForm submitted successfully");

      await acknowledgeDetails(acknowledgeForm);
      console.log("acknowledgeForm submitted successfully");

      let logObj = {
        name: userResp[0].name,
        authority: userResp[0].roll,
        effectedData: "resgister driver application ",
        timestamp: new Date(),
        action: "created",
      };
      // adding logs
      await addLogs(logObj);
      res
        .status(201)
        .json({ statusCode: 200, success: true, message: Msg.formSubmitted });
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(201).json({ sucess: false, error: Msg.internalError });
    }
  } else {
    try {
      await updateAboutYouFormById(aboutYouObj, userId);
      console.log("about form updated successfully");
      // console.log(aboutYouForms)

      await updateBackgroundInformationbyId(backgroundInfo, userId);
      console.log("backgroundInfo updated successfully");

      await updateVehicleExperienceById(vehicleExperienceForm, userId);

      console.log("vehicleExperienceForm updated successfully");

      await updatePersonalDetailsById(personalDetailForm, userId);
      console.log("personalDetailForm updated successfully");

      await updateBankDetailsById(bankDetailForm, userId);
      console.log("bankDetailForm updated successfully");

      await updateAcknowledgeDetailsById(acknowledgeForm, userId);
      console.log("acknowledgeForm updated successfully");
      let logObj = {
        name: userResp[0].name,
        authority: userResp[0].roll,
        effectedData: "updated driver application",
        timestamp: new Date(),
        action: "updated",
      };
      // adding logs
      await addLogs(logObj);
      res
        .status(200)
        .json({ statusCode: 200, success: true, message: Msg.formUpdated });
    } catch (error) {
      console.error("Error occurred:", error);
      res
        .status(201)
        .json({ statusCode: 500, sucess: false, error: Msg.internalError });
    }
  }
};

let recordNo = 255201;
exports.driverIncidentReportHandle = async (req, res) => {
  try {
    let { userId } = req.decoded;
    const userResp = await fetchUserById(userId);
    const bankDetailData = req.body.find(
      (form) => form.formName === "Bank Detail"
    ).formData;
    const conditionAndInformation = req.body.find(
      (form) => form.formName === "Condition & Information"
    ).formData;
    const policeInfoData = req.body.find(
      (form) => form.formName === "Police Information"
    ).formData;
    const damagePropertyInfo = req.body.find(
      (form) => form.formName === "Damage To Vehicle/property"
    ).formData;
    const driverStatementInfo = req.body.find(
      (form) => form.formName === "Driver Statement"
    ).formData;

    const bankDetailInfo = {
      recordNo: recordNo,
      clientName: bankDetailData.clientName,
      vehicleRegistrationNumber: bankDetailData.vehicleRegistrationNumber,
      incidentReportedTo: JSON.stringify(bankDetailData.incidentReportedTo),
      userId: userId,
    };

    await bankDetail(bankDetailInfo);

    const condtionInfo = {
      dateTimeOfIncident: conditionAndInformation.dateTimeOfIncident,
      roadNumber: conditionAndInformation.roadNumber,
      location: conditionAndInformation.location,
      speedInMPH: conditionAndInformation.speedInMPH,
      lightLevel: conditionAndInformation.lightLevel,
      weather: JSON.stringify(conditionAndInformation.weather),
      roadCondition: conditionAndInformation.roadCondition,
      userId: userId,
    };

    await conditionInformation(condtionInfo);

    const policeInfo = {
      policeInvolved: policeInfoData.PoliceInvolved === "Yes",
      officerFirstName: policeInfoData.officerFirstName,
      officerLastName: policeInfoData.officerLastName,
      officerNumber: policeInfoData.officerNumber,
      policeStationName: policeInfoData.policeStationName,
      statementGiven: policeInfoData.statementGiven === "Yes",
      userId: userId,
    };

    await policeInformation(policeInfo);

    const damageInfo = {
      isVehicleDriveable: damagePropertyInfo.isVehicleDriveable === "Yes",
      didTakePhotos: damagePropertyInfo.didTakePhotos,
      wereYouInjured: damagePropertyInfo.wereYouInjured,

      wereThereWitnesses: damagePropertyInfo.wereThereWitnesses === "Yes",
      witnesssess:
        damagePropertyInfo.wereThereWitnesses === "Yes"
          ? JSON.stringify(damagePropertyInfo.witnesssess)
          : null,

      vehiclesInvolved: damagePropertyInfo.vehiclesInvolved === "Yes",
      vehiclesInvolvedDetails:
        damagePropertyInfo.vehiclesInvolved === "Yes"
          ? JSON.stringify(damagePropertyInfo.vehiclesInvolvedDetails)
          : null,

      liability: damagePropertyInfo.liability,
      wereYouOnMobile: damagePropertyInfo.wereYouOnMobile,
      userId: userId,
    };

    await damageProperty(damageInfo);

    const driverStatementData = {
      driverStatement: driverStatementInfo.driverStatement,
      signatureUrl: driverStatementInfo.signatureUrl,
      userId: userId,
    };

    await driverStatement(driverStatementData);

    recordNo++;

    let logObj = {
      name: userResp[0].name,
      authority: userResp[0].roll,
      effectedData: "register incident report ",
      timestamp: new Date(),
      action: "created",
    };
    // adding logs
    await addLogs(logObj);
    res
      .status(200)
      .json({ statusCode: 200, success: true, message: Msg.formSubmitted });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(201)
      .json({ statusCode: 500, sucess: false, error: Msg.internalError });
  }
};

let requestNo = 1100;
exports.ppeRecordHandle = async (req, res) => {
  try {
    let { userId } = req.decoded;
    const userResp = await fetchUserById(userId);
    const ppeRecordData = req.body;
    const ppeRecordInfo = {
      requestNo: requestNo,
      hiVisVest: JSON.stringify(ppeRecordData.hiVisVest),
      poloShirt: JSON.stringify(ppeRecordData.poloShirt),
      trousers: JSON.stringify(ppeRecordData.trousers),
      hardHat: JSON.stringify(ppeRecordData.hardHat),
      userId: userId,
    };

    await ppeRecord(ppeRecordInfo);
    let logObj = {
      name: userResp[0].name,
      authority: userResp[0].roll,
      effectedData: "submitted ppe request",
      timestamp: new Date(),
      action: "created",
    };
    // adding logs
    await addLogs(logObj);

    requestNo++;
    res
      .status(200)
      .json({ statusCode: 200, success: true, message: Msg.ppeRecord });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(201)
      .json({ statusCode: 500, sucess: false, error: Msg.internalError });
  }
};

exports.getDriverIncidentReportHandle = async (req, res) => {
  try {
    let { userId } = req.decoded;
    const { id } = req.query;
    const policeResp = await getPoliceInformation(userId);
    const damageResp = await getDamageProperty(userId);
    const bankResp = await getBankDetail(userId);
    const condtionResp = await getConditionInformation(userId);
    const driverResp = await getDriverStatement(userId);

    const bankRecord = bankResp.find((item) => item.id === parseInt(id));
    const policeRecord = policeResp.find((item) => item.id === parseInt(id));
    const damageRecord = damageResp.find((item) => item.id === parseInt(id));
    const conditionRecord = condtionResp.find(
      (item) => item.id === parseInt(id)
    );
    const imgeResp = await getIncidentReportImagesByUserId(id);
    const driverRecord = driverResp.find((item) => item.id === parseInt(id));

    const images = imgeResp.map(record => record.images);



    const formattedData = {
      recordNo: bankRecord?.recordNo ?? null,
      clientName: bankRecord?.clientName ?? null,
      vehicleRegistrationNumber: bankRecord?.vehicleRegistrationNumber ?? null,
      incidentReportedTo: bankRecord?.incidentReportedTo?.join(", ") ?? null,
      dateTimeOfIncident: conditionRecord?.dateTimeOfIncident
        ? new Date(conditionRecord.dateTimeOfIncident).toDateString()
        : null,
      roadNumber: conditionRecord?.roadNumber ?? null,
      location: conditionRecord?.location ?? null,
      speedInMPH: conditionRecord?.speedInMPH ?? null,
      lightLevel: conditionRecord?.lightLevel ?? null,
      weather: conditionRecord?.weather?.join(", ") ?? null,
      roadCondition: conditionRecord?.roadCondition ?? null,
      PoliceInvolved: policeRecord?.PoliceInvolved === "1" ? "Yes" : "No",
      statementGiven: policeRecord?.statementGiven === "1" ? "Yes" : "No",
      isVehicleDriveable:
        damageRecord?.isVehicleDriveable === "1" ? "Yes" : "No",
      didTakePhotos: damageRecord?.didTakePhotos ?? null,
      photos: damageRecord?.didTakePhotos === "Yes" ? images.map((img)=>`${baseurl}/temp/${img}`) : null,
      wereYouInjured: damageRecord?.wereYouInjured ?? null,
      wereThereWitnesses:
        damageRecord?.wereThereWitnesses === "1" ? "Yes" : "No",
      witnesses: damageRecord?.witnesses ?? "",
      liability: damageRecord?.liability ?? "",
      vehiclesInvolved: damageRecord?.vehiclesInvolved === "1" ? "Yes" : "No",
      wereYouOnMobile: damageRecord?.wereYouOnMobile === "Yes" ? "Yes" : "No",
      driverStatement: driverRecord?.driverStatement ?? null,
      signatureUrl: driverRecord?.signatureUrl ?? null,
    };

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Driver incident report retrieved successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(201)
      .json({ statusCode: 500, sucess: false, error: Msg.internalError });
  }
};

exports.getDriverIncidentReportsHandle = async (req, res) => {
  try {
    let { userId } = req.decoded;
    const bankResp = await getBankDetail(userId);
    const damageResp = await getDamageProperty(userId);
    const condtionResp = await getConditionInformation(userId);

    const condtionData = condtionResp.map((record) => {
      return {
        location: record.location,
      };
    });

    const bankData = bankResp.map((record) => {
      return {
        id: record.id,
        reportNo: record.recordNo,
        clientName: record.clientName,
        vehicleNumber: record.vehicleRegistrationNumber,
      };
    });

    //  console.log("bank DAta ", bankData)

    const damageData = damageResp.map((record) => {
      console.log("vehiclesInvolvedDetails:", record.vehiclesInvolvedDetails);
      if (
        record.vehiclesInvolvedDetails &&
        record.vehiclesInvolvedDetails.length > 0
      ) {
        return {
          driverName: record.vehiclesInvolvedDetails[0].DriverName,
        };
      } else {
        return {
          driverName: "",
        };
      }
    });

    console.log("damageResp:", damageResp);

    const mergedData = bankData.map((record, index) => {
      return {
        id: record.id,
        reportNo: record.reportNo,
        vehicleNumber: record.vehicleNumber,
        location: condtionData[index]?.location || "", // Use empty string if location data is missing
        driverName: damageData[index]?.driverName || "", // Use empty string if driver name data is missing
        clientName: record.clientName,
      };
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Driver incident reports retrieved successfully",
      data: mergedData,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(201)
      .json({ statusCode: 500, sucess: false, error: Msg.internalError });
  }
};

exports.getPpeRecordsHandle = async (req, res) => {
  try {
    let { userId } = req.decoded;
    const resp = await getPpeRecord(userId);
    const nameResp = await getAboutYouForm(userId);
    console.log("name response", nameResp);

    const tableData = resp.map((record) => {
      return {
        id: record.id,
        requestNo: record.requestNo,
        totalItems: Object.keys(record).length - 3,
        driverName: nameResp[0]?.firstName || "",
        submissionDate: record.submissionDate,
        actionDate: "NA",
        status: record.status,
      };
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: Msg.ppeRecords,
      data: tableData,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(201).json({ sucess: false, error: Msg.internalError });
  }
};

exports.getPpeRecordHandle = async (req, res) => {
  try {
    const { id } = req.query;
    let { userId } = req.decoded;

    const resp = await getPpeRecord(userId);
    const record = resp.find((item) => item?.id === parseInt(id));

    if (record) {
      // Initialize an array to store the formatted PPE details
      let ppeDetails = [];

      // Iterate through each property of the record
      Object.keys(record).forEach((key) => {
        if (
          key !== "id" &&
          key !== "userId" &&
          key !== "submissionDate" &&
          key !== "requestNo" &&
          key.toLowerCase() !== "status" &&
          record[key] !== undefined &&
          record[key] !== null &&
          record[key] !== "" &&
          key.toLowerCase() !== "createdat" && // Exclude "CreatedAt" property
          key.toLowerCase() !== "approvedat" // Exclude "ApprovedAt" property
        ) {
          // Format the property name
          const formattedName = key.replace(/([A-Z])/g, " $1").trim();
          const capitalizedFormattedName =
            formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

          // Push the formatted PPE detail object to the ppeDetails array
          ppeDetails.push({
            name: capitalizedFormattedName,
            ...record[key],
          });
        }
      });

      // Update the record data to include the ppeDetails array
      record["ppeDetails"] = ppeDetails;
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: Msg.ppeRequest,
      data: record,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(201)
      .json({ statusCode: 201, success: false, error: Msg.internalError });
  }
};

exports.addImagesInIncidentReport = async (req, res) => {
  try {
    let { userId } = req.decoded;
    //const { images } = req.body;
    const resp = await getAllDamageProperty();
    if (!req.files) {
      return res.status(201).json({
        success: false,
        msg: Msg.provideImages,
      });
    }
 
    const imgPaths = req.files.map((file) => file.filename);
    console.log(imgPaths);

    const uploadPromises = imgPaths.map((image) => {
      let obj = {
        images: image,
        userId,
        reportId: resp.length + 1,
      };
      incidentReportImages(obj)
    });

    await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      msg: Msg.imagesUploaded
    });
  } catch (error) {
    console.log(error);
    return res.status(201).json({
      success: true,
      msg: Msg.err,
    });
  }
};
