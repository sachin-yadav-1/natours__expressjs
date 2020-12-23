const mongoose = require('mongoose');
const app = require('./app');

// DATABASE SETUP
const DB = process.env.DB_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => console.log('DB Connection Successful!'))
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });

// SERVER SETUP
const port = process.env.PORT;
app.listen(port, () => console.log(`Listening to server at port: ${port}`));
