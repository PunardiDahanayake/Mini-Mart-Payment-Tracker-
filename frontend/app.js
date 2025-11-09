// app.js - fully working frontend for Mini Mart System
//not working properly




const API_CUSTOMERS = 'http://localhost:8008/api/customers';
const API_PAYMENTS = 'http://localhost:8008/api/payments';

// DOM Elements
const customerForm = document.getElementById('customer-form');
const paymentForm = document.getElementById('payment-form');
const customerSelect = document.getElementById('customer');
const paymentList = document.getElementById('payment-list');
const totalDueAllDisplay = document.getElementById('total-due-all');
const filteredTotalDueDisplay = document.getElementById('filtered-total-due');
const searchInput = document.getElementById('search-input');

// ==================== Customers ====================
async function fetchCustomers() {
  const res = await fetch(API_CUSTOMERS);
  const customers = await res.json();

  // Populate customer dropdown for payment form
  customerSelect.innerHTML = '<option value="">Select Customer</option>';
  customers.forEach(c => {
    const option = document.createElement('option');
    option.value = c._id;
    option.textContent = c.name;
    customerSelect.appendChild(option);
  });

  return customers;
}

customerForm.addEventListener('submit', async e => {
  e.preventDefault();

  const newCustomer = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  if (!newCustomer.name) {
    alert('Name is required');
    return;
  }

  try {
    const res = await fetch(API_CUSTOMERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    });

    if (!res.ok) throw new Error('Failed to add customer');

    customerForm.reset();
    await fetchCustomers();
    fetchPayments(searchInput.value);
  } catch (err) {
    console.error(err);
    alert('Error adding customer. Check console.');
  }
});

// ==================== Payments ====================
async function fetchPayments(search = '') {
  const res = await fetch(API_PAYMENTS);
  let payments = await res.json();

  // Apply search
  if (search.trim() !== '') {
    const lowerSearch = search.toLowerCase();
    payments = payments.filter(p =>
      p.customerId?.name?.toLowerCase().includes(lowerSearch) ||
      (p.customerId?.email || '').toLowerCase().includes(lowerSearch) ||
      (p.customerId?.phone || '').toLowerCase().includes(lowerSearch) ||
      (p.description || '').toLowerCase().includes(lowerSearch)
    );
  }

  paymentList.innerHTML = '';
  payments.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${p.customerId?.name || '-'}</td>
      <td class="border px-4 py-2">${p.description || '-'}</td>
      <td class="border px-4 py-2">$${p.amount}</td>
      <td class="border px-4 py-2">${p.status}</td>
      <td class="border px-4 py-2">${new Date(p.date).toLocaleString()}</td>
      <td class="border px-4 py-2">${p.status==='Pending'?`<button data-id="${p._id}" class="mark-paid bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Mark Paid</button>`:'-'}</td>
    `;
    paymentList.appendChild(tr);
  });

  // Mark as Paid buttons
  document.querySelectorAll('.mark-paid').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`${API_PAYMENTS}/${btn.dataset.id}/pay`, { method: 'PATCH' });
      fetchPayments(searchInput.value);
      fetchTotalDueAll();
    });
  });

  const totalDue = payments.filter(p => p.status==='Pending').reduce((sum, p) => sum + p.amount, 0);
  filteredTotalDueDisplay.textContent = `Total Due (Filtered): $${totalDue}`;
}

// Add payment
paymentForm.addEventListener('submit', async e => {
  e.preventDefault();
  const paymentData = {
    customerId: customerSelect.value,
    description: document.getElementById('description').value.trim(),
    amount: parseFloat(document.getElementById('amount').value),
    status: document.getElementById('status').value,
    date: document.getElementById('date').value || new Date()
  };

  if (!paymentData.customerId || !paymentData.amount) {
    alert('Customer and Amount are required');
    return;
  }

  try {
    await fetch(API_PAYMENTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    paymentForm.reset();
    fetchPayments(searchInput.value);
    fetchTotalDueAll();
  } catch (err) {
    console.error(err);
    alert('Error adding payment');
  }
});

// ==================== Totals ====================
async function fetchTotalDueAll() {
  const res = await fetch(API_PAYMENTS);
  const payments = await res.json();
  const total = payments.filter(p => p.status==='Pending').reduce((sum, p) => sum + p.amount, 0);
  totalDueAllDisplay.textContent = `$${total}`;
}

// ==================== Search ====================
searchInput.addEventListener('input', () => fetchPayments(searchInput.value));

// ==================== Init ====================
fetchCustomers();
fetchPayments();
fetchTotalDueAll();

