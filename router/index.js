
const express = require("express");
const router = express.Router();

const { GoogleSpreadsheet } = require("google-spreadsheet");

const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: process.env.FIREBASE_CLIENT_EMAIL,
  key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet("1j_nmnZWGRDqX8NYBDuJfzTHRRqDcz2C2KGLMjHWhgPY", serviceAccountAuth);

router.get("/:id", async (req, res) => {
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

router.post("/:uid", async (req, res) => {
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

router.delete("/:uid/:id", async (req, res) => {
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

router.put("/:uid/:id", async (req, res) => {
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

module.exports = router;
