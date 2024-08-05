// src/components/Dashboard.js

export default function Dashboard() {
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
                  <a href="#" class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="#" id="patientListLink" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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

        <header class="bg-white shadow">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900">Dashboard</h2>
          </div>
        </header>

        <main>
          <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            Total Patients
                          </dt>
                          <dd class="text-lg font-medium text-gray-900" id="totalPatients">
                            Chargement...
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">
                            Consultations ce mois
                          </dt>
                          <dd class="text-lg font-medium text-gray-900" id="monthlyConsultations">
                            Chargement...
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Consultations par mois</h3>
                    <div class="mt-5">
                      <div id="consultationsChart" style="height: 300px;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Répartition des patients par âge et sexe</h3>
                    <div class="mt-5">
                      <div id="ageGenderDistributionChart" style="height: 350px;"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    `;

    document.getElementById('app').innerHTML = template;
    addEventListeners();
    loadDashboardData();
  }

  function addEventListeners() {
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('patientListLink').addEventListener('click', navigateToPatientList);
    document.getElementById('configLink').addEventListener('click', navigateToConfig);

  }


  function navigateToConfig(e) {
    e.preventDefault();
    import('./Configuration/ConfigurationMenu.js').then(module => {
      const ConfigurationMenu = module.default;
      ConfigurationMenu().render();
    }).catch(err => console.error('Error loading ConfigurationMenu:', err));
  }

  function navigateToPatientList(e) {
    e.preventDefault();
    import('./Patients/PatientList.js').then(module => {
      const PatientList = module.default;
      const patientList = PatientList();
      patientList.render();
    }).catch(err => console.error('Error loading PatientList:', err));
  }

  function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    import('./Auth/Login.js').then(module => {
      const Login = module.default;
      Login();
    }).catch(err => console.error('Error loading Login:', err));
  }

  function loadDashboardData() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      updateDashboardUI({ error: 'Utilisateur non connecté' });
      return;
    }

    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('getDashboardData', userId);
      window.electronAPI.send('getAgeGenderDistribution', userId);
    } else {
      console.error('Electron API is not available');
      updateDashboardUI({ error: 'Impossible de charger les données' });
    }
  }

  function createConsultationsChart(data) {
    if (!data || !data.labels || !data.values || data.labels.length === 0 || data.values.length === 0) {
      console.error('Invalid chart data:', data);
      document.getElementById('consultationsChart').innerHTML = 'Données non disponibles pour le graphique';
      return;
    }

    const options = {
      chart: {
        type: 'bar',
        height: 350
      },
      series: [{
        name: 'Consultations',
        data: data.values
      }],
      xaxis: {
        categories: data.labels,
        title: {
          text: 'Mois'
        }
      },
      yaxis: {
        title: {
          text: 'Nombre de consultations'
        }
      },
      colors: ['#4F46E5']
    };

    const chart = new ApexCharts(document.getElementById('consultationsChart'), options);
    chart.render();
  }

  function updateDashboardUI(data) {
    if (data.error) {
      document.getElementById('totalPatients').textContent = 'Erreur';
      document.getElementById('monthlyConsultations').textContent = 'Erreur';
      document.getElementById('consultationsChart').innerHTML = data.error;
      return;
    }

    document.getElementById('totalPatients').textContent = data.totalPatients || 'N/A';
    document.getElementById('monthlyConsultations').textContent = data.monthlyConsultations || 'N/A';
    createConsultationsChart(data.consultationsPerMonth);
  }

  function createAgeGenderDistributionChart(data) {
    const options = {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
      },
      series: [
        {
          name: 'Hommes',
          data: data.male
        },
        {
          name: 'Femmes',
          data: data.female
        }
      ],
      xaxis: {
        categories: ['0-18', '19-30', '31-45', '46-60', '61+'],
        title: {
          text: 'Tranches d\'âge'
        }
      },
      yaxis: {
        title: {
          text: 'Nombre de patients'
        }
      },
      colors: ['#008FFB', '#FF4560'],
      title: {
        text: 'Répartition des patients par âge et sexe',
        align: 'center'
      }
    };

    const chart = new ApexCharts(document.getElementById('ageGenderDistributionChart'), options);
    chart.render();
  }

  if (window.electronAPI && typeof window.electronAPI.receive === 'function') {
    window.electronAPI.receive('dashboardDataResponse', (data) => {
      console.log('Received dashboard data:', data);
      updateDashboardUI(data);
    });

    window.electronAPI.receive('ageGenderDistributionResponse', (data) => {
      if (data.error) {
        console.error('Error loading age-gender distribution:', data.error);
      } else {
        createAgeGenderDistributionChart(data);
      }
    });

  } else {
    console.error('Electron API receive function is not available');
  }

  return {
    render
  };
}