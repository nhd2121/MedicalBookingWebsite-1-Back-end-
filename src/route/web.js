import express from "express";
import homeController from "../controller/homeController";
import userController from "../controller/userController";
import doctorController from "../controller/doctorController";
import patientController from "../controller/patientController";
import specialtyController from "../controller/specialtyController";
import clinicController from "../controller/clinicController";

let router = express.Router();

const initWebRoute = (app) => {
  router.get("/", homeController.getHomepage);
  router.get("/about-page", homeController.getAboutpage);
  router.get("/crud", homeController.getCRUD);

  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  router.post("/api/login", userController.handleLogin);
  router.get("/api/get-all-users", userController.handleGetAllUsers);
  router.post("/api/create-new-user", userController.handleCreateNewUser);
  router.put("/api/edit-user", userController.handleEditUser);
  router.delete("/api/delete-user", userController.handleDeleteUser);
  router.get("/api/allcode", userController.getAllCode);


  router.get("/api/popular-doctor-home", doctorController.getPopularDoctorHome);
  router.get("/api/get-all-doctors", doctorController.getAllDoctors);
  router.post("/api/post-info-doctors", doctorController.postInfoDoctors);
  router.get("/api/get-details-doctor-by-id", doctorController.getDetailDoctorById);
  router.post("/api/bulk-create-schedule", doctorController.bulkCreateSchedule);
  router.get("/api/get-schedule-doctor-by-date", doctorController.getScheduleDoctorByDate);
  router.get("/api/get-extra-info-doctor-by-id", doctorController.getExtraInfoDoctorById);
  router.get("/api/get-profile-doctor-by-id", doctorController.getProfileDoctorById);

  router.get("/api/get-list-patient-for-doctor", doctorController.getListPatientForDoctor);
  router.post("/api/send-bill", doctorController.sendBill);


  router.post("/api/book-patient-appointment", patientController.bookPatientAppointment);
  router.post("/api/verify-patient-appointment", patientController.verifyPatientAppointment);

  router.post("/api/create-new-specialty", specialtyController.createNewSpecialty);
  router.get("/api/get-all-specialty", specialtyController.getAllSpecialty);
  router.get("/api/get-detail-specialty-by-id", specialtyController.getDetailSpecialtyById);

  router.post("/api/create-new-clinic", clinicController.createNewClinic);
  router.get("/api/get-all-clinic", clinicController.getAllClinic);
  router.get("/api/get-detail-clinic-by-id", clinicController.getDetailClinicById);

  return app.use("/", router);
};

export default initWebRoute;
