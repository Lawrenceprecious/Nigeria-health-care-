document.addEventListener('DOMContentLoaded', async () => {
  const user = await verifySession();
  window.location.replace(user ? 'home.html' : 'login.html');
});
