var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressvalidator = require("express-validator"),
  session = require("express-session"),
  bodyparser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  Student = require("./models/student"),
  Warden = require("./models/warden"),
  Hod = require("./models/hod");

var url = "mongodb://localhost/LeaveApp";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to DB");
  })
  .catch(err => {
    console.log("Error:", err.message);
  });

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressvalidator());
app.use(flash());

//passport config
app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(Student.authenticate()));
passport.use(
  new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
// passport.serializeUser(Student.serializeUser());
// passport.deserializeUser(Student.deserializeUser());

app.use((req, res, next) => {
  //   res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

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
// show student registration form
app.get("/student/register", (req, res) => {
  res.render("register");
});
//student registration logic
app.post("/student/register", (req, res) => {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var hostel = req.body.hostel;
  var department = req.body.department;
  req.checkBody("name", "name is required").notEmpty();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("hostel", "hostel is required").notEmpty();
  req.checkBody("department", "department is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();
  req.checkBody("password2", "Password dont match").equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
    var newStudent = new Student({
      name: name,
      username: username,
      password: password,
      department: department,
      hostel: hostel
    });
    Student.createStudent(newStudent, (err, student) => {
      if (err) throw err;
      console.log(student);
    });
    req.flash("success", "you are registered successfully,now you can login");

    res.redirect("/student/login");
  }
});
// app.post("/student/register", (req, res) => {
//   Student.register(
//     new Student({ username: req.body.username }),
//     req.body.password,
//     (err, student) => {
//       if (err) {
//         console.log(err);
//         return res.render("register", { error: err.message });
//       }
//       passport.authenticate("local")(req, res, () => {
//         req.flash(
//           "success",
//           "Succesfully registered !Welcome to Banathali" + student.username
//         );
//         res.redirect("/");
//       });
//     }
//   );
// });
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
