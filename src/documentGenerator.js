// src/documentGenerator.js

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { app } = require('electron');
const { getpatientForPDF } = require('./db/queries');


async function generatePdf(patientId, userId) {
    console.log('Generating PDF for patient ID:', patientId, 'User ID:', userId);
    // const data = await getpatientForPDF(patientId, userId);
    // const { patient, consultations, followups } = data;

    // console.log("Infos du patient :", patient);
    // console.log("Consultations :", consultations);
    // console.log("Suivis :", followups);

    try {
        const data = await getpatientForPDF(patientId, userId);
        const { patient, consultations, followups } = data;

        const doc = new PDFDocument();
        const filePath = path.join(app.getPath('documents'), `patient_${patient.last_name}_${patient.first_name}_${patient.patient_number}_dossier.pdf`);
        doc.pipe(fs.createWriteStream(filePath));

        // En-tête
        doc.fontSize(16).text('DOSSIER PATIENT THz TERA P90', { align: 'center' });
        doc.moveDown();

        // Informations du patient
        doc.fontSize(12);
        doc.text(`Identifiant (ID) n° : ${patient.patient_number || 'N/A'}`);
        doc.text(`Date : ${new Date().toLocaleDateString()}`);
        doc.text(`Nom : ${patient.last_name}`);
        doc.text(`Prénoms : ${patient.first_name}`);
        doc.text(`Sexe : ${patient.gender === 'male' ? 'Masculin' : 'Féminin'}`);
        doc.text(`Âge : ${calculateAge(patient.date_of_birth)} ans`);
        doc.text(`Profession : ${patient.profession || 'N/A'}`);
        doc.text(`Résidence actuelle : ${patient.current_residence || 'N/A'}`);
        doc.text(`Résidence habituelle : ${patient.usual_residence || 'N/A'}`);
        doc.text(`Contacts : ${patient.contacts || 'N/A'}`);
        doc.moveDown();

        // Dernière consultation
        if (consultations.length > 0) {
            const lastConsultation = consultations[0];
            doc.text('Dernière Consultation', { underline: true });
            doc.text(`Date : ${new Date(lastConsultation.consultation_date).toLocaleDateString()}`);
            doc.text(`Motif : ${lastConsultation.reason || 'N/A'}`);
            doc.text('Constantes :');
            doc.text(`TA : ${lastConsultation.blood_pressure || 'N/A'} mmHg ; Pouls : ${lastConsultation.pulse || 'N/A'} bat/min ; Poids : ${lastConsultation.weight || 'N/A'} kg ; T° : ${lastConsultation.temperature || 'N/A'} °C`);
            doc.text('Antécédents :');
            doc.text(`- Médicaux : ${lastConsultation.medical_history || 'N/A'}`);
            doc.text(`- Chirurgicaux : ${lastConsultation.surgical_history || 'N/A'}`);
            doc.text(`- Gynéco-obstétricaux : ${lastConsultation.gyneco_obstetric_history || 'N/A'}`);
            doc.text(`Examen clinique : ${lastConsultation.clinical_examination || 'N/A'}`);
            doc.text(`Syndrome : ${lastConsultation.syndrome || 'N/A'}`);
            doc.text(`Bilan : ${lastConsultation.assessment || 'N/A'}`);
            doc.text(`Diagnostic retenu : ${lastConsultation.diagnosis || 'N/A'}`);
            doc.text('Traitement proposé :');
            doc.text(`- Médical : ${lastConsultation.medical_treatment || 'N/A'}`);
            doc.text(`- Conseil hygiéno-diététique : ${lastConsultation.hygiene_dietary_advice || 'N/A'}`);
            doc.text(`- Autres : ${lastConsultation.other_treatments || 'N/A'}`);
            doc.text(`- SEANCES DE THERAPIE ELECTROMAGNETIQUE AU TERAHERTZ TERA P90`);
            doc.text(`Séance N° : ${lastConsultation.session_number || 'N/A'}`);
            doc.text(`Observation : ${lastConsultation.terahertz_therapy_session || 'N/A'}`);
            doc.text(`Conclusion : ${lastConsultation.conclusion || 'N/A'}`);
            doc.text(`Nom et signature du prestataire : ${lastConsultation.treating_physician || 'N/A'}`);
            doc.moveDown();
        }

        // Suivis
        doc.text('Suivis', { underline: true });
        followups.forEach((followup, index) => {
            doc.text(`Suivi ${index + 1}`);
            doc.text(`Séance N° : ${followup.session_number || 'N/A'}`);
            doc.text(`Date : ${new Date(followup.followup_date).toLocaleDateString()}`);
            doc.text('Constantes :');
            doc.text(`TA : ${followup.blood_pressure || 'N/A'} mmHg ; Pouls : ${followup.pulse || 'N/A'} bat/min ; Poids : ${followup.weight || 'N/A'} kg ; T° : ${followup.temperature || 'N/A'} °C`);
            doc.text('REVUE DE LA SEANCE PRECEDENTE (THz Téra P90)');
            doc.text(`Résultat : ${followup.satisfaction || 'N/A'}`);
            doc.text(`Conduite à tenir : ${followup.course_of_action || 'N/A'}`);
            doc.text(`Nom et signature du prestataire : ${followup.actions_to_take || 'N/A'}`);
            doc.moveDown();
        });

        doc.end();
        return filePath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

async function generateDocx(patientId, userId) {
    try {
        const data = await getpatientForPDF(patientId, userId);
        const { patient, consultations, followups } = data;

        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: "DOSSIER PATIENT THz TERA P90",
                        heading: docx.HeadingLevel.HEADING_1,
                        alignment: docx.AlignmentType.CENTER,
                    }),
                    new docx.Paragraph({
                        text: `Identifiant (ID) n° : ${patient.patient_number || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Date : ${new Date().toLocaleDateString()}`,
                    }),
                    new docx.Paragraph({
                        text: `Nom : ${patient.last_name}`,
                    }),
                    new docx.Paragraph({
                        text: `Prénoms : ${patient.first_name}`,
                    }),
                    new docx.Paragraph({
                        text: `Sexe : ${patient.gender === 'male' ? 'Masculin' : 'Féminin'}`,
                    }),
                    new docx.Paragraph({
                        text: `Âge : ${calculateAge(patient.date_of_birth)} ans`,
                    }),
                    new docx.Paragraph({
                        text: `Profession : ${patient.profession || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Résidence actuelle : ${patient.current_residence || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Résidence habituelle : ${patient.usual_residence || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Contacts : ${patient.contacts || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: "",
                    }),
                ],
            }],
        });

        // Dernière consultation
        if (consultations.length > 0) {
            const lastConsultation = consultations[0];
            doc.addSection({
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: "Dernière Consultation",
                        heading: docx.HeadingLevel.HEADING_2,
                    }),
                    new docx.Paragraph({
                        text: `Date : ${new Date(lastConsultation.consultation_date).toLocaleDateString()}`,
                    }),
                    new docx.Paragraph({
                        text: `Motif : ${lastConsultation.reason || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: "Constantes :",
                    }),
                    new docx.Paragraph({
                        text: `TA : ${lastConsultation.blood_pressure || 'N/A'} mmHg ; Pouls : ${lastConsultation.pulse || 'N/A'} bat/min ; Poids : ${lastConsultation.weight || 'N/A'} kg ; T° : ${lastConsultation.temperature || 'N/A'} °C`,
                    }),
                    new docx.Paragraph({
                        text: "Antécédents :",
                    }),
                    new docx.Paragraph({
                        text: `- Médicaux : ${lastConsultation.medical_history || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `- Chirurgicaux : ${lastConsultation.surgical_history || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `- Gynéco-obstétricaux : ${lastConsultation.gyneco_obstetric_history || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Examen clinique : ${lastConsultation.clinical_examination || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Syndrome : ${lastConsultation.syndrome || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Bilan : ${lastConsultation.assessment || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Diagnostic retenu : ${lastConsultation.diagnosis || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: "Traitement proposé :",
                    }),
                    new docx.Paragraph({
                        text: `- Médical : ${lastConsultation.medical_treatment || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `- Conseil hygiéno-diététique : ${lastConsultation.hygiene_dietary_advice || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `- Autres : ${lastConsultation.other_treatments || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: "- SEANCES DE THERAPIE ELECTROMAGNETIQUE AU TERAHERTZ TERA P90",
                    }),
                    new docx.Paragraph({
                        text: `Séance N° : ${lastConsultation.session_number || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Observation : ${lastConsultation.terahertz_therapy_session || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Conclusion : ${lastConsultation.conclusion || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Nom et signature du prestataire : ${lastConsultation.treating_physician || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: "",
                    }),
                ],
            });
        }

        // Suivis
        doc.addSection({
            properties: {},
            children: [
                new docx.Paragraph({
                    text: "Suivis",
                    heading: docx.HeadingLevel.HEADING_2,
                }),
                ...followups.flatMap((followup, index) => [
                    new docx.Paragraph({
                        text: `Suivi ${index + 1}`,
                        heading: docx.HeadingLevel.HEADING_3,
                    }),
                    new docx.Paragraph({
                        text: `Séance N° : ${followup.session_number || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Date : ${new Date(followup.followup_date).toLocaleDateString()}`,
                    }),
                    new docx.Paragraph({
                        text: "Constantes :",
                    }),
                    new docx.Paragraph({
                        text: `TA : ${followup.blood_pressure || 'N/A'} mmHg ; Pouls : ${followup.pulse || 'N/A'} bat/min ; Poids : ${followup.weight || 'N/A'} kg ; T° : ${followup.temperature || 'N/A'} °C`,
                    }),
                    new docx.Paragraph({
                        text: "REVUE DE LA SEANCE PRECEDENTE (THz Téra P90)",
                    }),
                    new docx.Paragraph({
                        text: `Résultat : ${followup.satisfaction || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Conduite à tenir : ${followup.course_of_action || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: `Nom et signature du prestataire : ${followup.actions_to_take || 'N/A'}`,
                    }),
                    new docx.Paragraph({
                        text: "",
                    }),
                ]),
            ],
        });

        const buffer = await docx.Packer.toBuffer(doc);
        const filePath = path.join(app.getPath('documents'), `patient_${patient.last_name}_${patient.first_name}_${patient.patient_number}_dossier.docx`);
        fs.writeFileSync(filePath, buffer);
        return filePath;

    } catch (error) {
        console.error('Error generating DOCX:', error);
        throw error;
    }
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

module.exports = {
    generatePdf,
    generateDocx,
};