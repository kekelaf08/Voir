// Gestionnaire d'état des votes
class VoteStatusManager {
    constructor() {
        this.status = {
            isActive: false,
            startTime: null,
            endTime: null,
            lastUpdate: null
        };
        
        // Initialiser l'état
        this.loadStatus();
        
        // Démarrer la vérification périodique
        this.startChecking();
        
        // Écouter les événements de changement d'état
        window.addEventListener('voteStatusChanged', (event) => {
            this.handleStatusChange(event.detail);
        });
    }
    
    // Charger l'état depuis le localStorage
    loadStatus() {
        const savedStatus = localStorage.getItem('voteStatus');
        if (savedStatus) {
            this.status = JSON.parse(savedStatus);
            this.updateUI();
        }
    }
    
    // Mettre à jour l'interface utilisateur
    updateUI() {
        if (!this.status.isActive) {
            this.disableVoting();
        }
    }
    
    // Vérifier périodiquement les changements d'état
    startChecking() {
        setInterval(() => {
            const lastUpdate = localStorage.getItem('voteStatusLastUpdate');
            if (lastUpdate && (!this.status.lastUpdate || parseInt(lastUpdate) > this.status.lastUpdate)) {
                this.loadStatus();
            }
        }, 2000); // Vérifier toutes les 2 secondes
    }
    
    // Gérer les changements d'état
    handleStatusChange(detail) {
        this.loadStatus();
        
        if (detail.action === 'start') {
            this.showNotification('Les votes sont maintenant ouverts !', 'success');
            // Réactiver les boutons de vote et les étoiles
            this.enableVoting();
        } else if (detail.action === 'end') {
            this.showNotification('Les votes sont maintenant clôturés.', 'warning');
            this.disableVoting();
        }
    }
    
    // Vérifier si les votes sont actifs
    isVotingActive() {
        return this.status.isActive;
    }
    
    // Activer le vote
    enableVoting() {
        // Réactiver les boutons de vote
        const voteButtons = document.querySelectorAll('.vote-button');
        voteButtons.forEach(button => {
            if (!button.classList.contains('voted')) {
                button.disabled = false;
                button.classList.remove('disabled');
            }
        });

        // Réactiver les étoiles
        const ratingStars = document.querySelectorAll('.rating-star');
        ratingStars.forEach(star => {
            star.style.pointerEvents = 'auto';
            star.style.opacity = '1';
        });

        // Supprimer le message de votes clôturés s'il existe
        const voteClosedMessage = document.querySelector('.vote-closed-message');
        if (voteClosedMessage) {
            voteClosedMessage.remove();
        }
    }
    
    // Désactiver le vote
    disableVoting() {
        // Désactiver tous les boutons de vote
        const voteButtons = document.querySelectorAll('.vote-button');
        voteButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });

        // Désactiver toutes les étoiles de notation
        const ratingStars = document.querySelectorAll('.rating-star');
        ratingStars.forEach(star => {
            star.style.pointerEvents = 'none';
            star.style.opacity = '0.5';
        });
        
        // Ajouter un message d'information si pas déjà présent
        const voteContainer = document.querySelector('.vote-container');
        if (voteContainer && !voteContainer.querySelector('.vote-closed-message')) {
            const message = document.createElement('div');
            message.className = 'alert alert-warning mt-3 vote-closed-message';
            message.innerHTML = '<i class="fas fa-info-circle"></i> Les votes sont actuellement clôturés.';
            voteContainer.prepend(message);
        }
    }
    
    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        // Animer l'entrée de la notification
        notification.classList.add('animate__animated', 'animate__fadeInRight');
        
        // Supprimer la notification après 5 secondes
        setTimeout(() => {
            notification.classList.remove('animate__fadeInRight');
            notification.classList.add('animate__fadeOutRight');
            setTimeout(() => notification.remove(), 1000);
        }, 5000);
    }
}

// Créer une instance du gestionnaire d'état des votes
const voteStatusManager = new VoteStatusManager();

// Exporter le gestionnaire pour une utilisation externe
window.voteStatusManager = voteStatusManager;

class VoteStatusChecker {
    constructor() {
        this.maxVotesPerUser = 3;
        this.currentClass = this.getCurrentClass();
        this.initializeVoteStatus();
        console.log('VoteStatusChecker initialized for class:', this.currentClass);
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

    initializeVoteStatus() {
        if (!this.currentClass) {
            console.error('Classe non déterminée, impossible d\'initialiser le statut des votes');
            return;
        }

        // Initialiser le compteur de votes
        this.updateVoteCount();

        // Écouter les événements de vote
        window.addEventListener('projectVoted', () => {
            this.updateVoteCount();
            this.checkVoteStatus();
        });

        // Vérifier le statut initial des votes
        this.checkVoteStatus();
    }

    updateVoteCount() {
        const votesData = JSON.parse(localStorage.getItem('projectVotes') || '{}');
        let usedVotes = 0;

        // Compter les votes pour la classe actuelle
        Object.entries(votesData).forEach(([key, data]) => {
            if (key.startsWith(`${this.currentClass}_`)) {
                usedVotes += data.votes;
            }
        });

        // Mettre à jour l'affichage des votes restants
        const remainingVotes = Math.max(0, this.maxVotesPerUser - usedVotes);
        const votesCountElement = document.getElementById('votesCount');
        if (votesCountElement) {
            votesCountElement.textContent = remainingVotes;
        }

        console.log('Votes count updated:', {
            class: this.currentClass,
            used: usedVotes,
            remaining: remainingVotes
        });

        return remainingVotes;
    }

    checkVoteStatus() {
        const remainingVotes = this.updateVoteCount();
        const projectOptions = document.querySelectorAll('.project-option');

        projectOptions.forEach(option => {
            const rating = option.querySelector('.rating');
            if (rating) {
                const inputs = rating.querySelectorAll('input[type="radio"]');
                const hasVoted = this.hasVotedForProject(option);

                if (remainingVotes === 0 && !hasVoted) {
                    // Désactiver les votes si plus de votes disponibles
                    inputs.forEach(input => {
                        input.disabled = true;
                        input.closest('.rating').classList.add('disabled');
                    });
                } else {
                    // Activer les votes si des votes sont disponibles
                    inputs.forEach(input => {
                        input.disabled = false;
                        input.closest('.rating').classList.remove('disabled');
                    });
                }
            }
        });
    }

    hasVotedForProject(projectOption) {
        const votesData = JSON.parse(localStorage.getItem('projectVotes') || '{}');
        const groupId = projectOption.dataset.group;
        const projectId = projectOption.dataset.project;
        const projectKey = `${this.currentClass}_g${groupId}p${projectId}`;

        return votesData[projectKey] && votesData[projectKey].votes > 0;
    }

    showNotification(message, type = 'info') {
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

// Initialiser le vérificateur de statut des votes
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing vote status checker...');
    window.voteStatusChecker = new VoteStatusChecker();
}); 