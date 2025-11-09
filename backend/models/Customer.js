//const mongoose = require('../db');
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;


// import mongoose from 'mongoose';

// const { Schema, model } = mongoose;

// const studentSchema = new Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   contactNumber: {
//     type: String,
//     required: true
//   },
//   age: {
//     type: Number,
//     required: true
//   }
// });

// const Student = model('Student', studentSchema);

// export default Student;
