// src/db/queries.js

const db = require('./schema');
const bcrypt = require('bcrypt');


function getProfessions() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM professions ORDER BY name", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function addProfession(name) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO professions (name) VALUES (?)", [name], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, name });
            }
        });
    });
}

function deleteProfession(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM professions WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, message: 'Profession supprimée avec succès' });
            }
        });
    });
}

function deleteResidence(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM residences WHERE id = ?", [id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ success: true, message: 'Résidence supprimée avec succès' });
            }
        });
    });
}


function getResidences() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM residences ORDER BY name", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function addResidence(name, type) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO residences (name, type) VALUES (?, ?)", [name, type], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, name, type });
            }
        });
    });
}


function loginUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                reject(new Error('Erreur de base de données'));
            } else if (!user) {
                resolve({ success: false, message: 'Utilisateur non trouvé' });
            } else {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        console.error('Bcrypt error:', err);
                        reject(new Error('Erreur de vérification du mot de passe'));
                    } else if (result) {
                        resolve({ success: true, userId: user.id });
                    } else {
                        resolve({ success: false, message: 'Mot de passe incorrect' });
                    }
                });
            }
        });
    });
}

function registerUser(username, email, password, role) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Bcrypt error:', err);
                reject(new Error('Erreur de hachage du mot de passe'));
            } else {
                db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [username, email, hash, role],
                    function (err) {
                        if (err) {
                            console.error('Database error:', err);
                            if (err.code === 'SQLITE_CONSTRAINT') {
                                resolve({ success: false, message: 'Nom d\'utilisateur ou email déjà utilisé' });
                            } else {
                                reject(new Error('Erreur d\'insertion dans la base de données'));
                            }
                        } else {
                            resolve({ success: true, userId: this.lastID });
                        }
                    }
                );
            }
        });
    });
}


function getDashboardData(userId) {
    return new Promise((resolve, reject) => {
        const data = {
            totalPatients: 0,
            monthlyConsultations: 0,
            consultationsPerMonth: {
                labels: [],
                values: []
            }
        };

        // Get total patients for the connected user
        db.get('SELECT COUNT(*) as count FROM patients WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Error getting total patients:', err);
                data.totalPatients = 0;
            } else {
                data.totalPatients = row.count;
            }

            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            // Get monthly consultations for the connected user's patients
            db.get(`
                SELECT COUNT(*) as count 
                FROM consultations c
                JOIN patients p ON c.patient_id = p.id
                WHERE p.user_id = ? AND c.consultation_date >= ?
            `, [userId, firstDayOfMonth.toISOString()], (err, row) => {
                if (err) {
                    console.error('Error getting monthly consultations:', err);
                    data.monthlyConsultations = 0;
                } else {
                    data.monthlyConsultations = row.count;
                }

                // Get consultations per month for the connected user's patients
                db.all(`
                    SELECT strftime('%Y-%m', c.consultation_date) as month, COUNT(*) as count
                    FROM consultations c
                    JOIN patients p ON c.patient_id = p.id
                    WHERE p.user_id = ?
                    GROUP BY strftime('%Y-%m', c.consultation_date)
                    ORDER BY month DESC
                    LIMIT 12
                `, [userId], (err, rows) => {
                    if (err) {
                        console.error('Error getting consultations per month:', err);
                    } else {
                        rows.reverse().forEach(row => {
                            data.consultationsPerMonth.labels.push(row.month);
                            data.consultationsPerMonth.values.push(row.count);
                        });
                    }

                    // Ensure we always have valid data
                    if (data.consultationsPerMonth.labels.length === 0) {
                        data.consultationsPerMonth.labels = ['Pas de données'];
                        data.consultationsPerMonth.values = [0];
                    }

                    resolve(data);
                });
            });
        });
    });
}

async function generatePatientNumber() {
    return new Promise((resolve, reject) => {
        const query = "SELECT MAX(CAST(SUBSTR(patient_number, 2) AS INTEGER)) as max_num FROM patients";
        db.get(query, [], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const nextNum = (row.max_num || 0) + 1;
                const patientNumber = `P${String(nextNum).padStart(5, '0')}`;
                resolve(patientNumber);
            }
        });
    });
}


