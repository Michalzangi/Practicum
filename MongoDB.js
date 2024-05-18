const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://barsiboni:OeTrMMWzNa9cb31W@practicumdatabase.shts5lo.mongodb.net/?retryWrites=true&w=majority&appName=PracticumDatabase";


const client = new MongoClient(uri, {
  serverApi: {
    version: '1'
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run();


//Login Function
const loginUser = async (username, password) => {
  try {
    const database = client.db('Practicum');
    const collection = database.collection('Users');
    const user = await collection.findOne({ UserName: username });
    if (user && user.Password === password) {
      return { message: 'Login successful!', user };
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to authenticate user');
  }
}

//FilterAssets
const filterAssets = async (AssetType, AssetPriceMin, AssetPriceMax, AssetStreet, AssetStreetNumber, RoomNum, AssetCity) => {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to the database...');
    await client.connect();
    console.log('Connected to the database.');
    const database = client.db('Practicum');
    const collection = database.collection('Assets');
    const filter = { AssetStatus: 'Available' }; // Add condition for AssetStatus
    if (AssetType) filter.AssetType = AssetType;
    if (AssetPriceMin || AssetPriceMax) {
      // Convert string inputs to numeric values
      const minPrice = AssetPriceMin ? parseInt(AssetPriceMin, 10) : undefined;
      const maxPrice = AssetPriceMax ? parseInt(AssetPriceMax, 10) : undefined;

      filter.AssetPrice = {};
      if (minPrice !== undefined) filter.AssetPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.AssetPrice.$lte = maxPrice;
    }
    if (AssetStreet) filter.AssetStreet = AssetStreet;
    if (AssetStreetNumber) filter.AssetStreetNumber = AssetStreetNumber;
    if (RoomNum) filter.RoomNum = RoomNum;
    if (AssetCity) filter.AssetCity = AssetCity;

    console.log('Filter:', filter);
    const projection = { "AssetID": 0 }; // Exclude AssetID and AssetImage fields
    const result = await collection.find(filter, { projection }).toArray();
    console.log('Filtered Assets:', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch filtered assets.');
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}


const filterAssetsForManager = async (AssetType, AssetPriceMin, AssetPriceMax, AssetStreet, AssetStreetNumber, RoomNum, AssetCity) => {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to the database...');
    await client.connect();
    console.log('Connected to the database.');
    const database = client.db('Practicum');
    const collection = database.collection('Assets');
    const filter = {};
    if (AssetType) filter.AssetType = AssetType;
    if (AssetPriceMin || AssetPriceMax) {
      // Convert string inputs to numeric values
      const minPrice = AssetPriceMin ? parseInt(AssetPriceMin, 10) : undefined;
      const maxPrice = AssetPriceMax ? parseInt(AssetPriceMax, 10) : undefined;

      // Construct a price range filter
      filter.AssetPrice = {};
      if (minPrice !== undefined) filter.AssetPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.AssetPrice.$lte = maxPrice;
    }
    if (AssetStreet) filter.AssetStreet = AssetStreet;
    if (AssetStreetNumber) filter.AssetStreetNumber = AssetStreetNumber;
    if (RoomNum) filter.RoomNum = RoomNum;
    if (AssetCity) filter.AssetCity = AssetCity;

    console.log('Filter:', filter);
    const projection = { "AssetID": 0 }; // Exclude AssetID and AssetImage fields
    const result = await collection.find(filter, { projection }).toArray();
    console.log('Filtered Assets:', result);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch filtered assets.');
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}


//All Assets
async function getAllAssets() {
  const client = new MongoClient(uri);

  try {
      console.log('Connecting to the database...');
      await client.connect();
      console.log('Connected to the database.');
      const database = client.db('Practicum');
      const collection = database.collection('Assets');
      const projection = { "_id": 0 };
      const assets = await collection.find({}, { projection }).toArray();
      console.log(assets);
      return assets;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch all assets.');
    } finally {
      await client.close();
    }
}


//Show All Feedback
const getFeedback = async () => {
  let client; // Define the client variable

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const database = client.db('Practicum');
    const collection = database.collection('Feedback');
    const feedbacks = await collection.find().toArray();
    console.log('Feedbacks:', feedbacks);
    return feedbacks;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to fetch feedback data');
  } finally {
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
};


//Add New Asset
const addProperty = async (assetType, city, bathrooms, SqrRoot, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage, assetDescription) => {
  let client; // Define the client variable

  try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const database = client.db('Practicum');
    const collection = database.collection('Assets');

    // Find the maximum AssetID
    const maxAssetIdDoc = await collection.find({ AssetID: { $exists: true, $type: 'number' } }).sort({ AssetID: -1 }).limit(1).toArray();
    let newAssetId = 1; // Default value if collection is empty

    if (maxAssetIdDoc.length > 0) {
      const maxAssetId = maxAssetIdDoc[0].AssetID;
      if (!isNaN(maxAssetId)) {
        newAssetId = parseInt(maxAssetId) + 1; // Increment the maximum AssetID by 1
      }
    }

    // Parse assetPrice to an integer
    const price = parseInt(assetPrice);

    // Ensure consistency in assetType case
    const formattedAssetType = assetType.charAt(0).toUpperCase() + assetType.slice(1).toLowerCase();

    // Insert the property document into the collection
    const result = await collection.insertOne({ 
      AssetID: newAssetId,
      AssetType: formattedAssetType,
      AssetCity: city,
      AssetBathrooms: bathrooms,
      AssetSquareRoot: SqrRoot,
      AssetPrice: price,
      AssetStreet: assetStreet,
      AssetStreetNumber: assetStreetNumber,
      RoomNum: roomNum,
      AssetImage: assetImage,
      AssetDescription: assetDescription,
      AssetStatus: 'Available' // New field AssetStatus with value 'Available'
    });

    console.log('Property added successfully');
    return result.insertedId;
  } catch (error) {
    console.error('Error adding property:', error);
    throw new Error('Failed to add property');
  } finally {
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
}

//Add New Feedback
const addFeedback = async (customerId, feedbackData) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
      await client.connect();
      const database = client.db('Practicum');
      const customersCollection = database.collection('Customers');
      const dealsCollection = database.collection('Deals');
      const customer = await customersCollection.findOne({ CustomerID: customerId });
      if (!customer) {
          throw new Error('Customer not found. Please register as a customer to add feedback.');
      }

      const dealsCount = await dealsCollection.countDocuments({ customerId: customerId });
      if (dealsCount === 0) {
          throw new Error('You still haven\'t made a deal. A feedback hasn\'t been added.');
      }

      const collection = database.collection('Feedback');
      const result = await collection.insertOne(feedbackData);
      console.log('Feedback added successfully!');
      console.log('Received feedback data:', feedbackData);
      return result;
  } catch (error) {
      console.error('Error adding feedback:', error);
      throw new Error('Failed to add feedback');
  } finally {
      await client.close();
  }
};


//Add New Meeting
const addMeeting = async (customerID, date, time, location, partner, meetingType, assetSelect) => {
  let client; // Define client variable

  try {
    // Connect to MongoDB database
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Access the MongoDB database
    const database = client.db('Practicum');
    const meetingsCollection = database.collection('Meetings');
    const customersCollection = database.collection('Customers');

    // Check if the provided date has already passed
    const meetingDate = new Date(date);
    const currentDate = new Date();
    if (meetingDate < currentDate) {
      throw new Error('Date has passed. Please pick a date that is relevant.');
    }

    // Check if the CustomerID exists in the Customers collection
    const customer = await customersCollection.findOne({ CustomerID: customerID });
    if (!customer) {
      throw new Error('You are not yet a customer. Please sign up as one.');
    }

    // Add meeting document to Meetings collection with appropriate details
    const meetingData = {
      CustomerID: customerID,
      Date: date,
      Time: time,
      Location: location,
      Partner: partner,
      MeetingType: meetingType
    };

    // Check if AssetSelect is provided before adding it to the document
    if (assetSelect && assetSelect.length > 0) {
      meetingData.AssetSelect = assetSelect;
    }

    const result = await meetingsCollection.insertOne(meetingData);

    console.log('Meeting added successfully');
    return result.insertedId;
  } catch (error) {
    console.error('Error adding meeting:', error.message);
    throw new Error(error.message);
  } finally {
    // Close connection to MongoDB database
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
};





//get All Meetings
const getAllMeetings = async () => {
  try {
    const database = client.db('Practicum');
    const collection = database.collection('Meetings');
    const meetings = await collection.find().toArray();
    console.log('Meetings:', meetings);
    return meetings;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw new Error('Failed to fetch meetings');
  }
};


const checkCustomerExists = async (customerID) => {
  let client;

  try {
      client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');

      const database = client.db('Practicum');
      const collection = database.collection('Customers');

      // בדיקה אם הלקוח קיים במסד הנתונים על ידי ID
      const customer = await collection.findOne({ CustomerID: customerID });

      if (customer) {
          return true; // הלקוח קיים
      } else {
          return false; // הלקוח לא קיים
      }
  } catch (error) {
      console.error('Error checking customer:', error);
      throw new Error('Failed to check customer');
  } finally {
      if (client) {
          await client.close();
          console.log('Connection to MongoDB closed');
      }
  }
}


const updateProperty = async (assetID, assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage) => {
  let client; // Define the client variable

  try {
    const capitalizedAssetType = assetType.charAt(0).toUpperCase() + assetType.slice(1);
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const database = client.db('Practicum');
    const collection = database.collection('Assets');
    const existingProperty = await collection.findOne({ AssetID: parseInt(assetID) });
    if (!existingProperty) {
      console.log('Property with AssetID', assetID, 'not found.');
      return 0; // Return 0 to indicate that no documents were modified
    }

    const updateQuery = {};
    if (capitalizedAssetType) updateQuery.AssetType = capitalizedAssetType;
    if (assetPrice) updateQuery.AssetPrice = parseInt(assetPrice);
    if (assetStreet) updateQuery.AssetStreet = assetStreet;
    if (assetStreetNumber) updateQuery.AssetStreetNumber = assetStreetNumber;
    if (roomNum) updateQuery.RoomNum = roomNum;
    if (assetImage) updateQuery.AssetImage = assetImage;
    if (Object.keys(updateQuery).length > 0) {
      const result = await collection.updateOne({ AssetID: parseInt(assetID) }, { $set: updateQuery });
      console.log('Result of updateOne:', result);
      console.log('Property updated successfully');
      return result.modifiedCount; // Return the number of modified documents
    } else {
      console.log('No fields to update');
      return 0; // Return 0 to indicate that no documents were modified
    }
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property');
  } finally {
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
}
//get All Users
const getAllUsers = async () => {
  try {
    const database = client.db('Practicum');
    const collection = database.collection('Users');
    const Users = await collection.find().toArray();
    console.log('Users:', Users);
    return Users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

//delete Users
async function deleteUserById(UserId) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
      await client.connect();
      const db = client.db('Practicum');
      const usersCollection = db.collection('Users');
      const userObjectId = new ObjectId(UserId);
      const result = await usersCollection.deleteOne({ _id: userObjectId });
      if (result.deletedCount === 1) {
          console.log('User deleted successfully');
      } else {
          console.log('User not found or deletion failed');
      }
      const Users = await usersCollection.find().toArray();
      console.log('Users:', Users);
      return Users;
      } catch (err) {
      console.error('Error deleting user:', err);
      throw err; 
      } finally {
      await client.close();
    }
  }

//add User
async function addUser(userData) {
  try {
      const db = client.db('Practicum');
      const usersCollection = db.collection('Users');

      // Check if the username already exists
      const existingUser = await usersCollection.findOne({ UserName: userData.UserName });
      if (existingUser) {
          throw new Error('Username is already existing. Please try again.');
      }

      // If the username is not taken, proceed to insert the user data
      const result = await usersCollection.insertOne(userData);
      console.log('Insert result:', result);
      
      if (result && result.insertedCount === 1) {
          console.log('User added:', userData);
          return userData;
      } else {
          console.error('Error adding user: No inserted document found');
          return null;
      }
  } catch (error) {
      console.error('Error adding user:', error);
      throw error;
  }
}


//add partner
async function addPartner(partnerData) {
  try {
      const db = client.db('Practicum');
      const partnerCollection = db.collection('Partner');
      const result = await partnerCollection.insertOne(partnerData);
      console.log('Insert result:', result);
      if (result && result.insertedCount === 1) {
          console.log('partner added:', partnerData);
          return partnerData;
      } else {
          console.error('Error adding partner: No inserted document found');
          return null;
      }
  } catch (error) {
      console.error('Error adding partner:', error);
      throw error;
  }
}

//get all partners
async function getAllPartners() {
  const client = new MongoClient(uri);

  try {
      console.log('Connecting to the database...');
      await client.connect();
      console.log('Connected to the database.');
      const database = client.db('Practicum');
      const collection = database.collection('Partner');
      const projection = { "_id": 0 };
      const partners = await collection.find({}, { projection }).toArray();
      console.log(partners);
      return partners;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch all Partners.');
    } finally {
      await client.close();
    }
}

//add new Customer 
const addCustomer = async (customerID, fullName, phone, email,joinDate ,customerType, UserName) => {
  let client;

  try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const database = client.db('Practicum');
    const collection = database.collection('Customers');
    const collection2 = database.collection('Users');

    // Check if customerID already exists
    const existingCustomer = await collection.findOne({ CustomerID: customerID });
    if (existingCustomer) {
      throw new Error('The ID you entered already exists');
    }

    // Check if UserName already exists
    const existingUserName = await collection2.findOne({ UserName: UserName });
    if (!existingUserName) {
      throw new Error("Username doesn't exist. Please make a new account for the future customer before making a new customer file.");
    }

    const result = await collection.insertOne({
      CustomerID: customerID,
      FullName: fullName,
      Phone: phone,
      Email: email,
      joinDate: joinDate,
      CustomerType: customerType,
      UserName: UserName
    });

    console.log('Customer added successfully');
    return result.insertedId;
  } catch (error) {
    console.error('Error adding Customer:', error);
    throw new Error('Failed to add Customer: ' + error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
}

async function createDeal(assetId, customer1Id, customer2Id, SignatureDate,partnerUserName) {
  try {
      // Convert assetId to integer
      assetId = parseInt(assetId);

      if (customer1Id === customer2Id) {
          console.log("Error: Customer IDs cannot be the same.");
          return;
      }

      const db = client.db("Practicum");
      const dealsCollection = db.collection("Deals");
      const customersCollection = db.collection("Customers");
      const assetsCollection = db.collection("Assets");

      // Fetch customer1 and customer2 documents
      const customer1 = await customersCollection.findOne({ CustomerID: customer1Id });
      const customer2 = await customersCollection.findOne({ CustomerID: customer2Id });

      if (!customer1 || !customer2) {
          console.log("Error: Customer 1 or Customer 2 not found.");
          return;
      }

      // Fetch asset document
      const asset = await assetsCollection.findOne({ AssetID: assetId });

      if (!asset) {
          console.log("Error: Asset not found.");
          return;
      }

      // Determine deal type and customer roles based on asset type
      let dealType, customer1Role, customer2Role, dealCommission;
      if (asset.AssetType.toLowerCase() === "rent") {
          dealType = "Renting";
          customer1Role = "Rented";
          customer2Role = "Rentee";
          dealCommission = asset.AssetPrice;
      } else if (asset.AssetType.toLowerCase() === "sale") {
          dealType = "Buying";
          customer1Role = "Seller";
          customer2Role = "Buyer";
          dealCommission = asset.AssetPrice * 0.01;
      } else {
          console.log("Error: Invalid asset type. Asset type must be 'rent' or 'sale'.");
          return;
      }

      // Generate a unique transaction number
      const highestDeal = await dealsCollection.findOne({}, { sort: { transactionNumber: -1 } });
      const transactionNumber = highestDeal ? highestDeal.transactionNumber + 1 : 1;

      // Create deal documents with separate fields for hour and date
      const currentDate = new Date();
      const hour = currentDate.getHours();
      
      const deal1 = {
          transactionNumber,
          customerId: customer1Id,
          assetId,
          dealType,
          role: customer1Role,
          dealCommission,
          createdAtHour: hour,
          createdAtDate: SignatureDate,
          PartnerUserName: partnerUserName
      };

      const transactionNumberForSecondDeal = transactionNumber + 1;

      const deal2 = {
          transactionNumber: transactionNumberForSecondDeal,
          customerId: customer2Id,
          assetId,
          dealType: (dealType === "Renting") ? "Rented" : "Selling",
          role: customer2Role,
          dealCommission,
          createdAtHour: hour,
          createdAtDate: SignatureDate,
          PartnerUserName: partnerUserName
      };

      // Update asset status to "Unavailable"
      await assetsCollection.updateOne(
          { AssetID: assetId },
          { $set: { AssetStatus: "Unavailable" } }
      );

      // Insert both deal documents into the deals collection
      await dealsCollection.insertOne(deal1);
      await dealsCollection.insertOne(deal2);

      console.log("Deal documents created successfully.");
  } catch (error) {
      console.error("Error creating deal:", error);
  }
}




//delete meeting
async function deleteMeetingById(meetingId) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
      await client.connect();
      console.log('Connected to MongoDB'); // לוג לקשר הוצאה
      const db = client.db('Practicum');
      const MeetingsCollection = db.collection('Meetings');
      const userObjectId = new ObjectId(meetingId);
      const result = await MeetingsCollection.deleteOne({ _id: userObjectId });
      if (result.deletedCount === 1) {
          console.log('Meeting deleted successfully');
      } else {
          console.log('Meetings not found or deletion failed');
      }
  } catch (err) {
      console.error('Error deleting Meeting:', err);
      throw err;
  } finally {
      await client.close();
      console.log('MongoDB connection closed'); // לוג לסגירת קשר
  }
}


const checkMeetingExists = async (date,time,partner) => {
  let client;

  try {
      client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');

      const database = client.db('Practicum');
      const collection = database.collection('Meetings');
      const dateTime = new Date(`${date}T${time}`);

      // בדיקה אם הלקוח קיים במסד הנתונים על ידי ID
      const meeting = await collection.findOne({ DateTime: dateTime ,Partner:partner});

      if (meeting) {
          return true; // הלקוח קיים
      } else {
          return false; // הלקוח לא קיים
      }
  } catch (error) {
      console.error('Error checking meeting:', error);
      throw new Error('Failed to check meeting');
  } finally {
      if (client) {
          await client.close();
          console.log('Connection to MongoDB closed');
      }
  }
}

//get All Customers
const getAllCustomers = async () => {
  try {
    const database = client.db('Practicum');
    const collection = database.collection('Customers');
    const Customers = await collection.find().toArray();
    console.log('Customers:', Customers);
    return Customers;
  } catch (error) {
    console.error('Error fetching Customers:', error);
    throw new Error('Failed to fetch Customers');
  }
};

//getMeetingsbyCustomer(Username)
async function getMeetingsByUsername(username) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
      await client.connect();
      const db = client.db('Practicum');
      console.log(username);
      
      // Step 1: Find the customer document based on the username
      const customer = await db.collection('Customers').findOne({ UserName: username });
      if (!customer) {
          console.log('Customer not found');
          return [];
      }

      // Step 2: Find all meetings that match the CustomerID
      const meetings = await db.collection('Meetings').find({ CustomerID: customer.CustomerID }).toArray();
      console.log('Meetings:', meetings);
      return meetings;
  } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
  } finally {
      // Close the MongoDB connection
      await client.close();
  }
}

const getAllDeals = async () => {
  try {
    const database = client.db('Practicum');
    const collection = database.collection('Deals');
    const deals = await collection.find().toArray();
    console.log('deals:', deals);
    return deals;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw new Error('Failed to fetch Deals');
  }
};

const getCustomerByID = async (customerID) => {
  let client;

  try {
      client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');

      const database = client.db('Practicum');
      const collection = database.collection('Customers');

      // בדיקה אם הלקוח קיים במסד הנתונים על ידי ID
      const customer = await collection.findOne({ CustomerID: customerID });

      return customer; // Return the customer object (which may be null if not found)
  } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
  } finally {
      if (client) {
          await client.close();
          console.log('Connection to MongoDB closed');
      }
  }
}

async function getAvailableAssets() {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to the database...');
    await client.connect();
    console.log('Connected to the database.');
    const database = client.db('Practicum');
    const collection = database.collection('Assets');
    const projection = { "_id": 0 };
    const filter = { "AssetStatus": "Available" };
    const assets = await collection.find(filter, { projection }).toArray();
    console.log(assets);
    return assets;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch available assets.');
  } finally {
    await client.close();
  }
}



module.exports = { run ,loginUser ,getAllAssets ,filterAssets ,getFeedback, addProperty,addFeedback,addMeeting,
   updateProperty,getAllUsers, deleteUserById, addUser,addPartner,getAllPartners,addCustomer, filterAssetsForManager, 
   createDeal,checkCustomerExists,getAllMeetings,deleteMeetingById,checkMeetingExists,getAllCustomers,getMeetingsByUsername,
    getAllDeals,getCustomerByID, getAvailableAssets};
