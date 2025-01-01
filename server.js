// start new server on port 3000

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello')
});


// start server on port

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});