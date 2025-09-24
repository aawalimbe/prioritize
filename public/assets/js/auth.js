// Authentication logic for login/register/logout

document.addEventListener('DOMContentLoaded', function() {
  // Session check function (outer scope)
  async function checkSession(showTasks, forceShowApp) {
    try {
      // Check session and user id
      const res = await fetch('/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'me' })
      });
      const userData = await res.json();
      if (userData.success && userData.user && userData.user.id) {
        // User is authenticated, show tasks
        if (forceShowApp) {
          showApp(userData.user.username);
        }
        if (showTasks && !forceShowApp) {
          // Already showing tasks
        } else if (!showTasks) {
          window.location.hash = '#/tasks';
        }
      } else {
        showLoginForm();
        if (!showTasks) window.location.hash = '#/login';
      }
    } catch {
      showLoginForm();
      if (!showTasks) window.location.hash = '#/login';
    }
  }

  // Simple hash-based router
  function route() {
    const hash = window.location.hash;
    if (hash === '#/register') {
      showRegisterForm();
    } else if (hash === '#/tasks') {
      checkSession(true, true);
    } else {
      showLoginForm();
    }
  }

  window.addEventListener('hashchange', route);
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showLogin = document.getElementById('showLogin');
  const showRegister = document.getElementById('showRegister');
  const userPanel = document.getElementById('userPanel');
  const welcomeUser = document.getElementById('welcomeUser');
  const logoutBtn = document.getElementById('logoutBtn');
  const appDiv = document.getElementById('app');

  // Show login/register forms
  async function showLoginForm() {
    // Destroy session by default when showing login screen
    try {
      await fetch('/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch {}
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    userPanel.style.display = 'none';
    appDiv.style.display = 'none';
  }
  function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    userPanel.style.display = 'none';
    appDiv.style.display = 'none';
  }

 async function showApp(username) {
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  userPanel.style.display = '';
  appDiv.style.display = '';
  // Fetch user info from backend
  try {
    const res = await fetch('/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'me' })
    });
    const data = await res.json();
    if (data.success && data.user) {
      welcomeUser.textContent = `Welcome, ${data.user.username} (ID: ${data.user.id})`;
    } else {
      welcomeUser.textContent = 'Welcome, ' + (username || 'User');
    }
  } catch {
    welcomeUser.textContent = 'Welcome, ' + (username || 'User');
  }
}

  // Switch forms
  showLogin?.addEventListener('click', function(e) {
  e.preventDefault();
  window.location.hash = '#/login';
  });
  showRegister?.addEventListener('click', function(e) {
  e.preventDefault();
  window.location.hash = '#/register';
  });

  // Register
  registerForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const res = await fetch('/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password })
    });
    const data = await res.json();
    if (data.success) {
      alert('Registration successful! Please log in.');
      window.location.hash = '#/login';
    } else {
      alert(data.message || 'Registration failed');
    }
  });

  // Login
  loginForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const res = await fetch('/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const data = await res.json();
    if (data.success) {
      // After successful login, clear task table and fetch fresh tasks
      try {
        const taskTableBody = document.getElementById('taskTableBody');
        if (taskTableBody) taskTableBody.innerHTML = '';
        if (typeof fetchTasksFromAPI === 'function' && typeof renderTasks === 'function') {
          fetchTasksFromAPI().then(renderTasks);
        }
      } catch {}
      window.location.hash = '#/tasks';
    } else {
      alert(data.message || 'Login failed');
    }
  });

  // Logout
  logoutBtn?.addEventListener('click', async function() {
    await fetch('/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    // Clear task table UI on logout
    try {
      const taskTableBody = document.getElementById('taskTableBody');
      if (taskTableBody) taskTableBody.innerHTML = '';
    } catch {}
    // Clear UI and force login screen
    window.location.hash = '#/login';
  });

  // On load, check session (simple check: try to fetch tasks)
  (async function checkSession() {
  // Initial route
  route();
  })();
});
