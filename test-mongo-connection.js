const { MongoClient } = require('mongodb');
const dns = require('dns');

// Test DNS resolution first
console.log('Testing DNS resolution...');
dns.resolveSrv('_mongodb._tcp.cluster0.zmqcbuo.mongodb.net', (err, records) => {
  if (err) {
    console.error('❌ DNS SRV lookup failed:', err.message);
  } else {
    console.log('✅ DNS SRV lookup successful:', records);
  }

  // Try basic DNS lookup
  dns.lookup('cluster0.zmqcbuo.mongodb.net', (err, address) => {
    if (err) {
      console.error('❌ DNS A record lookup failed:', err.message);
    } else {
      console.log('✅ DNS resolved to:', address);
    }

    // Now try MongoDB connection
    const uri = process.env.MONGODB_URI || 'mongodb+srv://nandeishbaburaj_db_user:nandeishkashish1234@cluster0.zmqcbuo.mongodb.net/?appName=Cluster0';
    
    console.log('\nAttempting MongoDB connection...');
    console.log('Connection URI:', uri.split('@')[0] + '@***@' + uri.split('@')[1]);

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    client.connect()
      .then(() => {
        console.log('✅ MongoDB connection successful!');
        client.close();
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
      });
  });
});
