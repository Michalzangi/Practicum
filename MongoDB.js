const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://barsiboni:OeTrMMWzNa9cb31W@practicumdatabase.shts5lo.mongodb.net/?retryWrites=true&w=majority&appName=PracticumDatabase";

// Create a MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: '1'
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected to MongoDB");

    // Send a ping to confirm a successful connection (optional)
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

const filterAssets = async (AssetType, AssetPriceMin, AssetPriceMax, AssetStreet, AssetStreetNumber, RoomNum) => {
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

      // Construct a price range filter
      filter.AssetPrice = {};
      if (minPrice !== undefined) filter.AssetPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.AssetPrice.$lte = maxPrice;
    }
    if (AssetStreet) filter.AssetStreet = AssetStreet;
    if (AssetStreetNumber) filter.AssetStreetNumber = AssetStreetNumber;
    if (RoomNum) filter.RoomNum = RoomNum;

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


const filterAssetsForManager = async (AssetType, AssetPriceMin, AssetPriceMax, AssetStreet, AssetStreetNumber, RoomNum) => {
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
      // Find all documents in the collection, excluding AssetImage
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

    // Access the database and collection
    const database = client.db('Practicum');
    const collection = database.collection('Feedback');

    // Find all documents in the collection
    const feedbacks = await collection.find().toArray();
    console.log('Feedbacks:', feedbacks);
    return feedbacks;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to fetch feedback data');
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
};


//Add New Asset
const addProperty = async (assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage, assetDescription) => {
  let client; // Define the client variable

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Access the database and collection
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
    // Close the MongoDB connection
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

      // Check if the customer exists
      const customer = await customersCollection.findOne({ CustomerID: customerId });
      if (!customer) {
          console.log('Customer not found. Cannot add feedback.');
          return null;
      }

      // Check if the customer has made at least one deal
      const dealsCount = await dealsCollection.countDocuments({ customerId: customerId });
      if (dealsCount === 0) {
          console.log('Customer has not made any deals. Cannot add feedback.');
          return null;
      }

      // Proceed to add feedback
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
  let client; // הגדרה של משתנה client

  try {
    // חיבור למסד הנתונים MongoDB
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // גישה למסד הנתונים ולאוסף Meetings
    const database = client.db('Practicum');
    const collection = database.collection('Meetings');

    // המרת התאריך והשעה לאובייקט JavaScript Date
    const dateTime = new Date(`${date}T${time}`);

    // הוספת מסמך הפגישה לאוסף Meetings עם כל הפרטים המתאימים
    const result = await collection.insertOne({
      CustomerID: customerID,
      DateTime: dateTime,
      Location: location,
      Partner: partner,
      MeetingType: meetingType,
      AssetSelect: assetSelect
       // הוספת סוג הפגישה למסמך הפגישה
    });

    console.log('Meeting added successfully');
    return result.insertedId;
  } catch (error) {
    console.error('Error adding meeting:', error);
    throw new Error('Failed to add meeting');
  } finally {
    // סגירת חיבור למסד הנתונים MongoDB
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
}





const updateProperty = async (assetID, assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage) => {
  let client; // Define the client variable

  try {
    // Capitalize the first letter of assetType
    const capitalizedAssetType = assetType.charAt(0).toUpperCase() + assetType.slice(1);

    // Connect to MongoDB
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Access the database and collection
    const database = client.db('Practicum');
    const collection = database.collection('Assets');

    // Find the existing property document based on the assetId
    const existingProperty = await collection.findOne({ AssetID: parseInt(assetID) });

    if (!existingProperty) {
      console.log('Property with AssetID', assetID, 'not found.');
      return 0; // Return 0 to indicate that no documents were modified
    }

    // Construct the update query
    const updateQuery = {};

    // Update fields only if they are present
    if (capitalizedAssetType) updateQuery.AssetType = capitalizedAssetType;
    if (assetPrice) updateQuery.AssetPrice = parseInt(assetPrice);
    if (assetStreet) updateQuery.AssetStreet = assetStreet;
    if (assetStreetNumber) updateQuery.AssetStreetNumber = assetStreetNumber;
    if (roomNum) updateQuery.RoomNum = roomNum;
    if (assetImage) updateQuery.AssetImage = assetImage;

    // Perform the update if there are fields to update
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
    // Close the MongoDB connection
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

      // Check if the deletion was successful
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
const addCustomer = async (customerID, fullName, phone, email, customerType) => {
  let client; // הגדרה של משתנה client

  try {
    // חיבור למסד הנתונים MongoDB
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // גישה למסד הנתונים ולאוסף Customers
    const database = client.db('Practicum');
    const collection = database.collection('Customers');

    // הוספת מסמך הלקוח לאוסף Customers עם כל הפרטים המתאימים
    const result = await collection.insertOne({
      CustomerID: customerID,
      FullName: fullName,
      Phone: phone,
      Email: email,
      CustomerType: customerType

    });

    console.log('Customer added successfully');
    return result.insertedId;
  } catch (error) {
    console.error('Error adding Customer:', error);
    throw new Error('Failed to add Customer');
  } finally {
    // סגירת חיבור למסד הנתונים MongoDB
    if (client) {
      await client.close();
      console.log('Connection to MongoDB closed');
    }
  }
}

//check Customer Existence
async function checkCustomerExistence(username) {
  let client; try {
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    await client.connect();
    const database = client.db('Practicum');
    const collection = database.collection('Customers');
    const customer = await collection.findOne({ username });
    if (customer) {
      console.log('Customer exists');
      return true;
    }
    else {
      console.log('You need to add a new customer');
      return false;
    }
  }
  catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to check customer existence');
  } finally {
    await client.close();
  }
}

async function createDeal(assetId, customer1Id, customer2Id) {
  try {
      const db = client.db("Practicum");
      const dealsCollection = db.collection("Deals");
      const customersCollection = db.collection("Customers");
      const assetsCollection = db.collection("Assets");

      // Fetch customer1 and customer2 documents
      console.log(customer1Id);
      console.log(customer2Id);
      const customer1 = await customersCollection.findOne({ CustomerID: customer1Id });
      const customer2 = await customersCollection.findOne({ CustomerID: customer2Id });

      if (!customer1 || !customer2) {
          console.log("Customer 1 or Customer 2 not found.");
          return;
      }

      // Fetch asset document
      const asset = await assetsCollection.findOne({ AssetID: parseInt(assetId) });

      if (!asset) {
          console.log("Asset not found.");
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
          console.log("Invalid asset type. Asset type must be 'rent' or 'sale'.");
          return;
      }

      // Generate a unique transaction number
      const highestDeal = await dealsCollection.findOne({}, { sort: { transactionNumber: -1 } });

// Calculate the next transaction number
      const transactionNumber = highestDeal ? highestDeal.transactionNumber + 1 : 1;

      // Create deal documents
      const deal1 = {
          transactionNumber,
          customerId: customer1Id,
          assetId,
          dealType,
          role: customer1Role,
          dealCommission
      };


      const transactionNumberForSecondDeal = transactionNumber + 1;

      const deal2 = {
          transactionNumber:  transactionNumberForSecondDeal,
          customerId: customer2Id,
          assetId,
          dealType: (dealType === "Renting") ? "Rented" : "Selling",
          role: customer2Role,
          dealCommission
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


module.exports = { run ,loginUser ,getAllAssets ,filterAssets ,getFeedback, addProperty,addFeedback,addMeeting,
   updateProperty,getAllUsers, deleteUserById, addUser,addPartner,getAllPartners,addCustomer,checkCustomerExistence, filterAssetsForManager, createDeal};