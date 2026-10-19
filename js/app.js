/* ==========================================================================
   CUSTOMER PORTAL APPLICATION LOGIC (js/app.js)
   Indian Salon Online Booking, Staff Selection, Tracking, Reviews & Auth
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Check Java + MySQL Backend Connection Status
  const health = await window.dbConnector.checkBackendHealth();
  updateDbStatusIndicator(health);

  // Initialize UI Sections
  await loadCategoriesAndServices();
  await loadStylists();
  await loadReviews();

  // Setup Authentication & Profile Bar
  setupAuthUI();

  // Setup Event Listeners
  setupBookingWizard();
  setupTracker();
  setupReviewModal();
  setupMyBookingsUI();
});

// Display DB connection status badge on nav
function updateDbStatusIndicator(health) {
  const badge = document.getElementById('dbStatusBadge');
  if (!badge) return;

  if (health.database && health.database.connected) {
    badge.className = 'badge badge-success';
    badge.innerHTML = `<i class="fa-solid fa-database"></i> MySQL Connected`;
  } else {
    badge.className = 'badge badge-warning';
    badge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> LocalStorage Fallback`;
  }
}

// Global State for Booking Wizard
const bookingState = {
  step: 1,
  service_id: null,
  service_name: '',
  service_price: 0,
  stylist_id: null,
  stylist_name: 'Any Available Stylist',
  appointment_date: '',
  appointment_time: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  notes: ''
};

// ==========================================
// AUTHENTICATION UI & PROFILE BAR
// ==========================================
// ==========================================
// AUTHENTICATION UI & ROLE MANAGEMENT
// 1) Register -> Customer, Admin
// 2) Login -> Customer, Admin
// ==========================================
function setupAuthUI() {
  updateNavAuthUI();

  const closeAuthBtn = document.getElementById('closeAuthModalBtn');
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => closeAuthModal());

  // Mode Elements (1. Login  |  2. Register)
  const modeLoginBtn = document.getElementById('authModeLoginBtn');
  const modeRegBtn = document.getElementById('authModeRegisterBtn');
  const loginContainer = document.getElementById('authModeLoginContainer');
  const regContainer = document.getElementById('authModeRegisterContainer');

  // Sub-Tab Elements under Register
  const regRoleCustTab = document.getElementById('regRoleCustTab');
  const regRoleAdminTab = document.getElementById('regRoleAdminTab');
  const regCustForm = document.getElementById('regCustForm');
  const regAdminForm = document.getElementById('regAdminForm');

  // Helper to switch mode (Login vs Register)
  window.setAuthMode = function(mode) {
    clearAuthAlert();
    if (mode === 'register') {
      if (modeLoginBtn) modeLoginBtn.classList.remove('active');
      if (modeRegBtn) modeRegBtn.classList.add('active');
      if (loginContainer) loginContainer.style.display = 'none';
      if (regContainer) regContainer.style.display = 'block';
    } else {
      if (modeRegBtn) modeRegBtn.classList.remove('active');
      if (modeLoginBtn) modeLoginBtn.classList.add('active');
      if (regContainer) regContainer.style.display = 'none';
      if (loginContainer) loginContainer.style.display = 'block';
    }
  };

  // Helper to switch Register Role (Customer vs Admin)
  window.setRegRole = function(role) {
    clearAuthAlert();
    if (role === 'admin') {
      if (regRoleCustTab) regRoleCustTab.classList.remove('active');
      if (regRoleAdminTab) regRoleAdminTab.classList.add('active');
      if (regCustForm) regCustForm.style.display = 'none';
      if (regAdminForm) regAdminForm.style.display = 'block';
    } else {
      if (regRoleAdminTab) regRoleAdminTab.classList.remove('active');
      if (regRoleCustTab) regRoleCustTab.classList.add('active');
      if (regAdminForm) regAdminForm.style.display = 'none';
      if (regCustForm) regCustForm.style.display = 'block';
    }
  };

  if (modeLoginBtn) modeLoginBtn.addEventListener('click', () => window.setAuthMode('login'));
  if (modeRegBtn) modeRegBtn.addEventListener('click', () => window.setAuthMode('register'));

  if (regRoleCustTab) regRoleCustTab.addEventListener('click', () => window.setRegRole('customer'));
  if (regRoleAdminTab) regRoleAdminTab.addEventListener('click', () => window.setRegRole('admin'));

  // Switch links inside forms
  const switchCustReg = document.getElementById('switchCustRegLink');
  if (switchCustReg) switchCustReg.addEventListener('click', () => { window.setAuthMode('register'); window.setRegRole('customer'); });

  const switchCustLogin = document.getElementById('switchCustLoginLink');
  if (switchCustLogin) switchCustLogin.addEventListener('click', () => window.setAuthMode('login'));

  const switchAdminLogin = document.getElementById('switchAdminLoginLink');
  if (switchAdminLogin) switchAdminLogin.addEventListener('click', () => window.setAuthMode('login'));

  // Quick-fill Demo Helper Buttons
  const fillCustDemo = document.getElementById('fillDemoCustomerLogin');
  if (fillCustDemo) {
    fillCustDemo.addEventListener('click', () => {
      document.getElementById('commonLoginIdentifier').value = '9876543210';
      document.getElementById('commonLoginPassword').value = '123456';
    });
  }

  const fillAdminDemo = document.getElementById('fillDemoAdminLogin');
  if (fillAdminDemo) {
    fillAdminDemo.addEventListener('click', () => {
      document.getElementById('commonLoginIdentifier').value = 'admin';
      document.getElementById('commonLoginPassword').value = 'admin123';
    });
  }

  // 1. Common Portal Login Submit (Handles both Customer & Admin)
  const commonLoginBtn = document.getElementById('commonLoginSubmitBtn');
  if (commonLoginBtn) {
    commonLoginBtn.addEventListener('click', async () => {
      const identifier = (document.getElementById('commonLoginIdentifier').value || '').trim();
      const password = (document.getElementById('commonLoginPassword').value || '').trim();

      if (!identifier || !password) {
        return showAuthAlert('Please enter your mobile number/username and password.', 'danger');
      }

      commonLoginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in...`;
      const res = await window.dbConnector.login({ identifier, password });
      commonLoginBtn.innerHTML = `<i class="fa-solid fa-sign-in-alt"></i> Login`;

      if (res.success) {
        if (res.user.role === 'admin') {
          showAuthAlert(`Admin Access Verified! Redirecting to Operations Dashboard...`, 'success');
          setTimeout(() => {
            location.href = 'admin.html';
          }, 800);
        } else {
          showAuthAlert(`Welcome back, ${res.user.name}!`, 'success');
          setTimeout(() => {
            closeAuthModal();
            updateNavAuthUI();
            if (window.pendingBookingAction) {
              window.pendingBookingAction = false;
              openBookingModal();
            }
          }, 700);
        }
      } else {
        showAuthAlert(res.message, 'danger');
      }
    });
  }

  // 2. Customer Register Submit (Checks if already exists)
  const custRegBtn = document.getElementById('custRegSubmitBtn');
  if (custRegBtn) {
    custRegBtn.addEventListener('click', async () => {
      const name = document.getElementById('regCustName').value.trim();
      const phone = document.getElementById('regCustPhone').value.trim();
      const email = document.getElementById('regCustEmail').value.trim();
      const password = document.getElementById('regCustPassword').value.trim();

      if (!name || !phone || !password) {
        return showAuthAlert('Name, mobile number, and password are required.', 'danger');
      }

      custRegBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering Customer...`;
      const res = await window.dbConnector.register({
        role: 'customer',
        name,
        phone,
        email,
        password
      });
      custRegBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Register as Customer`;

      if (res.success) {
        showAuthAlert(`Welcome to Shree Royal Salon, ${name}! Registered successfully.`, 'success');
        setTimeout(() => {
          closeAuthModal();
          updateNavAuthUI();
          if (window.pendingBookingAction) {
            window.pendingBookingAction = false;
            openBookingModal();
          }
        }, 800);
      } else {
        showAuthAlert(res.message, 'danger');
      }
    });
  }

  // 3. Admin Register Submit (Checks if already exists)
  const adminRegBtn = document.getElementById('adminRegSubmitBtn');
  if (adminRegBtn) {
    adminRegBtn.addEventListener('click', async () => {
      const username = document.getElementById('regAdminUsername').value.trim();
      const fullName = document.getElementById('regAdminFullName').value.trim();
      const email = document.getElementById('regAdminEmail').value.trim();
      const password = document.getElementById('regAdminPassword').value.trim();

      if (!username || !password) {
        return showAuthAlert('Username and password are required for admin registration.', 'danger');
      }

      adminRegBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering Admin...`;
      const res = await window.dbConnector.register({
        role: 'admin',
        username,
        full_name: fullName,
        email,
        password
      });
      adminRegBtn.innerHTML = `<i class="fa-solid fa-shield-alt"></i> Register as Salon Admin`;

      if (res.success) {
        showAuthAlert('Admin account created successfully! Redirecting to Dashboard...', 'success');
        setTimeout(() => {
          location.href = 'admin.html';
        }, 900);
      } else {
        showAuthAlert(res.message, 'danger');
      }
    });
  }
}

function openAuthModal(mode = 'login', alertMsg = null) {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.style.display = 'flex';
  if (typeof window.setAuthMode === 'function') {
    window.setAuthMode(mode);
  }
  if (alertMsg) {
    showAuthAlert(alertMsg, 'warning');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
  clearAuthAlert();
}

function showAuthAlert(msg, type) {
  const box = document.getElementById('authAlertBox');
  if (!box) return;
  box.style.display = 'block';
  box.className = type === 'success' ? 'badge badge-success' : type === 'warning' ? 'badge badge-warning' : 'badge badge-danger';
  box.style.width = '100%';
  box.style.padding = '10px 14px';
  box.style.justifyContent = 'center';
  box.innerText = msg;
}

function clearAuthAlert() {
  const box = document.getElementById('authAlertBox');
  if (box) box.style.display = 'none';
}

function updateNavAuthUI() {
  const container = document.getElementById('navAuthSection');
  if (!container) return;

  const user = window.dbConnector.getCurrentUser();
  if (user) {
    if (user.role === 'admin') {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-primary"><i class="fa-solid fa-shield-alt"></i> Admin: ${user.full_name || user.username}</span>
          <button class="btn btn-secondary btn-sm" onclick="location.href='admin.html'"><i class="fa-solid fa-gauge-high"></i> Dashboard</button>
          <button class="btn btn-secondary btn-sm" onclick="logoutUser()" title="Logout"><i class="fa-solid fa-sign-out-alt"></i></button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-primary"><i class="fa-solid fa-user"></i> ${user.name}</span>
          <button class="btn btn-secondary btn-sm" id="openMyBookingsBtn"><i class="fa-solid fa-calendar-days"></i> My Bookings</button>
          <button class="btn btn-secondary btn-sm" onclick="logoutUser()" title="Logout"><i class="fa-solid fa-sign-out-alt"></i></button>
        </div>
      `;
      const myBookingsBtn = document.getElementById('openMyBookingsBtn');
      if (myBookingsBtn) myBookingsBtn.addEventListener('click', openMyBookingsModal);
    }
  } else {
    // Single clean option when not logged in
    container.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="openAuthModalBtn"><i class="fa-solid fa-user-circle"></i> Login / Register</button>
    `;
    const openAuthBtn = document.getElementById('openAuthModalBtn');
    if (openAuthBtn) openAuthBtn.addEventListener('click', () => openAuthModal('login'));
  }
}

window.logoutUser = function() {
  window.dbConnector.logout();
  updateNavAuthUI();
  alert('You have logged out.');
};

// ==========================================
// MY BOOKINGS MODAL
// ==========================================
function setupMyBookingsUI() {
  const closeBtn = document.getElementById('closeMyBookingsModalBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeMyBookingsModal);
}

function openMyBookingsModal() {
  const modal = document.getElementById('myBookingsModal');
  const user = window.dbConnector.getCurrentUser();
  if (!modal || !user || !user.phone) return;

  modal.style.display = 'flex';
  loadCustomerBookings(user.phone);
}

function closeMyBookingsModal() {
  const modal = document.getElementById('myBookingsModal');
  if (modal) modal.style.display = 'none';
}

async function loadCustomerBookings(phone) {
  const list = document.getElementById('myBookingsList');
  if (!list) return;

  list.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Loading your bookings...</div>`;
  const apps = await window.dbConnector.getCustomerAppointments(phone);

  if (apps.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-calendar-xmark" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--primary);"></i>
        <p>No appointments found under phone: <strong>${phone}</strong></p>
        <button class="btn btn-primary btn-sm" style="margin-top: 14px;" onclick="closeMyBookingsModal(); openBookingModal();">Book Appointment Now</button>
      </div>
    `;
    return;
  }

  list.innerHTML = apps.map(a => `
    <div style="background: var(--bg-surface-soft); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 18px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <strong style="color: var(--primary); font-size: 1.1rem; font-family: var(--font-heading);">#${a.ref_code}</strong>
          <span class="badge ${a.status === 'Confirmed' ? 'badge-success' : a.status === 'Completed' ? 'badge-primary' : 'badge-warning'}">${a.status}</span>
          <span class="badge ${a.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}">${a.payment_status}</span>
        </div>
        <h4 style="color: var(--text-main); font-size: 1.05rem; margin-bottom: 4px;">${a.service_name}</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem;"><i class="fa-regular fa-calendar"></i> ${a.appointment_date} at ${a.appointment_time} | Stylist: <strong>${a.stylist_name || 'Staff'}</strong></p>
      </div>
      <div style="text-align: right;">
        <span style="display: block; font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">₹${parseFloat(a.total_price).toFixed(2)}</span>
        <button class="btn btn-secondary btn-sm" onclick="printBookingTicket('${a.ref_code}')"><i class="fa-solid fa-print"></i> Print Slip</button>
      </div>
    </div>
  `).join('');
}

window.printBookingTicket = async function(refCode) {
  const app = await window.dbConnector.findAppointment(refCode);
  if (app) {
    closeMyBookingsModal();
    openBookingModal();
    goToWizardStep(5);
    renderConfirmationTicket(app.ref_code);
  }
};

// ==========================================
// 1. SERVICES CATALOG & CATEGORIES
// ==========================================
let allServices = [];

async function loadCategoriesAndServices() {
  const tabsContainer = document.getElementById('categoryTabs');
  const servicesGrid = document.getElementById('servicesGrid');
  if (!servicesGrid) return;

  const categories = await window.dbConnector.getCategories();
  allServices = await window.dbConnector.getServices();

  // Render Tabs
  if (tabsContainer) {
    tabsContainer.innerHTML = `
      <button class="cat-tab active" data-cat="all">All Services</button>
      ${categories.map(c => `<button class="cat-tab" data-cat="${c.id}">${c.name}</button>`).join('')}
    `;

    tabsContainer.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabsContainer.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const catId = e.target.getAttribute('data-cat');
        renderServices(catId);
      });
    });
  }

  renderServices('all');
}

function renderServices(catId) {
  const servicesGrid = document.getElementById('servicesGrid');
  if (!servicesGrid) return;

  let filtered = allServices;
  if (catId !== 'all') {
    filtered = allServices.filter(s => s.category_id == catId);
  }

  if (filtered.length === 0) {
    servicesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">No services available in this category.</div>`;
    return;
  }

  servicesGrid.innerHTML = filtered.map(s => `
    <div class="service-card">
      <div class="service-img-wrap">
        <img src="${s.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'}" alt="${s.name}" loading="lazy" />
        <span class="service-price-badge">₹${parseFloat(s.price).toFixed(2)}</span>
      </div>
      <div class="service-info">
        <h3 class="service-title">${s.name}</h3>
        <p class="service-desc">${s.description || 'Premium salon treatment crafted by our experienced specialists.'}</p>
        <div class="service-footer">
          <span class="service-duration"><i class="fa-regular fa-clock"></i> ${s.duration_mins} Mins</span>
          <button class="btn btn-primary btn-sm book-service-btn" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}">
            Book Now <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Bind Service Card "Book Now" Buttons
  servicesGrid.querySelectorAll('.book-service-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');
      const price = e.currentTarget.getAttribute('data-price');

      bookingState.service_id = id;
      bookingState.service_name = name;
      bookingState.service_price = price;

      const activeUser = window.dbConnector.getCurrentUser();
      if (!activeUser) {
        window.pendingBookingAction = true;
        openAuthModal('login', `Please login or register to book ${name}.`);
        return;
      }

      openBookingModal();
      goToWizardStep(2); // Jump straight to stylist selection
    });
  });
}

// ==========================================
// 2. STYLISTS DIRECTORY
// ==========================================
async function loadStylists() {
  const grid = document.getElementById('stylistsGrid');
  if (!grid) return;

  const stylists = await window.dbConnector.getStylists();

  grid.innerHTML = stylists.map(st => `
    <div class="stylist-card">
      <div class="stylist-avatar">
        <img src="${st.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}" alt="${st.name}" />
      </div>
      <h4 class="stylist-name">${st.name}</h4>
      <p class="stylist-title">${st.title}</p>
      <div class="stylist-rating">
        <i class="fa-solid fa-star"></i> ${st.rating || 5.0} Rating
      </div>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 20px;">${st.bio || 'Expert in Indian hair textures, skin rejuvenation, and bespoke grooming.'}</p>
      <button class="btn btn-outline btn-sm select-stylist-btn" data-id="${st.id}" data-name="${st.name}">
        Select Stylist
      </button>
    </div>
  `).join('');

  grid.querySelectorAll('.select-stylist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');

      bookingState.stylist_id = id;
      bookingState.stylist_name = name;

      const activeUser = window.dbConnector.getCurrentUser();
      if (!activeUser) {
        window.pendingBookingAction = true;
        openAuthModal('login', `Please login or register to book with ${name}.`);
        return;
      }

      openBookingModal();
      goToWizardStep(1); // Select service first
    });
  });
}

// ==========================================
// 3. BOOKING WIZARD
// ==========================================
window.openBookingModal = function() {
  const activeUser = window.dbConnector.getCurrentUser();
  if (!activeUser) {
    window.pendingBookingAction = true;
    openAuthModal('login', 'Please login or register before booking an appointment.');
    return;
  }

  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'flex';
    goToWizardStep(bookingState.step || 1);
  }
};

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.style.display = 'none';
}

function setupBookingWizard() {
  const closeBtn = document.getElementById('closeBookingModalBtn');
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');
  const dateInput = document.getElementById('bookDate');

  if (closeBtn) closeBtn.addEventListener('click', closeBookingModal);

  // Set default appointment date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    bookingState.appointment_date = today;
    dateInput.addEventListener('change', (e) => {
      bookingState.appointment_date = e.target.value;
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (bookingState.step > 1) goToWizardStep(bookingState.step - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (validateCurrentStep()) {
        if (bookingState.step < 4) {
          goToWizardStep(bookingState.step + 1);
        } else if (bookingState.step === 4) {
          await submitAppointmentBooking();
        }
      }
    });
  }
}

function goToWizardStep(stepNum) {
  bookingState.step = stepNum;

  // Update indicators
  for (let i = 1; i <= 5; i++) {
    const ind = document.getElementById(`stepIndicator${i}`);
    if (ind) ind.classList.toggle('active', i === stepNum);

    const content = document.getElementById(`wizardStepContent${i}`);
    if (content) content.style.display = (i === stepNum) ? 'block' : 'none';
  }

  // Populate data per step
  if (stepNum === 1) renderWizardServicesList();
  if (stepNum === 2) renderWizardStylistsList();
  if (stepNum === 3) renderTimeSlots();

  // Pre-fill user data if logged in
  if (stepNum === 4) {
    const user = window.dbConnector.getCurrentUser();
    if (user && user.role === 'customer') {
      const nameInput = document.getElementById('custName');
      const phoneInput = document.getElementById('custPhone');
      const emailInput = document.getElementById('custEmail');
      if (nameInput && !nameInput.value) nameInput.value = user.name || '';
      if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
      if (emailInput && !emailInput.value) emailInput.value = user.email || '';
    }
    renderBookingSummary();
  }

  // Control Buttons
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');

  if (prevBtn) prevBtn.style.display = (stepNum > 1 && stepNum < 5) ? 'inline-flex' : 'none';

  if (nextBtn) {
    if (stepNum === 4) {
      nextBtn.innerHTML = `Confirm & Book Appointment <i class="fa-solid fa-check-circle"></i>`;
      nextBtn.style.display = 'inline-flex';
    } else if (stepNum === 5) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.innerHTML = `Next Step <i class="fa-solid fa-arrow-right"></i>`;
      nextBtn.style.display = 'inline-flex';
    }
  }
}

function renderWizardServicesList() {
  const container = document.getElementById('wizardServicesList');
  if (!container) return;

  container.innerHTML = allServices.map(s => `
    <div class="service-select-item ${bookingState.service_id == s.id ? 'selected' : ''}" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}" style="padding: 14px; background: #FFFFFF; border: 1px solid ${bookingState.service_id == s.id ? 'var(--primary)' : 'var(--border-medium)'}; border-radius: 10px; margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: 0.2s;">
      <div>
        <strong style="color: var(--text-main); display: block;">${s.name}</strong>
        <span style="font-size: 0.85rem; color: var(--text-muted);">${s.duration_mins} mins</span>
      </div>
      <span style="font-weight: 700; color: var(--primary); font-size: 1.05rem;">₹${parseFloat(s.price).toFixed(2)}</span>
    </div>
  `).join('');

  container.querySelectorAll('.service-select-item').forEach(item => {
    item.addEventListener('click', (e) => {
      container.querySelectorAll('.service-select-item').forEach(i => i.style.borderColor = 'var(--border-medium)');
      item.style.borderColor = 'var(--primary)';
      item.style.background = 'var(--primary-light)';
      bookingState.service_id = item.getAttribute('data-id');
      bookingState.service_name = item.getAttribute('data-name');
      bookingState.service_price = item.getAttribute('data-price');
    });
  });
}

async function renderWizardStylistsList() {
  const container = document.getElementById('wizardStylistsList');
  if (!container) return;

  const stylists = await window.dbConnector.getStylists();

  container.innerHTML = `
    <div class="stylist-select-item ${!bookingState.stylist_id ? 'selected' : ''}" data-id="" data-name="Any Available Stylist" style="padding: 14px; background: #FFFFFF; border: 1px solid ${!bookingState.stylist_id ? 'var(--primary)' : 'var(--border-medium)'}; border-radius: 10px; margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; color: var(--primary-hover); font-size: 1.1rem;">
        <i class="fa-solid fa-users"></i>
      </div>
      <div>
        <strong style="color: var(--text-main); display: block;">Any Available Stylist</strong>
        <span style="font-size: 0.85rem; color: var(--text-muted);">Assign best available specialist</span>
      </div>
    </div>
    ${stylists.map(st => `
      <div class="stylist-select-item ${bookingState.stylist_id == st.id ? 'selected' : ''}" data-id="${st.id}" data-name="${st.name}" style="padding: 14px; background: #FFFFFF; border: 1px solid ${bookingState.stylist_id == st.id ? 'var(--primary)' : 'var(--border-medium)'}; border-radius: 10px; margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
        <img src="${st.avatar_url}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
        <div>
          <strong style="color: var(--text-main); display: block;">${st.name}</strong>
          <span style="font-size: 0.85rem; color: var(--primary);">${st.title}</span>
        </div>
      </div>
    `).join('')}
  `;

  container.querySelectorAll('.stylist-select-item').forEach(item => {
    item.addEventListener('click', (e) => {
      container.querySelectorAll('.stylist-select-item').forEach(i => i.style.borderColor = 'var(--border-medium)');
      item.style.borderColor = 'var(--primary)';
      bookingState.stylist_id = item.getAttribute('data-id');
      bookingState.stylist_name = item.getAttribute('data-name');
    });
  });
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlotsGrid');
  if (!container) return;

  const slots = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM', '07:30 PM'];

  container.innerHTML = slots.map(slot => `
    <button class="time-slot ${bookingState.appointment_time === slot ? 'selected' : ''}" data-slot="${slot}">${slot}</button>
  `).join('');

  container.querySelectorAll('.time-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      bookingState.appointment_time = e.currentTarget.getAttribute('data-slot');
    });
  });
}

function validateCurrentStep() {
  if (bookingState.step === 1) {
    if (!bookingState.service_id) {
      alert('Please select a salon service before proceeding.');
      return false;
    }
  } else if (bookingState.step === 3) {
    if (!bookingState.appointment_date || !bookingState.appointment_time) {
      alert('Please choose an appointment date and available time slot.');
      return false;
    }
  } else if (bookingState.step === 4) {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();

    if (!name || !phone) {
      alert('Please enter your Name and Mobile Number (+91).');
      return false;
    }

    bookingState.customer_name = name;
    bookingState.customer_phone = phone;
    bookingState.customer_email = email;
    bookingState.notes = document.getElementById('custNotes').value.trim();
  }
  return true;
}

function renderBookingSummary() {
  const container = document.getElementById('bookingSummaryBox');
  if (!container) return;

  container.innerHTML = `
    <div style="background: var(--bg-surface-soft); border: 1px solid var(--border-medium); border-radius: var(--radius-md); padding: 18px; margin-top: 15px;">
      <h4 style="color: var(--text-main); margin-bottom: 10px; font-family: var(--font-heading);">Booking Summary</h4>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 4px;"><strong>Service:</strong> ${bookingState.service_name} (₹${parseFloat(bookingState.service_price).toFixed(2)})</p>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 4px;"><strong>Stylist:</strong> ${bookingState.stylist_name}</p>
      <p style="color: var(--text-muted); font-size: 0.9rem;"><strong>Date & Time:</strong> ${bookingState.appointment_date} at ${bookingState.appointment_time}</p>
    </div>
  `;
}

async function submitAppointmentBooking() {
  const activeUser = window.dbConnector.getCurrentUser();
  if (!activeUser) {
    alert('You must be logged in to confirm an appointment booking.');
    closeBookingModal();
    openAuthModal('login', 'Please login or register to complete your appointment booking.');
    return;
  }

  const res = await window.dbConnector.createAppointment(bookingState);

  if (res && res.ref_code) {
    goToWizardStep(5);
    renderConfirmationTicket(res.ref_code);
  } else {
    alert('Booking error. Please check your information and try again.');
  }
}

function renderConfirmationTicket(refCode) {
  const container = document.getElementById('confirmationTicketBox');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--success-light); color: var(--success); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 16px; border: 1px solid #C4E8CD;">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3 style="font-family: var(--font-heading); color: var(--text-main); font-size: 1.7rem; margin-bottom: 6px;">Appointment Confirmed!</h3>
      <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 20px;">Your reservation is saved. Present this reference code or your mobile number on arrival.</p>

      <div style="background: var(--bg-surface-soft); border: 2px dashed var(--primary); border-radius: var(--radius-md); padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
        <span style="font-size: 0.8rem; color: var(--text-muted); display: block; text-transform: uppercase; letter-spacing: 0.05em;">Booking Reference Code</span>
        <strong style="font-family: var(--font-heading); font-size: 2.2rem; color: var(--primary); letter-spacing: 0.05em;">${refCode}</strong>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">Total Amount: <strong style="color: var(--text-main);">₹${parseFloat(bookingState.service_price).toFixed(2)}</strong> (Pay at salon via UPI / Cash)</p>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Ticket</button>
        <button class="btn btn-primary" onclick="location.reload()">Done</button>
      </div>
    </div>
  `;
}

// ==========================================
// 4. APPOINTMENT TRACKER
// ==========================================
function setupTracker() {
  const searchBtn = document.getElementById('searchAppointmentBtn');
  const input = document.getElementById('trackerRefInput');
  const resultBox = document.getElementById('trackerResultBox');

  if (searchBtn && input) {
    searchBtn.addEventListener('click', async () => {
      const code = input.value.trim();
      if (!code) return alert('Enter your Reference Code (e.g., SLN-8921) or Mobile Number.');

      searchBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking...`;
      const app = await window.dbConnector.findAppointment(code);
      searchBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Track`;

      if (app) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div class="glass-panel" style="padding: 24px; margin-top: 20px; border-left: 4px solid var(--primary);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h4 style="color: var(--text-main); font-family: var(--font-heading); font-size: 1.3rem;">Appointment #${app.ref_code}</h4>
              <span class="badge ${app.status === 'Confirmed' ? 'badge-success' : app.status === 'Completed' ? 'badge-primary' : 'badge-warning'}">${app.status}</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 6px;"><strong>Customer:</strong> ${app.customer_name} (${app.customer_phone})</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 6px;"><strong>Service:</strong> ${app.service_name}</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 6px;"><strong>Stylist:</strong> ${app.stylist_name || 'Any Available Stylist'}</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 6px;"><strong>Date & Time:</strong> ${app.appointment_date} at ${app.appointment_time}</p>
            <p style="color: var(--text-muted); font-size: 0.9rem;"><strong>Total Price:</strong> <span style="color: var(--primary); font-weight:700;">₹${parseFloat(app.total_price).toFixed(2)}</span> (${app.payment_status})</p>
          </div>
        `;
      } else {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--danger); background: var(--danger-light); border-radius: 10px; margin-top: 20px; border: 1px solid #F5C6C6;">No appointment found for Reference Code / Mobile: "${code}"</div>`;
      }
    });
  }
}

// ==========================================
// 5. REVIEWS & TESTIMONIALS
// ==========================================
async function loadReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  const reviews = await window.dbConnector.getReviews();

  grid.innerHTML = reviews.map(r => `
    <div class="glass-panel" style="padding: 24px; position: relative;">
      <div style="display: flex; align-items: center; gap: 4px; color: var(--primary); margin-bottom: 12px;">
        ${'<i class="fa-solid fa-star"></i>'.repeat(r.rating || 5)}
      </div>
      <p style="color: var(--text-main); font-style: italic; font-size: 0.95rem; margin-bottom: 16px;">"${r.comment}"</p>
      <div>
        <strong style="color: var(--text-main); display: block; font-family: var(--font-heading); font-size: 1.05rem;">${r.customer_name}</strong>
        <span style="font-size: 0.8rem; color: var(--primary-hover); font-weight: 600;">${r.service_name || 'Salon Guest'}</span>
      </div>
    </div>
  `).join('');
}

function setupReviewModal() {
  const submitBtn = document.getElementById('submitReviewBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const name = document.getElementById('revName').value.trim();
      const comment = document.getElementById('revComment').value.trim();
      const rating = parseInt(document.getElementById('revRating').value);

      if (!name || !comment) return alert('Please enter your name and review comments.');

      await window.dbConnector.addReview({ customer_name: name, rating, comment, service_name: 'Verified Guest' });
      alert('Dhanyawad! Your review has been submitted.');
      document.getElementById('revName').value = '';
      document.getElementById('revComment').value = '';
      await loadReviews();
    });
  }
}
