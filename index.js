require("fix-esm").register();
const express = require("express");
const app = express();
const cors = require("cors");

// app.use(express.static);

app.use(express.json());

app.use(cors());

const { GoogleSpreadsheet } = require("google-spreadsheet");

const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: process.env.FIREBASE_CLIENT_EMAIL,
  key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet("1j_nmnZWGRDqX8NYBDuJfzTHRRqDcz2C2KGLMjHWhgPY", serviceAccountAuth);
console.log(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").length);
// Initialize Firebase Admin SDK with environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Restore newline characters
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "user@example.xyz";
const password = "password123";

admin
  .auth()
  .createUser({
    email: email,
    password: password,
  })
  .then((userRecord) => {
    console.log("Successfully created new user:", userRecord.uid);
  })
  .catch((error) => {
    console.error("Error creating new user:", error);
  });

app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["query"];
    await sheet.loadCells("A1:Z10");
    const a2 = sheet.getCellByA1("A2");
    const query = `SELECT * WHERE A LIKE '%${id}%' ORDER BY A`;
    const rumus = `=QUERY(buildings!A2:A,"${query}")`;
    a2.formula = rumus;
    await sheet.saveUpdatedCells();
    const rows = await sheet.getRows();
    const filtered = [];
    rows.filter((item) => {
      filtered.push(item._rawData);
    });
    const data = [rows.at(-1)._worksheet._headerValues, filtered];
    res.json({ status: true, data, length: rows.length });
  } catch (error) {
    console.log(error);
    res.json({ status: false, data: error });
  }
});

app.post("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const body = req.body;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["buildings"];
    const add = await sheet.addRow(body);
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

app.delete("/:uid/:id", async (req, res) => {
  try {
    const { uid, id } = req.params;
    const body = req.body;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["buildings"];
    const rows = await sheet.getRows();
    const find = rows.findIndex((item) => item._rawData[0] === id);
    if (find === -1) throw error;
    await rows[find].delete();
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

app.put("/:uid/:id", async (req, res) => {
  try {
    const { uid, id } = req.params;
    const body = req.body;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["buildings"];
    const rows = await sheet.getRows();
    const find = rows.findIndex((item) => item._rawData[0] === id);
    if (find === -1) throw error;
    rows[find].assign(body);
    await rows[find].save();
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port 3000");
});

// (function () {
//   const array = require("./assets.json");
//   array.map((item) => {
//     const location = item.location.split(" > ");
//     item.country = location[0];
//     item.area = location[1];
//     item.building = location[2];
//     item.detail = location[3];
//     delete item.factory;
//     return item;
//   });
//   console.log(array);

//   const { createObjectCsvWriter } = require('csv-writer');
//   const csvFilePath = "output.csv";

//   // Define the CSV writer with column headers
//   const csvWriter = createObjectCsvWriter({
//     path: csvFilePath,
//     header: [
//       { id: "id", title: "id" },
//       { id: "name", title: "name" },
//       // { id: "location", title: "location" },
//       { id: "country", title: "country" },
//       { id: "area", title: "area" },
//       { id: "building", title: "building" },
//       { id: "detail", title: "detail" },
//     ],
//   });

//   // Write the JSON data to the CSV file
//   csvWriter
//     .writeRecords(array)
//     .then(() => {
//       console.log("CSV file saved as", csvFilePath);
//     })
//     .catch((error) => {
//       console.error("Error writing CSV file:", error);
//     });
// })();
