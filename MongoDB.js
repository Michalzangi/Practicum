const { MongoClient } = require('mongodb');

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
      // Connect to the MongoDB server
      console.log('Connecting to the database...');
      await client.connect();
      console.log('Connected to the database.');

      // Access the database and collection
      const database = client.db('Practicum');
      const collection = database.collection('Assets');

      // Projection to exclude the AssetImage field
      const projection = { "AssetID": 0 };
      // Find all documents in the collection, excluding AssetImage
      const assets = await collection.find({}, { projection }).toArray();
      console.log(assets);
      return assets;
  } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch all assets.');
  } finally {
      // Close the MongoDB connection
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
const addProperty = async (assetType, assetPrice, assetStreet, assetStreetNumber, roomNum, assetImage) => {
  let client; // Define the client variable

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Access the database and collection
    const database = client.db('Practicum');
    const collection = database.collection('Assets');

    // Parse assetPrice to an integer
    const price = parseInt(assetPrice);

    // Insert the property document into the collection
    const result = await collection.insertOne({
      AssetType: assetType,
      AssetPrice: price, // Use the parsed integer value
      AssetStreet: assetStreet,
      AssetStreetNumber: assetStreetNumber,
      RoomNum: roomNum,
      AssetImage: assetImage
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

<<<<<<< HEAD
//Add New Feedback

const addFeedback = async (feedbackData) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const database = client.db('Practicum');
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



=======
>>>>>>> db1eb9b68e9c8373ca5186547ae813eec2ba5e7b
// Call the run function to connect to the MongoDB instance

module.exports = { run ,loginUser ,getAllAssets ,filterAssets ,getFeedback, addProperty,addFeedback};


