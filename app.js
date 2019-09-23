var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressvalidator = require("express-validator"),
  session = require("express-session"),
  methodOverride = require("method-override"),
  bodyparser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  Student = require("./models/student"),
  Warden = require("./models/warden"),
  Hod = require("./models/hod"),
  Leave = require("./models/leave");

var moment = require("moment");

var url =process.env.DATABASEURL|| "mongodb://localhost/LeaveApp";
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
app.use(methodOverride("_method"));
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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("/student/login");
  }
}
app.get("/", (req, res) => {
  res.render("home");
});

//login logic for Student

//login logic for Hod

// passport.serializeUser(function(hod, done) {
//   done(null, hod.id);
// });

// passport.deserializeUser(function(id, done) {

// });

//registration form
app.get("/register", (req, res) => {
  res.render("register");
});
//registration logic
app.post("/student/register", (req, res) => {
  var type = req.body.type;
  if (type == "student") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var hostel = req.body.hostel;
    var department = req.body.department;
    var image = req.body.image;
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
        hostel: hostel,
        type: type,
        image: image
      });
      Student.createStudent(newStudent, (err, student) => {
        if (err) throw err;
        console.log(student);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/student/login");
    }
  } else if (type == "hod") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var department = req.body.department;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("department", "department is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newHod = new Hod({
        name: name,
        username: username,
        password: password,
        department: department,
        type: type,
        image: image
      });
      Hod.createHod(newHod, (err, hod) => {
        if (err) throw err;
        console.log(hod);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/hod/login");
    }
  } else if (type == "warden") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var hostel = req.body.hostel;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("hostel", "hostel is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newWarden = new Warden({
        name: name,
        username: username,
        password: password,
        hostel: hostel,
        type: type,
        image: image
      });
      Warden.createWarden(newWarden, (err, warden) => {
        if (err) throw err;
        console.log(warden);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/warden/login");
    }
  }
});

//stratergies
passport.use(
  "student",
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

passport.use(
  "hod",
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

passport.use(
  "warden",
  new LocalStrategy((username, password, done) => {
    Warden.getUserByUsername(username, (err, warden) => {
      if (err) throw err;
      if (!warden) {
        return done(null, false, { message: "Unknown User" });
      }
      Warden.comparePassword(
        password,
        warden.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, warden);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

//srialize

passport.serializeUser(function(user, done) {
  // console.log(user.id);
  done(null, { id: user.id, type: user.type });
});

//deserialize

passport.deserializeUser(function(obj, done) {
  switch (obj.type) {
    case "student":
      Student.getUserById(obj.id, function(err, student) {
        done(err, student);
      });
      break;
    case "hod":
      Hod.getUserById(obj.id, function(err, hod) {
        done(err, hod);
      });
      break;
    case "warden":
      Warden.getUserById(obj.id, function(err, warden) {
        done(err, warden);
      });
      break;
    default:
      done(new Error("no entity type:", obj.type), null);
      break;
  }
});

app.get("/student/login", (req, res) => {
  res.render("login");
});

app.post(
  "/student/login",
  passport.authenticate("student", {
    successRedirect: "/student/home",
    failureRedirect: "/student/login",
    failureFlash: true
  }),
  (req, res) => {
    // console.log(student);
    res.redirect("/student/home");
  }
);

app.get("/student/home", ensureAuthenticated, (req, res) => {
  var student = req.user.username;
  console.log(student);
  Student.findOne({ username: req.user.username })
    .populate("leaves")
    .exec((err, student) => {
      if (err || !student) {
        req.flash("error", "student not found");
        res.redirect("back");
        console.log("err");
      } else {
        res.render("homestud", {
          student: student,
          moment: moment
        });
      }
    });
});
app.get("/student/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Student.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundStudent) => {
      if (err || !foundStudent) {
        req.flash("error", "Student not found");
        res.redirect("back");
      } else {
        res.render("profilestud", { student: foundStudent });
      }
    });
});
app.get("/student/:id/edit", ensureAuthenticated, (req, res) => {
  Student.findById(req.params.id, (err, foundStudent) => {
    res.render("editS", { student: foundStudent });
  });
});
app.put("/student/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.student);
  Student.findByIdAndUpdate(
    req.params.id,
    req.body.student,
    (err, updatedStudent) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/student/" + req.params.id);
      }
    }
  );
});

app.get("/student/:id/apply", ensureAuthenticated, (req, res) => {
  Student.findById(req.params.id, (err, foundStud) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("leaveApply", { student: foundStud });
    }
  });
});

