const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  await connectDB();

  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }

  return app(req, res);
};
