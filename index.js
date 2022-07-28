const express = require("express");
require("@prisma/client");
require("dotenv").config();
const route = require("./route");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

//import router
const routes = require("./route");

// ROUTE
app.use("/", routes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
