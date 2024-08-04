// src/main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getProfessions, addProfession, deleteProfession, getResidences, addResidence, deleteResidence, loginUser, registerUser, getDashboardData, getPatients, addPatient, getPatientDetails, updatePatient, deletePatient, addFollowup, getFollowups, getFollowupDetails, updateFollowup, deleteFollowup, addConsultation, getConsultations, deleteConsultation, updateConsultation, getConsultationDetails } = require('./db/queries');
const { generatePdf, generateDocx } = require('./documentGenerator');



let mainWindow;

function createWindow() {
    console.log('Creating main window');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const indexPath = path.join(__dirname, '../index.html');
    console.log('Loading index.html from:', indexPath);
    mainWindow.loadFile(indexPath);

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Main window loaded successfully');
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load window:', errorCode, errorDescription);
    });

    if (process.env.NODE_ENV === 'development') {

        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
            hardResetMethod: 'exit',
            forceHardReset: true,
            debug: true
        });
        console.log('Electron-reload configured');

        mainWindow.webContents.openDevTools();
        console.log('DevTools opened');
    }
}

app.whenReady().then(() => {
    console.log('App is ready, creating window');
    createWindow();

    // les gestionnaires IPC sont définis dans le fichier main.js

    ipcMain.on('deleteProfession', async (event, id) => {
        try {
            const result = await deleteProfession(id);
            mainWindow.webContents.send('professionDeleted', result);
            // Rechargez la liste des professions après la suppression
            const professions = await getProfessions();
            mainWindow.webContents.send('professionsData', professions);
        } catch (error) {
            console.error('Error deleting profession:', error);
            mainWindow.webContents.send('professionDeleted', { error: 'Failed to delete profession' });
        }
    });

    ipcMain.on('deleteResidence', async (event, id) => {
        try {
            const result = await deleteResidence(id);
            mainWindow.webContents.send('residenceDeleted', result);
            // Rechargez la liste des résidences après la suppression
            const residences = await getResidences();
            mainWindow.webContents.send('residencesData', residences);
        } catch (error) {
            console.error('Error deleting residence:', error);
            mainWindow.webContents.send('residenceDeleted', { error: 'Failed to delete residence' });
        }
    });

    ipcMain.on('getProfessions', async (event) => {
        try {
            const professions = await getProfessions();
            mainWindow.webContents.send('professionsData', professions);
        } catch (error) {
            console.error('Error fetching professions:', error);
            mainWindow.webContents.send('professionsData', { error: 'Failed to fetch professions' });
        }
    });

    ipcMain.on('addProfession', async (event, name) => {
        try {
            const result = await addProfession(name);
            mainWindow.webContents.send('professionAdded', result);
            // Rechargez la liste des professions après l'ajout
            const professions = await getProfessions();
            mainWindow.webContents.send('professionsData', professions);
        } catch (error) {
            console.error('Error adding profession:', error);
            mainWindow.webContents.send('professionAdded', { error: 'Failed to add profession' });
        }
    });

    ipcMain.on('getResidences', async (event) => {
        try {
            const residences = await getResidences();
            mainWindow.webContents.send('residencesData', residences);
        } catch (error) {
            console.error('Error fetching residences:', error);
            mainWindow.webContents.send('residencesData', { error: 'Failed to fetch residences' });
        }
    });

    ipcMain.on('addResidence', async (event, { name, type }) => {
        try {
            const result = await addResidence(name, type);
            mainWindow.webContents.send('residenceAdded', result);
            // Rechargez la liste des résidences après l'ajout
            const residences = await getResidences();
            mainWindow.webContents.send('residencesData', residences);
        } catch (error) {
            console.error('Error adding residence:', error);
            mainWindow.webContents.send('residenceAdded', { error: 'Failed to add residence' });
        }
    });

    ipcMain.on('getDashboardData', async (event, userId) => {
        try {
            const data = await getDashboardData(userId);
            mainWindow.webContents.send('dashboardDataResponse', data);
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            mainWindow.webContents.send('dashboardDataResponse', { error: 'Failed to get dashboard data' });
        }
    });

    ipcMain.on('login', async (event, { username, password }) => {
        try {
            const result = await loginUser(username, password);
            mainWindow.webContents.send('loginResponse', result);
        } catch (error) {
            console.error('Login error:', error);
            mainWindow.webContents.send('loginResponse', { success: false, message: error.message });
        }
    });

    ipcMain.on('register', async (event, { username, email, password, role }) => {
        try {
            const result = await registerUser(username, email, password, role);
            mainWindow.webContents.send('registerResponse', result);
        } catch (error) {
            console.error('Register error:', error);
            mainWindow.webContents.send('registerResponse', { success: false, message: error.message });
        }
    });

    ipcMain.on('addPatient', async (event, { patientData, userId }) => {
        try {
            const result = await addPatient(patientData, userId);
            mainWindow.webContents.send('addPatientResponse', result);
        } catch (error) {
            console.error('Error adding patient:', error);
            mainWindow.webContents.send('addPatientResponse', { success: false, error: error.message });
        }
    });

    ipcMain.on('getPatients', async (event, { patientsPerPage, status, searchTerm, userId }) => {
        try {
            const patients = await getPatients({ patientsPerPage, status, searchTerm, userId });
            mainWindow.webContents.send('patientsData', patients);
        } catch (error) {
            console.error('Error fetching patients:', error);
            mainWindow.webContents.send('patientsData', { error: 'Failed to fetch patients' });
        }
    });

    ipcMain.on('getPatientDetails', async (event, { patientId, userId }) => {
        try {
            const patientDetails = await getPatientDetails(patientId, userId);
            mainWindow.webContents.send('patientDetailsResponse', patientDetails);
        } catch (error) {
            console.error('Error fetching patient details:', error);
            mainWindow.webContents.send('patientDetailsResponse', { error: 'Failed to fetch patient details' });
        }
    });

    ipcMain.on('updatePatient', async (event, patientData) => {
        try {
            const result = await updatePatient(patientData);
            mainWindow.webContents.send('updatePatientResponse', result);
        } catch (error) {
            console.error('Error updating patient:', error);
            mainWindow.webContents.send('updatePatientResponse', { success: false, error: 'Failed to update patient' });
        }
    });

    ipcMain.on('deletePatient', async (event, patientId) => {
        try {
            const result = await deletePatient(patientId);
            mainWindow.webContents.send('deletePatientResponse', result);
        } catch (error) {
            console.error('Error deleting patient:', error);
            mainWindow.webContents.send('deletePatientResponse', { success: false, error: 'Failed to delete patient' });
        }
    });

    ipcMain.on('addFollowup', async (event, followupData) => {
        try {
            const result = await addFollowup(followupData);
            mainWindow.webContents.send('addFollowupResponse', result);
        } catch (error) {
            console.error('Error adding followup:', error);
            mainWindow.webContents.send('addFollowupResponse', { success: false, error: 'Failed to add followup' });
        }
    });

    ipcMain.on('getFollowups', async (event, patientId) => {
        try {
            const followups = await getFollowups(patientId);
            mainWindow.webContents.send('followupsData', followups);
        } catch (error) {
            console.error('Error getting followups:', error);
            mainWindow.webContents.send('followupsData', { error: 'Failed to get followups' });
        }
    });

    ipcMain.on('getFollowupDetails', async (event, followupId) => {
        try {
            const followup = await getFollowupDetails(followupId);
            mainWindow.webContents.send('followupDetailsResponse', followup);
        } catch (error) {
            console.error('Error getting followup details:', error);
            mainWindow.webContents.send('followupDetailsResponse', { error: 'Failed to get followup details' });
        }
    });

    ipcMain.on('updateFollowup', async (event, followupData) => {
        try {
            const result = await updateFollowup(followupData);
            mainWindow.webContents.send('updateFollowupResponse', result);
        } catch (error) {
            console.error('Error updating followup:', error);
            mainWindow.webContents.send('updateFollowupResponse', { success: false, error: 'Failed to update followup' });
        }
    });

    ipcMain.on('deleteFollowup', async (event, followupId) => {
        try {
            const result = await deleteFollowup(followupId);
            mainWindow.webContents.send('deleteFollowupResponse', result);
        } catch (error) {
            console.error('Error deleting followup:', error);
            mainWindow.webContents.send('deleteFollowupResponse', { success: false, error: 'Failed to delete followup' });
        }
    });

    ipcMain.on('addConsultation', async (event, consultationData) => {
        try {
            const result = await addConsultation(consultationData);
            mainWindow.webContents.send('addConsultationResponse', result);
        } catch (error) {
            console.error('Error adding consultation:', error);
            mainWindow.webContents.send('addConsultationResponse', { success: false, error: 'Failed to add consultation' });
        }
    });

    ipcMain.on('getConsultations', async (event, patientId) => {
        try {
            const consultations = await getConsultations(patientId);
            mainWindow.webContents.send('consultationsData', consultations);
        } catch (error) {
            console.error('Error getting consultations:', error);
            mainWindow.webContents.send('consultationsData', { error: 'Failed to get consultations' });
        }
    });

    ipcMain.on('deleteConsultation', async (event, consultationId) => {
        try {
            const result = await deleteConsultation(consultationId);
            mainWindow.webContents.send('deleteConsultationResponse', result);
        } catch (error) {
            console.error('Error deleting consultation:', error);
            mainWindow.webContents.send('deleteConsultationResponse', { success: false, error: 'Failed to delete consultation' });
        }
    });

    ipcMain.on('updateConsultation', async (event, consultationData) => {
        try {
            const result = await updateConsultation(consultationData);
            mainWindow.webContents.send('updateConsultationResponse', result);
        } catch (error) {
            console.error('Error updating consultation:', error);
            mainWindow.webContents.send('updateConsultationResponse', { success: false, error: 'Failed to update consultation' });
        }
    });

    ipcMain.on('getConsultationDetails', async (event, consultationId) => {
        try {
            const consultation = await getConsultationDetails(consultationId);
            mainWindow.webContents.send('consultationDetailsResponse', consultation);
        } catch (error) {
            console.error('Error getting consultation details:', error);
            mainWindow.webContents.send('consultationDetailsResponse', { error: 'Failed to get consultation details' });
        }
    });

    ipcMain.on('generatePdf', async (event, { patientId, userId }) => {
        try {
            console.log('Generating PDF for patient ID:', patientId, 'User ID:', userId);
            if (!patientId || !userId) {
                throw new Error('Patient ID or User ID is undefined or null');
            }
            const filePath = await generatePdf(patientId, userId);
            mainWindow.webContents.send('documentGenerated', { success: true, type: 'PDF', filePath });
        } catch (error) {
            console.error('Error generating PDF:', error);
            mainWindow.webContents.send('documentGenerated', { success: false, type: 'PDF', error: error.message });
        }
    });

    ipcMain.on('generateDocx', async (event, { patientId, userId }) => {
        try {
            console.log('Generating DOCX for patient ID:', patientId, 'User ID:', userId);
            if (!patientId || !userId) {
                throw new Error('Patient ID or User ID is undefined or null');
            }
            const filePath = await generateDocx(patientId, userId);
            mainWindow.webContents.send('documentGenerated', { success: true, type: 'DOCX', filePath });
        } catch (error) {
            console.error('Error generating DOCX:', error);
            mainWindow.webContents.send('documentGenerated', { success: false, type: 'DOCX', error: error.message });
        }
    });


});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});