require('dotenv').config();
require('express-async-errors');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

if (process.env.VERCEL) {
  module.exports = app;
} else {
  (async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })();
}
