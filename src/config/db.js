const mongoose = require('mongoose');

if (!global.__acpMongoose) {
  global.__acpMongoose = { conn: null, promise: null };
}
const cached = global.__acpMongoose;

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    }).then((m) => m);
  }

  cached.conn = await cached.promise;

  const { host, port, name } = cached.conn.connection;
  console.log(`MongoDB connected: ${host}${port ? `:${port}` : ''}/${name}`);
  return cached.conn;
};
