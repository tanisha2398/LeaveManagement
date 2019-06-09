var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var studentSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  department: String,
  hostel: String,
  image: String
});
studentSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Student", studentSchema);

module.exports.createStudent = function(newStudent, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newStudent.password, salt, function(err, hash) {
      newStudent.password = hash;
      newStudent.save(callback);
    });
  });
};
