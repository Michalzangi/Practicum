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



// Call the run function to connect to the MongoDB instance

module.exports = { run,loginUser , getAllAssets, filterAssets,getFeedback};


