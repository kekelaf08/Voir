import { getProjects, updateProjectVote, hasVotedInGroup, markGroupAsVoted } from './firebase-config.js';

class VoteHandler {
    constructor() {
        this.currentClass = this.getCurrentClass();
        this.initializeVoteSystem();
        console.log('VoteHandler initialized for class:', this.currentClass);
    }

    getCurrentClass() {
        // Déterminer la classe à partir du nom du fichier HTML
        const pathname = window.location.pathname;
        const classMatch = pathname.match(/(\d+)eme_vote\.html$/) || pathname.match(/s(\d+)_vote\.html$/);
        
        if (classMatch) {
            if (pathname.includes('eme_vote')) {
                return classMatch[1]; // 7, 8, ou 9
            } else {
                return 'sec' + classMatch[1]; // sec1, sec2, ou sec3
            }
        }
        
        console.error('Impossible de déterminer la classe depuis:', pathname);
        return null;
    }

    async initializeVoteSystem() {
        if (!this.currentClass) {
            console.error('Classe non déterminée, impossible d\'initialiser le système de vote');
            return;
        }

        // Initialiser les gestionnaires d'événements pour les étoiles
        document.querySelectorAll('.rating input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleStarRating(e));
        });

        // Charger les votes existants
        await this.loadExistingVotes();
        await this.checkAndDisableVotedGroups();
        console.log('Current votes:', localStorage.getItem('projectVotes'));
    }

    async handleStarRating(event) {
        const radio = event.target;
        const rating = parseInt(radio.value);
        const projectOption = radio.closest('.project-option');
        const groupId = projectOption.dataset.group;
        const projectId = projectOption.dataset.project;
        const projectKey = `${this.currentClass}_g${groupId}p${projectId}`;
        const groupKey = `${this.currentClass}_g${groupId}`;

        // Vérifier si l'utilisateur a déjà voté pour ce groupe
        if (await hasVotedInGroup(groupKey)) {
            console.log('Vote déjà effectué pour ce groupe:', groupKey);
            return;
        }

        console.log('Vote registered:', { class: this.currentClass, groupId, projectId, rating, projectKey });

        // Mettre à jour les votes dans Firebase
        const success = await updateProjectVote(projectKey, rating);
        
        if (success) {
            // Marquer le groupe comme voté
            await markGroupAsVoted(groupKey);

            // Désactiver les votes pour ce groupe
            this.disableVotingInGroup(groupId);

            // Mettre à jour l'affichage
            this.updateStarDisplay(radio.closest('.rating'), rating);

            // Déclencher l'événement de mise à jour
            this.triggerVoteUpdate();
        }
    }

    async loadExistingVotes() {
        const projects = await getProjects();
        console.log('Loading existing votes:', projects);

        Object.entries(projects).forEach(([projectKey, data]) => {
            if (projectKey.startsWith(`${this.currentClass}_`)) {
                const [_, groupId, projectId] = projectKey.match(/g(\d+)p(\d+)$/);
                const averageRating = data.votes > 0 ? data.totalRating / data.votes : 0;

                const projectOption = document.querySelector(`[data-group="${groupId}"][data-project="${projectId}"]`);
                if (projectOption) {
                    const ratingContainer = projectOption.querySelector('.rating');
                    this.updateStarDisplay(ratingContainer, Math.round(averageRating));
                    
                    const voteStats = projectOption.querySelector('.vote-stats');
                    if (voteStats) {
                        const averageSpan = voteStats.querySelector('.vote-average span');
                        const countSpan = voteStats.querySelector('.vote-count span');
                        if (averageSpan) averageSpan.textContent = averageRating.toFixed(1);
                        if (countSpan) countSpan.textContent = `${data.votes} vote${data.votes !== 1 ? 's' : ''}`;
                    }
                }
            }
        });
    }

    async checkAndDisableVotedGroups() {
        document.querySelectorAll('.group-card').forEach(async groupCard => {
            const groupId = groupCard.dataset.group;
            const groupKey = `${this.currentClass}_g${groupId}`;
            if (await hasVotedInGroup(groupKey)) {
                this.disableVotingInGroup(groupId);
            }
        });
    }

    disableVotingInGroup(groupId) {
        // Désactiver les étoiles pour tous les projets du groupe
        const groupContainer = document.querySelector(`.group-card[data-group="${groupId}"]`);
        if (groupContainer) {
            const stars = groupContainer.querySelectorAll('.rating-star');
            stars.forEach(star => {
                star.style.pointerEvents = 'none';
                star.style.opacity = '0.5';
            });

            // Ajouter un message indiquant que l'utilisateur a déjà voté
            if (!groupContainer.querySelector('.vote-message')) {
                const message = document.createElement('div');
                message.className = 'alert alert-warning mt-3 vote-message';
                message.innerHTML = '<i class="fas fa-info-circle me-2"></i>Vous avez déjà voté pour ce groupe.';
                groupContainer.querySelector('.group-header').appendChild(message);
            }
        }
    }

    triggerVoteUpdate() {
        const event = new CustomEvent('projectVoted', {
            detail: {
                timestamp: new Date().getTime(),
                class: this.currentClass
            }
        });
        window.dispatchEvent(event);
        console.log('Vote update event triggered for class:', this.currentClass);
    }

    updateStarDisplay(container, rating) {
        const stars = container.querySelectorAll('.rating-star i');
        stars.forEach((star, index) => {
            star.className = index < rating ? 'fas fa-star' : 'far fa-star';
        });
    }
}

// Initialiser le gestionnaire de votes
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing vote handler...');
    window.voteHandler = new VoteHandler();
});

// Fonction pour vérifier si l'utilisateur a déjà voté dans une classe
function hasVotedInClass(classPrefix) {
    const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    return userVotes[classPrefix] === true;
}

// Fonction pour marquer une classe comme votée
function markClassAsVoted(classPrefix) {
    const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    userVotes[classPrefix] = true;
    localStorage.setItem('userVotes', JSON.stringify(userVotes));
}

// Fonction pour désactiver les votes dans une classe
function disableVotingInClass() {
    document.querySelectorAll('.rating-star').forEach(star => {
        star.style.pointerEvents = 'none';
        star.style.opacity = '0.5';
    });
    
    // Ajouter un message indiquant que l'utilisateur a déjà voté
    if (!document.querySelector('.vote-message')) {
        const header = document.querySelector('.votes-remaining');
        const message = document.createElement('div');
        message.className = 'alert alert-warning mt-3 vote-message';
        message.innerHTML = '<i class="fas fa-info-circle me-2"></i>Vous avez déjà voté dans cette classe.';
        header.parentNode.insertBefore(message, header.nextSibling);
    }
} 