const express = require('express');
const app = express();
const path = require('path');
const port = 4000;
const {loginUser}= require('./MongoDB')
// Serve static files from the 'Public\sass' directory
app.use(express.static(path.join(__dirname, 'Public', 'sass')));
app.use(express.json()); 
// Define a route handler for the root URL
app.get('/', (req, res) => {
  // You can optionally handle requests to the root URL separately here
  res.send('Hello from the root URL!');
});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const loginResult = await loginUser(username, password);
    res.json(loginResult);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});