require('dotenv').config();
require('express-async-errors');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

if (process.env.VERCEL) {
  // Vercel: connect DB lazily and export the app as a serverless handler
  connectDB().catch((err) => console.error('DB connection error:', err));
  module.exports = app;
} else {
  // Local: connect then start the server
  (async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })();
}
