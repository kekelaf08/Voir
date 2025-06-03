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

    initializeVoteSystem() {
        if (!this.currentClass) {
            console.error('Classe non déterminée, impossible d\'initialiser le système de vote');
            return;
        }

        // Initialiser les gestionnaires d'événements pour les étoiles
        document.querySelectorAll('.rating input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleStarRating(e));
        });

        // Charger les votes existants
        this.loadExistingVotes();
        console.log('Current votes:', localStorage.getItem('projectVotes'));
    }

    handleStarRating(event) {
        const radio = event.target;
        const rating = parseInt(radio.value);
        const projectOption = radio.closest('.project-option');
        const groupId = projectOption.dataset.group;
        const projectId = projectOption.dataset.project;
        const projectKey = `${this.currentClass}_g${groupId}p${projectId}`;

        console.log('Vote registered:', { class: this.currentClass, groupId, projectId, rating, projectKey });

        // Mettre à jour les votes dans le localStorage
        this.updateProjectVotes(projectKey, rating);

        // Déclencher l'événement de mise à jour
        this.triggerVoteUpdate();

        // Mettre à jour l'affichage
        this.updateStarDisplay(radio.closest('.rating'), rating);
    }

    updateProjectVotes(projectKey, rating) {
        const votesData = JSON.parse(localStorage.getItem('projectVotes') || '{}');
        console.log('Current votes data:', votesData);

        if (!votesData[projectKey]) {
            votesData[projectKey] = {
                title: this.getProjectTitle(projectKey),
                votes: 0,
                totalRating: 0,
                class: this.currentClass
            };
        }

        votesData[projectKey].votes += 1;
        votesData[projectKey].totalRating += rating;

        console.log('Updated votes data:', votesData);
        localStorage.setItem('projectVotes', JSON.stringify(votesData));
    }

    getProjectTitle(projectKey) {
        const [_, groupId, projectId] = projectKey.match(/g(\d+)p(\d+)$/);
        const projectElement = document.querySelector(`[data-group="${groupId}"][data-project="${projectId}"]`);
        return projectElement ? projectElement.querySelector('.project-title').textContent : `Projet ${projectId}`;
    }

    triggerVoteUpdate() {
        // Créer et dispatcher un événement personnalisé
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
        // Mettre à jour l'affichage visuel des étoiles
        const stars = container.querySelectorAll('label i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star';
            } else {
                star.className = 'far fa-star';
            }
        });
    }

    loadExistingVotes() {
        const votesData = JSON.parse(localStorage.getItem('projectVotes') || '{}');
        console.log('Loading existing votes:', votesData);

        // Pour chaque projet avec des votes
        Object.entries(votesData).forEach(([projectKey, data]) => {
            // Vérifier si le vote appartient à la classe courante
            if (projectKey.startsWith(`${this.currentClass}_`)) {
                const [_, groupId, projectId] = projectKey.match(/g(\d+)p(\d+)$/);
                const averageRating = data.totalRating / data.votes;

                // Mettre à jour l'affichage des étoiles
                const projectOption = document.querySelector(`[data-group="${groupId}"][data-project="${projectId}"]`);
                if (projectOption) {
                    const ratingContainer = projectOption.querySelector('.rating');
                    this.updateStarDisplay(ratingContainer, Math.round(averageRating));
                    
                    // Mettre à jour les statistiques affichées
                    const voteStats = projectOption.querySelector('.vote-stats');
                    if (voteStats) {
                        const averageSpan = voteStats.querySelector('.vote-average span');
                        const countSpan = voteStats.querySelector('.vote-count span');
                        if (averageSpan) averageSpan.textContent = averageRating.toFixed(1);
                        if (countSpan) countSpan.textContent = `${data.votes} votes`;
                    }
                }
            }
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