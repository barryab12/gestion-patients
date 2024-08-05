// src/db/schema.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'patient_tracking.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Création de la table users
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Users table created or already exists.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS professions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS residences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL
        )`);

        // Création de la table patients
        db.run(`
            CREATE TABLE IF NOT EXISTS patients (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            patient_number TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            gender TEXT,
            date_of_birth DATE,
            profession_id INTEGER,
            current_residence_id INTEGER,
            usual_residence_id INTEGER,
            contacts TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (profession_id) REFERENCES professions(id),
            FOREIGN KEY (current_residence_id) REFERENCES residences(id),
            FOREIGN KEY (usual_residence_id) REFERENCES residences(id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating patients table:', err);
            } else {
                console.log('Patients table created or already exists.');

                // Création de l'index unique sur patient_number
                db.run(`
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_number ON patients(patient_number)
                `, (indexErr) => {
                    if (indexErr) {
                        console.error('Error creating unique index on patient_number:', indexErr);
                    } else {
                        console.log('Unique index on patient_number created or already exists.');
                    }
                });
            }
        });

        // Insert default professions
        const defaultProfessions = [
            "Agriculteur", "Commerçant", "Enseignant", "Infirmier", "Médecin",
            "Chauffeur", "Mécanicien", "Couturier", "Coiffeur", "Électricien",
            "Plombier", "Maçon", "Menuisier", "Pêcheur", "Étudiant", "Retraité", "Autre"
        ];

        const insertProfession = db.prepare("INSERT OR IGNORE INTO professions (name) VALUES (?)");
        defaultProfessions.forEach(profession => {
            insertProfession.run(profession);
        });
        insertProfession.finalize();

        // Création de la table consultations
        db.run(`
            CREATE TABLE IF NOT EXISTS consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                consultation_date DATE,
                reason TEXT,
                blood_pressure TEXT,
                pulse INTEGER,
                weight REAL,
                temperature REAL,
                medical_history TEXT,
                surgical_history TEXT,
                gyneco_obstetric_history TEXT,
                clinical_examination TEXT,
                syndrome TEXT,
                assessment TEXT,
                diagnosis TEXT,
                medical_treatment TEXT,
                hygiene_dietary_advice TEXT,
                other_treatments TEXT,
                terahertz_therapy_session TEXT,
                session_number INTEGER,
                conclusion TEXT,
                treating_physician TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating consultations table:', err);
            } else {
                console.log('Consultations table created or already exists.');
            }
        });

        // Création de la table followups
        db.run(`
            CREATE TABLE IF NOT EXISTS followups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                followup_date DATE,
                blood_pressure TEXT,
                pulse INTEGER,
                weight REAL,
                temperature REAL,
                session_number INTEGER,
                observation TEXT,
                satisfaction TEXT,
                course_of_action TEXT,
                actions_to_take TEXT,
                interactive_number TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating followups table:', err);
            } else {
                console.log('Followups table created or already exists.');
            }
        });
    });
}

module.exports = db;