app.post("/student/:id/apply", (req, res) => {
  Student.findById(req.params.id)
    .populate("leaves")
    .exec((err, student) => {
      if (err) {
        res.redirect("/student/home");
      } else {
        date = new Date(req.body.leave.from);
        todate = new Date(req.body.leave.to);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        dt = date.getDate();
        todt = todate.getDate();

        if (dt < 10) {
          dt = "0" + dt;
        }
        if (month < 10) {
          month = "0" + month;
        }
        console.log(todt - dt);
        req.body.leave.days = todt - dt;
        console.log(year + "-" + month + "-" + dt);
        // req.body.leave.to = req.body.leave.to.substring(0, 10);
        console.log(req.body.leave);
        // var from = new Date(req.body.leave.from);
        // from.toISOString().substring(0, 10);
        // console.log("from date:", strDate);
        Leave.create(req.body.leave, (err, newLeave) => {
          if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
            console.log(err);
          } else {
            newLeave.stud.id = req.user._id;
            newLeave.stud.username = req.user.username;
            console.log("leave is applied by--" + req.user.username);

            // console.log(newLeave.from);
            newLeave.save();

            student.leaves.push(newLeave);

            student.save();
            req.flash("success", "Successfully applied for leave");
            res.render("homestud", { student: student, moment: moment });
          }
        });
      }
    });
});
app.get("/student/:id/track", (req, res) => {
  Student.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundStud) => {
      if (err) {
        req.flash("error", "No student with requested id");
        res.redirect("back");
      } else {
        
        res.render("trackLeave", { student: foundStud, moment: moment });
      }
    });
});
app.get("/hod/login", (req, res) => {
  res.render("hodlogin");
});

app.post(
  "/hod/login",
  passport.authenticate("hod", {
    successRedirect: "/hod/home",
    failureRedirect: "/hod/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/hod/home");
  }
);
app.get("/hod/home", ensureAuthenticated, (req, res) => {
  Hod.find({}, (err, hod) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homehod", {
        hod: req.user
      });
    }
  });
});
app.get("/hod/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Hod.findById(req.params.id).exec((err, foundHod) => {
    if (err || !foundHod) {
      req.flash("error", "Hod not found");
      res.redirect("back");
    } else {
      res.render("profilehod", { hod: foundHod });
    }
  });
});
app.get("/hod/:id/edit", ensureAuthenticated, (req, res) => {
  Hod.findById(req.params.id, (err, foundHod) => {
    res.render("editH", { hod: foundHod });
  });
});
app.put("/hod/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.hod);
  Hod.findByIdAndUpdate(req.params.id, req.body.hod, (err, updatedHod) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      req.flash("success", "Succesfully updated");
      res.redirect("/hod/" + req.params.id);
    }
  });
});
app.get("/hod/:id/leave", (req, res) => {
  Hod.findById(req.params.id).exec((err, hodFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      // console.log(hodFound);
      Student.find({ department: hodFound.department })
        .populate("leaves")
        .exec((err, students) => {
          if (err) {
            req.flash("error", "student not found with your department");
            res.redirect("back");
          } else {
            // students.forEach(function(student) {
            //   if (student.leaves.length > 0) {
            // student.leaves.forEach(function(leave) {
            //   console.log(leave);
            //   console.log("////////////");
            // Leave.findById(leave, (err, leaveFound) => {
            //   if (err) {
            //     req.flash("error", "leave not found");
            //     res.redirect("back");
            //   } else {
            //     // console.log(leaveFound.subject);
            res.render("hodLeaveSign", {
              hod: hodFound,
              students: students,
              // leave: leaveFound,
              moment: moment
            });
            //   }
            // });
            // });
            // }
            // Leave.find({ username: student.username }, (err, leave) => {
            //   console.log(leave.username);
            // });
            // });
            // console.log(students);
          }
        });
    }
    // console.log(req.body.hod);
  });
});

