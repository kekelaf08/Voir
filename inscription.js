class SignupManager {
    constructor() {
        this.form = document.getElementById('signupForm');
        this.fullNameInput = document.getElementById('fullName');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.alert = document.querySelector('.alert');
        this.alertMessage = document.querySelector('.alert-message');
        this.requirements = document.querySelectorAll('.requirement');

        this.bindEvents();
    }

    bindEvents() {
        // Validation du formulaire
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Validation en temps réel
        this.fullNameInput.addEventListener('input', () => {
            this.validateField(this.fullNameInput);
        });

        this.emailInput.addEventListener('input', () => {
            this.validateField(this.emailInput);
        });

        this.passwordInput.addEventListener('input', () => {
            this.validateField(this.passwordInput);
            this.validatePasswordRequirements();
            this.validatePasswordMatch();
        });

        this.confirmPasswordInput.addEventListener('input', () => {
            this.validateField(this.confirmPasswordInput);
            this.validatePasswordMatch();
        });

        // Masquer l'alerte quand l'utilisateur commence à taper
        [this.fullNameInput, this.emailInput, this.passwordInput, this.confirmPasswordInput].forEach(input => {
            input.addEventListener('input', () => this.hideAlert());
        });
    }

    validateField(input) {
        let isValid = true;

        // Validation spécifique pour chaque champ
        switch(input.id) {
            case 'fullName':
                isValid = input.value.trim().length >= 2;
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                break;
            case 'password':
                isValid = this.validatePasswordRequirements();
                break;
            case 'confirmPassword':
                isValid = this.validatePasswordMatch();
                break;
        }

        if (!isValid) {
            input.classList.add('is-invalid');
            return false;
        }
        
        input.classList.remove('is-invalid');
        return true;
    }

    validatePasswordRequirements() {
        const password = this.passwordInput.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };

        // Mettre à jour l'affichage des exigences
        this.requirements.forEach(req => {
            const type = req.dataset.requirement;
            const icon = req.querySelector('i');
            
            if (requirements[type]) {
                req.classList.add('valid');
                req.classList.remove('invalid');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-check');
            } else {
                req.classList.add('invalid');
                req.classList.remove('valid');
                icon.classList.remove('fa-check');
                icon.classList.add('fa-times');
            }
        });

        return Object.values(requirements).every(req => req);
    }

    validatePasswordMatch() {
        const isValid = this.passwordInput.value === this.confirmPasswordInput.value;
        if (!isValid) {
            this.confirmPasswordInput.classList.add('is-invalid');
        } else {
            this.confirmPasswordInput.classList.remove('is-invalid');
        }
        return isValid;
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

    handleSignup() {
        // Validation de tous les champs
        let isValid = true;
        if (!this.validateField(this.fullNameInput)) isValid = false;
        if (!this.validateField(this.emailInput)) isValid = false;
        if (!this.validateField(this.passwordInput)) isValid = false;
        if (!this.validateField(this.confirmPasswordInput)) isValid = false;

        if (!isValid) {
            this.showAlert('Veuillez corriger les erreurs dans le formulaire.');
            return;
        }

        // Création de l'objet utilisateur
        const user = {
            fullName: this.fullNameInput.value.trim(),
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value // Dans une vraie application, le mot de passe serait hashé
        };

        // Simuler l'enregistrement (à remplacer par un appel API)
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Animation de succès
        this.form.classList.add('animate__animated', 'animate__fadeOutUp');
        setTimeout(() => {
            // Redirection vers la page de connexion
            window.location.href = 'connexion.html';
        }, 1000);
    }
}

// Fonction pour basculer la visibilité du mot de passe
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new SignupManager();
}); 