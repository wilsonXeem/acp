const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const parsePositiveAmount = (value, field = 'amount') => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    const err = new Error(`${field} must be a positive number`);
    err.status = 400;
    throw err;
  }
  return parsed;
};

const parsePositiveInteger = (value, field) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const err = new Error(`${field} must be a positive integer`);
    err.status = 400;
    throw err;
  }
  return parsed;
};

const parseNonNegativeInteger = (value, field) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    const err = new Error(`${field} must be a non-negative integer`);
    err.status = 400;
    throw err;
  }
  return parsed;
};

const ensureAllowed = (value, allowed, field) => {
  if (!allowed.includes(value)) {
    const err = new Error(`${field} must be one of: ${allowed.join(', ')}`);
    err.status = 400;
    throw err;
  }
};

module.exports = {
  isEmail,
  parsePositiveAmount,
  parsePositiveInteger,
  parseNonNegativeInteger,
  ensureAllowed,
};
