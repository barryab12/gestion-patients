// src/components/Followups/AddFollowup.js

export default function AddFollowup(patientId, onFollowupAdded) {
    let formContainer = null;

    function render() {
        const template = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="addFollowupModal">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Ajouter un suivi</h3>
              <form id="addFollowupForm" class="mt-2 text-left">
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
                  <button type="button" id="cancelAddFollowup" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Annuler
                  </button>
                  <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
    }

    function addEventListeners() {
        formContainer.querySelector('#addFollowupForm').addEventListener('submit', handleAddFollowup);
        formContainer.querySelector('#cancelAddFollowup').addEventListener('click', closeModal);
    }

    function handleAddFollowup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const followupData = Object.fromEntries(formData.entries());

        followupData.patientId = patientId;
        followupData.pulse = parseInt(followupData.pulse) || null;
        followupData.weight = parseFloat(followupData.weight) || null;
        followupData.temperature = parseFloat(followupData.temperature) || null;

        window.electronAPI.send('addFollowup', followupData);
    }

    function closeModal() {
        if (formContainer) {
            formContainer.remove();
        }
    }

    window.electronAPI.receive('addFollowupResponse', (response) => {
        if (response.success) {
            alert('Suivi ajouté avec succès');
            closeModal();
            if (typeof onFollowupAdded === 'function') {
                onFollowupAdded();
            }
        } else {
            alert("Erreur lors de l'ajout du suivi : " + response.error);
        }
    });

    return {
        render,
        closeModal
    };
}