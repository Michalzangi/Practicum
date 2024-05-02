const express = require('express');
const app = express();
const port = 4000;
const {loginUser, filterAssets, getFeedback,getAllAssets, addProperty,addFeedback,addMeeting, updateProperty,
  getAllUsers,deleteUserById,addUser,addPartner,getAllPartners,addCustomer,filterAssetsForManager,
  createDeal,checkCustomerExists,getAllMeetings,deleteMeetingById,checkMeetingExists }= require('./MongoDB')

app.use(express.static('public'));
app.use(express.json()); 
const nodemailer = require('nodemailer');
app.get('/', (req, res) => {
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
  const { assetType, assetPriceMin, assetPriceMax, roomNumber, assetStreetNumber, assetStreet } = req.query;

  try {
    const filteredAssets = await filterAssets(assetType, assetPriceMin, assetPriceMax, assetStreet, assetStreetNumber, roomNumber);
    res.json(filteredAssets); 
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/CustomerAssetsForManager', async (req, res) => {
  const { assetType, assetPriceMin, assetPriceMax, roomNumber, assetStreetNumber, assetStreet } = req.query;

  try {
    const filteredAssets = await filterAssetsForManager(assetType, assetPriceMin, assetPriceMax, assetStreet, assetStreetNumber, roomNumber);
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
  const { assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage, assetDescription } = req.body;

  try {
    const propertyId = await addProperty(assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage, assetDescription);
    res.status(201).json({ message: 'Property added successfully', propertyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/addDeal', async (req, res) => {
  const { AssetID, Customer1ID, Customer2ID, PartnerUserName } = req.body;

  try {
    const DealID = await createDeal(AssetID, Customer1ID, Customer2ID, PartnerUserName);
    res.status(201).json({ message: 'Deals added successfully', DealID });
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
  const feedbackData = req.body; // Data sent from the form on the client side

  try {
      const customerId = feedbackData.CustomerID;
      const result = await addFeedback(customerId, feedbackData);
      res.status(201).json({ message: 'Feedback added successfully!' });
  } catch (error) {
      if (error.message.includes('Customer not found')) {
          res.status(404).json({ error: 'Your Customer ID is not found. Please register as a customer to add a feedback.' });
      } else if (error.message.includes('haven\'t made a deal')) {
          res.status(404).json({ error: 'You still haven\'t made a deal. A feedback hasn\'t been added.' });
      } else {
          console.error('Error adding feedback to database:', error);
          res.status(500).json({ error: 'Failed to add feedback to the database' });
      }
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


app.post('/addMeeting', async (req, res) => {
  const { customerID, date, time, location, partner, meetingType, assetSelect } = req.body;

  try {
      const customerExists = await checkCustomerExists(customerID);
      if (!customerExists) {
          return res.status(400).json({ error: 'Customer does not exist' });
      }

      const meetingId = await addMeeting(customerID, date, time, location, partner, meetingType, assetSelect);
      res.status(201).json({ message: 'Meeting added successfully', meetingId });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/checkCustomerExists', async (req, res) => {
  const { customerID } = req.query;

  try {
      const exists = await checkCustomerExists(customerID);
      res.status(200).json({ exists }); // Return a JSON response
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

///////////
app.get('/Assets', async (req, res) => {
  try {
    const assets = await getAllAssets(); // Implement this function to fetch all users
    res.json(assets); // Send the users as a JSON response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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

app.post('/add-partner', async (req, res) => {
  try {
      const newPartner = await addPartner(req.body);
      res.status(201).json(newPartner);
  } catch (error) {
      console.error('Error adding Partner:', error);
      res.status(500).json({ error: 'Failed to add Partner' });
  }
});

app.get('/Partners', async (req, res) => {
  try {
    const Partners = await getAllPartners(); // Implement this function to fetch all users
    res.json(Partners); // Send the users as a JSON response
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch Partners' });
  }
});

app.post('/AddCustomer', async (req, res) => {
  const { customerID, fullName, phone, email, customerType } = req.body;

  try {
    const customerId = await addCustomer(customerID, fullName, phone, email, customerType);
    res.status(201).json({ message: 'Customer added successfully', customerId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////////////////////////////////////////
app.get('/meetings', async (req, res) => {
  try {
    const meetings = await getAllMeetings();
    res.json(meetings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});
app.delete('/meeting/:id', async (req, res) => {
  const meetingId = req.params.id;
  try {
      await deleteMeetingById(meetingId);
      res.sendStatus(204); // Send success status code
  } catch (error) {
      console.error('Error deleting meeting:', error);
      res.sendStatus(500); // Send internal server error status code
  }
});
app.get('/checkMeetingExists', async (req, res) => {
  const { date,time,partner } = req.query;

  try {
      const exists = await checkMeetingExists(date,time,partner);
      res.status(200).json({ exists }); // Return a JSON response
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});