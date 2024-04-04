const express = require('express');
const app = express();
const port = 4000;
const {loginUser, filterAssets, getFeedback, addProperty,addFeedback,addMeeting, updateProperty,getAllUsers,deleteUserById,addUser }= require('./MongoDB')

app.use(express.static('public'));
app.use(express.json()); 
const nodemailer = require('nodemailer');
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


app.post('/updateProperty', async (req, res) => {
  const { assetID, assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage } = req.body;
  console.log('Request Body:', req.body);

  try {
    
    const propertyId = await updateProperty(assetID, assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage);
    res.status(201).json({ message: 'Property updated successfully', propertyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/addFeedback', async (req, res) => {
  const feedbackData = req.body; // הנתונים שנשלחו מהטופס בצד הלקוח

  try {
    await addFeedback(feedbackData); // הוספת הפידבק למסד הנתונים
    res.status(201).json({ message: 'Feedback added successfully!' });
  } catch (error) {
    console.error('Error adding feedback to database:', error);
    res.status(500).json({ error: 'Failed to add feedback to the database' });
  }
});


const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
      user: 'nofar.shamir7@gmail.com', 
      pass: 'shebnouqreidnctk' 
  }
});

app.post('/submitMessage', async (req, res) => {
  const formData = req.body;

  try {
      const emailContent = `
          Name: ${formData.Name}
          Email: ${formData.Email}
          Message: ${formData.Message}
      `;

      const mailOptions = {
          from: 'nofar.shamir7@gmail.com', 
          to: 'nofar.shamir7@gmail.com', 
          subject: 'New Message Received',
          text: emailContent
      };

      await transporter.sendMail(mailOptions);

      console.log('message email sent successfully'); 

      res.json({ message: 'message submitted successfully!' });
  } catch (error) {
      console.error('Error sending message email:', error);
      res.status(500).json({ error: 'Failed to send message email' });
  }
});
////////////////////////////////////////////////////////////////////////
app.get('/Users', async (req, res) => {
  try {
    const Users = await getAllUsers(); // Implement this function to fetch all users
    res.json(Users); // Send the users as a JSON response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/Users/:id', async (req, res) => {
  const UserId = req.params.id;
  await deleteUserById(UserId);
  res.sendStatus(204); // Send success status code
});

app.post('/add-user', async (req, res) => {
  try {
      const newUser = await addUser(req.body);
      res.status(201).json(newUser);
  } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ error: 'Failed to add user' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
