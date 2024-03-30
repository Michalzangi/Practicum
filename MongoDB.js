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

//Login Function
async function login(username, password) {
  try {
    const database = client.db('Practicum'); // Use the existing client instance
    const collection = database.collection('Users');
    const user = await collection.findOne({ UserName: username, Password: password });

    if (user) {
      if (user.Role === 'Admin') {
        console.log('Admin logged in');
        return 1;
      } else if (user.Role === 'User') {
        console.log('User logged in');
        return 2;
      }
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to authenticate user');
  }
}

//FilterAssets

const filterAssets = async (AssetType, AssetPrice, AssetStreet, AssetStreetNumber, RoomNum) => {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to the database...');
    await client.connect();
    console.log('Connected to the database.');

    const database = client.db('Practicum');
    const collection = database.collection('Assets');

    const filter = {};
    if (AssetType) filter.AssetType = AssetType;
    if (AssetPrice) filter.AssetPrice = AssetPrice;
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





// Call the run function to connect to the MongoDB instance

module.exports = { run, login, getAllAssets, filterAssets};


