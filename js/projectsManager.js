// Gestionnaire de projets pour la synchronisation admin/utilisateur
class ProjectsManager {
    constructor() {
        this.projects = this.loadProjects();
        this.initializeEventListeners();
    }

    // Charger les projets depuis le localStorage
    loadProjects() {
        const savedProjects = localStorage.getItem('projects_data');
        return savedProjects ? JSON.parse(savedProjects) : this.getDefaultProjects();
    }

    // Structure par défaut des projets
    getDefaultProjects() {
        return {
            '7eme': {},
            '8eme': {},
            '9eme': {},
            's1': {},
            's2': {},
            's3': {}
        };
    }

    // Sauvegarder les projets dans le localStorage
    saveProjects() {
        localStorage.setItem('projects_data', JSON.stringify(this.projects));
        this.notifyUpdate();
    }

    // Ajouter ou mettre à jour un projet
    updateProject(level, groupId, projectId, projectData) {
        if (!this.projects[level]) {
            this.projects[level] = {};
        }
        if (!this.projects[level][groupId]) {
            this.projects[level][groupId] = {};
        }
        this.projects[level][groupId][projectId] = {
            ...projectData,
            lastUpdate: new Date().toISOString()
        };
        this.saveProjects();
    }

    // Supprimer un projet
    deleteProject(level, groupId, projectId) {
        if (this.projects[level]?.[groupId]?.[projectId]) {
            delete this.projects[level][groupId][projectId];
            this.saveProjects();
        }
    }

    // Obtenir tous les projets d'un niveau
    getProjectsByLevel(level) {
        return this.projects[level] || {};
    }

    // Obtenir un projet spécifique
    getProject(level, groupId, projectId) {
        return this.projects[level]?.[groupId]?.[projectId];
    }

    // Mettre à jour les statistiques de vote
    updateVoteStats(level, groupId, projectId, rating) {
        const project = this.getProject(level, groupId, projectId);
        if (project) {
            if (!project.votes) {
                project.votes = {
                    count: 0,
                    total: 0,
                    average: 0
                };
            }
            project.votes.count++;
            project.votes.total += rating;
            project.votes.average = project.votes.total / project.votes.count;
            this.saveProjects();
        }
    }

    // Initialiser les écouteurs d'événements pour la synchronisation en temps réel
    initializeEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'projects_data') {
                this.projects = JSON.parse(e.newValue);
                this.notifyUpdate();
            }
        });
    }

    // Notifier les changements aux abonnés
    notifyUpdate() {
        const event = new CustomEvent('projectsUpdated', {
            detail: { projects: this.projects }
        });
        window.dispatchEvent(event);
    }
}

// Créer une instance unique du gestionnaire
const projectsManager = new ProjectsManager();

// Exporter l'instance pour utilisation dans d'autres fichiers
window.projectsManager = projectsManager; 