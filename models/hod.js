var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var hodSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  department: String,
  image: String
});

hodSchema.plugin(passportLocalMongoose);
var Hod = (module.exports = mongoose.model("Hod", hodSchema));

module.exports.createHod = function(newHod, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newHod.password, salt, function(err, hash) {
      newHod.password = hash;
      newHod.save(callback);
    });
  });
};
