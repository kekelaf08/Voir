// Gestionnaire de navigation
class NavigationManager {
    constructor() {
        this.currentSection = null;
        this.bindEvents();
    }

    bindEvents() {
        // Gestion des clics sur les boutons de navigation
        document.querySelectorAll('.management-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const sectionId = button.dataset.section;
                this.showSection(sectionId);
            });
        });

        // Gestion des boutons retour
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', () => {
                this.showHomePage();
            });
        });
    }

    showSection(sectionId) {
        const homePage = document.getElementById('home-page');
        const section = document.getElementById(`${sectionId}-section`);

        if (!section) return;

        // Masquer la page d'accueil avec animation
        homePage.classList.remove('animate__fadeIn');
        homePage.classList.add('animate__fadeOut');

        setTimeout(() => {
            homePage.style.display = 'none';
            
            // Afficher la section avec animation
            section.style.display = 'block';
            section.classList.add('animate__animated', 'animate__fadeIn');
            
            // Mettre à jour la section courante
            this.currentSection = sectionId;
        }, 500);
    }

    showHomePage() {
        const currentSection = document.getElementById(`${this.currentSection}-section`);
        const homePage = document.getElementById('home-page');

        if (currentSection) {
            // Masquer la section courante avec animation
            currentSection.classList.remove('animate__fadeIn');
            currentSection.classList.add('animate__fadeOut');

            setTimeout(() => {
                currentSection.style.display = 'none';
                currentSection.classList.remove('animate__animated', 'animate__fadeOut');
                
                // Afficher la page d'accueil avec animation
                homePage.style.display = 'block';
                homePage.classList.remove('animate__fadeOut');
                homePage.classList.add('animate__animated', 'animate__fadeIn');
            }, 500);
        }
    }
}

// Utilitaires pour les animations
const AnimationUtils = {
    fadeIn: (element, duration = 500) => {
        element.style.opacity = 0;
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease`;
        setTimeout(() => element.style.opacity = 1, 10);
    },

    fadeOut: (element, duration = 500) => {
        element.style.opacity = 1;
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = 0;
        setTimeout(() => element.style.display = 'none', duration);
    },

    slideDown: (element, duration = 500) => {
        element.style.display = 'block';
        const height = element.scrollHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        setTimeout(() => element.style.height = height + 'px', 10);
    },

    shake: (element) => {
        element.classList.add('animate__animated', 'animate__headShake');
        element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__headShake');
        });
    }
};

// Toast notifications
class ToastNotification {
    static show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type} animate__animated animate__fadeInRight`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('animate__fadeInRight');
            toast.classList.add('animate__fadeOutRight');
            setTimeout(() => toast.remove(), 1000);
        }, 3000);
    }
}

// Gestion des Classes
class ClassManager {
    constructor() {
        this.classes = [];
        this.modal = new bootstrap.Modal(document.getElementById('addClassModal'));
        this.bindEvents();
        this.loadClasses();
    }

    bindEvents() {
        // Bouton d'enregistrement dans la modale
        document.getElementById('saveClassBtn').addEventListener('click', () => {
            this.saveClass();
        });

        // Validation en temps réel du formulaire
        document.getElementById('className').addEventListener('input', (e) => {
            this.validateClassName(e.target.value);
        });

        // Réinitialiser le formulaire à la fermeture de la modale
        document.getElementById('addClassModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('classForm').reset();
            this.clearValidationErrors();
        });

        // Délégation d'événements pour les boutons d'action
        document.querySelector('#classesTable').addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const row = target.closest('tr');
            const className = row.cells[0].textContent;

