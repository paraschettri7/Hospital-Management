require('dotenv').config();
// Vercel Node runtime invokes the exported Express app directly as the
// request handler — no app.listen() and no serverless-http wrapper needed.
module.exports = require('../src/app');
