const express = require('express');
const app = express();
const path = require('path');
const port = 4000;
const {login}= require('./MongoDB')
// Serve static files from the 'Public\sass' directory
app.use(express.static(path.join(__dirname, 'Public', 'sass')));

// Define a route handler for the root URL
app.get('/', (req, res) => {
  // You can optionally handle requests to the root URL separately here
  res.send('Hello from the root URL!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const loggedIn = await login(username, password);

  if (loggedIn === 1) {
    // User role is "manager," redirect to manager page
    res.redirect('/Home.html');
  } else if (loggedIn === 2) {
    // User role is "customer," redirect to customer page
    res.redirect('/HomeManager.html');
  } else {
    // The user does not exist, so show an error message.
    res.send('<script>alert("Try again incorrect Username or Password"); window.location.href = "/index.html";</script>');
  }
});