            if (target.classList.contains('btn-primary')) {
                this.editClass(className, row);
            } else if (target.classList.contains('btn-danger')) {
                this.deleteClass(className, row);
            } else if (target.classList.contains('btn-info')) {
                this.viewGroups(className);
            }
        });
    }

    validateClassName(name) {
        const input = document.getElementById('className');
        const isValid = name.length >= 3 && /^[a-zA-Z0-9\s-]+$/.test(name);
        
        if (!isValid) {
            input.classList.add('is-invalid');
            if (!input.nextElementSibling) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Le nom doit contenir au moins 3 caractères et ne peut contenir que des lettres, chiffres, espaces et tirets.';
                input.parentNode.appendChild(feedback);
            }
        } else {
            input.classList.remove('is-invalid');
            const feedback = input.nextElementSibling;
            if (feedback && feedback.className === 'invalid-feedback') {
                feedback.remove();
            }
        }
        
        return isValid;
    }

    clearValidationErrors() {
        const inputs = document.querySelectorAll('#classForm .form-control');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const feedback = input.nextElementSibling;
            if (feedback && feedback.className === 'invalid-feedback') {
                feedback.remove();
            }
        });
    }

    saveClass() {
        const nameInput = document.getElementById('className');
        const countInput = document.getElementById('studentCount');
        
        const className = nameInput.value.trim();
        const studentCount = parseInt(countInput.value);

        // Validation
        if (!this.validateClassName(className)) {
            return;
        }

        if (isNaN(studentCount) || studentCount < 1) {
            countInput.classList.add('is-invalid');
            if (!countInput.nextElementSibling) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Le nombre d\'élèves doit être supérieur à 0.';
                countInput.parentNode.appendChild(feedback);
            }
            return;
        }

        // Vérifier si la classe existe déjà
        if (this.classes.some(c => c.name.toLowerCase() === className.toLowerCase())) {
            nameInput.classList.add('is-invalid');
            if (!nameInput.nextElementSibling) {
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Cette classe existe déjà.';
                nameInput.parentNode.appendChild(feedback);
            }
            return;
        }

        // Ajouter la classe
        const newClass = {
            name: className,
            students: studentCount
        };

        this.classes.push(newClass);
        this.addClassToTable(newClass);

        // Fermer la modale et afficher la notification
        this.modal.hide();
        ToastNotification.show(`La classe ${className} a été ajoutée avec succès !`);

        // Mettre à jour le compteur de classes dans les statistiques
        this.updateClassCount();
    }

    addClassToTable(classData) {
        const tbody = document.querySelector('#classesTable tbody');
        const row = document.createElement('tr');
        row.className = 'animate__animated animate__fadeInDown';
        
        row.innerHTML = `
            <td>${classData.name}</td>
            <td>${classData.students}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary">
                    <i class="fas fa-edit"></i>
                    Modifier
                </button>
                <button class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                    Supprimer
                </button>
                <button class="btn btn-sm btn-info">
                    <i class="fas fa-users"></i>
                    Voir groupes
                </button>
            </td>
        `;

        tbody.insertBefore(row, tbody.firstChild);
    }

    updateClassCount() {
        const statsNumber = document.querySelector('.stats-card .stats-number');
        if (statsNumber) {
            statsNumber.textContent = this.classes.length;
        }
    }

    loadClasses() {
        // Simuler le chargement des classes (à remplacer par un appel API)
        const tbody = document.querySelector('#classesTable tbody');
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Chargement...</td></tr>';

        // Simuler un délai réseau
        setTimeout(() => {
            tbody.innerHTML = '';
            this.classes = [
                { name: 'Terminale A', students: 32 },
                { name: 'Terminale B', students: 35 },
                { name: 'Terminale C', students: 30 }
            ];

            this.classes.forEach(classe => {
                this.addClassToTable(classe);
            });

            this.updateClassCount();
        }, 1000);
    }

    deleteClass(className, row) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la classe ${className} ?`)) {
            row.classList.add('animate__animated', 'animate__fadeOutLeft');
            row.addEventListener('animationend', () => {
                this.classes = this.classes.filter(c => c.name !== className);
                row.remove();
                this.updateClassCount();
                ToastNotification.show(`La classe ${className} a été supprimée`);
            });
        }
    }

    viewGroups(className) {
        document.querySelector('#groupes select').value = className;
        document.getElementById('groupes-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Gestion des Groupes
class GroupManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Ajouter un groupe
        document.querySelector('#groupes button.btn-success').addEventListener('click', () => {
            this.showAddGroupModal();
        });

        // Changement de classe sélectionnée
        document.querySelector('#groupes select').addEventListener('change', (e) => {
            this.loadGroups(e.target.value);
        });
    }

    showAddGroupModal() {
        // À implémenter : Afficher une modale pour ajouter un groupe
        alert('Fonctionnalité à implémenter : Ajouter un groupe');
    }

    loadGroups(className) {
        // À implémenter : Charger les groupes d'une classe
        console.log(`Chargement des groupes pour la classe : ${className}`);
    }
}

// Gestion des Projets
class ProjectManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Ajouter un projet
        document.querySelector('#projets button.btn-success').addEventListener('click', () => {
            this.showAddProjectModal();
        });

        // Changement de groupe sélectionné
        document.querySelector('#projets select').addEventListener('change', (e) => {
            this.loadProjects(e.target.value);
        });
    }

    showAddProjectModal() {
        // À implémenter : Afficher une modale pour ajouter un projet
        alert('Fonctionnalité à implémenter : Ajouter un projet');
    }

    loadProjects(groupName) {
        // À implémenter : Charger les projets d'un groupe
        console.log(`Chargement des projets pour le groupe : ${groupName}`);
    }
}

// Gestion des Votes
class VoteManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Lancer les votes
        document.querySelector('#votes .btn-primary').addEventListener('click', () => {
            this.startVoting();
        });

        // Clôturer les votes
        document.querySelector('#votes .btn-danger').addEventListener('click', () => {
            this.endVoting();
        });

        // Changement des paramètres de vote
        document.querySelectorAll('#votes .form-check-input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateVoteSettings(e.target.id, e.target.checked);
            });
        });
    }

    startVoting() {
        // À implémenter : Lancer les votes
        alert('Fonctionnalité à implémenter : Lancement des votes');
    }

    endVoting() {
        if (confirm('Êtes-vous sûr de vouloir clôturer les votes ?')) {
            // À implémenter : Clôturer les votes
            alert('Fonctionnalité à implémenter : Clôture des votes');
        }
    }

    updateVoteSettings(settingId, value) {
        // À implémenter : Mettre à jour les paramètres de vote
        console.log(`Mise à jour du paramètre ${settingId} : ${value}`);
    }
}

// Gestion des Résultats
class ResultManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Filtres
        document.querySelectorAll('#resultats select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateResults();
            });
        });

        // Export
        document.querySelector('#resultats .btn-group').addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.textContent.includes('PDF')) {
                this.exportPDF();
            } else if (target.textContent.includes('Excel')) {
                this.exportExcel();
            }
        });
    }

    updateResults() {
        // À implémenter : Mettre à jour les résultats selon les filtres
        const classe = document.querySelector('#resultats select:nth-child(1)').value;
        const groupe = document.querySelector('#resultats select:nth-child(2)').value;
        console.log(`Mise à jour des résultats - Classe: ${classe}, Groupe: ${groupe}`);
    }

    exportPDF() {
        // À implémenter : Exporter en PDF
        alert('Fonctionnalité à implémenter : Export PDF');
    }

    exportExcel() {
        // À implémenter : Exporter en Excel
        alert('Fonctionnalité à implémenter : Export Excel');
    }
}

// Gestion des groupes
let groups = [];

document.addEventListener('DOMContentLoaded', function() {
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', handleGroupSubmit);
    }

    // Charger les groupes existants
    loadGroups();
});

function handleGroupSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedClass = formData.get('class');

    // Vérifier si une classe est sélectionnée
    if (!selectedClass) {
        showNotification('Veuillez sélectionner une classe', 'danger');
        return;
    }

    const newGroup = {
        id: Date.now(),
        class: selectedClass,
        name: formData.get('groupName'),
        projectTitle: formData.get('projectTitle'),
        projectDescription: formData.get('projectDescription'),
        members: parseInt(formData.get('members')),
        status: formData.get('status'),
        createdAt: new Date().toISOString()
    };

    // Validation supplémentaire
    if (!newGroup.name || !newGroup.projectTitle || !newGroup.members) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'danger');
        return;
    }

    // Ajouter le nouveau groupe
    groups.push(newGroup);
    
    // Sauvegarder dans le localStorage
    saveGroups();
    
    // Mettre à jour l'affichage
    updateGroupsDisplay();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addGroupModal'));
    modal.hide();
    
    // Réinitialiser le formulaire
    e.target.reset();
    
    // Afficher une notification
    showNotification(`Groupe "${newGroup.name}" ajouté avec succès dans la classe ${newGroup.class}!`, 'success');

    // Mettre à jour les compteurs
    updateGroupCounters();
}

function loadGroups() {
    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) {
        groups = JSON.parse(savedGroups);
        updateGroupsDisplay();
    }
}

function saveGroups() {
    localStorage.setItem('groups', JSON.stringify(groups));
}

function updateGroupsDisplay() {
    const tbody = document.querySelector('#groupsTable tbody');
    if (!tbody) return;

    // Récupérer la classe actuellement sélectionnée
    const currentClass = document.querySelector('.class-button.active')?.getAttribute('data-class');
    const currentClassName = getClassNameFromId(currentClass);

    // Filtrer les groupes pour la classe actuelle
    const filteredGroups = currentClassName ? 
        groups.filter(group => group.class === currentClassName) : 
        groups;

    tbody.innerHTML = '';
    
    if (filteredGroups.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-info-circle me-2 text-muted"></i>
                    Aucun groupe dans cette classe
                </td>
            </tr>
        `;
        return;
    }
    
    filteredGroups.forEach(group => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="badge bg-soft-primary text-primary">${escapeHtml(group.class)}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-users text-muted me-2"></i>
                    ${escapeHtml(group.name)}
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-project-diagram text-primary me-2"></i>
                    <div>
                        <div class="fw-medium">${escapeHtml(group.projectTitle)}</div>
                        <small class="text-muted">${escapeHtml(group.projectDescription)}</small>
                    </div>
                </div>
            </td>
            <td>${group.members} membres</td>
            <td>
                <span class="badge bg-${group.status === 'actif' ? 'success' : 'secondary'}">${escapeHtml(group.status)}</span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editGroup(${group.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewGroupDetails(${group.id})" title="Détails">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGroup(${group.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Mettre à jour les compteurs de groupes
    updateGroupCounters();
}

// Fonction utilitaire pour convertir l'ID de classe en nom de classe
function getClassNameFromId(classId) {
    const classMapping = {
        'classeA': '7ème',
        'classeB': '8ème',
        'classeC': '9ème',
        'classeD': 'Secondaire 1',
        'classeE': 'Secondaire 2',
        'classeF': 'Secondaire 3'
    };
    return classMapping[classId];
}

function updateGroupCounters() {
    const classGroups = {};
    groups.forEach(group => {
        if (!classGroups[group.class]) {
            classGroups[group.class] = 0;
        }
        classGroups[group.class]++;
    });

    // Mettre à jour l'affichage des compteurs dans les cartes de classe
    document.querySelectorAll('.class-card p').forEach(counter => {
        const className = counter.previousElementSibling.textContent;
        const count = classGroups[className] || 0;
        counter.textContent = `${count} groupe${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`;
    });
}

function deleteGroup(groupId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
        groups = groups.filter(g => g.id !== groupId);
        saveGroups();
        updateGroupsDisplay();
        showNotification('Groupe supprimé avec succès!', 'success');
    }
}

function editGroup(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Remplir le formulaire avec les données du groupe
    const form = document.getElementById('groupForm');
    form.querySelector('[name="class"]').value = group.class;
    form.querySelector('[name="groupName"]').value = group.name;
    form.querySelector('[name="projectTitle"]').value = group.projectTitle;
    form.querySelector('[name="projectDescription"]').value = group.projectDescription;
    form.querySelector('[name="members"]').value = group.members;
    form.querySelector('[name="status"]').value = group.status;

    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('addGroupModal'));
    modal.show();

    // Changer le titre du modal
    document.querySelector('#addGroupModal .modal-title').innerHTML = `
        <i class="fas fa-edit me-2"></i>
        Modifier le groupe
    `;
}

function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Ajouter au document
    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter les styles pour les notifications toast
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            background: white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
        }

        .toast-success {
            border-left: 4px solid var(--success-color);
        }

        .toast-error {
            border-left: 4px solid var(--danger-color);
        }

        .toast-icon {
            font-size: 1.5rem;
        }

        .toast-success .toast-icon {
            color: var(--success-color);
        }

        .toast-error .toast-icon {
            color: var(--danger-color);
        }

        .animate__fadeOut {
            animation: fadeOut 0.5s ease forwards;
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initialiser les gestionnaires
    new NavigationManager();
    new ClassManager();
    new GroupManager();
    new ProjectManager();
    new VoteManager();
    new ResultManager();
});

// Mettre à jour la gestion des clics sur les boutons de classe
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.class-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const classId = this.getAttribute('data-class');
            
            // Retirer la classe active de tous les boutons
            document.querySelectorAll('.class-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Afficher le tableau des groupes
            const groupsTable = document.getElementById('groupsTable');
            if (groupsTable) {
                groupsTable.style.display = 'block';
            }
            
            // Mettre à jour l'affichage des groupes
            updateGroupsDisplay();
        });
    });
}); 