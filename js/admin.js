// Script pour l'interface administrateur
class AdminInterface {
    constructor() {
        this.currentLevel = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Écouter les formulaires d'ajout/modification de projet
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.project-form')) {
                e.preventDefault();
                this.handleProjectFormSubmit(e.target);
            }
        });

        // Écouter les boutons de suppression
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-project')) {
                e.preventDefault();
                this.handleProjectDelete(e.target);
            }
        });

        // Écouter les changements de niveau
        document.addEventListener('change', (e) => {
            if (e.target.matches('#levelSelect')) {
                this.currentLevel = e.target.value;
                this.refreshProjectsList();
            }
        });

        // Écouter les mises à jour des projets
        window.addEventListener('projectsUpdated', () => {
            this.refreshProjectsList();
        });
    }

    handleProjectFormSubmit(form) {
        const formData = new FormData(form);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            groupId: formData.get('groupId'),
            members: formData.get('members').split(',').map(m => m.trim()),
            votes: {
                count: 0,
                total: 0,
                average: 0
            }
        };

        projectsManager.updateProject(
            this.currentLevel,
            projectData.groupId,
            formData.get('projectId'),
            projectData
        );

        this.showNotification('Projet sauvegardé avec succès !', 'success');
    }

    handleProjectDelete(button) {
        const { level, groupId, projectId } = button.dataset;
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            projectsManager.deleteProject(level, groupId, projectId);
            this.showNotification('Projet supprimé avec succès !', 'success');
        }
    }

    refreshProjectsList() {
        if (!this.currentLevel) return;

        const projects = projectsManager.getProjectsByLevel(this.currentLevel);
        const container = document.getElementById('projectsList');
        container.innerHTML = ''; // Vider la liste

        Object.entries(projects).forEach(([groupId, groupProjects]) => {
            const groupElement = this.createGroupElement(groupId, groupProjects);
            container.appendChild(groupElement);
        });
    }

    createGroupElement(groupId, groupProjects) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-card mb-4';
        groupDiv.innerHTML = `
            <h3>Groupe ${groupId}</h3>
            <div class="projects-grid">
                ${Object.entries(groupProjects).map(([projectId, project]) => `
                    <div class="project-card">
                        <h4>${project.title}</h4>
                        <p>${project.description}</p>
                        <div class="stats">
                            <span>Votes: ${project.votes.count}</span>
                            <span>Moyenne: ${project.votes.average.toFixed(1)}</span>
                        </div>
                        <div class="actions">
                            <button class="btn btn-edit" data-project-id="${projectId}">Modifier</button>
                            <button class="btn btn-delete delete-project" 
                                    data-level="${this.currentLevel}"
                                    data-group-id="${groupId}"
                                    data-project-id="${projectId}">
                                Supprimer
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        return groupDiv;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialiser l'interface administrateur
document.addEventListener('DOMContentLoaded', () => {
    window.adminInterface = new AdminInterface();
}); 