// src/components/Auth/Login.js

export default function Login() {
  function render() {
    const template = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div class="max-w-md w-full space-y-8">
            <div>
              <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Connexion
              </h2>
            </div>
            <form id="loginForm" class="mt-8 space-y-6">
              <input type="hidden" name="remember" value="true">
              <div class="rounded-md shadow-sm -space-y-px">
                <div>
                  <label for="username" class="sr-only">Nom d'utilisateur</label>
                  <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Nom d'utilisateur">
                </div>
                <div>
                  <label for="password" class="sr-only">Mot de passe</label>
                  <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Mot de passe">
                </div>
              </div>

              <div>
                <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Se connecter
                </button>
              </div>
            </form>
            <div class="text-center">
              <a href="#" id="registerLink" class="font-medium text-indigo-600 hover:text-indigo-500">
                Créer un compte
              </a>
            </div>
          </div>
        </div>
      `;

    document.getElementById('app').innerHTML = template;
    addEventListeners();
  }

  function addEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerLink').addEventListener('click', navigateToRegister);
  }

  function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('login', { username, password });
    } else {
      console.error('Electron API is not available');
      showToast("Erreur de connexion à l'API", 'error');
    }
  }

  function navigateToRegister(e) {
    e.preventDefault();
    import('./Register.js').then(module => {
      const Register = module.default;
      Register();
    }).catch(err => console.error('Error loading Register:', err));
  }

  function showToast(message, type = 'info') {
    const backgroundColor = {
      info: '#3498db',
      success: '#07bc0c',
      warning: '#f1c40f',
      error: '#e74c3c'
    };

    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: backgroundColor[type],
      stopOnFocus: true
    }).showToast();
  }


  if (window.electronAPI && typeof window.electronAPI.receive === 'function') {
    window.electronAPI.receive('loginResponse', (response) => {
      if (response.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', response.userId);
        import('../Dashboard.js').then(module => {
          const Dashboard = module.default;
          const dashboard = Dashboard();
          dashboard.render();
        }).catch(err => console.error('Error loading Dashboard:', err));
      } else {
        showToast(response.message || 'Échec de la connexion. Veuillez vérifier vos informations.', 'error');
      }
    });
  } else {
    console.error('Electron API receive function is not available');
  }

  render();
}