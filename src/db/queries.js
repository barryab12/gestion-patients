// src/db/queries.js

const db = require('./schema');
const bcrypt = require('bcryptjs');

function getProfessions() {
    const stmt = db.prepare("SELECT * FROM professions ORDER BY name");
    return stmt.all();
}

function addProfession(name) {
    const stmt = db.prepare("INSERT INTO professions (name) VALUES (?)");
    const info = stmt.run(name);
    return { id: info.lastInsertRowid, name };
}

function deleteProfession(id) {
    const stmt = db.prepare("DELETE FROM professions WHERE id = ?");
    stmt.run(id);
    return { success: true, message: 'Profession supprimée avec succès' };
}

function deleteResidence(id) {
    const stmt = db.prepare("DELETE FROM residences WHERE id = ?");
    stmt.run(id);
    return { success: true, message: 'Résidence supprimée avec succès' };
}

function getResidences() {
    const stmt = db.prepare("SELECT * FROM residences ORDER BY name");
    return stmt.all();
}

function addResidence(name, type) {
    const stmt = db.prepare("INSERT INTO residences (name, type) VALUES (?, ?)");
    const info = stmt.run(name, type);
    return { id: info.lastInsertRowid, name, type };
}

function loginUser(username, password) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
    }

    return new Promise((resolve, reject) => {
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
    });
}

function registerUser(username, email, password, role) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Bcrypt error:', err);
                reject(new Error('Erreur de hachage du mot de passe'));
            } else {
                const stmt = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
                try {
                    const info = stmt.run(username, email, hash, role);
                    resolve({ success: true, userId: info.lastInsertRowid });
                } catch (error) {
                    if (error.code === 'SQLITE_CONSTRAINT') {
                        resolve({ success: false, message: 'Nom d\'utilisateur ou email déjà utilisé' });
                    } else {
                        console.error('Database error:', error);
                        reject(new Error('Erreur d\'insertion dans la base de données'));
                    }
                }
            }
        });
    });
}

function getDashboardData(userId) {
    const data = {
        totalPatients: 0,
        monthlyConsultations: 0,
        consultationsPerMonth: {
            labels: [],
            values: []
        }
    };

    const totalPatientsStmt = db.prepare('SELECT COUNT(*) as count FROM patients WHERE user_id = ?');
    data.totalPatients = totalPatientsStmt.get(userId).count;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();

    const monthlyConsultationsStmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE p.user_id = ? AND c.consultation_date >= ?
    `);
    data.monthlyConsultations = monthlyConsultationsStmt.get(userId, firstDayOfMonth).count;

    const consultationsPerMonthStmt = db.prepare(`
        SELECT strftime('%Y-%m', c.consultation_date) as month, COUNT(*) as count
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        WHERE p.user_id = ?
        GROUP BY strftime('%Y-%m', c.consultation_date)
        ORDER BY month DESC
        LIMIT 12
    `);
    const consultationsPerMonth = consultationsPerMonthStmt.all(userId);

    consultationsPerMonth.reverse().forEach(row => {
        data.consultationsPerMonth.labels.push(row.month);
        data.consultationsPerMonth.values.push(row.count);
    });

    if (data.consultationsPerMonth.labels.length === 0) {
        data.consultationsPerMonth.labels = ['Pas de données'];
        data.consultationsPerMonth.values = [0];
    }

    return data;
}

function generatePatientNumber() {
    const stmt = db.prepare("SELECT MAX(CAST(SUBSTR(patient_number, 2) AS INTEGER)) as max_num FROM patients");
    const row = stmt.get();
    const nextNum = (row.max_num || 0) + 1;
    return `P${String(nextNum).padStart(5, '0')}`;
}

function addPatient(patientData, userId) {
    const { firstName, lastName, dateOfBirth, gender, professionId, currentResidenceId, usualResidenceId, contacts } = patientData;

    const insertStmt = db.prepare(`
        INSERT INTO patients (
            patient_number, first_name, last_name, date_of_birth, gender, 
            profession_id, current_residence_id, usual_residence_id, contacts, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let patientNumber;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            patientNumber = generatePatientNumber();
            const info = insertStmt.run(
                patientNumber, firstName, lastName, dateOfBirth, gender,
                professionId, currentResidenceId, usualResidenceId, contacts, userId
            );
            return { success: true, id: info.lastInsertRowid, patientNumber };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: patients.patient_number')) {
                retries++;
                if (retries >= maxRetries) {
                    throw new Error('Failed to generate a unique patient number after multiple attempts');
                }
            } else {
                console.error('Error adding patient:', error);
                throw error;
            }
        }
    }
}

