const API_BASE = window.HEALTHCONNECT_API_BASE || 'http://127.0.0.1:5000';
const TOKEN_KEY = 'healthconnect_access_token';
const USER_KEY = 'healthconnect_user';

function getToken() { return window.localStorage.getItem(TOKEN_KEY); }
function saveSession(payload) { window.localStorage.setItem(TOKEN_KEY, payload.token); window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user)); }
function clearSession() { window.localStorage.removeItem(TOKEN_KEY); window.localStorage.removeItem(USER_KEY); }
function getStoredUser() { try { return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } }

async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`nigeria-health-care-production.up.railway.app${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}

async function verifySession() {
  if (!getToken()) return null;
  try { const data = await apiRequest('/api/auth/me'); return data.user; }
  catch { clearSession(); return null; }
}

async function requireProtectedPage() {
  if (!document.body.hasAttribute('data-protected')) return;
  const user = await verifySession();
  if (!user) {
    const next = `${window.location.pathname.split('/').pop() || 'index.html'}${window.location.search}`;
    const loginPath = window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
    window.location.replace(`${loginPath}?next=${encodeURIComponent(next)}`);
    return;
  }
  const name = document.querySelector('[data-user-name]');
  if (name) name.textContent = user.name;
}

async function redirectIfAuthenticated() {
  if (!document.body.hasAttribute('data-guest-only')) return;
  const user = await verifySession();
  if (user) window.location.replace('index.html');
}

function setFormMessage(element, message, success = false) { if (!element) return; element.textContent = message; element.classList.toggle('success', success); element.classList.add('show'); }
function setLoading(button, loading, label) { if (!button) return; button.disabled = loading; button.textContent = loading ? 'Please wait…' : label; }

function setupLogin() {
  const form = document.querySelector('#login-form');
  if (!form) return;
  const password = document.querySelector('#login-password');
  const message = document.querySelector('#login-message');
  const button = form.querySelector('button[type="submit"]');
  document.querySelector('[data-toggle-password]')?.addEventListener('click', (event) => { password.type = password.type === 'password' ? 'text' : 'password'; event.currentTarget.textContent = password.type === 'password' ? 'Show' : 'Hide'; });
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); message?.classList.remove('show'); setLoading(button, true, 'Log in');
    try { const data = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email.value, password: form.password.value }) }); saveSession(data); const next = new URLSearchParams(window.location.search).get('next'); window.location.replace(next || 'index.html'); }
    catch (error) { setFormMessage(message, error.message); setLoading(button, false, 'Log in'); }
  });
}

function setupRegistration() {
  const form = document.querySelector('#register-form');
  if (!form) return;
  const message = document.querySelector('#register-message'); const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => { event.preventDefault(); message?.classList.remove('show'); setLoading(button, true, 'Create account'); try { const data = await apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: form.name.value, email: form.email.value, phone: form.phone.value, password: form.password.value, confirmPassword: form.confirmPassword.value }) }); saveSession(data); window.location.replace('index.html'); } catch (error) { setFormMessage(message, error.message); setLoading(button, false, 'Create account'); } });
}

function setupForgotPassword() {
  const form = document.querySelector('#forgot-form');
  if (!form) return;
  const message = document.querySelector('#forgot-message'); const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => { event.preventDefault(); message?.classList.remove('show'); setLoading(button, true, 'Send reset link'); try { const data = await apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: form.email.value }) }); setFormMessage(message, data.message, true); form.reset(); } catch (error) { setFormMessage(message, 'We could not process that request. Please try again.'); } finally { setLoading(button, false, 'Send reset link'); } });
}

function setupResetPassword() {
  const form = document.querySelector('#reset-form');
  if (!form) return;
  const token = new URLSearchParams(window.location.search).get('token'); const message = document.querySelector('#reset-message'); const button = form.querySelector('button[type="submit"]');
  if (!token) { setFormMessage(message, 'This reset link is missing its security token. Request a new link.', false); button.disabled = true; return; }
  form.addEventListener('submit', async (event) => { event.preventDefault(); message?.classList.remove('show'); setLoading(button, true, 'Update password'); try { const data = await apiRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password: form.password.value, confirmPassword: form.confirmPassword.value }) }); setFormMessage(message, data.message, true); form.reset(); window.setTimeout(() => window.location.replace('login.html'), 1400); } catch (error) { setFormMessage(message, error.message); setLoading(button, false, 'Update password'); } });
}

function setupLogout() { document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', async () => { try { if (getToken()) await apiRequest('/api/auth/logout', { method: 'POST' }); } catch {} finally { clearSession(); window.location.replace('login.html'); } })); }

document.addEventListener('DOMContentLoaded', () => { requireProtectedPage(); redirectIfAuthenticated(); setupLogin(); setupRegistration(); setupForgotPassword(); setupResetPassword(); setupLogout(); });
