// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import { PORT, mongoDBURL } from './config.js';
// //import studentRoute from './routes/customers.js';
// import customerRoutes from './routes/customers.js';

// //app.use('/api/customers', customerRoutes);


// const app = express();
// app.use(express.json());
// app.use(cors());

// // Default route
// app.get('/', (req, res) => {
//   console.log(req);
//   return res.status(200).send('Welcome to the Mini Mart System');
// });


// app.use('/api/customers', customerRoutes);


// mongoose
//   .connect(mongoDBURL)
//   .then(() => {
//     console.log('Connected to the database successfully');
//     app.listen(PORT, () => {
//       console.log(`Server is running on port: ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log('Failed to connect to the database', error);
//   });
// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, mongoDBURL } from './config.js';
import customerRoutes from './routes/customers.js';
import paymentRoutes from './routes/payments.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Mini Mart System');
});

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection failed:', err));
