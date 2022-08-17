import db from "../models/index";
import CRUDservice from "../services/CRUDservice";

let getHomepage = async (req, res) => {
  try {
    let data = await db.User.findAll();
    console.log("----------");
    console.log(data);

    return res.render("homepage.ejs", {
      data: JSON.stringify(data),
    });
  } catch (e) {
    console.log(e);
  }
};

let getAboutpage = async (req, res) => {
  return res.render("about.ejs");
};

let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};

let postCRUD = async (req, res) => {
  let message = await CRUDservice.createNewUser(req.body);
  console.log(message);
  return res.send("Hello Post CRUD");
};

let displayGetCRUD = async (req, res) => {
  let data = await CRUDservice.getAllUser();
  console.log("-------------------------");
  console.log(data);
  console.log("-------------------------");
  return res.render("displayCRUD.ejs", {
    dataTable: data,
  });
};

let getEditCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    let userData = await CRUDservice.getUserInforById(userId);
    return res.render("editCRUD.ejs", {
      userData: userData,
    });
  } else {
    return res.send("User not found");
  }
};

let putCRUD = async (req, res) => {
  let data = req.body;
  let allUsers = await CRUDservice.updateUserData(data);
  return res.render("displayCRUD.ejs", {
    dataTable: allUsers,
  });
};

let deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    await CRUDservice.deleteUserById(id);
    return res.send("Delete user successfully");
  } else {
    return res.send("user not found");
  }
};

module.exports = {
  getHomepage,
  getAboutpage,
  getCRUD,
  postCRUD,
  displayGetCRUD,
  getEditCRUD,
  putCRUD,
  deleteCRUD,
};
