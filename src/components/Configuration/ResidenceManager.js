// src/components/Configuration/ResidenceManager.js

export default function ResidenceManager() {
  function render() {
    const template = `
      <div class="min-h-screen bg-gray-100">
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex">
                <div class="flex-shrink-0 flex items-center">
                  <h1 class="text-xl font-bold">Suivi des Patients</h1>
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a href="#" id="dashboardLink" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="#" id="patientListLink" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Liste des Patients
                  </a>
                  <a href="#" id="configLink" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Configuration
                  </a>
                </div>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:items-center">
                <button id="logoutButton" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <h2 class="text-2xl font-semibold mb-5">Gérer les résidences</h2>
            <form id="addResidenceForm" class="mb-4">
              <div class="flex space-x-2">
                <input type="text" id="residenceName" placeholder="Nouvelle résidence" class="flex-grow px-3 py-2 border rounded-l">
                <select id="residenceType" class="px-3 py-2 border">
                  <option value="current">Résidence actuelle</option>
                  <option value="usual">Résidence habituelle</option>
                </select>
                <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-r hover:bg-green-600">Ajouter</button>
              </div>
            </form>
            <ul id="residenceList" class="space-y-2"></ul>
          </div>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = template;
    loadResidences();
    addEventListeners();
  }

  function addEventListeners() {
    document.getElementById('dashboardLink').addEventListener('click', navigateToDashboard);
    document.getElementById('patientListLink').addEventListener('click', navigateToPatientList);
    document.getElementById('configLink').addEventListener('click', navigateToConfig);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('addResidenceForm').addEventListener('submit', handleAddResidence);
  }

  function navigateToDashboard(e) {
    e.preventDefault();
    import('../Dashboard.js').then(module => {
      const Dashboard = module.default;
      const dashboard = Dashboard();
      dashboard.render();
    }).catch(err => console.error('Error loading Dashboard:', err));
  }

  function navigateToPatientList(e) {
    e.preventDefault();
    import('../Patients/PatientList.js').then(module => {
      const PatientList = module.default;
      const patientList = PatientList();
      patientList.render();
    }).catch(err => console.error('Error loading PatientList:', err));
  }

  function navigateToConfig(e) {
    e.preventDefault();
    import('./ConfigurationMenu.js').then(module => {
      const ConfigurationMenu = module.default;
      ConfigurationMenu().render();
    }).catch(err => console.error('Error loading ConfigurationMenu:', err));
  }

  function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    import('../Auth/Login.js').then(module => {
      const Login = module.default;
      Login();
    }).catch(err => console.error('Error loading Login:', err));
  }

  function handleAddResidence(e) {
    e.preventDefault();
    const residenceName = document.getElementById('residenceName').value;
    const residenceType = document.getElementById('residenceType').value;
    if (residenceName) {
      window.electronAPI.send('addResidence', { name: residenceName, type: residenceType });
      document.getElementById('residenceName').value = '';
    }
  }

  function loadResidences() {
    window.electronAPI.send('getResidences');
  }

  function deleteResidence(id) {
    window.electronAPI.send('deleteResidence', id);
  }

  window.electronAPI.receive('residencesData', (residences) => {
    const list = document.getElementById('residenceList');
    list.innerHTML = residences.map(r => `
      <li class="flex justify-between items-center p-2 bg-white rounded shadow">
        <span>${r.name} (${r.type})</span>
        <button class="delete-residence text-red-500 hover:text-red-700" data-id="${r.id}">Supprimer</button>
      </li>
    `).join('');

    document.querySelectorAll('.delete-residence').forEach(button => {
      button.addEventListener('click', () => deleteResidence(button.dataset.id));
    });
  });

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

  window.electronAPI.receive('residenceAdded', (result) => {
    if (result.error) {
      showToast(`Erreur lors de l'ajout de la résidence: ${result.error}`, 'error');
    } else {
      loadResidences();
    }
  });

  window.electronAPI.receive('residenceDeleted', (result) => {
    if (result.error) {
      showToast(`Erreur lors de la suppression de la résidence: ${result.error}`, 'error');
    } else {
      loadResidences();
    }
  });

  return { render };
}