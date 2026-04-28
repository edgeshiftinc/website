const { MongoClient } = require('mongodb');
const dns = require('dns').promises;

async function testConnections() {
  const uris = [
    // Original SRV
    'mongodb+srv://nandeishbaburaj_db_user:nandeishkashish1234@cluster0.zmqcbuo.mongodb.net/?appName=Cluster0',
    // Try with retryWrites and direct connection
    'mongodb+srv://nandeishbaburaj_db_user:nandeishkashish1234@cluster0.zmqcbuo.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority&directConnection=false',
  ];

  for (const uri of uris) {
    console.log(`\nTesting: ${uri.split('@')[0]}@***`);
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });

    try {
      await client.connect();
      console.log('✅ Success!');
      await client.close();
      return true;
    } catch (err) {
      console.error(`❌ ${err.message}`);
    }
  }
  return false;
}

testConnections();
