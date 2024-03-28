const express = require('express');
const app = express();
const path = require('path');
const port = 4000;

// Serve static files from the 'Public\sass' directory
app.use(express.static(path.join(__dirname, 'Public', 'sass')));

// Define a route handler for the root URL
app.get('/', (req, res) => {
  // You can optionally handle requests to the root URL separately here
  res.send('Hello from the root URL!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});