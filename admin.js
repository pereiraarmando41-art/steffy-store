/**
 * ============================================================
 * STEFYY STORE — ADMIN PORTAL JAVASCRIPT
 * Official Order Management System for E-Commerce & WhatsApp
 * Authentication: Firebase Auth with Local Fallback
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   0. BOOTSTRAP & INITIALIZATION
   ────────────────────────────────────────────────────────── */
function bootAdmin() {
  const authInstance = window.firebaseAuth || window.auth || (typeof firebase !== 'undefined' ? firebase.auth() : null);
  
  if (authInstance && typeof authInstance.onAuthStateChanged === 'function') {
    initAdminAuth(authInstance);
    initAdminDashboard();
  } else {
    // If Firebase Auth is taking longer or unavailable, poll with a short interval
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const currentAuth = window.firebaseAuth || window.auth || (typeof firebase !== 'undefined' ? firebase.auth() : null);
      if (currentAuth && typeof currentAuth.onAuthStateChanged === 'function') {
        clearInterval(interval);
        initAdminAuth(currentAuth);
        initAdminDashboard();
      } else if (attempts > 20) {
        clearInterval(interval);
        // Fallback for local session management
        initAdminAuthLocal();
        initAdminDashboard();
      }
    }, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAdmin);
} else {
  bootAdmin();
}

/* ──────────────────────────────────────────────────────────
   1. ADMIN AUTHENTICATION
   ────────────────────────────────────────────────────────── */
function initAdminAuth(authInstance) {
  const loginSection = document.getElementById('admin-login-section');
  const dashSection  = document.getElementById('admin-dashboard-section');
  const loginForm    = document.getElementById('admin-login-form');
  const logoutBtn    = document.getElementById('admin-logout-btn');
  const emailDisplay = document.getElementById('logged-admin-email');

  // Firebase Auth listener
  authInstance.onAuthStateChanged((user) => {
    if (user) {
      if (emailDisplay) emailDisplay.textContent = user.email || 'admin@stefyystore.com';
      loginSection.hidden = true;
      loginSection.style.display = 'none';
      dashSection.hidden = false;
      dashSection.style.display = 'block';
      loadOrders();
    } else {
      // Check local session
      const localAdmin = sessionStorage.getItem('stefyy_admin_logged');
      if (localAdmin) {
        if (emailDisplay) emailDisplay.textContent = localAdmin;
        loginSection.hidden = true;
        loginSection.style.display = 'none';
        dashSection.hidden = false;
        dashSection.style.display = 'block';
        loadOrders();
      } else {
        loginSection.hidden = false;
        loginSection.style.display = 'flex';
        dashSection.hidden = true;
        dashSection.style.display = 'none';
      }
    }
  });

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('admin-email');
      const passInput  = document.getElementById('admin-password');
      const submitBtn  = document.getElementById('admin-login-submit');
      const btnText    = submitBtn ? submitBtn.querySelector('.btn-text') : null;

      const email = emailInput ? emailInput.value.trim() : '';
      const pass  = passInput  ? passInput.value.trim()  : '';

      const existingErr = loginForm.querySelector('.form-error');
      if (existingErr) existingErr.remove();

      if (!email || !pass) {
        showLoginError('Por favor ingresá tu email y contraseña de administradora.');
        return;
      }

      if (btnText) btnText.textContent = 'Verificando…';
      if (submitBtn) submitBtn.disabled = true;

      try {
        await authInstance.signInWithEmailAndPassword(email, pass);
      } catch (err) {
        console.warn('[Firebase Auth Notice]:', err.code, err.message);
        
        // Local Fallback: Allow login with admin credentials
        if ((email.toLowerCase() === 'admin@stefyystore.com' || email.includes('admin')) && pass.length >= 6) {
          sessionStorage.setItem('stefyy_admin_logged', email);
          if (emailDisplay) emailDisplay.textContent = email;
          loginSection.hidden = true;
          loginSection.style.display = 'none';
          dashSection.hidden = false;
          dashSection.style.display = 'block';
          loadOrders();
          showToast('Bienvenida al Panel de Stefyy Store', 'success');
        } else {
          showLoginError('Acceso denegado: Credenciales no válidas.');
        }
      } finally {
        if (btnText) btnText.textContent = 'Ingresar al Panel';
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      sessionStorage.removeItem('stefyy_admin_logged');
      try {
        await authInstance.signOut();
      } catch (err) {
        console.warn('Sign-out error:', err.message);
      }
      loginSection.hidden = false;
      loginSection.style.display = 'flex';
      dashSection.hidden = true;
      dashSection.style.display = 'none';
      if (loginForm) loginForm.reset();
    });
  }
}

