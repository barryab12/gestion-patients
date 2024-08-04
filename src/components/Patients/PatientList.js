// src/components/Patients/PatientList.js

export default function PatientList() {
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
                    <a href="#" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Liste des Patients
                    </a>
                    <a href="#" id="configLink" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
  
          <div class="container mx-auto px-4 sm:px-8">
            <div class="py-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold leading-tight">Liste des Patients</h2>
                <button id="addPatientButton" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Ajouter un Patient
                </button>
              </div>
              <div class="my-2 flex sm:flex-row flex-col">
                <div class="flex flex-row mb-1 sm:mb-0">
                  <div class="relative">
                    <select id="patientsPerPage" class="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                      <option>5</option>
                      <option>10</option>
                      <option>20</option>
                    </select>
                  </div>
                  <div class="relative">
                    <select id="patientStatus" class="appearance-none h-full rounded-r border-t sm:rounded-r-none sm:border-r-0 border-r border-b block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500">
                      <option>Tous</option>
                      <option>Actif</option>
                      <option>Inactif</option>
                    </select>
                  </div>
                </div>
                <div class="block relative">
                  <span class="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current text-gray-500">
                      <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                    </svg>
                  </span>
                  <input id="searchPatients" placeholder="Rechercher" class="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none" />
                </div>
              </div>
              <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div class="inline-block min-w-full shadow rounded-lg overflow-hidden">
                  <table class="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Numéro
                        </th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Patient
                        </th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date de Naissance
                        </th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Profession
                        </th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Résidence Actuelle
                        </th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Dernière Consultation
                        </th>
                        <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody id="patientTableBody">
                      <!-- Les données des patients seront insérées ici -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

        document.getElementById('app').innerHTML = template;
        addEventListeners();
        loadPatients();
    }

    function addEventListeners() {
        document.getElementById('dashboardLink').addEventListener('click', navigateToDashboard);
        document.getElementById('configLink').addEventListener('click', navigateToConfig);
        document.getElementById('logoutButton').addEventListener('click', handleLogout);
        document.getElementById('addPatientButton').addEventListener('click', handleAddPatient);
        document.getElementById('patientsPerPage').addEventListener('change', handlePatientsPerPageChange);
        document.getElementById('patientStatus').addEventListener('change', handlePatientStatusChange);
        document.getElementById('searchPatients').addEventListener('input', handleSearchPatients);
    }

    function navigateToDashboard(e) {
        e.preventDefault();
        import('../Dashboard.js').then(module => {
            const Dashboard = module.default;
            const dashboard = Dashboard();
            dashboard.render();
        }).catch(err => console.error('Error loading Dashboard:', err));
    }

    function navigateToConfig(e) {
        e.preventDefault();
        import('../Configuration/ConfigurationMenu.js').then(module => {
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

    function handleAddPatient() {
        import('./AddPatientForm.js').then(module => {
            const AddPatientForm = module.default;
            const addPatientForm = AddPatientForm(loadPatients);
            addPatientForm.render();
        }).catch(err => console.error('Error loading AddPatientForm:', err));
    }

    function handlePatientsPerPageChange() {
        loadPatients();
    }

    function handlePatientStatusChange() {
        loadPatients();
    }

    function handleSearchPatients() {
        loadPatients();
    }

    function loadPatients() {
        const patientsPerPage = document.getElementById('patientsPerPage')?.value;
        const status = document.getElementById('patientStatus')?.value;
        const searchTerm = document.getElementById('searchPatients')?.value;
        const userId = localStorage.getItem('userId');

        const params = {
            patientsPerPage: patientsPerPage || null,
            status: status || 'all',
            searchTerm: searchTerm || '',
            userId: userId
        };

        if (window.electronAPI && typeof window.electronAPI.send === 'function') {
            window.electronAPI.send('getPatients', params);
        } else {
            console.error('Electron API is not available');
        }
    }

    function viewPatient(patientId) {
        import('./PatientDetails.js').then(module => {
            const PatientDetails = module.default;
            const patientDetails = PatientDetails();
            patientDetails.render(patientId);
        }).catch(err => console.error('Error loading PatientDetails:', err));
    }

    function editPatient(patientId) {
        console.log('Edit patient:', patientId);
        // À implémenter plus tard
    }

    function displayPatients(patients) {
        const tableBody = document.getElementById('patientTableBody');
        tableBody.innerHTML = patients.map(patient => `
            <tr>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">${patient.patient_number}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div class="flex items-center">
                        <div class="ml-3">
                            <p class="text-gray-900 whitespace-no-wrap">
                                ${patient.first_name} ${patient.last_name}
                            </p>
                        </div>
                    </div>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">${patient.date_of_birth}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">${patient.profession || 'N/A'}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">${patient.current_residence || 'N/A'}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">${patient.last_consultation || 'N/A'}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button class="view-patient text-indigo-600 hover:text-indigo-900" data-id="${patient.id}">Voir</button>
                    <button class="edit-patient text-indigo-600 hover:text-indigo-900 ml-2" data-id="${patient.id}">Modifier</button>
                </td>
            </tr>
        `).join('');

        // Ajouter les écouteurs d'événements pour les boutons
        document.querySelectorAll('.view-patient').forEach(button => {
            button.addEventListener('click', () => viewPatient(button.dataset.id));
        });
        document.querySelectorAll('.edit-patient').forEach(button => {
            button.addEventListener('click', () => editPatient(button.dataset.id));
        });
    }

    if (window.electronAPI && typeof window.electronAPI.receive === 'function') {
        window.electronAPI.receive('patientsData', (patients) => {
            displayPatients(patients);
        });
    }

    return {
        render
    };
}