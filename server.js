const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

// GLOBAL UNHANDLED EXCEPTION ( ASYNC CODE ERRORS ) HANDLER
process.on('unhandledException', (err) => {
  console.log('UNHANDLED EXCEPTION');
  console.log(err.name, err.message);
  process.exit(1);
});

// DATABASE SETUP
const DB = process.env.DB_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB Connection Successful!'));

// SERVER SETUP
const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`Listening to server at port: ${port}`)
);

// GLOBAL UNHANDLED REJECTION ( PROMISE ) HANDLER
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);

  // Close server and exit
  server.close(() => {
    process.exit(1);
  });
});
