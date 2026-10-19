/* ==========================================================================
   EXECUTIVE ADMIN DASHBOARD LOGIC (js/admin.js)
   Indian Salon Operations, Booking Pipeline, Staff Directory & POS Billing
   ========================================================================== */

let currentAdminTab = 'appointments';
let revenueChart = null;
let servicesChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check Java + MySQL Backend Connection
  const health = await window.dbConnector.checkBackendHealth();
  updateAdminDbStatus(health);

  // Bind Sidebar Navigation
  setupSidebarNavigation();

  // Check Admin Authentication Gatekeeper
  const isAuthenticated = checkAdminAuthGate();
  if (isAuthenticated) {
    await refreshDashboardData();
  }

  // Setup Admin Modals
  setupAdminModals();
});

// Admin Gatekeeper Check
function checkAdminAuthGate() {
  const overlay = document.getElementById('adminAuthOverlay');
  const user = window.dbConnector.getCurrentUser();

  if (!user || user.role !== 'admin') {
    if (overlay) overlay.style.display = 'flex';
    setupAdminGateLogin();
    return false;
  }

  if (overlay) overlay.style.display = 'none';
  const badge = document.getElementById('adminUserBadge');
  if (badge) {
    badge.innerHTML = `<i class="fa-solid fa-user-shield"></i> Admin: ${user.full_name || user.username}`;
  }
  return true;
}

function setupAdminGateLogin() {
  const tabLogin = document.getElementById('adminGateTabLogin');
  const tabRegister = document.getElementById('adminGateTabRegister');
  const formLogin = document.getElementById('adminGateLoginForm');
  const formRegister = document.getElementById('adminGateRegisterForm');
  const alertBox = document.getElementById('adminGateAlert');

  // Tab switching
  if (tabLogin && tabRegister && !tabLogin.dataset.bound) {
    tabLogin.dataset.bound = 'true';
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
      if (alertBox) alertBox.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.style.display = 'block';
      formLogin.style.display = 'none';
      if (alertBox) alertBox.style.display = 'none';
    });
  }

  // 1. Admin Login Submit
  const loginBtn = document.getElementById('adminGateLoginBtn');
  if (loginBtn && !loginBtn.dataset.bound) {
    loginBtn.dataset.bound = 'true';
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('adminGateUser').value.trim();
      const password = document.getElementById('adminGatePass').value.trim();

      if (!username || !password) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'badge badge-danger';
          alertBox.innerText = 'Please enter username and password.';
        }
        return;
      }

      loginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
      const res = await window.dbConnector.login({ role: 'admin', username, password });
      loginBtn.innerHTML = `<i class="fa-solid fa-sign-in-alt"></i> Login to Admin Dashboard`;

      if (res.success) {
        const overlay = document.getElementById('adminAuthOverlay');
        if (overlay) overlay.style.display = 'none';
        const badge = document.getElementById('adminUserBadge');
        if (badge) {
          badge.innerHTML = `<i class="fa-solid fa-user-shield"></i> Admin: ${res.user.full_name || res.user.username}`;
        }
        await refreshDashboardData();
      } else {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'badge badge-danger';
          alertBox.innerText = res.message || 'Invalid admin credentials.';
        }
      }
    });
  }

  // 2. Admin Register Submit
  const regBtn = document.getElementById('adminGateRegBtn');
  if (regBtn && !regBtn.dataset.bound) {
    regBtn.dataset.bound = 'true';
    regBtn.addEventListener('click', async () => {
      const username = document.getElementById('adminGateRegUser').value.trim();
      const fullName = document.getElementById('adminGateRegName').value.trim();
      const email = document.getElementById('adminGateRegEmail').value.trim();
      const password = document.getElementById('adminGateRegPass').value.trim();

      if (!username || !password) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'badge badge-danger';
          alertBox.innerText = 'Username and password are required for admin registration.';
        }
        return;
      }

      regBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering Admin...`;
      const res = await window.dbConnector.register({
        role: 'admin',
        username,
        full_name: fullName,
        email,
        password
      });
      regBtn.innerHTML = `<i class="fa-solid fa-user-shield"></i> Register as Salon Admin`;

      if (res.success) {
        const overlay = document.getElementById('adminAuthOverlay');
        if (overlay) overlay.style.display = 'none';
        const badge = document.getElementById('adminUserBadge');
        if (badge) {
          badge.innerHTML = `<i class="fa-solid fa-user-shield"></i> Admin: ${res.user.full_name || res.user.username}`;
        }
        await refreshDashboardData();
      } else {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'badge badge-danger';
          alertBox.innerText = res.message || 'Failed to register admin account.';
        }
      }
    });
  }
}

window.adminLogout = function() {
  window.dbConnector.logout();
  const overlay = document.getElementById('adminAuthOverlay');
  if (overlay) overlay.style.display = 'flex';
  setupAdminGateLogin();
};

function updateAdminDbStatus(health) {
  const badge = document.getElementById('adminDbStatus');
  if (!badge) return;

  if (health.database && health.database.connected) {
    badge.className = 'badge badge-success';
    badge.innerHTML = `<i class="fa-solid fa-database"></i> MySQL Connected`;
  } else {
    badge.className = 'badge badge-warning';
    badge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> LocalStorage Fallback`;
  }
}

