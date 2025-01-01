// start new server on port 3000



// USE ecomapp;

// -- Creating the 'users' table
// CREATE TABLE users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   address TEXT,
//   phone VARCHAR(15),
//   email VARCHAR(255) UNIQUE NOT NULL,
//   is_verified BOOLEAN DEFAULT FALSE, -- Indicates whether the user is verified
//   otp VARCHAR(10), -- Stores the one-time password for verification
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );


// -- Creating the 'categories' table (optional, for product categorization)
// CREATE TABLE categories (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );

// -- Creating the 'products' table
// CREATE TABLE products (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     price DECIMAL(10, 2) NOT NULL,
//     image VARCHAR(255),
//     categoryId INT, -- Foreign key to link products to categories
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
// );

// -- Creating the 'orders' table
// CREATE TABLE orders (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     userId INT NOT NULL,
//     productId INT NOT NULL,
//     paymentMethod VARCHAR(50) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
//     FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
// );







const express = require('express');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
// mysql as db

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Abcd@123123',
  database : 'ecomapp'
});
const app = express();
const port = 3000;

app.use(express.json());
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// configure nodemailer

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'najukakhade5@gmail.com',
    pass: 'ndyv cdbe kvas umly'
  }
});

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('singup');
});

app.get('/logout', (req, res) => {
  res.send('Logout Page');
});

app.get('/buy/:id', (req, res) => {
  let productId = req.params.id;
  res.render('orders', { product: productId});
  });

app.post('/order', (req, res) => {
  let productId = req.body.productId; 
  let quantity = req.body.quantity;
  let userId = req.body.userId;
  let address = req.body.address;
  let phoneNo = req.body.phoneNo;
  let paymentMethod = req.body.paymentMethod;
});
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // check in database
  connection.query('SELECT * FROM users WHERE email =?', [email], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      if (result[0].upassword === password) {
        res.redirect('/');
      } else {
        res.send('Invalid password');
      }
    } else {
      res.send('User not found');
    }
  });
});

app.post('/register', (req, res) => {
  let name = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let phone = req.body.phone;
  let address = req.body.address;
  let verificationCode = Math.floor(1000 + Math.random() * 9000);

  // insert into database
  connection.query('INSERT INTO users (name, email, upassword, phone, address, otp) VALUES (?,?,?,?,?,?)', [name, email, password, phone, address, verificationCode], (err, result) => {
    if (err) throw err;
    console.log('User registered successfully.');
    // send verification email
    let mailOptions = {
      from: 'najukakhade5@gmail.com',
      to: email,
      subject: 'Verify your email address',
      text: `Your verification code is ${verificationCode}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ', info.response);
        res.redirect('/verify-account');
      }
    });
  });
  
  
});

app.get('/verify-account', (req, res) => {
  res.render('verify-account');
});

app.post('/verify-account', (req, res) => {
  let email = req.body.email;
  let verificationCode = req.body.verificationCode;
  console.log(verificationCode);
  console.log(email);
  // verify the code in database
  connection.query('SELECT * FROM users WHERE email =? AND otp =?', [email, verificationCode], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      connection.query('UPDATE users SET is_verified = 1 WHERE email =?', [email], (err, result) => {
        if (err) throw err;
        console.log('Account verified successfully.');
        res.redirect('/login');
      });
    } else {
      console.log('Invalid verification code.');
      res.render('verify-account', { error: "Invalid Verification Code" });
    }
  });
});

app.get('/orders', (req, res) => {
  res.render('orders');
});

// start server on port

app.listen(port, () => {
  // connect to db  
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
  });
  console.log(`Server running on port ${port}`);
});