async function addPatient(patientData, userId) {
    const interactiveNumber = await generateInteractiveNumber();
    const { firstName, lastName, dateOfBirth, gender, professionId, currentResidenceId, usualResidenceId, contacts } = patientData;
    let patientNumber;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            patientNumber = await generatePatientNumber();
            const query = `
                INSERT INTO patients (
                    patient_number, first_name, last_name, date_of_birth, gender, 
                    profession_id, current_residence_id, usual_residence_id, contacts, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            return new Promise((resolve, reject) => {
                db.run(query, [
                    patientNumber, firstName, lastName, dateOfBirth, gender,
                    professionId, currentResidenceId, usualResidenceId, contacts, userId
                ], function (err) {
                    if (err) {
                        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: patients.patient_number')) {
                            retries++;
                            if (retries >= maxRetries) {
                                reject(new Error('Failed to generate a unique patient number after multiple attempts'));
                            }
                        } else {
                            console.error('Error adding patient:', err);
                            reject(err);
                        }
                    } else {
                        resolve({ success: true, id: this.lastID, patientNumber });
                    }
                });
            });
        } catch (error) {
            console.error('Error in addPatient:', error);
            throw error;
        }
    }
}

function getPatients({ patientsPerPage = null, status = 'all', searchTerm = '', userId }) {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT 
                p.id, p.patient_number, p.first_name, p.last_name, p.gender, p.date_of_birth,
                prof.name as profession,
                res_current.name as current_residence,
                res_usual.name as usual_residence,
                MAX(c.consultation_date) as last_consultation
            FROM 
                patients p
            LEFT JOIN 
                consultations c ON p.id = c.patient_id
            LEFT JOIN
                professions prof ON p.profession_id = prof.id
            LEFT JOIN
                residences res_current ON p.current_residence_id = res_current.id
            LEFT JOIN
                residences res_usual ON p.usual_residence_id = res_usual.id
            WHERE 
                p.user_id = ?
        `;

        const queryParams = [userId];

        if (searchTerm) {
            query += `
                AND (
                    p.first_name LIKE ? OR 
                    p.last_name LIKE ? OR 
                    p.patient_number LIKE ?
                )
            `;
            queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        if (status !== 'all') {
            // Ajoutez ici la logique pour filtrer par statut si nécessaire
        }

        query += `
            GROUP BY 
                p.id
            ORDER BY 
                p.last_name, p.first_name
        `;

        if (patientsPerPage) {
            query += " LIMIT ?";
            queryParams.push(parseInt(patientsPerPage));
        }

        db.all(query, queryParams, (err, rows) => {
            if (err) {
                console.error('Error fetching patients:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getPatientDetails(patientId, userId) {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT * FROM patients
      WHERE id = ? AND user_id = ?
    `;

        db.get(query, [patientId, userId], (err, row) => {
            if (err) {
                console.error('Error fetching patient details:', err);
                reject(err);
            } else if (!row) {
                reject(new Error('Patient not found or access denied'));
            } else {
                resolve(row);
            }
        });
    });
}


function updatePatient(patientData) {
    return new Promise((resolve, reject) => {
        const { id, lastName, firstName, dateOfBirth, gender, professionId, currentResidenceId, usualResidenceId, contacts } = patientData;

        const query = `
            UPDATE patients 
            SET last_name = ?, first_name = ?, date_of_birth = ?, gender = ?, 
                profession_id = ?, current_residence_id = ?, usual_residence_id = ?, contacts = ?
            WHERE id = ?
        `;

        db.run(query, [lastName, firstName, dateOfBirth, gender, professionId, currentResidenceId, usualResidenceId, contacts, id], function (err) {
            if (err) {
                console.error('Error updating patient:', err);
                reject(err);
            } else {
                resolve({ success: true, message: 'Patient mis à jour avec succès' });
            }
        });
    });
}

function deletePatient(patientId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM patients WHERE id = ?';

        db.run(query, [patientId], function (err) {
            if (err) {
                console.error('Error deleting patient:', err);
                reject(err);
            } else {
                resolve({ success: true, message: 'Patient supprimé avec succès' });
            }
        });
    });
}


function addFollowup(followupData) {
    return new Promise((resolve, reject) => {
        const { patientId, followupDate, bloodPressure, pulse, weight, temperature, observation } = followupData;

        const query = `
            INSERT INTO followups 
            (patient_id, followup_date, blood_pressure, pulse, weight, temperature, observation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [patientId, followupDate, bloodPressure, pulse, weight, temperature, observation], function (err) {
            if (err) {
                console.error('Error adding followup:', err);
                reject(err);
            } else {
                resolve({ success: true, id: this.lastID, message: 'Suivi ajouté avec succès' });
            }
        });
    });
}

function getFollowups(patientId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM followups
            WHERE patient_id = ?
            ORDER BY followup_date DESC
        `;

        db.all(query, [patientId], (err, rows) => {
            if (err) {
                console.error('Error getting followups:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getFollowupDetails(followupId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM followups WHERE id = ?';

        db.get(query, [followupId], (err, row) => {
            if (err) {
                console.error('Error getting followup details:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function updateFollowup(followupData) {
    return new Promise((resolve, reject) => {
        const { id, followupDate, bloodPressure, pulse, weight, temperature, observation } = followupData;

        const query = `
            UPDATE followups 
            SET followup_date = ?, blood_pressure = ?, pulse = ?, weight = ?, temperature = ?, observation = ?
            WHERE id = ?
        `;

        db.run(query, [followupDate, bloodPressure, pulse, weight, temperature, observation, id], function (err) {
            if (err) {
                console.error('Error updating followup:', err);
                reject(err);
            } else {
                resolve({ success: true, message: 'Suivi mis à jour avec succès' });
            }
        });
    });
}

function deleteFollowup(followupId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM followups WHERE id = ?';

        db.run(query, [followupId], function (err) {
            if (err) {
                console.error('Error deleting followup:', err);
                reject(err);
            } else {
                resolve({ success: true, message: 'Suivi supprimé avec succès' });
            }
        });
    });
}

function addConsultation(consultationData) {
    return new Promise((resolve, reject) => {
        const { patientId, consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment } = consultationData;

        const query = `
            INSERT INTO consultations 
            (patient_id, consultation_date, reason, blood_pressure, pulse, weight, temperature, medical_history, clinical_examination, diagnosis, medical_treatment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [patientId, consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment], function (err) {
            if (err) {
                console.error('Error adding consultation:', err);
                reject(err);
            } else {
                resolve({ success: true, id: this.lastID, message: 'Consultation ajoutée avec succès' });
            }
        });
    });
}

function getConsultations(patientId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM consultations
            WHERE patient_id = ?
            ORDER BY consultation_date DESC
        `;

        db.all(query, [patientId], (err, rows) => {
            if (err) {
                console.error('Error getting consultations:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function deleteConsultation(consultationId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM consultations WHERE id = ?';

        db.run(query, [consultationId], function (err) {
            if (err) {
                console.error('Error deleting consultation:', err);
                reject(err);
            } else {
                resolve({ success: true, message: 'Consultation supprimée avec succès' });
            }
        });
    });
}

function updateConsultation(consultationData) {
    return new Promise((resolve, reject) => {
        const { id, consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment } = consultationData;

        const query = `
            UPDATE consultations 
            SET consultation_date = ?, reason = ?, blood_pressure = ?, pulse = ?, weight = ?, temperature = ?, 
                medical_history = ?, clinical_examination = ?, diagnosis = ?, medical_treatment = ?
            WHERE id = ?
        `;

        db.run(query, [consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment, id], function (err) {
            if (err) {
                console.error('Error updating consultation:', err);
                reject(err);
            } else {
                resolve({ success: true, message: 'Consultation mise à jour avec succès' });
            }
        });
    });
}

function getConsultationDetails(consultationId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM consultations WHERE id = ?';

        db.get(query, [consultationId], (err, row) => {
            if (err) {
                console.error('Error getting consultation details:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function generateInteractiveNumber() {
    return new Promise((resolve, reject) => {
        const query = "SELECT MAX(CAST(SUBSTR(interactive_number, 1, 6) AS INTEGER)) as max_num FROM patients";
        db.get(query, [], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const nextNum = (row.max_num || 0) + 1;
                const interactiveNumber = `${String(nextNum).padStart(6, '0')}THz`;
                resolve(interactiveNumber);
            }
        });
    });
}

async function getpatientForPDF(patientId, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Récupérer les détails du patient
            const patientQuery = `
                SELECT p.*, 
                       prof.name as profession,
                       cr.name as current_residence,
                       ur.name as usual_residence
                FROM patients p
                LEFT JOIN professions prof ON p.profession_id = prof.id
                LEFT JOIN residences cr ON p.current_residence_id = cr.id
                LEFT JOIN residences ur ON p.usual_residence_id = ur.id
                WHERE p.id = ? AND p.user_id = ?
            `;
            const patient = await new Promise((resolve, reject) => {
                db.get(patientQuery, [patientId, userId], (err, row) => {
                    if (err) reject(err);
                    else if (!row) reject(new Error('Patient not found or access denied'));
                    else resolve(row);
                });
            });

            // Récupérer les consultations
            const consultationsQuery = `
                SELECT * FROM consultations
                WHERE patient_id = ?
                ORDER BY consultation_date DESC
            `;
            const consultations = await new Promise((resolve, reject) => {
                db.all(consultationsQuery, [patientId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Récupérer les suivis
            const followupsQuery = `
                SELECT * FROM followups
                WHERE patient_id = ?
                ORDER BY followup_date DESC
            `;
            const followups = await new Promise((resolve, reject) => {
                db.all(followupsQuery, [patientId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            resolve({
                patient,
                consultations,
                followups
            });
        } catch (error) {
            console.error('Error fetching patient data for PDF:', error);
            reject(error);
        }
    });
}


module.exports = {
    getProfessions,
    addProfession,
    getResidences,
    addResidence,
    loginUser,
    registerUser,
    getDashboardData,
    getPatients,
    addPatient,
    getPatientDetails,
    deleteProfession,
    deleteResidence,
    updatePatient,
    deletePatient,
    addFollowup,
    getFollowups,
    getFollowupDetails,
    updateFollowup,
    deleteFollowup,
    addConsultation,
    getConsultations,
    deleteConsultation,
    updateConsultation,
    getConsultationDetails,
    getpatientForPDF,
};