function setupSidebarNavigation() {
  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');

      const tab = targetBtn.getAttribute('data-tab');
      currentAdminTab = tab;

      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
      const targetContent = document.getElementById(`tabContent-${tab}`);
      if (targetContent) targetContent.style.display = 'block';

      if (tab === 'analytics') renderCharts();
    });
  });
}

async function refreshDashboardData() {
  await loadKpis();
  await loadAppointmentsKanban();
  await loadServicesTable();
  await loadStylistsTable();
}

// ==========================================
// 1. KPI METRICS
// ==========================================
async function loadKpis() {
  const stats = await window.dbConnector.getDashboardStats();
  const services = await window.dbConnector.getServices();

  document.getElementById('kpiTodayApps').innerText = stats.todayAppointments || 0;
  document.getElementById('kpiRevenue').innerText = `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`;
  document.getElementById('kpiActiveStylists').innerText = stats.activeStylists || 0;
  document.getElementById('kpiTotalServices').innerText = services.length || 0;
}

// ==========================================
// 2. APPOINTMENTS KANBAN PIPELINE
// ==========================================
async function loadAppointmentsKanban() {
  const colPending = document.getElementById('colPending');
  const colConfirmed = document.getElementById('colConfirmed');
  const colInProgress = document.getElementById('colInProgress');
  const colCompleted = document.getElementById('colCompleted');

  if (!colPending) return;

  const appointments = await window.dbConnector.getAppointments();

  const pendingApps = appointments.filter(a => a.status === 'Pending');
  const confirmedApps = appointments.filter(a => a.status === 'Confirmed');
  const inProgressApps = appointments.filter(a => a.status === 'In-Progress');
  const completedApps = appointments.filter(a => a.status === 'Completed');

  colPending.innerHTML = pendingApps.map(renderKanbanCard).join('');
  colConfirmed.innerHTML = confirmedApps.map(renderKanbanCard).join('');
  colInProgress.innerHTML = inProgressApps.map(renderKanbanCard).join('');
  colCompleted.innerHTML = completedApps.map(renderKanbanCard).join('');

  // Bind Kanban Status Progression Buttons
  document.querySelectorAll('.kanban-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const newStatus = e.currentTarget.getAttribute('data-status');
      await window.dbConnector.updateAppointmentStatus(id, newStatus);
      await refreshDashboardData();
    });
  });

  // Bind Payment Quick Actions (UPI / Cash)
  document.querySelectorAll('.pay-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const method = prompt("Select Payment Mode for this appointment:\n1. UPI (GPay/PhonePe)\n2. Cash\n3. Card", "UPI");
      const chosenMethod = method ? method.trim() : 'UPI';
      await window.dbConnector.updatePaymentStatus(id, 'Paid', chosenMethod);
      await refreshDashboardData();
    });
  });

  // Bind Invoice / Bill Print Buttons
  document.querySelectorAll('.invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const app = appointments.find(a => a.id == id);
      if (app) generateInvoiceModal(app);
    });
  });
}

