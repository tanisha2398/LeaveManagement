var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var studentSchema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,
  department: String,
  hostel: String,
  image: String,
  leaves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave"
    }
  ]
});
studentSchema.plugin(passportLocalMongoose);
var Student = (module.exports = mongoose.model("Student", studentSchema));

module.exports.createStudent = function(newStudent, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newStudent.password, salt, function(err, hash) {
      newStudent.password = hash;
      newStudent.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  Student.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  Student.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, passwordFound) {
    if (err) throw err;
    callback(null, passwordFound);
  });
};
