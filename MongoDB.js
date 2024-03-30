const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://barsiboni:OeTrMMWzNa9cb31W@practicumdatabase.shts5lo.mongodb.net/?retryWrites=true&w=majority&appName=PracticumDatabase";

// Create a MongoClient instance with options for ServerApiVersion
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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




module.exports = { run, login };
