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
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressvalidator());

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
// passport.use(
//   new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!user.verifyPassword(password)) {
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   })
// );

// passport.serializeUser(Student.serializeUser());
// passport.deserializeUser(Student.deserializeUser());
// app.use(
//   expressvalidator({
//     errorFormatter: function(param, msg, value) {
//       var namespace = param.split("."),
//         root = namespace.shift(),
//         formParam = root;

//       while (namespace.length) {
//         formParam += "[" + namespace.shift() + "]";
//       }
//       return {
//         param: formParam,
//         msg: msg,
//         value: value
//       };
//     }
//   })
// );
app.use(flash());
app.use((req, res, next) => {
  //   res.locals.currentUser = req.user;
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.user = req.user || null;
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   } else {
//     req.flash("error", "You need to be logged in");
//     res.redirect("/student/login");
//   }
// }

app.get("/student/login", (req, res) => {
  res.render("login");
});
//login logic for Student
passport.use(
  new LocalStrategy((username, password, done) => {
    Student.getUserByUsername(username, (err, student) => {
      if (err) throw err;
      if (!student) {
        return done(null, false, { message: "Unknown User" });
      }
      Student.comparePassword(
        password,
        student.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, student);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

passport.serializeUser(function(student, done) {
  done(null, student.id);
});

passport.deserializeUser(function(id, done) {
  Student.getUserById(id, function(err, student) {
    done(err, student);
  });
});

app.post(
  "/student/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/student/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/hod/login", (req, res) => {
  res.render("hodlogin");
});

//login logic for Hod
passport.use(
  new LocalStrategy((username, password, done) => {
    Hod.getUserByUsername(username, (err, hod) => {
      if (err) throw err;
      if (!hod) {
        return done(null, false, { message: "Unknown User" });
      }
      Hod.comparePassword(password, hod.password, (err, passwordFound) => {
        if (err) throw err;
        if (passwordFound) {
          return done(null, hod);
        } else {
          return done(null, false, { message: "Invalid Password" });
        }
      });
    });
  })
);

passport.serializeUser(function(hod, done) {
  done(null, hod.id);
});

passport.deserializeUser(function(id, done) {
  Hod.getUserById(id, function(err, hod) {
    done(err, hod);
  });
});

app.post(
  "/hod/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/hod/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/");
  }
);

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
  //validation
  req.checkBody("name", "name is required").notEmpty();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("hostel", "hostel is required").notEmpty();
  req.checkBody("department", "department is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();
  req.checkBody("password2", "Password dont match").equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    // req.session.errors = errors;
    // req.session.success = false;
    console.log("errors: " + errors);
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

//logout for student

app.get("/student/logout", (req, res) => {
  req.logout();
  req.flash("success", "you are logged out");
  res.redirect("/student/login");
});

app.get("/warden/register", (req, res) => {
  res.render("wardenregister");
});
//hod register
app.get("/hod/register", (req, res) => {
  res.render("hodregister");
});
//hod register logic
app.post("/hod/register", (req, res) => {
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var department = req.body.department;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "password is required").notEmpty();
  req.checkBody("department", "department is required").notEmpty();
  req.checkBody("password2", "Password dont match").equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    res.render("hodregister", {
      errors: errors
    });
  } else {
    var newHod = new Hod({
      name: name,
      username: username,
      password: password,
      department: department
    });
    Hod.createHod(newHod, (err, hod) => {
      if (err) throw err;
      console.log(hod);
    });
    req.flash("success", "you are registered successfully,now you can login");

    res.redirect("/hod/login");
  }
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
