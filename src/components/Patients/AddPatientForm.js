// src/components/Patients/AddPatientForm.js

export default function AddPatientForm(onPatientAdded) {
  let formContainer = null;

  function render() {
    const template = `
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="addPatientModal">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Ajouter un nouveau patient</h3>
            <form id="addPatientForm" class="mt-2 text-left">
              <!-- Form fields here -->
              <div class="mb-4">
                <label for="lastName" class="block text-gray-700 text-sm font-bold mb-2">Nom</label>
                <input type="text" id="lastName" name="lastName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
              </div>
              <div class="mb-4">
                <label for="firstName" class="block text-gray-700 text-sm font-bold mb-2">Prénom</label>
                <input type="text" id="firstName" name="firstName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
              </div>
              <div class="mb-4">
                <label for="dateOfBirth" class="block text-gray-700 text-sm font-bold mb-2">Date de naissance</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
              </div>
              <div class="mb-4">
                <label for="gender" class="block text-gray-700 text-sm font-bold mb-2">Genre</label>
                <select id="gender" name="gender" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                  <option value="">Sélectionnez</option>
                  <option value="male">Masculin</option>
                  <option value="female">Féminin</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div class="mb-4">
                <label for="profession" class="block text-gray-700 text-sm font-bold mb-2">Profession</label>
                <select id="profession" name="profession" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Sélectionnez une profession</option>
                </select>
              </div>
              <div class="mb-4">
                <label for="currentResidence" class="block text-gray-700 text-sm font-bold mb-2">Résidence actuelle</label>
                <select id="currentResidence" name="currentResidence" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Sélectionnez une résidence</option>
                </select>
              </div>
              <div class="mb-4">
                <label for="usualResidence" class="block text-gray-700 text-sm font-bold mb-2">Résidence habituelle</label>
                <select id="usualResidence" name="usualResidence" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Sélectionnez une résidence</option>
                </select>
              </div>
              <div class="flex items-center justify-between mt-4">
                <button type="button" id="cancelAddPatient" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Annuler
                </button>
                <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    formContainer = document.createElement('div');
    formContainer.innerHTML = template;
    document.body.appendChild(formContainer);

    addEventListeners();
    loadProfessionsAndResidences();
  }

  function addEventListeners() {
    formContainer.querySelector('#addPatientForm').addEventListener('submit', handleAddPatient);
    formContainer.querySelector('#cancelAddPatient').addEventListener('click', closeModal);
  }

  function handleAddPatient(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const patientData = Object.fromEntries(formData.entries());
    const userId = localStorage.getItem('userId');

    // Convertir les ID en nombres
    patientData.professionId = parseInt(patientData.profession);
    patientData.currentResidenceId = parseInt(patientData.currentResidence);
    patientData.usualResidenceId = parseInt(patientData.usualResidence);

    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('addPatient', { patientData, userId });
    } else {
      console.error('Electron API is not available');
    }
  }

  function closeModal() {
    if (formContainer) {
      formContainer.remove();
    }
  }

  function loadProfessionsAndResidences() {
    window.electronAPI.send('getProfessions');
    window.electronAPI.send('getResidences');
  }

  window.electronAPI.receive('professionsData', (professions) => {
    const select = formContainer.querySelector('#profession');
    professions.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      select.appendChild(option);
    });
  });

  window.electronAPI.receive('residencesData', (residences) => {
    const currentSelect = formContainer.querySelector('#currentResidence');
    const usualSelect = formContainer.querySelector('#usualResidence');
    residences.forEach(r => {
      const option = document.createElement('option');
      option.value = r.id;
      option.textContent = r.name;
      currentSelect.appendChild(option.cloneNode(true));
      usualSelect.appendChild(option.cloneNode(true));
    });
  });

  if (window.electronAPI && typeof window.electronAPI.receive === 'function') {
    window.electronAPI.receive('addPatientResponse', (response) => {
      if (response.success) {
        alert('Patient ajouté avec succès');
        closeModal();
        if (typeof onPatientAdded === 'function') {
          onPatientAdded();
        }
      } else {
        alert("Erreur lors de l'ajout du patient : " + response.error);
      }
    });
  }

  return {
    render,
    closeModal
  };
}