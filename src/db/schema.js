// src/db/schema.js

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');


let dbPath;
if (process.env.NODE_ENV === 'development') {
    dbPath = path.join(__dirname, 'patient_tracking.db');
} else {
    dbPath = path.join(process.resourcesPath, 'db', 'patient_tracking.db');
}


// Assurez-vous que le répertoire de la base de données existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath, { verbose: console.log });

function createTables() {
    // Création de la table users
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL
        )
    `);

    db.exec(`CREATE TABLE IF NOT EXISTS professions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS residences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL
    )`);

    // Création de la table patients
    db.exec(`
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
    `);

    // Création de l'index unique sur patient_number
    db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_number ON patients(patient_number)
    `);

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

    // Création de la table consultations
    db.exec(`
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
    `);

    // Création de la table followups
    db.exec(`
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
    `);
}

createTables();

module.exports = db;