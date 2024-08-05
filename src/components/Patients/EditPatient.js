// src/components/Patients/EditPatient.js

export default function EditPatient(patientId, onPatientUpdated) {
  let formContainer = null;
  let patientData = null;

  function render() {
    const template = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="editPatientModal">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Modifier le patient</h3>
              <form id="editPatientForm" class="mt-2 text-left">
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
                <div class="mb-4">
                  <label for="contacts" class="block text-gray-700 text-sm font-bold mb-2">Contacts</label>
                  <input type="text" id="contacts" name="contacts" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="flex items-center justify-between mt-4">
                  <button type="button" id="cancelEditPatient" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Annuler
                  </button>
                  <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Mettre à jour
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

    loadPatientData();
    loadProfessionsAndResidences();
    addEventListeners();
  }

  function addEventListeners() {
    formContainer.querySelector('#editPatientForm').addEventListener('submit', handleEditPatient);
    formContainer.querySelector('#cancelEditPatient').addEventListener('click', closeModal);
  }

  function loadPatientData() {
    window.electronAPI.send('getPatientDetails', { patientId, userId: localStorage.getItem('userId') });
  }

  function populateForm(patient) {
    patientData = patient;
    formContainer.querySelector('#lastName').value = patient.last_name;
    formContainer.querySelector('#firstName').value = patient.first_name;
    formContainer.querySelector('#dateOfBirth').value = patient.date_of_birth;
    formContainer.querySelector('#gender').value = patient.gender;
    formContainer.querySelector('#profession').value = patient.profession_id || '';
    formContainer.querySelector('#currentResidence').value = patient.current_residence_id || '';
    formContainer.querySelector('#usualResidence').value = patient.usual_residence_id || '';
    formContainer.querySelector('#contacts').value = patient.contacts || '';

  }

  function handleEditPatient(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedPatientData = Object.fromEntries(formData.entries());

    // Convertir les ID en nombres
    updatedPatientData.professionId = parseInt(updatedPatientData.profession) || null;
    updatedPatientData.currentResidenceId = parseInt(updatedPatientData.currentResidence) || null;
    updatedPatientData.usualResidenceId = parseInt(updatedPatientData.usualResidence) || null;

    updatedPatientData.contacts = formData.get('contacts');

    // Ajouter l'ID du patient
    updatedPatientData.id = patientId;

    window.electronAPI.send('updatePatient', updatedPatientData);
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

  window.electronAPI.receive('patientDetailsResponse', (patient) => {
    populateForm(patient);
  });

  window.electronAPI.receive('professionsData', (professions) => {
    const select = formContainer.querySelector('#profession');
    professions.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      select.appendChild(option);
    });
    if (patientData) {
      select.value = patientData.profession_id || '';
    }
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
    if (patientData) {
      currentSelect.value = patientData.current_residence_id || '';
      usualSelect.value = patientData.usual_residence_id || '';
    }
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

  window.electronAPI.receive('updatePatientResponse', (response) => {
    if (response.success) {
      showToast('Patient mis à jour avec succès', 'success');
      closeModal();
      if (typeof onPatientUpdated === 'function') {
        onPatientUpdated();
      }
    } else {
      showToast("Erreur lors de la mise à jour du patient : " + response.error, 'error');
    }
  });

  return {
    render,
    closeModal
  };
}