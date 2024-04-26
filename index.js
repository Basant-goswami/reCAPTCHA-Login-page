const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
let ejs = require("ejs");
const path = require("path");

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

// app.engine("ejs", engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./public")));

const PORT = 3000;

// Mock database
const users = [];
const Product = [];

// Define User class
class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }
}

// Define UserService class
class UserService {
  registerUser(user) {
    users.push(user);
    console.log("User registered successfully");
  }

  loginUser(username, password) {
    const user = users.find((user) => user.username === username);
    if (user && user.password === password) {
      console.log("Login successful");
      return true;
    } else {
      console.log("Invalid username or password");
      return false;
    }
  }
}

// Instantiate UserService
const userService = new UserService();

app.get("/", (req, res) => {
  res.redirect("/register");
});

// Serve the registration form with Google reCAPTCHA
app.get("/register", (req, res) => {
  res.render("./register.ejs");
});

// product adding page
app.get("/product", (req, res) => {
  res.render("./product.ejs");
});

// product adding
app.post("/product/item", (req, res) => {
  let newItem = req.body.product;
  Product.push(newItem);
  //   console.log("Products:", Product);
  res.render("./items.ejs", { Product: Product });
});

//  showing product

// Register user route with reCAPTCHA verification
app.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    "g-recaptcha-response": recaptchaResponse,
  } = req.body;
  const recaptchaSecret = "6Lc7PsgpAAAAAH6c-wwGANdeRcjWmpYntm5M-gxI";

  //   Verify reCAPTCHA response
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaResponse}`
  );
  console.log("reCAPTCHA verification response:", response.data);

  if (!response.data.success) {
    res.status(400).send("reCAPTCHA verification failed");
    return;
  }
  //   Register the user
  const user = new User(username, email, password);
  userService.registerUser(user);
  //   res.send(`user name ${user.username} and password ${user.password}`);
  res.redirect("/login");
});

// Serve the login form
app.get("/login", (req, res) => {
  res.render("./login.ejs");
});

// Login user route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (userService.loginUser(username, password)) {
    res.redirect("/product");
  } else {
    res.status(401).send("Invalid username or password");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
