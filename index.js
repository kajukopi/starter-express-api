require("fix-esm").register();
const express = require("express");
const app = express();
const cors = require("cors");

// app.use(express.static);
// app.use(express.json());

app.use(cors());

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: process.env.CLIENT_EMAIL,
  key: process.env.PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.get("/:id", async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    const { id } = req.params;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["query"];
    await sheet.loadCells("A1:Z10");
    const a2 = sheet.getCellByA1("A2");
    const query = `SELECT * WHERE A LIKE '%${id}%' ORDER BY A`;
    const rumus = `=QUERY(assets!A2:I,"${query}")`;
    a2.formula = rumus;
    await sheet.saveUpdatedCells();
    const rows = await sheet.getRows();
    const data = rows.at(-1)._rawData;
    const header = rows.at(-1)._worksheet._headerValues;
    const object = {};
    for (let i = 0; i < data.length; i++) {
      object[header[i]] = data[i];
    }
    res.json({ status: true, data: object, length: rows.length });
  } catch (error) {
    console.log(error);
    res.json({ status: false, data: error });
  }
});

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("Listening on port 3000");
});
