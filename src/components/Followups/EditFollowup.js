// src/components/Followups/EditFollowup.js

export default function EditFollowup(followupId, onFollowupUpdated) {
  let formContainer = null;
  let followupData = null;

  function render() {
    const template = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="editFollowupModal">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Modifier le suivi</h3>
              <form id="editFollowupForm" class="mt-2 text-left">
                <div class="mb-4">
                  <label for="followupDate" class="block text-gray-700 text-sm font-bold mb-2">Date du suivi</label>
                  <input type="date" id="followupDate" name="followupDate" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-4">
                  <label for="bloodPressure" class="block text-gray-700 text-sm font-bold mb-2">Tension artérielle</label>
                  <input type="text" id="bloodPressure" name="bloodPressure" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="ex: 120/80">
                </div>
                <div class="mb-4">
                  <label for="pulse" class="block text-gray-700 text-sm font-bold mb-2">Pouls</label>
                  <input type="number" id="pulse" name="pulse" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="ex: 72">
                </div>
                <div class="mb-4">
                  <label for="weight" class="block text-gray-700 text-sm font-bold mb-2">Poids (kg)</label>
                  <input type="number" id="weight" name="weight" step="0.1" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="ex: 70.5">
                </div>
                <div class="mb-4">
                  <label for="temperature" class="block text-gray-700 text-sm font-bold mb-2">Température (°C)</label>
                  <input type="number" id="temperature" name="temperature" step="0.1" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="ex: 37.0">
                </div>
                <div class="mb-4">
                  <label for="observation" class="block text-gray-700 text-sm font-bold mb-2">Observation</label>
                  <textarea id="observation" name="observation" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"></textarea>
                </div>
                <div class="flex items-center justify-between mt-4">
                  <button type="button" id="cancelEditFollowup" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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

    loadFollowupData();
    addEventListeners();
  }

  function addEventListeners() {
    formContainer.querySelector('#editFollowupForm').addEventListener('submit', handleEditFollowup);
    formContainer.querySelector('#cancelEditFollowup').addEventListener('click', closeModal);
  }

  function loadFollowupData() {
    window.electronAPI.send('getFollowupDetails', followupId);
  }

  function populateForm(followup) {
    followupData = followup;
    formContainer.querySelector('#followupDate').value = followup.followup_date;
    formContainer.querySelector('#bloodPressure').value = followup.blood_pressure || '';
    formContainer.querySelector('#pulse').value = followup.pulse || '';
    formContainer.querySelector('#weight').value = followup.weight || '';
    formContainer.querySelector('#temperature').value = followup.temperature || '';
    formContainer.querySelector('#observation').value = followup.observation || '';
  }

  function handleEditFollowup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedFollowupData = Object.fromEntries(formData.entries());

    updatedFollowupData.id = followupId;
    updatedFollowupData.pulse = parseInt(updatedFollowupData.pulse) || null;
    updatedFollowupData.weight = parseFloat(updatedFollowupData.weight) || null;
    updatedFollowupData.temperature = parseFloat(updatedFollowupData.temperature) || null;

    window.electronAPI.send('updateFollowup', updatedFollowupData);
  }

  function closeModal() {
    if (formContainer) {
      formContainer.remove();
    }
  }



  window.electronAPI.receive('followupDetailsResponse', (followup) => {
    populateForm(followup);
  });

  window.electronAPI.receive('updateFollowupResponse', (response) => {
    if (response.success) {
      showToast('Suivi mis à jour avec succès', 'success');
      closeModal();
      if (typeof onFollowupUpdated === 'function') {
        onFollowupUpdated();
      }
    } else {
      showToast("Erreur lors de la mise à jour du suivi : " + response.error, 'error');
    }
  });

  return {
    render,
    closeModal
  };
}