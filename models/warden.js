var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var wardenSchema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,
  hostel: String,
  image: String
});

wardenSchema.plugin(passportLocalMongoose);
var Warden = (module.exports = mongoose.model("Warden", wardenSchema));

module.exports.createWarden = function(newWarden, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newWarden.password, salt, function(err, hash) {
      newWarden.password = hash;
      newWarden.save(callback);
    });
  });
};

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  Warden.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  Warden.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, passwordFound) {
    if (err) throw err;
    callback(null, passwordFound);
  });
};