function getPatients({ patientsPerPage = null, status = 'all', searchTerm = '', userId }) {
    let query = `
        SELECT 
            p.id, p.patient_number, p.first_name, p.last_name, p.gender, p.date_of_birth, p.contacts,
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
                p.contacts LIKE ? OR
                p.patient_number LIKE ?

            )
        `;
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
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

    const stmt = db.prepare(query);
    return stmt.all(...queryParams);
}

function getPatientDetails(patientId, userId) {
    const stmt = db.prepare(`
        SELECT * FROM patients
        WHERE id = ? AND user_id = ?
    `);
    const patient = stmt.get(patientId, userId);
    if (!patient) {
        throw new Error('Patient not found or access denied');
    }
    return patient;
}

function updatePatient(patientData) {
    const { id, lastName, firstName, dateOfBirth, gender, professionId, currentResidenceId, usualResidenceId, contacts } = patientData;

    const stmt = db.prepare(`
        UPDATE patients 
        SET last_name = ?, first_name = ?, date_of_birth = ?, gender = ?, 
            profession_id = ?, current_residence_id = ?, usual_residence_id = ?, contacts = ?
        WHERE id = ?
    `);

    stmt.run(lastName, firstName, dateOfBirth, gender, professionId, currentResidenceId, usualResidenceId, contacts, id);
    return { success: true, message: 'Patient mis à jour avec succès' };
}

function deletePatient(patientId) {
    const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
    stmt.run(patientId);
    return { success: true, message: 'Patient supprimé avec succès' };
}

