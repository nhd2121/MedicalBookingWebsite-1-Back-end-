import express from "express";
import configViewEngine from "./configs/viewEngine";
import bodyParser from "body-parser";
import initWebRoute from "./route/web";
import connectDB from "./configs/connectDB";
// import cors from 'cors';

require("dotenv").config();

const path = require("path");

const app = express();
// app.use(cors({ origin: true }));
// Add headers before the routes are defined
// middleware
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
const port = process.env.PORT || 3000;

//config de gui data gui len server tu phia client --> su dung duoc method POST
// app.use(bodyParser.urlencoded({ extend: true }));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extend: true}));


//setup view engine
configViewEngine(app);

// init web route
initWebRoute(app);

connectDB();

// init api route
// initAPIRouter(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
