// // import express from 'express';
// // import Customer from '../models/Customer.js';

// // const router = express.Router();

// // // Get all customers
// // router.get('/', async (req, res) => {
// //   try {
// //     const customers = await Customer.find();
// //     res.json(customers);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Create a new customer
// // router.post('/', async (req, res) => {
// //   try {
// //     const customer = new Customer(req.body);
// //     await customer.save();
// //     res.status(201).json(customer);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // export default router;
// import express from 'express';
// import Customer from '../models/Customer.js';

// const router = express.Router();

// // Get all customers
// router.get('/', async (req, res) => {
//   try {
//     const customers = await Customer.find();
//     res.json(customers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create a new customer
// router.post('/', async (req, res) => {
//   try {
//     const customer = new Customer(req.body);
//     await customer.save();
//     res.status(201).json(customer);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Update a customer
// router.put('/:id', async (req, res) => {
//   try {
//     const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(customer);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Delete a customer
// router.delete('/:id', async (req, res) => {
//   try {
//     await Customer.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Customer deleted successfully' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// export default router;

import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
