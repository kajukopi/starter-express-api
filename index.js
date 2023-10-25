require("fix-esm").register();
const express = require("express");
const app = express();
const cors = require("cors");

// app.use(express.static);

app.use(express.json());

app.use(cors());

app.use("/api", require("./router/index"));

app.use("/auth", require("./router/auth"));

app.use("/auth/google/callback", (req, res) => {
  console.log(req.query.code);
  res.json({ status: true });
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
