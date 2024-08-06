// src/components/Patients/PatientDetails.js

export default function PatientDetails() {
  let patientId = null;

  function render() {
    const template = `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Détails du Patient</h2>
        <button id="backToPatientList" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Retour à la Liste des Patients
        </button>
      </div>
      <div id="patientInfo" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <!-- Les informations du patient seront injectées ici -->
      </div>
       <div class="flex space-x-4 mb-4">
          <button id="generatePdfBtn" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Générer PDF
          </button>
          <button id="generateDocxBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Générer DOCX
          </button>
        </div>
      <div class="flex space-x-4">
        <button id="editPatientBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Modifier
        </button>
        <button id="deletePatientBtn" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Supprimer
        </button>
        <button id="addConsultationBtn" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Ajouter une Consultation
        </button>
        <button id="addFollowupBtn" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Ajouter un Suivi
        </button>
      </div>
      <div class="mt-8">
        <h3 class="text-xl font-bold mb-4">Consultations</h3>
        <div id="consultationList">
          <!-- La liste des consultations sera injectée ici -->
        </div>
      </div>
      <div class="mt-8">
        <h3 class="text-xl font-bold mb-4">Suivis</h3>
        <div id="followupList">
          <!-- La liste des suivis sera injectée ici -->
        </div>
      </div>
    </div>
  `;

    document.getElementById('app').innerHTML = template;
    addEventListeners();
    loadPatientDetails();
    loadConsultations();
    loadFollowups();
  }

  function addEventListeners() {
    document.getElementById('backToPatientList').addEventListener('click', navigateToPatientList);
    document.getElementById('editPatientBtn').addEventListener('click', handleEditPatient);
    document.getElementById('deletePatientBtn').addEventListener('click', handleDeletePatient);
    document.getElementById('addConsultationBtn').addEventListener('click', handleAddConsultation);
    document.getElementById('addFollowupBtn').addEventListener('click', handleAddFollowup);
    document.getElementById('generatePdfBtn').addEventListener('click', handleGeneratePdf);
    document.getElementById('generateDocxBtn').addEventListener('click', handleGenerateDocx);
  }


  function handleGeneratePdf() {
    const userId = localStorage.getItem('userId');
    console.log('Generating PDF for patient ID:', patientId, 'User ID:', userId);
    if (!patientId || !userId) {
      showToast('Erreur : ID du patient ou de l\'utilisateur non défini');
      return;
    }
    window.electronAPI.send('generatePdf', { patientId, userId });
  }


  function handleGenerateDocx() {
    const userId = localStorage.getItem('userId');
    console.log('Generating DOCX for patient ID:', patientId, 'User ID:', userId);
    if (!patientId || !userId) {
      showToast('Erreur : ID du patient ou de l\'utilisateur non défini');
      return;
    }
    window.electronAPI.send('generateDocx', { patientId, userId });
  }


  function navigateToPatientList() {
    import('./PatientList.js').then(module => {
      const PatientList = module.default;
      const patientList = PatientList();
      patientList.render();
    }).catch(err => console.error('Error loading PatientList:', err));
  }

  function handleEditPatient() {
    import('./EditPatient.js').then(module => {
      const EditPatient = module.default;
      const editPatient = EditPatient(patientId, loadPatientDetails);
      editPatient.render();
    }).catch(err => console.error('Error loading EditPatient:', err));
  }

  function handleDeletePatient() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      window.electronAPI.send('deletePatient', patientId);
    }
  }

  function handleAddConsultation() {
    import('../Consultations/AddConsultation.js').then(module => {
      const AddConsultation = module.default;
      const addConsultation = AddConsultation(patientId, loadConsultations);
      addConsultation.render();
    }).catch(err => console.error('Error loading AddConsultation:', err));
  }

  function loadConsultations() {
    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('getConsultations', patientId);
    } else {
      console.error('Electron API is not available');
    }
  }

  function displayConsultations(consultations) {
    const consultationList = document.getElementById('consultationList');
    if (consultations.length === 0) {
      consultationList.innerHTML = '<p>Aucune consultation enregistrée.</p>';
    } else {
      consultationList.innerHTML = consultations.map(consultation => `
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h4 class="text-xl font-bold mb-4">Consultation du ${new Date(consultation.consultation_date).toLocaleDateString()}</h4>
                <div class="grid grid-cols-2 gap-4">
                    <p><strong>Motif:</strong> ${consultation.reason || 'Non spécifié'}</p>
                    <p><strong>Tension artérielle:</strong> ${consultation.blood_pressure || 'Non mesurée'}</p>
                    <p><strong>Pouls:</strong> ${consultation.pulse ? consultation.pulse + ' bpm' : 'Non mesuré'}</p>
                    <p><strong>Poids:</strong> ${consultation.weight ? consultation.weight + ' kg' : 'Non mesuré'}</p>
                    <p><strong>Température:</strong> ${consultation.temperature ? consultation.temperature + ' °C' : 'Non mesurée'}</p>
                </div>
                <div class="mt-4">
                    <p><strong>Antécédents médicaux:</strong></p>
                    <p class="ml-4">${consultation.medical_history || 'Non spécifiés'}</p>
                </div>
                <div class="mt-4">
                    <p><strong>Examen clinique:</strong></p>
                    <p class="ml-4">${consultation.clinical_examination || 'Non spécifié'}</p>
                </div>
                <div class="mt-4">
                    <p><strong>Diagnostic:</strong></p>
                    <p class="ml-4">${consultation.diagnosis || 'Non spécifié'}</p>
                </div>
                <div class="mt-4">
                    <p><strong>Traitement:</strong></p>
                    <p class="ml-4">${consultation.medical_treatment || 'Non spécifié'}</p>
                </div>
                <div class="mt-4 flex justify-end space-x-2">
                    <button class="edit-consultation bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" data-id="${consultation.id}">
                        Modifier
                    </button>
                    <button class="delete-consultation bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${consultation.id}">
                        Supprimer
                    </button>
                </div>
            </div>
        `).join('');

      // Ajouter les event listeners pour les boutons de modification et de suppression
      document.querySelectorAll('.edit-consultation').forEach(button => {
        button.addEventListener('click', (e) => handleEditConsultation(e.target.dataset.id));
      });
      document.querySelectorAll('.delete-consultation').forEach(button => {
        button.addEventListener('click', (e) => handleDeleteConsultation(e.target.dataset.id));
      });
    }
  }

  function handleEditConsultation(consultationId) {
    import('../Consultations/EditConsultation.js').then(module => {
      const EditConsultation = module.default;
      const editConsultation = EditConsultation(consultationId, loadConsultations);
      editConsultation.render();
    }).catch(err => console.error('Error loading EditConsultation:', err));
  }

  function handleDeleteConsultation(consultationId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      window.electronAPI.send('deleteConsultation', consultationId);
    }
  }

  function handleAddFollowup() {
    import('../Followups/AddFollowup.js').then(module => {
      const AddFollowup = module.default;
      const addFollowup = AddFollowup(patientId, loadFollowups);
      addFollowup.render();
    }).catch(err => console.error('Error loading AddFollowup:', err));
  }

  function loadPatientDetails() {
    const userId = localStorage.getItem('userId');
    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('getPatientDetails', { patientId, userId });
    } else {
      console.error('Electron API is not available');
    }
  }

  function loadFollowups() {
    if (window.electronAPI && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send('getFollowups', patientId);
    } else {
      console.error('Electron API is not available');
    }
  }

  function handleEditFollowup(followupId) {
    import('../Followups/EditFollowup.js').then(module => {
      const EditFollowup = module.default;
      const editFollowup = EditFollowup(followupId, loadFollowups);
      editFollowup.render();
    }).catch(err => console.error('Error loading EditFollowup:', err));
  }

  function handleDeleteFollowup(followupId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce suivi ?')) {
      window.electronAPI.send('deleteFollowup', followupId);
    }
  }


  function displayPatientDetails(patient) {
    const patientInfo = document.getElementById('patientInfo');
    patientInfo.innerHTML = `
      <p><strong>Numéro de patient:</strong> ${patient.patient_number}</p>
      <p><strong>Nom:</strong> ${patient.last_name}</p>
      <p><strong>Prénom:</strong> ${patient.first_name}</p>
      <p><strong>Date de naissance:</strong> ${patient.date_of_birth}</p>
      <p><strong>Genre:</strong> ${patient.gender}</p>
      <p><strong>Profession:</strong> ${patient.profession || 'Non spécifié'}</p>
      <p><strong>Résidence actuelle:</strong> ${patient.current_residence || 'Non spécifié'}</p>
      <p><strong>Résidence habituelle:</strong> ${patient.usual_residence || 'Non spécifié'}</p>
      <p><strong>Contacts:</strong> ${patient.contacts || 'Non spécifié'}</p>
    `;
  }

  function displayFollowups(followups) {
    const followupList = document.getElementById('followupList');
    if (followups.length === 0) {
      followupList.innerHTML = '<p>Aucun suivi enregistré.</p>';
    } else {
      followupList.innerHTML = followups.map(followup => `
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <p><strong>Date:</strong> ${new Date(followup.followup_date).toLocaleDateString()}</p>
                <p><strong>Tension artérielle:</strong> ${followup.blood_pressure || 'Non mesuré'}</p>
                <p><strong>Pouls:</strong> ${followup.pulse || 'Non mesuré'}</p>
                <p><strong>Poids:</strong> ${followup.weight ? followup.weight + ' kg' : 'Non mesuré'}</p>
                <p><strong>Température:</strong> ${followup.temperature ? followup.temperature + ' °C' : 'Non mesurée'}</p>
                <p><strong>Observation:</strong> ${followup.observation || 'Aucune observation'}</p>
                <div class="mt-4 flex justify-end space-x-2">
                    <button class="edit-followup bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" data-id="${followup.id}">
                        Modifier
                    </button>
                    <button class="delete-followup bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-id="${followup.id}">
                        Supprimer
                    </button>
                </div>
            </div>
        `).join('');

      // Ajouter les event listeners pour les boutons de modification et de suppression
      document.querySelectorAll('.edit-followup').forEach(button => {
        button.addEventListener('click', (e) => handleEditFollowup(e.target.dataset.id));
      });
      document.querySelectorAll('.delete-followup').forEach(button => {
        button.addEventListener('click', (e) => handleDeleteFollowup(e.target.dataset.id));
      });
    }
  }

  if (window.electronAPI && typeof window.electronAPI.receive === 'function') {

    window.electronAPI.receive('documentGenerated', (response) => {
      if (response.success) {
        showToast(`Document ${response.type} généré avec succès`, 'success');
      } else {
        showToast(`Erreur lors de la génération du document ${response.type}: ${response.error}`, 'error');
      }
    });

    window.electronAPI.receive('patientDetailsResponse', (patient) => {
      displayPatientDetails(patient);
    });

    window.electronAPI.receive('deletePatientResponse', (response) => {
      if (response.success) {
        showToast('Patient supprimé avec succès', 'success');
        navigateToPatientList();
      } else {
        showToast("Erreur lors de la suppression du patient : " + response.error, 'error');
      }
    });

    window.electronAPI.receive('deleteFollowupResponse', (response) => {
      if (response.success) {
        showToast('Suivi supprimé avec succès', 'success');
        loadFollowups();
      } else {
        showToast("Erreur lors de la suppression du suivi : " + response.error, 'error');
      }
    });

    window.electronAPI.receive('followupsData', (followups) => {
      if (Array.isArray(followups)) {
        displayFollowups(followups);
      } else {
        console.error('Error loading followups:', followups.error);
      }
    });

    window.electronAPI.receive('consultationsData', (consultations) => {
      if (Array.isArray(consultations)) {
        displayConsultations(consultations);
      } else {
        console.error('Error loading consultations:', consultations.error);
      }
    });

    window.electronAPI.receive('deleteConsultationResponse', (response) => {
      if (response.success) {
        showToast('Consultation supprimée avec succès', 'success');
        loadConsultations();
      } else {
        showToast("Erreur lors de la suppression de la consultation : " + response.error, 'error');
      }
    });

  }

  return {
    render: (id) => {
      patientId = id;
      render();
    }
  };
}