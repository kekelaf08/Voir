// Informations de connexion admin (à remplacer par une authentification sécurisée côté serveur)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // À remplacer par un hash sécurisé

class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        this.alert = document.querySelector('.alert');
        this.alertMessage = document.querySelector('.alert-message');

        this.bindEvents();
        this.checkRememberedUser();
    }

    bindEvents() {
        // Gestion de la soumission du formulaire
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Validation en temps réel
        this.usernameInput.addEventListener('input', () => {
            this.validateField(this.usernameInput);
        });

        this.passwordInput.addEventListener('input', () => {
            this.validateField(this.passwordInput);
        });

        // Masquer l'alerte quand l'utilisateur commence à taper
        this.usernameInput.addEventListener('input', () => this.hideAlert());
        this.passwordInput.addEventListener('input', () => this.hideAlert());
    }

    validateField(input) {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            return false;
        }
        input.classList.remove('is-invalid');
        return true;
    }

    showAlert(message) {
        this.alertMessage.textContent = message;
        this.alert.style.display = 'block';
        
        // Animation de l'alerte
        this.alert.classList.add('animate__animated', 'animate__shakeX');
        this.alert.addEventListener('animationend', () => {
            this.alert.classList.remove('animate__animated', 'animate__shakeX');
        });
    }

    hideAlert() {
        this.alert.style.display = 'none';
    }

    handleLogin() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        // Validation des champs
        let isValid = true;
        if (!this.validateField(this.usernameInput)) isValid = false;
        if (!this.validateField(this.passwordInput)) isValid = false;

        if (!isValid) return;

        // Vérifier si c'est l'admin
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            if (this.rememberMeCheckbox.checked) {
                this.rememberUser(username);
            } else {
                this.forgetUser();
            }
            localStorage.setItem('userRole', 'admin');
            window.location.href = 'voteadmin.html';
            return;
        }

        // Vérifier si c'est un visiteur inscrit
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (storedUser && storedUser.email === username && storedUser.password === password) {
            if (this.rememberMeCheckbox.checked) {
                this.rememberUser(username);
            } else {
                this.forgetUser();
            }
            
            // Stocker les informations de l'utilisateur pour la session
            localStorage.setItem('userRole', 'visitor');
            localStorage.setItem('userName', storedUser.fullName);
            
            // Redirection vers l'interface utilisateur
            window.location.href = 'utilisateur.html';
            return;
        }

        // Si aucune correspondance n'est trouvée
        this.showAlert('Identifiants incorrects');
        this.passwordInput.value = '';
        this.passwordInput.focus();
    }

    rememberUser(username) {
        localStorage.setItem('rememberedUser', username);
    }

    forgetUser() {
        localStorage.removeItem('rememberedUser');
    }

    checkRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            this.usernameInput.value = rememberedUser;
            this.rememberMeCheckbox.checked = true;
        }
    }
}

// Fonction pour basculer la visibilité du mot de passe
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('.password-toggle i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
}); 