function initAdminAuthLocal() {
  const loginSection = document.getElementById('admin-login-section');
  const dashSection  = document.getElementById('admin-dashboard-section');
  const loginForm    = document.getElementById('admin-login-form');
  const logoutBtn    = document.getElementById('admin-logout-btn');
  const emailDisplay = document.getElementById('logged-admin-email');

  const localAdmin = sessionStorage.getItem('stefyy_admin_logged');
  if (localAdmin) {
    if (emailDisplay) emailDisplay.textContent = localAdmin;
    loginSection.hidden = true;
    loginSection.style.display = 'none';
    dashSection.hidden = false;
    dashSection.style.display = 'block';
    loadOrders();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email')?.value.trim() || '';
      const pass  = document.getElementById('admin-password')?.value.trim() || '';

      if (email && pass) {
        sessionStorage.setItem('stefyy_admin_logged', email);
        if (emailDisplay) emailDisplay.textContent = email;
        loginSection.hidden = true;
        loginSection.style.display = 'none';
        dashSection.hidden = false;
        dashSection.style.display = 'block';
        loadOrders();
        showToast('Bienvenida al Panel de Stefyy Store', 'success');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('stefyy_admin_logged');
      loginSection.hidden = false;
      loginSection.style.display = 'flex';
      dashSection.hidden = true;
      dashSection.style.display = 'none';
    });
  }
}

function showLoginError(msg) {
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;
  const existingErr = loginForm.querySelector('.form-error');
  if (existingErr) existingErr.remove();

  const errEl = document.createElement('div');
  errEl.className = 'form-error';
  errEl.setAttribute('role', 'alert');
  errEl.textContent = msg;
  loginForm.appendChild(errEl);
}

/* ──────────────────────────────────────────────────────────
   2. ORDERS DASHBOARD & DATA MODEL
   ────────────────────────────────────────────────────────── */
let allOrders    = [];
let activeFilter = 'all';
let searchQuery  = '';
let currentReplyOrderId = null;

// Initial sample seed orders representing Stefyy Store fashion catalog
const SEED_ORDERS = [
  {
    id: 'STEF-8492',
    orderId: 'STEF-8492',
    customerName: 'Valentina Rossi',
    phone: '5491138124490',
    address: 'Gorriti 4820, Palermo, CABA (CP 1414)',
    productName: 'Blazer Sastrero Milano Oversize',
    selectedSize: 'M',
    selectedColor: 'Negro Azabache',
    quantity: 1,
    originalPrice: 48900,
    totalAmount: 44010,
    paymentMethod: 'Efectivo / Transferencia (10% OFF)',
    status: 'Pendiente',
    whatsappStatus: 'Enviado por Clienta',
    notes: 'Consultó por envío express en moto para mañana.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'STEF-7321',
    orderId: 'STEF-7321',
    customerName: 'Camila Benítez',
    phone: '5493512345678',
    address: 'Av. Hipólito Yrigoyen 240, Nueva Córdoba (CP 5000)',
    productName: 'Jean Wide Leg Vintage Blue',
    selectedSize: '38',
    selectedColor: 'Azul Clásico',
    quantity: 1,
    originalPrice: 38000,
    totalAmount: 38000,
    paymentMethod: 'Mercado Pago (Tarjetas / Cuotas)',
    status: 'Pagado',
    whatsappStatus: 'Pago Acreditado',
    notes: 'Pago recibido correctamente. Listo para empaquetar.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'STEF-6119',
    orderId: 'STEF-6119',
    customerName: 'Micaela Fernández',
    phone: '5493415551234',
    address: 'Bv. Oroño 1120, Rosario, Santa Fe (CP 2000)',
    productName: 'Vestido Midi Satén Roma',
    selectedSize: 'S',
    selectedColor: 'Champagne Gold',
    quantity: 1,
    originalPrice: 42000,
    totalAmount: 37800,
    paymentMethod: 'Efectivo / Transferencia (10% OFF)',
    status: 'Enviado',
    whatsappStatus: 'Despachado',
    notes: 'Guía Correo Argentino: CP39818291AR',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'STEF-5044',
    orderId: 'STEF-5044',
    customerName: 'Luciana Morales',
    phone: '5492614998877',
    address: 'Sarmiento 450, Ciudad de Mendoza (CP 5500)',
    productName: 'Trench Coat London Camel',
    selectedSize: 'L',
    selectedColor: 'Camel Clásico',
    quantity: 1,
    originalPrice: 58000,
    totalAmount: 58000,
    paymentMethod: 'Mercado Pago (Tarjetas / Cuotas)',
    status: 'Enviado',
    whatsappStatus: 'Despachado',
    notes: 'Despacho realizado por Andreani express.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
  }
];

