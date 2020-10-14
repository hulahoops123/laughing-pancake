//jshint esversion:6
require('dotenv').config(); //This is for environment variables. It must be declared as early as possible
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({    //Schema must be defined in this way for authentication
  email: String,
  password: String
});


//The secret is now moved to the .env file. The env file has no commas or semicoplons and CAPITAL variable names. No spaces either.
//The .env file should be added to .gitignore 
//const secret = "thepasswordispenise"; //Define your secret word
//Choose the fields you want encrypted. Leave this out and all fields will be encrypted
//This must all be done before the model is declared.
userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:["password"]});



const User = new mongoose.model("Users", userSchema);

app.get("/", function(req, res) {
  res.render("home")
});

app.get("/login", function(req, res) {
  res.render("login")
});

app.get("/register", function(req, res) {
  res.render("register")
});

app.post("/register", function(req, res) {
  const un = req.body.username;
  const pw = req.body.password;
  const newUser = new User({
    email: un,
    password: pw
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("User has been successfully saved");
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {
  const un = req.body.username;
  const pw = req.body.password;
  User.findOne({
    email: un
  }, function(err, foundUser) {
    if (err) {
      //Username not found
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === pw) {
          //Username and password match
          res.render("secrets");
        } else {
          res.send("pw do not match");
        }
      } else {
        res.send("No user found");
      }
    }
  })
});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
