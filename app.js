var express = require("express"),
  app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/student/login", (req, res) => {
  res.render("login");
});
app.get("/hod/login", (req, res) => {
  res.render("login");
});
app.get("/warden/login", (req, res) => {
  res.render("login");
});
app.get("/student/register", (req, res) => {
  res.render("register");
});
app.get("/warden/register", (req, res) => {
  res.render("wardenregister");
});
app.get("/hod/register", (req, res) => {
  res.render("hodregister");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
