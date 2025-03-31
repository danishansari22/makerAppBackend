const mongoose = require('mongoose');
// import mongoose from 'mongoose';

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
};

const connection = mongoose.connection;

module.exports = {
  connect,
  connection,
};

// export { connect, connection };