// src/renderer.js

console.log('Renderer script loaded');

function loadComponent(componentName) {
    switch (componentName) {
        case 'Dashboard':
            import('./components/Dashboard.js').then(module => {
                const Dashboard = module.default;
                const dashboard = Dashboard();
                dashboard.render();
            }).catch(err => console.error('Error loading Dashboard:', err));
            break;
        case 'PatientList':
            import('./components/Patients/PatientList.js').then(module => {
                const PatientList = module.default;
                const patientList = PatientList();
                patientList.render();
            }).catch(err => console.error('Error loading PatientList:', err));
            break;
        case 'Login':
            import('./components/Auth/Login.js').then(module => {
                const Login = module.default;
                Login();
            }).catch(err => console.error('Error loading Login:', err));
            break;
        default:
            console.error('Unknown component:', componentName);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('Is user logged in?', isLoggedIn);

    if (isLoggedIn) {
        loadComponent('Dashboard');
    } else {
        loadComponent('Login');
    }
});

// Écoutez les changements de stockage local pour recharger le composant approprié
window.addEventListener('storage', (event) => {
    if (event.key === 'isLoggedIn') {
        const isLoggedIn = event.newValue === 'true';
        loadComponent(isLoggedIn ? 'Dashboard' : 'Login');
    }
});

window.navigateTo = function (componentName) {
    console.log(`Navigating to ${componentName}`);
    switch (componentName) {
        case 'Dashboard':
            import('./components/Dashboard.js').then(module => {
                const Dashboard = module.default;
                const dashboard = Dashboard();
                dashboard.render();
            }).catch(err => console.error('Error loading Dashboard:', err));
            break;
        case 'PatientList':
            import('./components/Patients/PatientList.js').then(module => {
                const PatientList = module.default;
                const patientList = PatientList();
                patientList.render();
            }).catch(err => console.error('Error loading PatientList:', err));
            break;
        // Add other cases as needed
        default:
            console.error('Unknown component:', componentName);
    }
};

// Exposez une fonction pour naviguer entre les composants
window.navigateTo = loadComponent;