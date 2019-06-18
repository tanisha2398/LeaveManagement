var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var passportLocalMongoose = require("passport-local-mongoose");

var hodSchema = new mongoose.Schema({
  name: String,
  type: String,
  username: String,
  password: String,
  department: String,
  image: String,
  leaves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave"
    }
  ]
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

module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  Hod.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
  Hod.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, passwordFound) {
    if (err) throw err;
    callback(null, passwordFound);
  });
};
