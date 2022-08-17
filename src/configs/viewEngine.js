import express from "express";

const configViewEngine = (app) => {
  app.use(express.static("./src/public")); // xet quyen truy cap vao folder public
  app.set("view engine", "ejs");
  app.set("views", "./src/views");
};

export default configViewEngine;
