const API_PAYMENTS = 'http://localhost:8008/api/payments';
const API_CUSTOMERS = 'http://localhost:8008/api/customers';

const paymentForm = document.getElementById('payment-form');
const paymentList = document.getElementById('payment-list');
const totalDueDisplay = document.getElementById('total-due');
const customerSelect = document.getElementById('customerId');
const searchInput = document.getElementById('search-input');

let editPaymentId = null;
let allPayments = [];

// Make customer dropdown searchable
function makeDropdownSearchable(selectElement) {
  const searchBox = document.createElement('input');
  searchBox.setAttribute('placeholder', 'Search customer...');
  searchBox.className = 'mb-2 p-1 border border-gray-300 rounded w-full';
  selectElement.parentNode.insertBefore(searchBox, selectElement);

  searchBox.addEventListener('input', () => {
    const term = searchBox.value.toLowerCase();
    Array.from(selectElement.options).forEach(opt => {
      opt.style.display = opt.text.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

// Fetch customers for dropdown
async function fetchCustomers() {
  try {
    const res = await fetch(API_CUSTOMERS);
    const customers = await res.json();
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = c.name;
      customerSelect.appendChild(opt);
    });
    makeDropdownSearchable(customerSelect);
  } catch (err) {
    console.error('Error loading customers:', err);
  }
}

// Fetch and render payments
async function fetchPayments() {
  try {
    const res = await fetch(API_PAYMENTS);
    allPayments = await res.json();
    renderPayments(allPayments);
  } catch (err) {
    console.error('Error fetching payments:', err);
  }
}

// Render payments based on search/filter
function renderPayments(payments) {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = payments.filter(p => {
    const name = p.customerId?.name?.toLowerCase() || '';
    const desc = (p.description || '').toLowerCase();
    const status = (p.status || '').toLowerCase();
    return name.includes(searchTerm) || desc.includes(searchTerm) || status.includes(searchTerm);
  });

  paymentList.innerHTML = '';
  filtered.forEach(p => {
    const statusColor = p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${p.customerId?.name || '-'}</td>
      <td class="border px-4 py-2">${p.description || '-'}</td>
      <td class="border px-4 py-2">${parseFloat(p.amount).toFixed(2)}</td>
      <td class="border px-4 py-2">
        <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusColor}">
          ${p.status}
        </span>
      </td>
      <td class="border px-4 py-2">${new Date(p.date).toLocaleString()}</td>
      <td class="border px-4 py-2 flex gap-2">
        <button class="edit-btn bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded" data-id="${p._id}">Edit</button>
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" data-id="${p._id}">Delete</button>
      </td>
    `;
    paymentList.prepend(tr);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => editPayment(btn.dataset.id)));
  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deletePayment(btn.dataset.id)));

  // Update total due outside table
  const total = filtered
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  totalDueDisplay.textContent = total.toFixed(2);
}

// Add or update payment
paymentForm.addEventListener('submit', async e => {
  e.preventDefault();

  const paymentData = {
    customerId: customerSelect.value,
    description: document.getElementById('description').value.trim(),
    amount: parseFloat(document.getElementById('amount').value) || 0,
    status: document.getElementById('status').value
  };

  if (!paymentData.customerId || !paymentData.amount) {
    Swal.fire({ icon: 'warning', title: 'Please select a customer and enter amount!' });
    return;
  }

  try {
    let res;
    if (editPaymentId) {
      res = await fetch(`${API_PAYMENTS}/${editPaymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      editPaymentId = null;
    } else {
      res = await fetch(API_PAYMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
    }

    if (!res.ok) throw new Error('Failed to save payment');

    paymentForm.reset();
    await fetchPayments();

    Swal.fire({ icon: 'success', title: 'Saved!', timer: 1500, showConfirmButton: false });
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save payment.' });
  }
});

document.getElementById('go-to-customer').addEventListener('click', () => {
  // Navigate to customer page
  window.location.href = 'customers.html';
});


// Export filtered payments to Excel
document.getElementById('export-excel').addEventListener('click', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = allPayments.filter(p => {
    const name = p.customerId?.name?.toLowerCase() || '';
    const desc = (p.description || '').toLowerCase();
    const status = (p.status || '').toLowerCase();
    return name.includes(searchTerm) || desc.includes(searchTerm) || status.includes(searchTerm);
  });

  if(filtered.length === 0){
    Swal.fire({ icon:'info', title:'No data to export'});
    return;
  }

  const data = filtered.map(p => ({
    Customer: p.customerId?.name || '-',
    Description: p.description || '-',
    Amount: parseFloat(p.amount).toFixed(2),
    Status: p.status,
    Date: new Date(p.date).toLocaleString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
  XLSX.writeFile(workbook, `Payments_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
});

// Export filtered payments to PDF
document.getElementById('export-pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4'); // landscape

  const searchTerm = searchInput.value.toLowerCase();
  const filtered = allPayments.filter(p => {
    const name = p.customerId?.name?.toLowerCase() || '';
    const desc = (p.description || '').toLowerCase();
    const status = (p.status || '').toLowerCase();
    return name.includes(searchTerm) || desc.includes(searchTerm) || status.includes(searchTerm);
  });

  if(filtered.length === 0){
    Swal.fire({ icon:'info', title:'No data to export'});
    return;
  }

  const headers = ["Customer", "Description", "Amount", "Status", "Date"];
  const rows = filtered.map(p => [
    p.customerId?.name || '-',
    p.description || '-',
    parseFloat(p.amount).toFixed(2),
    p.status,
    new Date(p.date).toLocaleString()
  ]);

  doc.setFontSize(16);
  doc.text("Payments Report", 40, 40);
  
  // autoTable requires this global
  doc.autoTable({
    startY: 60,
    head: [headers],
    body: rows,
    styles: { fontSize: 12 },
    theme: 'grid'
  });

  doc.save(`Payments_Report_${new Date().toISOString().slice(0,10)}.pdf`);
});


// Edit payment popup
async function editPayment(id) {
  try {
    const res = await fetch(`${API_PAYMENTS}/${id}`);
    const p = await res.json();

    const { value: formValues } = await Swal.fire({
      title: 'Edit Payment',
      html: `
        <div style="display:grid; grid-template-columns:120px 1fr; gap:10px; width:450px;">
          <label for="swal-customer">Customer:</label>
          <select id="swal-customer" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
            ${Array.from(customerSelect.options).map(opt =>
              `<option value="${opt.value}" ${opt.value === p.customerId?._id ? 'selected' : ''}>${opt.text}</option>`
            ).join('')}
          </select>
          <label for="swal-desc">Description:</label>
          <input id="swal-desc" value="${p.description || ''}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
          <label for="swal-amount">Amount:</label>
          <input id="swal-amount" type="number" step="0.01" value="${p.amount}" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
          <label for="swal-status">Status:</label>
          <select id="swal-status" style="width:100%; padding:6px; border:1px solid #ccc; border-radius:4px;">
            <option value="Pending" ${p.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Paid" ${p.status === 'Paid' ? 'selected' : ''}>Paid</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      preConfirm: () => ({
        customerId: document.getElementById('swal-customer').value,
        description: document.getElementById('swal-desc').value,
        amount: parseFloat(document.getElementById('swal-amount').value) || 0,
        status: document.getElementById('swal-status').value
      })
    });

    if (formValues) {
      await fetch(`${API_PAYMENTS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      await fetchPayments();
      Swal.fire({ icon: 'success', title: 'Updated!', timer: 1200, showConfirmButton: false });
    }

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch payment.' });
  }
}

// Delete payment
async function deletePayment(id) {
  const confirm = await Swal.fire({
    title: 'Delete Payment?',
    text: 'This action cannot be undone!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete!'
  });

  if (confirm.isConfirmed) {
    try {
      await fetch(`${API_PAYMENTS}/${id}`, { method: 'DELETE' });
      await fetchPayments();
      Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete payment.' });
    }
  }
}

// Search input
searchInput.addEventListener('input', () => renderPayments(allPayments));

// Initialize
fetchCustomers();
fetchPayments();
