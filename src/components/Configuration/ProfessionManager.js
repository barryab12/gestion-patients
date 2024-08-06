// src/components/Configuration/ProfessionManager.js

export default function ProfessionManager() {
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
            <h2 class="text-2xl font-semibold mb-5">Gérer les professions</h2>
            <form id="addProfessionForm" class="mb-4">
              <div class="flex">
                <input type="text" id="professionName" placeholder="Nouvelle profession" class="flex-grow px-3 py-2 border rounded-l">
                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600">Ajouter</button>
              </div>
            </form>
            <ul id="professionList" class="space-y-2"></ul>
          </div>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = template;
    loadProfessions();
    addEventListeners();
  }

  function addEventListeners() {
    document.getElementById('dashboardLink').addEventListener('click', navigateToDashboard);
    document.getElementById('patientListLink').addEventListener('click', navigateToPatientList);
    document.getElementById('configLink').addEventListener('click', navigateToConfig);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('addProfessionForm').addEventListener('submit', handleAddProfession);
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

  function handleAddProfession(e) {
    e.preventDefault();
    const professionName = document.getElementById('professionName').value;
    if (professionName) {
      window.electronAPI.send('addProfession', professionName);
      document.getElementById('professionName').value = '';
    }
  }

  function loadProfessions() {
    window.electronAPI.send('getProfessions');
  }

  function deleteProfession(id) {
    window.electronAPI.send('deleteProfession', id);
  }

  window.electronAPI.receive('professionsData', (professions) => {
    const list = document.getElementById('professionList');
    list.innerHTML = professions.map(p => `
      <li class="flex justify-between items-center p-2 bg-white rounded shadow">
        <span>${p.name}</span>
        <button class="delete-profession text-red-500 hover:text-red-700" data-id="${p.id}">Supprimer</button>
      </li>
    `).join('');

    document.querySelectorAll('.delete-profession').forEach(button => {
      button.addEventListener('click', () => deleteProfession(button.dataset.id));
    });
  });



  window.electronAPI.receive('professionAdded', (result) => {
    if (result.error) {
      showToast(`Erreur lors de l'ajout de la profession: ${result.error}`, 'error');
    } else {
      loadProfessions();
    }
  });

  window.electronAPI.receive('professionDeleted', (result) => {
    if (result.error) {
      showToast(`Erreur lors de la suppression de la profession: ${result.error}`, `error`);
    } else {
      loadProfessions();
    }
  });

  return { render };
}