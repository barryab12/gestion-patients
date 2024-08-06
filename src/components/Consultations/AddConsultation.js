// src/components/Consultations/AddConsultation.js

export default function AddConsultation(patientId, onConsultationAdded) {
  let formContainer = null;

  function render() {
    const template = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="addConsultationModal">
          <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Ajouter une consultation</h3>
              <form id="addConsultationForm" class="mt-2 text-left">
                <div class="grid grid-cols-2 gap-4">
                  <div class="mb-4">
                    <label for="consultationDate" class="block text-gray-700 text-sm font-bold mb-2">Date de consultation</label>
                    <input type="date" id="consultationDate" name="consultationDate" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                  </div>
                  <div class="mb-4">
                    <label for="reason" class="block text-gray-700 text-sm font-bold mb-2">Motif</label>
                    <input type="text" id="reason" name="reason" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
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
                </div>
                <div class="mb-4">
                  <label for="medicalHistory" class="block text-gray-700 text-sm font-bold mb-2">Antécédents médicaux</label>
                  <textarea id="medicalHistory" name="medicalHistory" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"></textarea>
                </div>
                <div class="mb-4">
                  <label for="clinicalExamination" class="block text-gray-700 text-sm font-bold mb-2">Examen clinique</label>
                  <textarea id="clinicalExamination" name="clinicalExamination" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"></textarea>
                </div>
                <div class="mb-4">
                  <label for="diagnosis" class="block text-gray-700 text-sm font-bold mb-2">Diagnostic</label>
                  <input type="text" id="diagnosis" name="diagnosis" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <div class="mb-4">
                  <label for="treatment" class="block text-gray-700 text-sm font-bold mb-2">Traitement</label>
                  <textarea id="treatment" name="treatment" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"></textarea>
                </div>
                <div class="flex items-center justify-between mt-4">
                  <button type="button" id="cancelAddConsultation" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
    formContainer.querySelector('#addConsultationForm').addEventListener('submit', handleAddConsultation);
    formContainer.querySelector('#cancelAddConsultation').addEventListener('click', closeModal);
  }



  function handleAddConsultation(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const consultationData = Object.fromEntries(formData.entries());

    consultationData.patientId = patientId;
    consultationData.pulse = parseInt(consultationData.pulse) || null;
    consultationData.weight = parseFloat(consultationData.weight) || null;
    consultationData.temperature = parseFloat(consultationData.temperature) || null;

    window.electronAPI.send('addConsultation', consultationData);
  }

  function closeModal() {
    if (formContainer) {
      formContainer.remove();
    }
  }

  window.electronAPI.receive('addConsultationResponse', (response) => {
    if (response.success) {
      showToast('Consultation ajoutée avec succès', 'success');
      closeModal();
      if (typeof onConsultationAdded === 'function') {
        onConsultationAdded();
      }
    } else {
      showToast("Erreur lors de l'ajout de la consultation : " + response.error, 'error');
    }
  });

  return {
    render,
    closeModal
  };
}