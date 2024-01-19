require("fix-esm").register();

require("dot-env");

const express = require("express");

const app = express();

const { engine } = require("express-handlebars");

app.engine(".hbs", engine({ extname: ".hbs" }));

app.set("view engine", ".hbs");

app.set("views", "./views");

app.enable("view cache");

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(express.static("assets"));

const cors = require("cors");

app.use(cors());

const { GoogleSpreadsheet } = require("google-spreadsheet");

const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);

const indexRouter = require("./router/index");

app.use("/", indexRouter);

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("Listening on port 3000");
});