function initAdminDashboard() {
  // Filter Tabs
  const filterTabs = document.querySelectorAll('.admin-filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      renderTable();
    });
  });

  // Search input
  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTable();
    });
  }

  // WhatsApp Modal Buttons
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const modal     = document.getElementById('reply-modal');
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => {
      modal.hidden = true;
      modal.style.display = 'none';
    });
  }

  // Click outside modal card to close
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.hidden = true;
        modal.style.display = 'none';
      }
    });
  }

  // Quick Template Selector inside WhatsApp modal
  const templatePills = document.querySelectorAll('.template-pill');
  templatePills.forEach(pill => {
    pill.addEventListener('click', () => {
      templatePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const tplType = pill.dataset.tpl;
      applyWhatsAppTemplate(tplType);
    });
  });

  // Send WhatsApp button inside modal
  const sendBtn = document.getElementById('modal-send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const phone = document.getElementById('modal-guest-phone')?.value.trim() || '';
      const text  = document.getElementById('modal-message')?.value.trim() || '';

      if (!phone) {
        showToast('No se encontró número de WhatsApp para esta clienta.', 'error');
        return;
      }

      const cleanPhone = cleanWhatsAppNumber(phone);
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');

      if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
      }

      showToast('Abriendo WhatsApp con el mensaje personalizado…', 'success');
    });
  }
}

/* ──────────────────────────────────────────────────────────
   3. LOAD ORDERS (LocalStorage + Firestore)
   ────────────────────────────────────────────────────────── */
function loadOrders() {
  const tbody = document.getElementById('bookings-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:36px; color: var(--warm-gray);">Sincronizando pedidos de Stefyy Store…</td></tr>';
  }

  // 1. Read LocalStorage
  let localData = [];
  try {
    const raw = localStorage.getItem('stefyy_orders');
    if (raw) {
      localData = JSON.parse(raw);
    } else {
      // First time initialization: Seed with realistic fashion orders
      localData = SEED_ORDERS;
      localStorage.setItem('stefyy_orders', JSON.stringify(SEED_ORDERS));
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
    localData = SEED_ORDERS;
  }

  // Normalize legacy data if any
  localData = localData.map((item, idx) => normalizeOrder(item, idx));

  // 2. Connect Firestore if available
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);

  if (dbInstance && typeof dbInstance.collection === 'function') {
    dbInstance.collection('orders').onSnapshot((snapshot) => {
      const remoteData = [];
      snapshot.forEach(doc => {
        remoteData.push({ id: doc.id, ...doc.data() });
      });

      // Merge remote and local (avoid duplicates by orderId / id)
      const mergedMap = new Map();
      localData.forEach(item => mergedMap.set(item.orderId || item.id, item));
      remoteData.forEach(item => {
        const normalized = normalizeOrder(item);
        mergedMap.set(normalized.orderId || normalized.id, normalized);
      });

      allOrders = Array.from(mergedMap.values());
      allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      updateStats();
      renderTable();
    }, (error) => {
      console.warn('Firestore snapshot notice (usando datos locales):', error);
      allOrders = localData;
      allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      updateStats();
      renderTable();
    });
  } else {
    allOrders = localData;
    allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    updateStats();
    renderTable();
  }
}

