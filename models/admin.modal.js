const db = require("../utils/db");

module.exports = {
  fetchAdminByEmail: async (email) => {
    return db.query(`select * from admins where email = '${email}'`);
  },

  fetchAdminById: async (id) => {
    return db.query(`select * from admins where id ='${id}' `);
  },

  getAdminData: async () => {
    return db.query(`select * from admins `);
  },

  setLoginStatus: async (currtime, email) => {
    return db.query(`UPDATE admins SET lastLogin  = ? WHERE email = ?`, [
      currtime,
      email,
    ]);
  },

  setAdminStatus: async (status, id) => {
    return db.query(`UPDATE admins SET status  = ? WHERE id = ?`, [status, id]);
  },

  adminRegister: async (userData) => {
    return db.query("insert into admins set ?", [userData]);
  },

  // select * from admin where email =
  getAllPpeRequests: async () => {
    return db.query(`SELECT COUNT(*) AS totalEntries FROM ppe_request`);
  },

  getAllIncidentReports: async () => {
    return db.query(`SELECT COUNT(*) AS totalEntries FROM driver_statement`);
  },

  getAllApplication: async () => {
    return db.query(`SELECT COUNT(*) AS totalEntries FROM acknowledge_details`);
  },

  setPpeRequestStatus: async (status, id) => {
    return db.query(`UPDATE ppe_request SET status = ? WHERE id = ?`, [
      status,
      id,
    ]);
  },

  updateApprovedDate: async (currtime, id) => {
    return db.query(`UPDATE ppe_request SET approvedAt = ? WHERE id = ?`, [
      currtime,
      id,
    ]);
  },

  getAllDriverApplication: async () => {
    return db.query(`SELECT * FROM about_you_form`);
  },

  ppeRequests: async () => {
    return db.query(`SELECT * FROM ppe_request`);
  },

  getLatestApplications: async () => {
    return db.query(` SELECT * FROM about_you_form ORDER BY createdAt DESC`);
  },

  getBankDetail: async () => {
    return db.query(`SELECT * FROM bank_detail`);
  },
  getConditionDetail: async () => {
    return db.query(`SELECT * FROM condition_information`);
  },

  getVehicleExperienceDetail: async () => {
    return db.query(`SELECT * FROM vehicle_experience_form`);
  },

  getBankDetailById: async (id) => {
    return db.query(`SELECT * FROM bank_detail WHERE id = ?`, [id]);
  },

  getConditionInformationById: async (id) => {
    return db.query(`SELECT * FROM condition_information WHERE id = ?`, [id]);
  },

  getPoliceInformationById: async (id) => {
    return db.query(`SELECT * FROM police_information WHERE id = ?`, [id]);
  },

  getDamagePropertyById: async (id) => {
    return db.query(`SELECT * FROM damage_to_vehicle_property WHERE id = ?`, [
      id,
    ]);
  },

  getDriverStatementById: async (id) => {
    return db.query(`SELECT * FROM driver_statement WHERE id = ?`, [id]);
  },

  driverApplicationStatusCount: async () => {
    return db.query(
      `SELECT COUNT(*) AS total FROM about_you_form WHERE status = 2`
    );
  },

  setDrivingStatus: async (status, id) => {
    return db.query(`UPDATE about_you_form SET status = ? WHERE id = ?`, [
      status,
      id,
    ]);
  },

  updateAdminOTPByEmail: async (email, otp) => {
    return db.query(`UPDATE admins SET otp = ? WHERE email = ?`, [otp, email]);
  },

  updateAdminPasswordByEmail: async (obj) => {
    return db.query(`UPDATE admins SET password = ? WHERE email = ?`, [
      obj.email,
      obj.password,
    ]);
  },

  updateAdminOtpToNullByEmail: async (email) => {
    return db.query(`UPDATE admins SET otp = NULL WHERE email = ?`, [email]);
  },

  getLogsData: async () => {
    return db.query(`SELECT * FROM logs ORDER BY id DESC`);
  },
  addLogs: async (logsData) => {
    return db.query("insert into logs set ?", [logsData]);
  },
};
