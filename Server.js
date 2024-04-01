const express = require('express');
const app = express();
const port = 4000;
const {loginUser, filterAssets, getFeedback, addProperty}= require('./MongoDB')
// Serve static files from the 'Public\sass' directoryapp.use(express.static('public'));
app.use(express.static('public'));
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


app.get('/CustomerAssets', async (req, res) => {
  // Retrieve parameters from query string
  const { assetType, assetPriceMin, assetPriceMax, roomNumber, assetStreetNumber, assetStreet } = req.query;

  try {
    // Call FilterAssets function with parameters
    const filteredAssets = await filterAssets(assetType, assetPriceMin, assetPriceMax, assetStreet, assetStreetNumber, roomNumber);
    res.json(filteredAssets); // Return filtered assets as JSON response
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle any errors
  }
});

app.get('/feedback', async (req, res) => {
  const feedback = await getFeedback();
  res.json(feedback);
});

app.post('/addProperty', async (req, res) => {
  const { assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage } = req.body;

  try {
    const propertyId = await addProperty(assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage);
    res.status(201).json({ message: 'Property added successfully', propertyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