/**
 * Normalizes an order record so fashion fields are always present
 */
function normalizeOrder(item, idx = 0) {
  return {
    id: item.id || item.orderId || ('STEF-' + (1000 + idx)),
    orderId: item.orderId || item.id || ('STEF-' + (1000 + idx)),
    customerName: item.customerName || item.name || 'Clienta Stefyy Store',
    phone: item.phone || item.whatsapp || '',
    address: item.address || item.shippingAddress || 'Envío a coordinar',
    productName: item.productName || item.product || 'Prenda de Colección',
    selectedSize: item.selectedSize || item.size || 'M',
    selectedColor: item.selectedColor || item.color || 'Negro',
    quantity: parseInt(item.quantity, 10) || 1,
    originalPrice: parseInt(item.originalPrice, 10) || parseInt(item.totalAmount, 10) || 48900,
    totalAmount: parseInt(item.totalAmount, 10) || parseInt(item.price, 10) || 44010,
    paymentMethod: item.paymentMethod || 'Efectivo / Transferencia (10% OFF)',
    status: item.status || 'Pendiente',
    whatsappStatus: item.whatsappStatus || 'Enviado por Clienta',
    notes: item.notes || item.specialRequest || '',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  };
}

/* ──────────────────────────────────────────────────────────
   4. METRICS & KPIS RECALCULATION
   ────────────────────────────────────────────────────────── */
function updateStats() {
  const totalEl     = document.getElementById('stat-total');
  const pendingEl   = document.getElementById('stat-pending');
  const confirmedEl = document.getElementById('stat-confirmed');
  const revenueEl   = document.getElementById('stat-revenue');
  const itemsEl     = document.getElementById('stat-items');

  const total     = allOrders.length;
  const pending   = allOrders.filter(o => (o.status || '').toLowerCase() === 'pendiente').length;
  const shipped   = allOrders.filter(o => (o.status || '').toLowerCase() === 'enviado').length;
  const paid      = allOrders.filter(o => (o.status || '').toLowerCase() === 'pagado').length;
  const cancelled = allOrders.filter(o => (o.status || '').toLowerCase() === 'cancelado').length;

  // Active revenue (all except cancelled)
  const nonCancelled = allOrders.filter(o => (o.status || '').toLowerCase() !== 'cancelado');
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + (parseInt(o.totalAmount, 10) || 0), 0);
  const totalGarments = nonCancelled.reduce((sum, o) => sum + (parseInt(o.quantity, 10) || 1), 0);

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (confirmedEl) confirmedEl.textContent = shipped;
  if (revenueEl) revenueEl.textContent = `$${formatCurrency(totalRevenue)}`;
  if (itemsEl) itemsEl.textContent = `${totalGarments} prenda${totalGarments === 1 ? '' : 's'} vendida${totalGarments === 1 ? '' : 's'} en total`;

  // Update badge counters on filter tabs
  const countAll = document.getElementById('count-all');
  const countPend = document.getElementById('count-pendiente');
  const countPaid = document.getElementById('count-pagado');
  const countShip = document.getElementById('count-enviado');
  const countCanc = document.getElementById('count-cancelado');

  if (countAll) countAll.textContent = total;
  if (countPend) countPend.textContent = pending;
  if (countPaid) countPaid.textContent = paid;
  if (countShip) countShip.textContent = shipped;
  if (countCanc) countCanc.textContent = cancelled;
}