function addFollowup(followupData) {
    const { patientId, followupDate, bloodPressure, pulse, weight, temperature, observation } = followupData;

    const stmt = db.prepare(`
        INSERT INTO followups 
        (patient_id, followup_date, blood_pressure, pulse, weight, temperature, observation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(patientId, followupDate, bloodPressure, pulse, weight, temperature, observation);
    return { success: true, id: info.lastInsertRowid, message: 'Suivi ajouté avec succès' };
}

function getFollowups(patientId) {
    const stmt = db.prepare(`
        SELECT * FROM followups
        WHERE patient_id = ?
        ORDER BY followup_date DESC
    `);
    return stmt.all(patientId);
}

function getFollowupDetails(followupId) {
    const stmt = db.prepare('SELECT * FROM followups WHERE id = ?');
    return stmt.get(followupId);
}

function updateFollowup(followupData) {
    const { id, followupDate, bloodPressure, pulse, weight, temperature, observation } = followupData;

    const stmt = db.prepare(`
        UPDATE followups 
        SET followup_date = ?, blood_pressure = ?, pulse = ?, weight = ?, temperature = ?, observation = ?
        WHERE id = ?
    `);

    stmt.run(followupDate, bloodPressure, pulse, weight, temperature, observation, id);
    return { success: true, message: 'Suivi mis à jour avec succès' };
}

function deleteFollowup(followupId) {
    const stmt = db.prepare('DELETE FROM followups WHERE id = ?');
    stmt.run(followupId);
    return { success: true, message: 'Suivi supprimé avec succès' };
}

function addConsultation(consultationData) {
    const { patientId, consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment } = consultationData;

    const stmt = db.prepare(`
        INSERT INTO consultations 
        (patient_id, consultation_date, reason, blood_pressure, pulse, weight, temperature, medical_history, clinical_examination, diagnosis, medical_treatment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(patientId, consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment);
    return { success: true, id: info.lastInsertRowid, message: 'Consultation ajoutée avec succès' };
}

function getConsultations(patientId) {
    const stmt = db.prepare(`
        SELECT * FROM consultations
        WHERE patient_id = ?
        ORDER BY consultation_date DESC
    `);
    return stmt.all(patientId);
}

function deleteConsultation(consultationId) {
    const stmt = db.prepare('DELETE FROM consultations WHERE id = ?');
    stmt.run(consultationId);
    return { success: true, message: 'Consultation supprimée avec succès' };
}

function updateConsultation(consultationData) {
    const { id, consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment } = consultationData;

    const stmt = db.prepare(`
        UPDATE consultations 
        SET consultation_date = ?, reason = ?, blood_pressure = ?, pulse = ?, weight = ?, temperature = ?, 
            medical_history = ?, clinical_examination = ?, diagnosis = ?, medical_treatment = ?
        WHERE id = ?
    `);

    stmt.run(consultationDate, reason, bloodPressure, pulse, weight, temperature, medicalHistory, clinicalExamination, diagnosis, treatment, id);
    return { success: true, message: 'Consultation mise à jour avec succès' };
}

function getConsultationDetails(consultationId) {
    const stmt = db.prepare('SELECT * FROM consultations WHERE id = ?');
    return stmt.get(consultationId);
}


function getpatientForPDF(patientId, userId) {
    const patientStmt = db.prepare(`
        SELECT p.*, 
               prof.name as profession,
               cr.name as current_residence,
               ur.name as usual_residence
        FROM patients p
        LEFT JOIN professions prof ON p.profession_id = prof.id
        LEFT JOIN residences cr ON p.current_residence_id = cr.id
        LEFT JOIN residences ur ON p.usual_residence_id = ur.id
        WHERE p.id = ? AND p.user_id = ?
    `);

    const patient = patientStmt.get(patientId, userId);
    if (!patient) {
        throw new Error('Patient not found or access denied');
    }

    const consultationsStmt = db.prepare(`
        SELECT * FROM consultations
        WHERE patient_id = ?
        ORDER BY consultation_date DESC
    `);
    const consultations = consultationsStmt.all(patientId);

    const followupsStmt = db.prepare(`
        SELECT * FROM followups
        WHERE patient_id = ?
        ORDER BY followup_date DESC
    `);
    const followups = followupsStmt.all(patientId);

    return {
        patient,
        consultations,
        followups
    };
}

function getAgeGenderDistribution(userId) {
    const query = `
      SELECT 
        CASE 
          WHEN age < 18 THEN '0-18'
          WHEN age BETWEEN 18 AND 30 THEN '19-30'
          WHEN age BETWEEN 31 AND 45 THEN '31-45'
          WHEN age BETWEEN 46 AND 60 THEN '46-60'
          ELSE '61+'
        END as age_group,
        gender,
        COUNT(*) as count
      FROM (
        SELECT 
          (strftime('%Y', 'now') - strftime('%Y', date_of_birth)) - 
          (strftime('%m-%d', 'now') < strftime('%m-%d', date_of_birth)) as age,
          gender
        FROM patients
        WHERE user_id = ?
      ) as patient_ages
      GROUP BY age_group, gender
      ORDER BY age_group, gender
    `;

    const stmt = db.prepare(query);
    const results = stmt.all(userId);

    const distribution = {
        male: [0, 0, 0, 0, 0],
        female: [0, 0, 0, 0, 0]
    };

    const ageGroups = ['0-18', '19-30', '31-45', '46-60', '61+'];

    results.forEach(row => {
        const index = ageGroups.indexOf(row.age_group);
        if (index !== -1) {
            if (row.gender === 'male') {
                distribution.male[index] = row.count;
            } else if (row.gender === 'female') {
                distribution.female[index] = row.count;
            }
        }
    });

    return distribution;
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
    getAgeGenderDistribution
};