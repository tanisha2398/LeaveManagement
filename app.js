var express = require("express"),
  app = express();

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("home");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
