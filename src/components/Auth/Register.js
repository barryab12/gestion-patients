// src/components/Auth/Register.js

export default function Register() {
  function render() {
    const template = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Créer un compte
            </h2>
          </div>
          <form id="registerForm" class="mt-8 space-y-6">
            <input type="hidden" name="remember" value="true">
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="username" class="sr-only">Nom d'utilisateur</label>
                <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Nom d'utilisateur">
              </div>
              <div>
                <label for="email" class="sr-only">Email</label>
                <input id="email" name="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email">
              </div>
              <div>
                <label for="password" class="sr-only">Mot de passe</label>
                <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Mot de passe">
              </div>
              <div>
                <label for="role" class="sr-only">Rôle</label>
                <select id="role" name="role" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm">
                  <option value="">Sélectionnez un rôle</option>
                  <option value="doctor">Médecin</option>
                  <option value="nurse">Infirmier(ère)</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div>
              <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                S'inscrire
              </button>
            </div>
          </form>
          <div class="text-center">
            <a href="#" id="loginLink" class="font-medium text-indigo-600 hover:text-indigo-500">
              Déjà un compte ? Se connecter
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = template;
    addEventListeners();
  }

  function addEventListeners() {
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginLink').addEventListener('click', navigateToLogin);
  }

  function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('register', { username, email, password, role });
    } else {
      console.error('Electron API is not available');
      showToast("Erreur d'inscription");
    }
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

  function navigateToLogin(e) {
    e.preventDefault();
    import('./Login.js').then(module => {
      const Login = module.default;
      Login();
    }).catch(err => console.error('Error loading Login:', err));
  }

  if (window.electronAPI && typeof window.electronAPI.receive === 'function') {
    window.electronAPI.receive('registerResponse', (response) => {
      if (response.success) {
        showToast('Inscription réussie. Veuillez vous connecter.', 'success');
        import('./Login.js').then(module => {
          const Login = module.default;
          Login();
        }).catch(err => console.error('Error loading Login:', err));
      } else {
        showToast(response.message || "Échec de l'inscription. Veuillez réessayer.", 'error');
      }
    });
  } else {
    console.error('Electron API receive function is not available');
  }

  render();
}