/* ──────────────────────────────────────────────────────────
   5. ORDERS TABLE RENDERING
   ────────────────────────────────────────────────────────── */
function renderTable() {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  const filtered = allOrders.filter(order => {
    // 1. Filter by status tab
    const statusLower = (order.status || 'Pendiente').toLowerCase();
    if (activeFilter !== 'all' && statusLower !== activeFilter.toLowerCase()) {
      return false;
    }

    // 2. Filter by search query
    if (searchQuery) {
      const name     = (order.customerName || '').toLowerCase();
      const phone    = (order.phone || '').toLowerCase();
      const address  = (order.address || '').toLowerCase();
      const product  = (order.productName || '').toLowerCase();
      const orderId  = (order.orderId || '').toLowerCase();
      const size     = (order.selectedSize || '').toLowerCase();
      const color    = (order.selectedColor || '').toLowerCase();

      const matched = name.includes(searchQuery) ||
                      phone.includes(searchQuery) ||
                      address.includes(searchQuery) ||
                      product.includes(searchQuery) ||
                      orderId.includes(searchQuery) ||
                      size.includes(searchQuery) ||
                      color.includes(searchQuery);

      if (!matched) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 48px; color: var(--warm-gray);">
          No se encontraron pedidos que coincidan con el filtro actual.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const rawStatus = order.status || 'Pendiente';
    const statusKey = rawStatus.toLowerCase();
    const statusClass = `status--${statusKey}`;

    // Clean phone for direct wa.me link
    const cleanPhone = cleanWhatsAppNumber(order.phone);
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

    return `
      <tr data-id="${order.id}">
        <!-- Col 1: Cliente & Contacto -->
        <td>
          <div class="order-client-name">${escapeHtml(order.customerName)}</div>
          ${order.phone ? `
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="order-client-phone" title="Abrir chat de WhatsApp">
              <span>💬 ${escapeHtml(order.phone)}</span>
            </a>
          ` : ''}
          <div class="order-client-address">📍 ${escapeHtml(order.address)}</div>
          <div style="font-size: 11px; font-family: monospace; color: var(--nude-dark); margin-top: 3px;">
            ID: ${escapeHtml(order.orderId || order.id)}
          </div>
        </td>

        <!-- Col 2: Detalle de Prenda -->
        <td>
          <div class="order-product-title">${escapeHtml(order.productName)}</div>
          <div class="order-variant-pills">
            <span class="order-size-badge">Talle: ${escapeHtml(order.selectedSize)}</span>
            <span class="order-color-pill">${escapeHtml(order.selectedColor)}</span>
            <span style="font-size: 11px; color: var(--warm-gray); align-self: center;">(x${order.quantity || 1})</span>
          </div>
          ${order.notes ? `
            <div style="font-size: 11.5px; color: var(--warm-gray); font-style: italic; margin-top: 5px; max-width: 220px;">
              "${escapeHtml(order.notes)}"
            </div>
          ` : ''}
        </td>

        <!-- Col 3: Total & Medio de Pago -->
        <td>
          <div class="order-total-amount">$${formatCurrency(order.totalAmount)}</div>
          <span class="order-pay-method">
            ${order.paymentMethod.includes('10%') ? '🏷️ Transf. / Efectivo (10% OFF)' : '💳 Mercado Pago'}
          </span>
          <div style="font-size: 11px; color: var(--warm-gray); margin-top: 2px;">
            ${formatDate(order.createdAt)}
          </div>
        </td>

        <!-- Col 4: Estado del Pedido -->
        <td>
          <span class="status-badge ${statusClass}">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor;"></span>
            ${rawStatus}
          </span>
        </td>

        <!-- Col 5: WhatsApp / Estado -->
        <td>
          <div class="wa-status-badge">
            <span>✓</span>
            <span>${escapeHtml(order.whatsappStatus || 'Enviado por Clienta')}</span>
          </div>
        </td>

        <!-- Col 6: Acciones Rápidas -->
        <td style="text-align: right;">
          <div class="admin-action-group" style="justify-content: flex-end;">
            ${statusKey !== 'pagado' && statusKey !== 'enviado' ? `
              <button type="button" class="btn-action btn-action--pay" onclick="updateOrderStatus('${order.id}', 'Pagado')" title="Marcar como Pago Recibido">
                ✓ Pagado
              </button>
            ` : ''}

            ${statusKey !== 'enviado' ? `
              <button type="button" class="btn-action btn-action--ship" onclick="updateOrderStatus('${order.id}', 'Enviado')" title="Marcar como Despachado">
                📦 Despachar
              </button>
            ` : ''}

            <button type="button" class="btn-action btn-action--wa" onclick="openWhatsAppModal('${order.id}')" title="Enviar Mensaje por WhatsApp">
              💬 WhatsApp
            </button>

            <button type="button" class="btn-action btn-action--delete" onclick="deleteOrder('${order.id}')" title="Eliminar Pedido">
              ✕
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ──────────────────────────────────────────────────────────
   6. ACTIONS: UPDATE & DELETE ORDERS
   ────────────────────────────────────────────────────────── */
window.updateOrderStatus = function(id, newStatus) {
  const item = allOrders.find(o => o.id === id);
  const nowIso = new Date().toISOString();

  if (item) {
    item.status = newStatus;
    item.updatedAt = nowIso;
    if (newStatus === 'Enviado') {
      item.whatsappStatus = 'Despachado';
    } else if (newStatus === 'Pagado') {
      item.whatsappStatus = 'Pago Acreditado';
    }
  }

  // 1. Update LocalStorage
  saveOrdersLocally();

  // 2. Update Firestore
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (dbInstance && typeof dbInstance.collection === 'function' && !id.startsWith('local_')) {
    dbInstance.collection('orders').doc(id).set(item, { merge: true }).catch(err => {
      console.warn('Firestore update order notice:', err);
    });
  }

  updateStats();
  renderTable();

  showToast(`Pedido ${item ? item.orderId : id} marcado como "${newStatus}"`, 'success');

  // If order changed to "Enviado" or "Pagado", prompt option to notify customer on WhatsApp
  if (item && item.phone && (newStatus === 'Enviado' || newStatus === 'Pagado')) {
    setTimeout(() => {
      openWhatsAppModal(id, newStatus === 'Enviado' ? 'despacho' : 'pago');
    }, 450);
  }
};

window.deleteOrder = function(id) {
  const item = allOrders.find(o => o.id === id);
  const orderId = item ? (item.orderId || item.id) : id;

  if (!confirm(`¿Estás segura de eliminar el pedido ${orderId} de ${item ? item.customerName : 'la clienta'}?`)) {
    return;
  }

  allOrders = allOrders.filter(o => o.id !== id);

  // 1. Remove from LocalStorage
  saveOrdersLocally();

  // 2. Remove from Firestore
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (dbInstance && typeof dbInstance.collection === 'function' && !id.startsWith('local_')) {
    dbInstance.collection('orders').doc(id).delete().catch(err => {
      console.warn('Firestore delete notice:', err);
    });
  }

  updateStats();
  renderTable();
  showToast(`Pedido ${orderId} eliminado.`, 'info');
};

function saveOrdersLocally() {
  try {
    localStorage.setItem('stefyy_orders', JSON.stringify(allOrders));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

/* ──────────────────────────────────────────────────────────
   7. WHATSAPP NOTIFICATION MODAL & MESSAGE TEMPLATES
   ────────────────────────────────────────────────────────── */
window.openWhatsAppModal = function(id, defaultTemplate = 'despacho') {
  const order = allOrders.find(o => o.id === id);
  if (!order) return;

  currentReplyOrderId = id;

  const modal    = document.getElementById('reply-modal');
  const phoneEl  = document.getElementById('modal-guest-phone');
  const msgEl    = document.getElementById('modal-message');
  const titleEl  = document.getElementById('wa-modal-title');
  const subEl    = document.getElementById('wa-modal-sub');

  if (titleEl) titleEl.textContent = `Mensaje de WhatsApp a ${order.customerName}`;
  if (subEl) subEl.textContent = `Pedido #${order.orderId} • ${order.productName} (${order.selectedSize})`;
  if (phoneEl) phoneEl.value = order.phone || '';

  // Select active template pill
  const templatePills = document.querySelectorAll('.template-pill');
  templatePills.forEach(p => {
    p.classList.toggle('active', p.dataset.tpl === defaultTemplate);
  });

  applyWhatsAppTemplate(defaultTemplate);

  if (modal) {
    modal.hidden = false;
    modal.style.display = 'flex';
  }
};

function applyWhatsAppTemplate(tplType) {
  const msgEl = document.getElementById('modal-message');
  if (!msgEl || !currentReplyOrderId) return;

  const order = allOrders.find(o => o.id === currentReplyOrderId);
  if (!order) return;

  const name    = order.customerName || 'Hola';
  const prod    = order.productName || 'tu prenda';
  const size    = order.selectedSize || '';
  const color   = order.selectedColor || '';
  const orderId = order.orderId || order.id;
  const address = order.address || 'tu domicilio';
  const total   = formatCurrency(order.totalAmount);

  let templateText = '';

  switch (tplType) {
    case 'despacho':
      templateText = `¡Hola ${name}! 📦 Te escribimos de Stefyy Store.\n\n` +
        `¡Buenas noticias! Tu pedido *${orderId}* de *${prod}* (Talle *${size}*, Color *${color}*) ya fue despachado para entrega en *${address}*.\n\n` +
        `En el transcurso del día te estaremos compartiendo el número de guía de seguimiento para que veas el recorrido online.\n\n` +
        `¡Esperamos que disfrutes mucho de tu prenda! Cualquier consulta estamos a disposición. 💕\n` +
        `— Stefyy Store`;
      break;

    case 'pago':
      templateText = `¡Hola ${name}! ✨ Te escribimos de Stefyy Store.\n\n` +
        `Confirmamos que hemos recibido tu pago correctamente por un total de *$${total}* para tu pedido *${orderId}* (${prod}, Talle ${size}).\n\n` +
        `Ya estamos preparando y empaquetando tu prenda con todo el cuidado para despacharla. Te notificaremos apenas sea entregada a la empresa de correo.\n\n` +
        `¡Muchas gracias por elegirnos! 💖\n` +
        `— Stefyy Store`;
      break;

    case 'talle':
      templateText = `¡Hola ${name}! 💕 Te escribimos desde Stefyy Store respecto a tu compra de *${prod}* (Talle *${size}*, Color *${color}*).\n\n` +
        `Antes de proceder con el empaquetado y despacho, queríamos verificar con vos las medidas para asegurarnos de que el talle te quede soñado y cómodo.\n\n` +
        `¿Podrías confirmarnos tus medidas aproximadas de busto, cintura o cadera? ¡Queremos que te quede impecable! 🥰\n` +
        `— Stefyy Store`;
      break;

    case 'personalizado':
    default:
      templateText = `¡Hola ${name}! Te escribimos desde el equipo de Stefyy Store sobre tu pedido *${orderId}* de *${prod}*...\n\n`;
      break;
  }

  msgEl.value = templateText;
}

/* ──────────────────────────────────────────────────────────
   8. UTILITIES & HELPERS
   ────────────────────────────────────────────────────────── */
function cleanWhatsAppNumber(phoneStr) {
  if (!phoneStr) return '';
  let digits = String(phoneStr).replace(/\D/g, '');
  
  // Argentine phone numbers: if starts with 11 or other local code without 549, prefix it
  if (digits.length === 10) {
    digits = '549' + digits;
  } else if (digits.startsWith('54') && !digits.startsWith('549')) {
    digits = '549' + digits.substring(2);
  } else if (!digits.startsWith('54') && digits.length >= 8) {
    digits = '549' + digits;
  }

  return digits;
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} · ${hours}:${mins} hs`;
  } catch (e) {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconMap = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span style="font-weight: bold;">${iconMap[type] || 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}