function renderKanbanCard(a) {
  return `
    <div class="kanban-card" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <span style="font-weight: 700; color: var(--primary); font-size: 0.85rem;">#${a.ref_code}</span>
        <span class="badge ${a.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}">${a.payment_status}</span>
      </div>
      <h5 style="color: var(--text-main); font-size: 1.05rem; margin-bottom: 4px;">${a.customer_name}</h5>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 4px;"><i class="fa-solid fa-scissors"></i> ${a.service_name}</p>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;"><i class="fa-regular fa-clock"></i> ${a.appointment_date} @ ${a.appointment_time}</p>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 10px;">
        <strong style="color: var(--text-main); font-size: 0.95rem;">₹${parseFloat(a.total_price).toFixed(2)}</strong>
        
        <div style="display: flex; gap: 6px;">
          ${a.status === 'Pending' ? `
            <button class="btn btn-outline btn-sm kanban-action-btn" data-id="${a.id}" data-status="Confirmed" title="Confirm Booking"><i class="fa-solid fa-check"></i></button>
          ` : ''}
          ${a.status === 'Confirmed' ? `
            <button class="btn btn-primary btn-sm kanban-action-btn" data-id="${a.id}" data-status="In-Progress" title="Start Service"><i class="fa-solid fa-play"></i></button>
          ` : ''}
          ${a.status === 'In-Progress' ? `
            <button class="btn btn-primary btn-sm kanban-action-btn" data-id="${a.id}" data-status="Completed" title="Complete Service"><i class="fa-solid fa-flag-checkered"></i></button>
          ` : ''}
          ${a.payment_status === 'Unpaid' ? `
            <button class="btn btn-secondary btn-sm pay-action-btn" data-id="${a.id}" title="Collect Payment (UPI/Cash)"><i class="fa-solid fa-indian-rupee-sign"></i></button>
          ` : ''}
          <button class="btn btn-secondary btn-sm invoice-btn" data-id="${a.id}" title="Print Bill Slip"><i class="fa-solid fa-receipt"></i></button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 3. SERVICES DIRECTORY (CRUD)
// ==========================================
async function loadServicesTable() {
  const tbody = document.getElementById('servicesTableBody');
  if (!tbody) return;

  const services = await window.dbConnector.getServices();

  tbody.innerHTML = services.map(s => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${s.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=100&q=80'}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" />
          <div>
            <strong style="color: var(--text-main); display: block;">${s.name}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${s.category_name || 'Hair Care & Precision Cuts'}</span>
          </div>
        </div>
      </td>
      <td>${s.duration_mins} mins</td>
      <td style="color: var(--primary); font-weight: 700;">₹${parseFloat(s.price).toFixed(2)}</td>
      <td><span class="badge badge-success">${s.status || 'Active'}</span></td>
      <td>
        <button class="btn btn-danger btn-sm delete-service-btn" data-id="${s.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.delete-service-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Are you sure you want to delete this service?')) {
        const id = e.currentTarget.getAttribute('data-id');
        await window.dbConnector.deleteService(id);
        await refreshDashboardData();
      }
    });
  });
}

// ==========================================
// 4. STYLISTS DIRECTORY (CRUD)
// ==========================================
async function loadStylistsTable() {
  const tbody = document.getElementById('stylistsTableBody');
  if (!tbody) return;

  const stylists = await window.dbConnector.getStylists();

  tbody.innerHTML = stylists.map(st => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${st.avatar_url}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-light);" />
          <div>
            <strong style="color: var(--text-main); display: block;">${st.name}</strong>
            <span style="font-size: 0.8rem; color: var(--primary);">${st.title}</span>
          </div>
        </div>
      </td>
      <td>${st.email || 'N/A'}</td>
      <td>${st.phone || 'N/A'}</td>
      <td>⭐ ${st.rating || 5.0}</td>
      <td><span class="badge badge-success">${st.status}</span></td>
      <td>
        <button class="btn btn-danger btn-sm delete-stylist-btn" data-id="${st.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.delete-stylist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Remove stylist from staff directory?')) {
        const id = e.currentTarget.getAttribute('data-id');
        await window.dbConnector.deleteStylist(id);
        await refreshDashboardData();
      }
    });
  });
}

// ==========================================
// 5. MODALS & FORMS
// ==========================================
function setupAdminModals() {
  // Service Modal
  const openSvcModal = document.getElementById('openAddServiceModalBtn');
  const closeSvcModal = document.getElementById('closeServiceModalBtn');
  const saveSvcBtn = document.getElementById('saveServiceBtn');

  if (openSvcModal) openSvcModal.addEventListener('click', () => document.getElementById('serviceModal').classList.add('active'));
  if (closeSvcModal) closeSvcModal.addEventListener('click', () => document.getElementById('serviceModal').classList.remove('active'));
  
  if (saveSvcBtn) {
    saveSvcBtn.addEventListener('click', async () => {
      const name = document.getElementById('newSvcName').value.trim();
      const price = parseFloat(document.getElementById('newSvcPrice').value);
      const duration = parseInt(document.getElementById('newSvcDuration').value);
      const desc = document.getElementById('newSvcDesc').value.trim();
      const img = document.getElementById('newSvcImg').value.trim();

      if (!name || isNaN(price)) return alert('Please enter service name and price in INR.');

      await window.dbConnector.createService({
        category_id: 1,
        name,
        price,
        duration_mins: duration || 30,
        description: desc,
        image_url: img
      });

      document.getElementById('serviceModal').classList.remove('active');
      await refreshDashboardData();
    });
  }

  // Stylist Modal
  const openStyModal = document.getElementById('openAddStylistModalBtn');
  const closeStyModal = document.getElementById('closeStylistModalBtn');
  const saveStyBtn = document.getElementById('saveStylistBtn');

  if (openStyModal) openStyModal.addEventListener('click', () => document.getElementById('stylistModal').classList.add('active'));
  if (closeStyModal) closeStyModal.addEventListener('click', () => document.getElementById('stylistModal').classList.remove('active'));

  if (saveStyBtn) {
    saveStyBtn.addEventListener('click', async () => {
      const name = document.getElementById('newStyName').value.trim();
      const title = document.getElementById('newStyTitle').value.trim();
      const email = document.getElementById('newStyEmail').value.trim();
      const phone = document.getElementById('newStyPhone').value.trim();
      const avatar = document.getElementById('newStyAvatar').value.trim();

      if (!name) return alert('Please enter stylist name.');

      await window.dbConnector.createStylist({ name, title, email, phone, avatar_url: avatar });

      document.getElementById('stylistModal').classList.remove('active');
      await refreshDashboardData();
    });
  }
}

// ==========================================
// 6. POS QUICK INVOICE BILL GENERATOR
// ==========================================
function generateInvoiceModal(a) {
  const modal = document.getElementById('invoiceModal');
  const box = document.getElementById('printableInvoice');
  if (!modal || !box) return;

  const basePrice = parseFloat(a.total_price);
  const gst = basePrice * 0.05; // 5% GST for Salon Services
  const grandTotal = basePrice + gst;

  box.innerHTML = `
    <div style="border-bottom: 2px solid var(--primary); padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-family: var(--font-heading); color: var(--text-main); font-size: 1.6rem;">SHREE ROYAL SALON & SPA</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Connaught Place / MG Road, India | +91 98765 43210</p>
        <p style="color: var(--text-dim); font-size: 0.8rem;">GSTIN: 07AAAAA0000A1Z5 | Reg. Salon Enterprise</p>
      </div>
      <div style="text-align: right;">
        <span class="badge badge-primary" style="font-size: 0.9rem;">TAX INVOICE</span>
        <p style="color: var(--primary); font-weight: 700; margin-top: 4px; font-size: 1.1rem;">#${a.ref_code}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 0.9rem;">
      <div>
        <strong style="color: var(--primary);">Customer Details:</strong>
        <p style="color: var(--text-main); font-weight: 600;">${a.customer_name}</p>
        <p style="color: var(--text-muted);">${a.customer_phone}</p>
      </div>
      <div style="text-align: right;">
        <strong style="color: var(--primary);">Appointment Timing:</strong>
        <p style="color: var(--text-main); font-weight: 600;">${a.appointment_date} at ${a.appointment_time}</p>
        <p style="color: var(--text-muted);">Payment: <span class="badge ${a.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}">${a.payment_status}</span></p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.9rem; color: var(--text-main);">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-medium); text-align: left; background: var(--bg-surface-soft);">
          <th style="padding: 10px 12px;">Service Description</th>
          <th style="padding: 10px 12px; text-align: center;">Stylist</th>
          <th style="padding: 10px 12px; text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 12px;"><strong>${a.service_name}</strong></td>
          <td style="padding: 12px; text-align: center;">${a.stylist_name || 'Floor Specialist'}</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">₹${basePrice.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
      <div style="width: 280px; background: var(--bg-surface-soft); padding: 16px; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 6px;">
          <span>Service Amount:</span>
          <span>₹${basePrice.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 6px;">
          <span>CGST + SGST (5%):</span>
          <span>₹${gst.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--text-main); font-weight: 700; font-size: 1.15rem; border-top: 1px solid var(--border-medium); padding-top: 8px;">
          <span>Net Total:</span>
          <span style="color: var(--primary);">₹${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; border-top: 1px dashed var(--border-medium); padding-top: 16px; color: var(--text-muted); font-size: 0.85rem;">
      Thank you for choosing Shree Royal Salon & Spa! Visit us again soon.
    </div>
  `;

  modal.classList.add('active');

  document.getElementById('closeInvoiceModalBtn').onclick = () => modal.classList.remove('active');
  document.getElementById('printInvoiceBtn').onclick = () => window.print();
}

// ==========================================
// 7. CHARTS & ANALYTICS
// ==========================================
async function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const ctxRevenue = document.getElementById('revenueChartCanvas');
  const ctxServices = document.getElementById('servicesChartCanvas');

  if (ctxRevenue) {
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(ctxRevenue, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Weekly Revenue (₹ INR)',
          data: [2500, 4200, 3800, 6100, 8900, 14500, 11200],
          borderColor: '#C59B27',
          backgroundColor: 'rgba(197, 155, 39, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#1D2129' } } },
        scales: {
          x: { ticks: { color: '#58606E' }, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { ticks: { color: '#58606E' }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  }

  if (ctxServices) {
    if (servicesChart) servicesChart.destroy();
    servicesChart = new Chart(ctxServices, {
      type: 'doughnut',
      data: {
        labels: ['Haircut & Styling', 'Herbal Hair Spa', 'O3+ D-Tan Facial', 'Beard & Shave', 'Gel Nail Art'],
        datasets: [{
          data: [35, 20, 20, 15, 10],
          backgroundColor: ['#C59B27', '#8C3826', '#1E7B48', '#C07106', '#2A6F97']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#1D2129' } } }
      }
    });
  }
}
