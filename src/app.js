require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ACP Investment API is running', version: '0.1.0' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
