// src/components/Configuration/ConfigurationMenu.js

export default function ConfigurationMenu() {
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
                  <a href="#" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
            <h2 class="text-2xl font-semibold mb-5">Configuration</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button id="manageProfessions" class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                Gérer les professions
              </button>
              <button id="manageResidences" class="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                Gérer les résidences
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = template;
    addEventListeners();
  }

  function addEventListeners() {
    document.getElementById('dashboardLink').addEventListener('click', navigateToDashboard);
    document.getElementById('patientListLink').addEventListener('click', navigateToPatientList);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('manageProfessions').addEventListener('click', navigateToProfessionManager);
    document.getElementById('manageResidences').addEventListener('click', navigateToResidenceManager);
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

  function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    import('../Auth/Login.js').then(module => {
      const Login = module.default;
      Login();
    }).catch(err => console.error('Error loading Login:', err));
  }

  function navigateToProfessionManager() {
    import('./ProfessionManager.js').then(module => {
      const ProfessionManager = module.default;
      ProfessionManager().render();
    }).catch(err => console.error('Error loading ProfessionManager:', err));
  }

  function navigateToResidenceManager() {
    import('./ResidenceManager.js').then(module => {
      const ResidenceManager = module.default;
      ResidenceManager().render();
    }).catch(err => console.error('Error loading ResidenceManager:', err));
  }

  return { render };
}