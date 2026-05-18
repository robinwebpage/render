const express = require('express');
const handler = require('./api/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.all('*', (req, res) => {
  handler(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
