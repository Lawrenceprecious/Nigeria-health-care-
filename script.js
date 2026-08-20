const facilities = [
  { name: 'Lagos Island General Hospital', type: 'hospital', state: 'Lagos', lga: 'Lagos Island', services: 'Emergency care · Outpatient · Maternity' },
  { name: 'Maitama District Hospital', type: 'hospital', state: 'FCT', lga: 'AMAC', services: 'General medicine · Paediatrics · Diagnostics' },
  { name: 'HealthPlus Pharmacy — Ikeja', type: 'pharmacy', state: 'Lagos', lga: 'Ikeja', services: 'Prescription · Wellness · Home delivery' },
  { name: 'Synlab Medical Laboratory', type: 'laboratory', state: 'Rivers', lga: 'Port Harcourt', services: 'Blood tests · Imaging · Health screening' },
  { name: 'National Blood Service — Abuja', type: 'blood bank', state: 'FCT', lga: 'Gwagwalada', services: 'Blood inventory · Donor registration' },
  { name: 'Evercare Clinic', type: 'clinic', state: 'Oyo', lga: 'Ibadan North', services: 'Family medicine · Preventive care' }
];

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function setupNavigation() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  $$('.site-nav a').forEach((link) => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
  const toggle = $('.mobile-menu-toggle');
  const nav = $('#site-navigation');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  $$('[data-auth-action]').forEach((button) => button.addEventListener('click', () => showToast('You are already signed in for this demo.')));
}

function facilityTypeLabel(type) {
  return type.replace('blood bank', 'blood bank').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function facilityCard(facility) {
  return `<article class="directory-card"><div><span class="type-badge">${facilityTypeLabel(facility.type)}</span><h3>${facility.name}</h3><p>⌖ ${facility.lga}, ${facility.state}</p><p>${facility.services}</p></div><button class="button button-outline" type="button" data-facility-contact="${facility.name}">View details <span>→</span></button></article>`;
}

function renderFacilities(list) {
  const results = $('#facility-results');
  const count = $('#facility-count');
  if (!results || !count) return;
  count.textContent = `${list.length} facilit${list.length === 1 ? 'y' : 'ies'} available`;
  results.innerHTML = list.length ? list.map(facilityCard).join('') : `<div class="empty-state"><div class="empty-symbol">⌖</div><h3>No facilities match that search</h3><p>Try a different facility type, state, LGA, or search term. The directory is ready for your real facility records.</p></div>`;
  $$('[data-facility-contact]', results).forEach((button) => button.addEventListener('click', () => showToast(`${button.dataset.facilityContact} details will open when the directory is connected to live records.`)));
}

function setupFacilityDirectory() {
  const form = $('#facility-filter-form');
  if (!form) return;
  const search = $('#facility-search');
  const state = $('#facility-state');
  const type = $('#facility-type');
  const quickButtons = $$('[data-type-filter]');
  const filter = () => {
    const query = (search.value || '').trim().toLowerCase();
    const selectedState = state.value;
    const selectedType = type.value;
    const filtered = facilities.filter((facility) => {
      const searchable = `${facility.name} ${facility.state} ${facility.lga} ${facility.services}`.toLowerCase();
      return (!query || searchable.includes(query)) && (!selectedState || facility.state === selectedState) && (!selectedType || facility.type === selectedType);
    });
    renderFacilities(filtered);
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); filter(); });
  [search, state, type].forEach((element) => element.addEventListener('input', filter));
  quickButtons.forEach((button) => button.addEventListener('click', () => { type.value = button.dataset.typeFilter; filter(); }));
  renderFacilities(facilities);
}

function setupHomeSearch() {
  const form = $('#home-search-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const search = $('#home-search');
    const query = search.value.trim();
    window.location.href = query ? `facilities.html?search=${encodeURIComponent(query)}` : 'facilities.html';
  });
  $$('[data-home-filter]').forEach((button) => button.addEventListener('click', () => {
    window.location.href = `facilities.html?type=${encodeURIComponent(button.dataset.homeFilter)}`;
  }));
}

function hydrateFacilityQuery() {
  const params = new URLSearchParams(window.location.search);
  const search = $('#facility-search');
  const type = $('#facility-type');
  if (!search || !type) return;
  if (params.get('search')) search.value = params.get('search');
  if (params.get('type')) type.value = params.get('type');
  if (params.get('type') || params.get('search')) $('#facility-filter-form').dispatchEvent(new Event('submit'));
}

function setupForms() {
  $$('form[data-demo-form]').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.dataset.success || 'Your request has been received in this demo.';
    showToast(message);
    form.reset();
  }));
  $$('[data-call-number]').forEach((button) => button.addEventListener('click', () => {
    const number = button.dataset.callNumber;
    showToast(`Calling ${number}. On a phone, this action would open your dialer.`);
  }));
}

function setupAssistant() {
  const form = $('#assistant-form');
  const messages = $('#chat-messages');
  const input = $('#assistant-input');
  if (!form || !messages || !input) return;
  const responses = [
    'Thank you for sharing that. I can provide general information, but a clinician should assess persistent or worsening symptoms. You can use the Facilities directory to find nearby care.',
    'A good next step is to write down when the symptom started, what makes it better or worse, and any medicines you take. If you feel seriously unwell, call 112.',
    'I can help you prepare questions for a healthcare professional. Please avoid sharing passwords, identification numbers, or highly sensitive personal information here.'
  ];
  const addMessage = (text, role) => { const bubble = document.createElement('div'); bubble.className = `chat-bubble ${role}`; bubble.textContent = text; messages.appendChild(bubble); messages.scrollTop = messages.scrollHeight; };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    window.setTimeout(() => addMessage(responses[Math.floor(Math.random() * responses.length)], 'assistant'), 450);
  });
  $$('[data-assistant-prompt]').forEach((button) => button.addEventListener('click', () => { input.value = button.dataset.assistantPrompt; input.focus(); }));
}

function setupAppointmentSpecialty() {
  const specialty = $('#appointment-specialty');
  const doctorNote = $('#doctor-note');
  if (!specialty || !doctorNote) return;
  specialty.addEventListener('change', () => { doctorNote.textContent = specialty.value ? `Showing specialists in ${specialty.value}.` : 'Choose a specialty to see recommended care options.'; });
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupHomeSearch();
  setupFacilityDirectory();
  hydrateFacilityQuery();
  setupForms();
  setupAssistant();
  setupAppointmentSpecialty();
});
