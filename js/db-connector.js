/* ==========================================================================
   DB CONNECTOR LAYER (js/db-connector.js)
   Connects to the Java + JDBC REST API backend (/api/*)
   with Authentication, Registration, and Offline fallback data.
   ========================================================================== */

const API_BASE = '/api';

// Indian Salon Mock Categories
const MOCK_CATEGORIES = [
  { id: 1, name: 'Hair Care & Precision Cuts', icon: 'scissors' },
  { id: 2, name: 'Color, Streaks & Hair Spa', icon: 'palette' },
  { id: 3, name: 'Skin Care, D-Tan & Facials', icon: 'sparkles' },
  { id: 4, name: 'Beard & Men\'s Grooming', icon: 'user-check' },
  { id: 5, name: 'Bridal, Nail Art & Makeover', icon: 'hand' }
];

// Indian Salon Mock Services (Prices in INR ₹)
const MOCK_SERVICES = [
  { id: 1, category_id: 1, category_name: 'Hair Care & Precision Cuts', name: 'Executive Haircut & Styling', description: 'Custom face-shape haircut with clarifying hair wash, soothing scalp massage, and blow-dry finish.', duration_mins: 40, price: 250.00, image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 2, category_id: 1, category_name: 'Hair Care & Precision Cuts', name: 'Ayurvedic Herbal Hair Spa & Champi', description: 'Traditional warm herbal oil champi massage with steam therapy and nourishing hair mask.', duration_mins: 50, price: 650.00, image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 3, category_id: 2, category_name: 'Color, Streaks & Hair Spa', name: 'Global Color & Highlights (Balayage)', description: 'Premium ammonia-free color with custom high-contrast streaks and gloss locking serum.', duration_mins: 120, price: 1800.00, image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 4, category_id: 2, category_name: 'Color, Streaks & Hair Spa', name: 'Organic Root Touch-Up', description: 'Seamless grey coverage root touch-up with ammonia-free herbal enriched formulation.', duration_mins: 45, price: 750.00, image_url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 5, category_id: 3, category_name: 'Skin Care, D-Tan & Facials', name: 'O3+ Brightening & D-Tan Facial', description: 'Deep pore cleansing, multi-active tan removal scrub, brightening mask, and serum boost.', duration_mins: 60, price: 950.00, image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 6, category_id: 3, category_name: 'Skin Care, D-Tan & Facials', name: 'Gold Radiance Glow Facial', description: 'Luxury 24K gold foil facial massage for instant skin rejuvenation, glow, and elasticity.', duration_mins: 75, price: 1450.00, image_url: 'https://images.unsplash.com/photo-1512290900673-700207402636?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 7, category_id: 4, category_name: 'Beard & Men\'s Grooming', name: 'Royal Hot Towel Shave & Beard Styling', description: 'Steam hot towel prep, precision straight razor beard lining, and cooling sandalwood aftershave.', duration_mins: 35, price: 350.00, image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 8, category_id: 4, category_name: 'Beard & Men\'s Grooming', name: 'Beard Sculpt & Charcoal Detox Face Mask', description: 'Detailed beard fade shaping accompanied by an activated charcoal blackhead peel mask.', duration_mins: 45, price: 550.00, image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 9, category_id: 5, category_name: 'Bridal, Nail Art & Makeover', name: 'Luxury Gel Nail Art & Manicure', description: 'Cuticle maintenance, hand exfoliation scrub, durable gel polish, and custom nail art.', duration_mins: 60, price: 850.00, image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', status: 'Active' },
  { id: 10, category_id: 5, category_name: 'Bridal, Nail Art & Makeover', name: 'Royal Pedicure & Foot Reflexology', description: 'Warm herbal water foot soak, dead skin exfoliation, paraffin wax therapy, and foot massage.', duration_mins: 60, price: 750.00, image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80', status: 'Active' }
];

// Indian Stylists Directory
const MOCK_STYLISTS = [
  { id: 1, name: 'Rajesh Sharma', title: 'Master Hair Stylist & Creative Director', bio: '12+ years expertise in precision haircuts, modern fades, and bridal hair couture.', email: 'rajesh.sharma@salon.in', phone: '+91 98231 45678', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', rating: 4.95, status: 'Active' },
  { id: 2, name: 'Priya Patel', title: 'Senior Skin Aesthetician & Bridal Makeup Artist', bio: 'Certified cosmetologist specializing in D-Tan treatments, hydra facials, and wedding makeovers.', email: 'priya.patel@salon.in', phone: '+91 98452 78901', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', rating: 4.92, status: 'Active' },
  { id: 3, name: 'Amit Verma', title: 'Lead Barber & Beard Grooming Specialist', bio: 'Renowned for sharp razor finishes, beard fading, and traditional hot towel grooming rituals.', email: 'amit.verma@salon.in', phone: '+91 97123 34567', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', rating: 4.88, status: 'Active' },
  { id: 4, name: 'Sunita Roy', title: 'Nail Art Specialist & Hair Spa Therapist', bio: 'Expert in gel nail architecture, cuticle aesthetics, and deeply relaxing Ayurvedic head massage.', email: 'sunita.roy@salon.in', phone: '+91 98980 12345', avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', rating: 4.90, status: 'Active' }
];

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '9876543210', password: '123456', total_visits: 4 },
  { id: 2, name: 'Ananya Iyer', email: 'ananya.iyer@gmail.com', phone: '9765432109', password: '123456', total_visits: 6 },
  { id: 3, name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '9654321098', password: '123456', total_visits: 2 }
];

const MOCK_ADMINS = [
  { id: 1, username: 'admin', password: 'admin123', full_name: 'Salon Manager', email: 'admin@salon.in', role: 'Admin' }
];

const MOCK_APPOINTMENTS = [
  { id: 1, ref_code: 'SLN-8921', customer_name: 'Rahul Sharma', customer_email: 'rahul.sharma@gmail.com', customer_phone: '9876543210', stylist_id: 1, stylist_name: 'Rajesh Sharma', service_id: 1, service_name: 'Executive Haircut & Styling', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '10:30', status: 'Confirmed', notes: 'Executive haircut with side fade styling.', total_price: 250.00, payment_status: 'Paid' },
  { id: 2, ref_code: 'SLN-8922', customer_name: 'Ananya Iyer', customer_email: 'ananya.iyer@gmail.com', customer_phone: '9765432109', stylist_id: 2, stylist_name: 'Priya Patel', service_id: 5, service_name: 'O3+ Brightening & D-Tan Facial', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '12:00', status: 'In-Progress', notes: 'O3+ D-Tan treatment before family function.', total_price: 950.00, payment_status: 'Paid' },
  { id: 3, ref_code: 'SLN-8923', customer_name: 'Vikram Malhotra', customer_email: 'vikram.m@gmail.com', customer_phone: '9654321098', stylist_id: 3, stylist_name: 'Amit Verma', service_id: 7, service_name: 'Royal Hot Towel Shave & Beard Styling', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '15:30', status: 'Pending', notes: 'Beard trim and traditional hot towel shave.', total_price: 350.00, payment_status: 'Unpaid' }
];

const MOCK_REVIEWS = [
  { id: 1, customer_name: 'Rohit Deshmukh', rating: 5, comment: 'Rajesh bhaiya gave me the sharpest haircut and fade I have ever had! The scalp massage was so relaxing.', service_name: 'Executive Haircut & Styling' },
  { id: 2, customer_name: 'Meera Nair', rating: 5, comment: 'Priya did a fantastic job with my O3+ D-Tan facial. My skin looked glowing and fresh for the wedding reception.', service_name: 'O3+ Brightening & D-Tan Facial' },
  { id: 3, customer_name: 'Karan Grover', rating: 5, comment: 'Amit is a master with the straight razor. Best hot towel shave experience in town. UPI payment was quick and smooth.', service_name: 'Royal Hot Towel Shave & Beard Styling' }
];

class DbConnector {
  constructor() {
    this.useApi = false;
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem('salon_services')) {
      localStorage.setItem('salon_services', JSON.stringify(MOCK_SERVICES));
    }
    if (!localStorage.getItem('salon_stylists')) {
      localStorage.setItem('salon_stylists', JSON.stringify(MOCK_STYLISTS));
    }
    if (!localStorage.getItem('salon_appointments')) {
      localStorage.setItem('salon_appointments', JSON.stringify(MOCK_APPOINTMENTS));
    }
    if (!localStorage.getItem('salon_reviews')) {
      localStorage.setItem('salon_reviews', JSON.stringify(MOCK_REVIEWS));
    }
    if (!localStorage.getItem('salon_customers')) {
      localStorage.setItem('salon_customers', JSON.stringify(MOCK_CUSTOMERS));
    }
    if (!localStorage.getItem('salon_admins')) {
      localStorage.setItem('salon_admins', JSON.stringify(MOCK_ADMINS));
    }
  }

  async checkBackendHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        this.useApi = data.database && data.database.connected;
        return data;
      }
    } catch (e) {
      this.useApi = false;
    }
    return { status: 'offline', database: { connected: false, message: 'Browser LocalStorage Standalone Mode' } };
  }

  // ==========================================
  // AUTHENTICATION (Login & Register)
  // ==========================================
  getCurrentUser() {
    const raw = localStorage.getItem('salon_active_user');
    return raw ? JSON.parse(raw) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('salon_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('salon_active_user');
    }
  }

  logout() {
    this.setCurrentUser(null);
  }

  async login(credentials) {
    // credentials: { role: 'admin'|'customer'|'auto', username, phone, identifier, password }
    const targetId = (credentials.identifier || credentials.phone || credentials.username || '').trim();
    const targetPass = credentials.password || '';

    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...credentials, identifier: targetId })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const userObj = { ...data.user, role: data.role };
          this.setCurrentUser(userObj);
          return { success: true, user: userObj, message: data.message };
        }
        return { success: false, message: data.error || data.message || 'Invalid credentials' };
      } catch (e) {}
    }

    // LocalStorage Fallback with existence checking
    const admins = JSON.parse(localStorage.getItem('salon_admins') || '[]');
    const customers = JSON.parse(localStorage.getItem('salon_customers') || '[]');

    // 1. Check if identifier is an Admin (Common portal admin login)
    const adminMatch = admins.find(a => a.username.toLowerCase() === targetId.toLowerCase());
    if (adminMatch) {
      if (adminMatch.password === targetPass) {
        const userObj = { id: adminMatch.id, username: adminMatch.username, full_name: adminMatch.full_name, role: 'admin' };
        this.setCurrentUser(userObj);
        return { success: true, user: userObj, message: 'Admin login successful' };
      } else {
        return { success: false, message: 'Incorrect admin password. Please try again.' };
      }
    }

    // 2. If explicit admin login requested but not found
    if (credentials.role === 'admin') {
      return { success: false, message: `Admin account '${targetId}' does not exist. Please register first.` };
    }

    // 3. Check Customer existence
    const customerMatch = customers.find(c => c.phone === targetId || (c.email && c.email.toLowerCase() === targetId.toLowerCase()));
    if (!customerMatch) {
      return { success: false, message: `No account found with mobile/email '${targetId}'. Please register first.` };
    }

    // 4. Verify Customer Password
    if (customerMatch.password === targetPass || !customerMatch.password) {
      const userObj = { id: customerMatch.id, name: customerMatch.name, phone: customerMatch.phone, email: customerMatch.email, role: 'customer' };
      this.setCurrentUser(userObj);
      return { success: true, user: userObj, message: 'Customer login successful' };
    } else {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
  }

  async register(data) {
    // data: { role: 'admin'|'customer', name, phone, email, username, full_name, password }
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const resp = await res.json();
        if (res.ok && resp.success) {
          const userObj = { ...resp.user, role: resp.role };
          this.setCurrentUser(userObj);
          return { success: true, user: userObj, message: resp.message };
        }
        return { success: false, message: resp.error || resp.message || 'Registration failed' };
      } catch (e) {}
    }

    // LocalStorage Fallback with existence checking
    const role = (data.role || 'customer').toLowerCase();
    if (role === 'admin') {
      const admins = JSON.parse(localStorage.getItem('salon_admins') || '[]');
      if (admins.some(a => a.username.toLowerCase() === data.username.trim().toLowerCase())) {
        return { success: false, message: `Admin username '${data.username}' is already registered. Please login instead.` };
      }
      const newAdmin = {
        id: Date.now(),
        username: data.username.trim(),
        password: data.password,
        full_name: data.full_name || 'Admin',
        email: data.email || '',
        role: 'admin'
      };
      admins.push(newAdmin);
      localStorage.setItem('salon_admins', JSON.stringify(admins));
      this.setCurrentUser(newAdmin);
      return { success: true, user: newAdmin, message: 'Admin account created successfully' };
    } else {
      const customers = JSON.parse(localStorage.getItem('salon_customers') || '[]');
      const phoneExists = customers.some(c => c.phone === data.phone.trim());
      if (phoneExists) {
        return { success: false, message: `An account with mobile number ${data.phone} already exists. Please login instead.` };
      }
      if (data.email && data.email.trim()) {
        const emailExists = customers.some(c => c.email && c.email.toLowerCase() === data.email.trim().toLowerCase());
        if (emailExists) {
          return { success: false, message: `An account with email ${data.email} already exists. Please login instead.` };
        }
      }

      const newCust = {
        id: Date.now(),
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email || '',
        password: data.password,
        total_visits: 1
      };
      customers.push(newCust);
      localStorage.setItem('salon_customers', JSON.stringify(customers));
      const userObj = { id: newCust.id, name: newCust.name, phone: newCust.phone, email: newCust.email, role: 'customer' };
      this.setCurrentUser(userObj);
      return { success: true, user: userObj, message: 'Customer registered successfully' };
    }
  }

  async getCustomerAppointments(phone) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/customer/appointments?phone=${encodeURIComponent(phone)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const apps = JSON.parse(localStorage.getItem('salon_appointments') || '[]');
    return apps.filter(a => a.customer_phone === phone);
  }

  // Categories
  async getCategories() {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return MOCK_CATEGORIES;
  }

  // Services
  async getServices() {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/services`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return JSON.parse(localStorage.getItem('salon_services') || '[]');
  }

  async createService(serviceData) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const services = JSON.parse(localStorage.getItem('salon_services') || '[]');
    const newService = {
      id: Date.now(),
      category_name: 'Hair Care & Precision Cuts',
      status: 'Active',
      ...serviceData
    };
    services.unshift(newService);
    localStorage.setItem('salon_services', JSON.stringify(services));
    return { id: newService.id, message: 'Service created' };
  }

  async updateService(id, serviceData) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    let services = JSON.parse(localStorage.getItem('salon_services') || '[]');
    const idx = services.findIndex(s => s.id == id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...serviceData };
      localStorage.setItem('salon_services', JSON.stringify(services));
    }
    return { message: 'Service updated' };
  }

  async deleteService(id) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    let services = JSON.parse(localStorage.getItem('salon_services') || '[]');
    services = services.filter(s => s.id != id);
    localStorage.setItem('salon_services', JSON.stringify(services));
    return { message: 'Service deleted' };
  }

  // Stylists
  async getStylists() {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/stylists`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return JSON.parse(localStorage.getItem('salon_stylists') || '[]');
  }

  async createStylist(stylistData) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/stylists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stylistData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const stylists = JSON.parse(localStorage.getItem('salon_stylists') || '[]');
    const newStylist = {
      id: Date.now(),
      rating: 5.0,
      status: 'Active',
      ...stylistData
    };
    stylists.push(newStylist);
    localStorage.setItem('salon_stylists', JSON.stringify(stylists));
    return { id: newStylist.id, message: 'Stylist added' };
  }

  async deleteStylist(id) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/stylists/${id}`, { method: 'DELETE' });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    let stylists = JSON.parse(localStorage.getItem('salon_stylists') || '[]');
    stylists = stylists.filter(st => st.id != id);
    localStorage.setItem('salon_stylists', JSON.stringify(stylists));
    return { message: 'Stylist deleted' };
  }

  // Appointments
  async getAppointments() {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/appointments`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return JSON.parse(localStorage.getItem('salon_appointments') || '[]');
  }

  async findAppointment(refCode) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/appointments/ref/${encodeURIComponent(refCode.trim())}`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const apps = JSON.parse(localStorage.getItem('salon_appointments') || '[]');
    const query = refCode.trim().toLowerCase();
    return apps.find(a => a.ref_code.toLowerCase() === query || a.customer_phone === query) || null;
  }

  async createAppointment(bookingData) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const apps = JSON.parse(localStorage.getItem('salon_appointments') || '[]');
    const services = await this.getServices();
    const stylists = await this.getStylists();

    const matchedService = services.find(s => s.id == bookingData.service_id) || { name: 'Executive Haircut & Styling', price: 250.00 };
    const matchedStylist = stylists.find(st => st.id == bookingData.stylist_id) || { name: 'Any Available Stylist' };

    const refCode = 'SLN-' + Math.floor(1000 + Math.random() * 9000);
    const newAppointment = {
      id: Date.now(),
      ref_code: refCode,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email || '',
      customer_phone: bookingData.customer_phone,
      stylist_id: bookingData.stylist_id,
      stylist_name: matchedStylist.name,
      service_id: bookingData.service_id,
      service_name: matchedService.name,
      appointment_date: bookingData.appointment_date,
      appointment_time: bookingData.appointment_time,
      status: 'Pending',
      notes: bookingData.notes || '',
      total_price: parseFloat(matchedService.price),
      payment_status: 'Unpaid',
      created_at: new Date().toISOString()
    };

    apps.unshift(newAppointment);
    localStorage.setItem('salon_appointments', JSON.stringify(apps));
    return { id: newAppointment.id, ref_code: refCode, message: 'Appointment booked successfully!' };
  }

  async updateAppointmentStatus(id, newStatus) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const apps = JSON.parse(localStorage.getItem('salon_appointments') || '[]');
    const target = apps.find(a => a.id == id);
    if (target) {
      target.status = newStatus;
      localStorage.setItem('salon_appointments', JSON.stringify(apps));
    }
    return { message: 'Status updated' };
  }

  async updatePaymentStatus(id, payment_status, payment_method) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/appointments/${id}/payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status, payment_method })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const apps = JSON.parse(localStorage.getItem('salon_appointments') || '[]');
    const target = apps.find(a => a.id == id);
    if (target) {
      target.payment_status = payment_status;
      localStorage.setItem('salon_appointments', JSON.stringify(apps));
    }
    return { message: 'Payment updated' };
  }

  // Dashboard KPI Metrics
  async getDashboardStats() {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const apps = JSON.parse(localStorage.getItem('salon_appointments') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayApps = apps.filter(a => a.appointment_date === today).length;
    const rev = apps.filter(a => a.payment_status === 'Paid').reduce((sum, a) => sum + (parseFloat(a.total_price) || 0), 0);
    const stylists = JSON.parse(localStorage.getItem('salon_stylists') || '[]');
    return {
      todayAppointments: todayApps,
      totalRevenue: rev,
      activeStylists: stylists.length,
      totalCustomers: apps.length
    };
  }

  // Reviews
  async getReviews() {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/reviews`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return JSON.parse(localStorage.getItem('salon_reviews') || '[]');
  }

  async addReview(reviewData) {
    if (this.useApi) {
      try {
        const res = await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const reviews = JSON.parse(localStorage.getItem('salon_reviews') || '[]');
    const newRev = { id: Date.now(), ...reviewData };
    reviews.unshift(newRev);
    localStorage.setItem('salon_reviews', JSON.stringify(reviews));
    return { message: 'Review added' };
  }
}

// Global Singleton Instance
window.dbConnector = new DbConnector();
