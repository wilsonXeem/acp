const mongoose = require('mongoose');

const cached = global.__acpMongoose || { conn: null, promise: null };

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  global.__acpMongoose = cached;

  const { host, port, name } = cached.conn.connection;
  console.log(`MongoDB connected: ${host}${port ? `:${port}` : ''}/${name}`);
  return cached.conn;
};
