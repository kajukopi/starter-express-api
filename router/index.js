const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.render("index", { js: "index", title: "Home" });
});

router.get("/member", async (req, res) => {
  res.render("member", { js: "member" });
});

router.get("/masuk", async (req, res) => {
  res.render("masuk", { js: "masuk" });
});

router.get("/daftar", async (req, res) => {
  res.render("daftar", { js: "daftar" });
});

router.get("/keluar", async (req, res) => {
  res.render("keluar", { js: "keluar" });
});

router.get("/tentang_kami", async (req, res) => {
  res.render("tentang_kami", { js: "tentang_kami" });
});

router.get("/pencarian", async (req, res) => {
  res.render("pencarian", { js: "pencarian" });
});

module.exports = router;
