 
// import mongoose from 'mongoose';

// const paymentSchema = new mongoose.Schema({
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
//   description: { type: String },
//   amount: { type: Number, required: true },
//   date: { type: Date, default: Date.now },
//   status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
// });

// const Payment = mongoose.model('Payment', paymentSchema);

// export default Payment;
// backend/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