app.get("/hod/:id/leave/:stud_id/info", (req, res) => {
  Hod.findById(req.params.id).exec((err, hodFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      Student.findById(req.params.stud_id)
        .populate("leaves")
        .exec((err, foundStudent) => {
          if (err) {
            req.flash("error", "student not found with this id");
            res.redirect("back");
          } else {
            res.render("moreinfostud", {
              student: foundStudent,
              hod: hodFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/hod/:id/leave/:stud_id/info", (req, res) => {
  Hod.findById(req.params.id).exec((err, hodFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      Student.findById(req.params.stud_id)
        .populate("leaves")
        .exec((err, foundStudent) => {
          if (err) {
            req.flash("error", "student not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundStudent.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "approved";
                  leave.approved = true;
                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundStudent.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "denied";
                  leave.denied = true;
                  leave.save();
                }
              });
            }
            res.render("moreinfostud", {
              student: foundStudent,
              hod: hodFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.get("/warden/login", (req, res) => {
  res.render("wardenlogin");
});

app.post(
  "/warden/login",
  passport.authenticate("warden", {
    successRedirect: "/warden/home",
    failureRedirect: "/warden/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/warden/home");
  }
);
app.get("/warden/home", ensureAuthenticated, (req, res) => {
  Warden.find({}, (err, hod) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homewarden", {
        warden: req.user
      });
    }
  });
});

app.get("/warden/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Warden.findById(req.params.id).exec((err, foundWarden) => {
    if (err || !foundWarden) {
      req.flash("error", "Warden not found");
      res.redirect("back");
    } else {
      res.render("profilewarden", { warden: foundWarden });
    }
  });
});
app.get("/warden/:id/edit", ensureAuthenticated, (req, res) => {
  Warden.findById(req.params.id, (err, foundWarden) => {
    res.render("editW", { warden: foundWarden });
  });
});

app.put("/warden/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.warden);
  Warden.findByIdAndUpdate(
    req.params.id,
    req.body.warden,
    (err, updatedWarden) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/warden/" + req.params.id);
      }
    }
  );
});

app.get("/warden/:id/leave", (req, res) => {
  Warden.findById(req.params.id).exec((err, wardenFound) => {
    if (err) {
      req.flash("error", "hod not found with requested id");
      res.redirect("back");
    } else {
      // console.log(hodFound);
      Student.find({ hostel: wardenFound.hostel })
        .populate("leaves")
        .exec((err, students) => {
          if (err) {
            req.flash("error", "student not found with your department");
            res.redirect("back");
          } else {
            res.render("wardenLeaveSign", {
              warden: wardenFound,
              students: students,

              moment: moment
            });
          }
        });
    }
  });
});
app.get("/warden/:id/leave/:stud_id/info", (req, res) => {
  Warden.findById(req.params.id).exec((err, wardenFound) => {
    if (err) {
      req.flash("error", "warden not found with requested id");
      res.redirect("back");
    } else {
      Student.findById(req.params.stud_id)
        .populate("leaves")
        .exec((err, foundStudent) => {
          if (err) {
            req.flash("error", "student not found with this id");
            res.redirect("back");
          } else {
            res.render("Wardenmoreinfostud", {
              student: foundStudent,
              warden: wardenFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/warden/:id/leave/:stud_id/info", (req, res) => {
  Warden.findById(req.params.id).exec((err, wardenFound) => {
    if (err) {
      req.flash("error", "warden not found with requested id");
      res.redirect("back");
    } else {
      Student.findById(req.params.stud_id)
        .populate("leaves")
        .exec((err, foundStudent) => {
          if (err) {
            req.flash("error", "student not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundStudent.leaves.forEach(function(leave) {
                if (leave.wardenstatus === "pending") {
                  leave.wardenstatus = "approved";

                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundStudent.leaves.forEach(function(leave) {
                if (leave.wardenstatus === "pending") {
                  leave.wardenstatus = "denied";

                  leave.save();
                }
              });
            }
            res.render("Wardenmoreinfostud", {
              student: foundStudent,
              warden: wardenFound,
              moment: moment
            });
          }
        });
    }
  });
});
//logout for student

app.get("/logout", (req, res) => {
  req.logout();
  // req.flash("success", "you are logged out");
  res.redirect("/");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
