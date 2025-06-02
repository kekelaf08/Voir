// Script pour les pages de vote
class VoteInterface {
    constructor(level) {
        this.level = level;
        this.remainingVotes = 3;
        this.votedProjects = new Map();
        this.initializeInterface();
    }

    initializeInterface() {
        // Charger les projets
        this.refreshProjectsList();

        // Initialiser les gestionnaires d'événements
        this.initializeEventListeners();

        // Charger les votes précédents
        this.loadPreviousVotes();

        // Mettre à jour l'affichage des votes restants
        this.updateVoteDisplay();
    }

    initializeEventListeners() {
        // Écouter les votes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.rating input')) {
                this.handleVote(e.target);
            }
        });

        // Écouter les mises à jour des projets
        window.addEventListener('projectsUpdated', () => {
            this.refreshProjectsList();
        });

        // Sauvegarder les votes avant de quitter la page
        window.addEventListener('beforeunload', () => {
            this.saveVotes();
        });
    }

    handleVote(input) {
        const rating = parseInt(input.value);
        const { group: groupId, project: projectId } = input.closest('.rating').dataset;
        const projectKey = `${groupId}-${projectId}`;

        if (this.remainingVotes > 0 || this.votedProjects.has(projectKey)) {
            const previousRating = this.votedProjects.get(projectKey);
            
            if (previousRating) {
                // Annuler le vote précédent
                this.votedProjects.delete(projectKey);
                this.remainingVotes++;
            }

            // Enregistrer le nouveau vote
            this.votedProjects.set(projectKey, rating);
            this.remainingVotes--;

            // Mettre à jour l'interface
            this.updateVoteDisplay();
            
            // Mettre à jour les statistiques dans le gestionnaire de projets
            projectsManager.updateVoteStats(this.level, groupId, projectId, rating);
            
            this.showNotification('Vote enregistré !', 'success');
        } else {
            input.checked = false;
            this.showNotification('Vous avez utilisé tous vos votes !', 'warning');
        }
    }

    refreshProjectsList() {
        const projects = projectsManager.getProjectsByLevel(this.level);
        const container = document.querySelector('main.container');
        if (!container) return;

        container.innerHTML = ''; // Vider le conteneur

        Object.entries(projects).forEach(([groupId, groupProjects]) => {
            const groupElement = this.createGroupElement(groupId, groupProjects);
            container.appendChild(groupElement);
        });
    }

    createGroupElement(groupId, groupProjects) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-card';
        groupDiv.innerHTML = `
            <div class="group-header">
                <h2 class="group-title">Groupe ${groupId}</h2>
                <div class="text-muted">${Object.values(groupProjects)[0]?.members?.length || 0} membres</div>
            </div>
            <div class="projects-container">
                ${Object.entries(groupProjects).map(([projectId, project]) => this.createProjectElement(groupId, projectId, project)).join('')}
            </div>
        `;
        return groupDiv;
    }

    createProjectElement(groupId, projectId, project) {
        return `
            <div class="project-option">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="rating" data-group="${groupId}" data-project="${projectId}">
                    ${this.createRatingInputs(groupId, projectId)}
                </div>
                <div class="vote-stats">
                    <span class="vote-average">${project.votes.average.toFixed(1)}</span>
                    <span class="vote-count">(${project.votes.count} votes)</span>
                </div>
            </div>
        `;
    }

    createRatingInputs(groupId, projectId) {
        let inputs = '';
        for (let i = 5; i >= 1; i--) {
            inputs += `
                <input type="radio" name="rating-${groupId}-${projectId}" value="${i}" id="star${i}-${groupId}-${projectId}">
                <label for="star${i}-${groupId}-${projectId}"><i class="fas fa-star"></i></label>
            `;
        }
        return inputs;
    }

    updateVoteDisplay() {
        const remainingVotesElement = document.getElementById('remainingVotes');
        if (remainingVotesElement) {
            remainingVotesElement.textContent = this.remainingVotes;
        }

        // Désactiver/activer les systèmes de notation selon les votes restants
        document.querySelectorAll('.rating').forEach(rating => {
            const groupId = rating.dataset.group;
            const projectId = rating.dataset.project;
            const projectKey = `${groupId}-${projectId}`;

            if (this.remainingVotes === 0 && !this.votedProjects.has(projectKey)) {
                rating.classList.add('disabled');
                rating.querySelectorAll('input').forEach(input => input.disabled = true);
            } else {
                rating.classList.remove('disabled');
                rating.querySelectorAll('input').forEach(input => input.disabled = false);
            }
        });
    }

    loadPreviousVotes() {
        const savedVotes = JSON.parse(localStorage.getItem(`votes_${this.level}`) || '{}');
        Object.entries(savedVotes).forEach(([projectKey, rating]) => {
            this.votedProjects.set(projectKey, rating);
            this.remainingVotes--;

            const [groupId, projectId] = projectKey.split('-');
            const input = document.querySelector(
                `.rating[data-group="${groupId}"][data-project="${projectId}"] input[value="${rating}"]`
            );
            if (input) {
                input.checked = true;
            }
        });
    }

    saveVotes() {
        const votesObject = Object.fromEntries(this.votedProjects);
        localStorage.setItem(`votes_${this.level}`, JSON.stringify(votesObject));
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

// Initialiser l'interface de vote avec le niveau approprié
document.addEventListener('DOMContentLoaded', () => {
    // Déterminer le niveau à partir du nom de la page
    const level = window.location.pathname.split('/').pop().split('_')[0];
    window.voteInterface = new VoteInterface(level);
}); 