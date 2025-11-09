const API_CUSTOMERS = 'http://localhost:8008/api/customers';

const customerList = document.getElementById('customer-list');
const searchInput = document.getElementById('search-input');

// Fetch and render customers
async function fetchCustomers() {
  try {
    const res = await fetch(API_CUSTOMERS);
    const customers = await res.json();

    const search = searchInput.value.toLowerCase().trim();
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      (c.email || '').toLowerCase().includes(search) ||
      (c.phone || '').toLowerCase().includes(search) ||
      (c.address || '').toLowerCase().includes(search)
    );

    customerList.innerHTML = '';
    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border px-4 py-2">${c.name}</td>
        <td class="border px-4 py-2">${c.email || '-'}</td>
        <td class="border px-4 py-2">${c.phone || '-'}</td>
        <td class="border px-4 py-2">${c.address || '-'}</td>
        <td class="border px-4 py-2">${new Date(c.createdAt).toLocaleString()}</td>
        <td class="border px-4 py-2 flex gap-2">
          <button class="edit-btn bg-yellow-400 px-2 py-1 rounded" data-id="${c._id}">Edit</button>
          <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${c._id}">Delete</button>
        </td>
      `;
      customerList.prepend(tr);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editCustomer(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteCustomer(btn.dataset.id));
    });

  } catch (err) {
    console.error(err);
  }
}

// Edit customer using SweetAlert
async function editCustomer(id) {
  try {
    const res = await fetch(`${API_CUSTOMERS}/${id}`);
    const customer = await res.json();

    const { value: formValues } = await Swal.fire({
      title: 'Edit Customer',
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Name" value="${customer.name}">` +
        `<input id="swal-email" class="swal2-input" placeholder="Email" value="${customer.email || ''}">` +
        `<input id="swal-phone" class="swal2-input" placeholder="Phone" value="${customer.phone || ''}">` +
        `<input id="swal-address" class="swal2-input" placeholder="Address" value="${customer.address || ''}">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        name: document.getElementById('swal-name').value.trim(),
        email: document.getElementById('swal-email').value.trim(),
        phone: document.getElementById('swal-phone').value.trim(),
        address: document.getElementById('swal-address').value.trim()
      })
    });

    if (formValues) {
      const updateRes = await fetch(`${API_CUSTOMERS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      if (!updateRes.ok) throw new Error('Failed to update customer');

      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Customer updated successfully', timer: 1500, showConfirmButton: false });
      fetchCustomers();
    }

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Could not update customer' });
  }
}

// Delete customer with confirmation
async function deleteCustomer(id) {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the customer!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete!'
  });

  if (confirm.isConfirmed) {
    try {
      const res = await fetch(`${API_CUSTOMERS}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete customer.' });
    }
  }
}

document.getElementById('go-to-payment').addEventListener('click', () => {
  // Navigate to payment page
  window.location.href = 'payments.html';
});


// Add new customer using form + SweetAlert
const customerForm = document.getElementById('customer-form');
customerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const newCustomer = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  if (!newCustomer.name) {
    Swal.fire({ icon: 'warning', title: 'Name required!' });
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
    fetchCustomers();

    Swal.fire({ icon: 'success', title: 'Added!', text: `${newCustomer.name} has been added.`, timer: 1500, showConfirmButton: false });
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Could not add customer.' });
  }
});

// Search functionality
searchInput.addEventListener('input', fetchCustomers);

// Initial load
fetchCustomers();
