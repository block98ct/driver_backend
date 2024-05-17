const db = require("../utils/db");

module.exports = {
  getUserData: async () => {
    return db.query(`select * from user_register`);
  },
  userRegister: async (userData) => {
    return db.query("insert into user_register set ?", [userData]);
  },
  fetchUserByEmail: async (email) => {
    return db.query(`select * from user_register where email = '${email}'`);
  },

  updateNumberById: async(id, contactNumber)=>{
    return db.query(`Update user_register set contactNumber = ? where id = ?`, [id,
      contactNumber
    ]);
  
  },

  updateNameById: async(id, name)=>{
    return db.query(`Update user_register set name = ? where id = ?`, [id,
      name
    ]);

  },

  fetchUserById: async (id) => {
    return db.query(`select * from user_register where id = '${id}'`);  
  },
  fetchUserByActToken: async (act_token) => {
    return db.query("select * from user_register where actToken = ?", [
      act_token,
    ]);
  },
  updateUserByActToken: async (id) => {
    return db.query(`Update user_register set isVerified = 1 where id = ?`, [  
      id,
    ]);
  },
  updatePassword: async (password, token) => {
    return db.query("Update user_register set password= ? where actToken=?", [
      password,
      token,
    ]);
  },

  fetchUserByIdInSubmitForm: async (id) => {
    return db.query(`select * from acknowledge_details where userId = '${id}'`);
  },

  setUSerStatus: async (status, id) => {
    return db.query(`UPDATE user_register SET status  = ? WHERE id = ?`, [
      status,
      id,
    ]);
  },

  setUserLoginStatus: async (currtime, email) => {
    return db.query(`UPDATE user_register SET lastLogin  = ? WHERE email = ?`, [
      currtime,
      email,
    ]);
  },

  // DRIVER APPLICATION FORM
  aboutYouForm: async (aboutYouData) => {
    return db.query("insert into about_you_form set ?", [aboutYouData]);
  },
  backgroundInformation: async (backGroundInfoData) => {
    return db.query("insert into background_information_form set ?", [
      backGroundInfoData,
    ]);
  },
  vehicleExperience: async (vehicleExpData) => {
    return db.query("insert into vehicle_experience_form set ?", [
      vehicleExpData,
    ]);
  },

  personalDetails: async (pernonalData) => {
    return db.query("insert into personal_details set ?", [pernonalData]);
  },

  bankDetails: async (bankData) => {
    return db.query("insert into bank_details set ?", [bankData]);
  },

  acknowledgeDetails: async (acknoledgeData) => {
    return db.query("insert into acknowledge_details set ?", [acknoledgeData]);
  },

  // UPDATE DRIVER APPLICATION FORM
  updateAboutYouFormById: async (aboutYouData, userId) => {
    return db.query("UPDATE about_you_form SET ? WHERE userId = ?", [
      aboutYouData,
      userId,
    ]);
  },
  updateBackgroundInformationbyId: async (backGroundInfoData, userId) => {
    return db.query(
      "UPDATE background_information_form SET ? WHERE userId = ?",
      [backGroundInfoData, userId]
    );
  },
  updateVehicleExperienceById: async (vehicleExpData, userId) => {
    return db.query("UPDATE vehicle_experience_form SET ? WHERE userId = ?", [
      vehicleExpData,
      userId,
    ]);
  },

  updatePersonalDetailsById: async (personalData, userId) => {
    return db.query("UPDATE personal_details SET ? WHERE userId = ?", [
      personalData,
      userId,
    ]);
  },

  updateBankDetailsById: async (bankData, userId) => {
    return db.query("UPDATE bank_details SET ? WHERE userId = ?", [
      bankData,
      userId,
    ]);
  },

  updateAcknowledgeDetailsById: async (acknoledgeData, userId) => {
    return db.query("UPDATE acknowledge_details SET ? WHERE userId = ?", [
      acknoledgeData,
      userId,
    ]);
  },

  checkUserInAboutFormById: async (userId) => {
    return db.query(
      "SELECT COUNT(*) AS count FROM about_you_form WHERE userId = ?",
      [userId]
    );
  },

  // DRIVER APPLICATION FORM
  aboutYouForm: async (aboutYouData) => {
    return db.query("insert into about_you_form set ?", [aboutYouData]);
  },
  backgroundInformation: async (backGroundInfoData) => {
    return db.query("insert into background_information_form set ?", [
      backGroundInfoData,
    ]);
  },
  vehicleExperience: async (vehicleExpData) => {
    return db.query("insert into vehicle_experience_form set ?", [
      vehicleExpData,
    ]);
  },

  personalDetails: async (pernonalData) => {
    return db.query("insert into personal_details set ?", [pernonalData]);
  },

  bankDetails: async (bankData) => {
    return db.query("insert into bank_details set ?", [bankData]);
  },

  acknowledgeDetails: async (acknoledgeData) => {
    return db.query("insert into acknowledge_details set ?", [acknoledgeData]);
  },

  // DRIVER REPORT FORM
  bankDetail: async (bankData) => {
    return db.query("insert into bank_detail set ?", [bankData]);
  },

  conditionInformation: async (infoData) => {
    return db.query("insert into condition_information set ?", [infoData]);
  },

  policeInformation: async (infoData) => {
    return db.query("insert into police_information set ?", [infoData]);
  },

  damageProperty: async (infoData) => {
    return db.query("insert into damage_to_vehicle_property set ?", [infoData]);
  },

  driverStatement: async (infoData) => {
    return db.query("insert into driver_statement set ?", [infoData]);
  },

  // DRIVER INCIDENT REPORT
  ppeRecord: async (infoData) => {
    return db.query("insert into ppe_request set ?", [infoData]);
  },

  incidentReportImages: async (data) => {
    return db.query("insert into incidentReportImages set ?", [data]);
  },

  // DRIVER APPLICATION FORM BY USERID
  getAboutYouForm: async (userId) => {
    return db.query(`SELECT * FROM about_you_form WHERE userId = ?`, [userId]);
  },
  getBackgroundInformation: async (userId) => {
    return db.query(
      `SELECT * FROM background_information_form WHERE userId = ?`,
      [userId]
    );
  },
  getVehicleExperience: async (userId) => {
    return db.query(`SELECT * FROM vehicle_experience_form WHERE userId = ?`, [
      userId,
    ]);
  },

  getPersonalDetails: async (userId) => {
    return db.query(`SELECT * FROM personal_details WHERE userId = ?`, [
      userId,
    ]);
  },

  getBankDetails: async (userId) => {
    return db.query(`SELECT * FROM bank_details WHERE userId = ?`, [userId]);
  },

  getAcknowledgeDetails: async (userId) => {
    return db.query(`SELECT * FROM acknowledge_details WHERE userId = ?`, [
      userId,
    ]);
  },

  // DRIVER APPLICATION FORM BY USERID

  getAllAboutYouForm: async () => {
    return db.query(`SELECT * FROM about_you_form`);
  },
  getAllBackgroundInformation: async () => {
    return db.query(`SELECT * FROM background_information_form`);
  },
  getAllVehicleExperience: async () => {
    return db.query(`SELECT * FROM vehicle_experience_form`);
  },

  getAllPersonalDetails: async () => {
    return db.query(`SELECT * FROM personal_details`);
  },

  getAllBankDetails: async () => {
    return db.query(`SELECT * FROM bank_details`);
  },

  getAllAcknowledgeDetails: async () => {
    return db.query(`SELECT * FROM acknowledge_details`);
  },

  // DRIVER REPORT FORM
  getBankDetail: async (userId) => {
    return db.query(`SELECT * FROM bank_detail WHERE userId = ?`, [userId]);
  },

  getConditionInformation: async (userId) => {
    return db.query(`SELECT * FROM condition_information WHERE userId = ?`, [
      userId,
    ]);
  },

  getPoliceInformation: async (userId) => {
    return db.query(`SELECT * FROM police_information WHERE userId = ?`, [
      userId,
    ]);
  },

  getDamageProperty: async (userId) => {
    return db.query(
      `SELECT * FROM damage_to_vehicle_property WHERE userId = ?`,
      [userId]
    );
  },


  getAllDamageProperty: async () => {
    return db.query(
      `SELECT * FROM damage_to_vehicle_property `
    );
  },


  getIncidentReportImagesByUserId: async (id) => {
    return db.query(
      `SELECT * FROM incidentReportImages WHERE reportId = ?`,
      [id]
    );
  },


  
  
  getDriverStatement: async (userId) => {
    return db.query(`SELECT * FROM driver_statement WHERE userId = ?`, [
      userId,
    ]);
  },

  getPpeRecord: async (userId) => {
    return db.query(`SELECT * FROM ppe_request WHERE userId = ?`, [userId]);
  },


};
