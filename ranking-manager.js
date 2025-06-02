class RankingManager {
    constructor() {
        this.initializeEventListeners();
        console.log('RankingManager initialized');
        this.ensureInitialData();
        this.debugStorage();
        this.currentClass = this.getCurrentClassFromURL();
    }

    getCurrentClassFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('class') || 'all';
    }

    getClassDisplayName(classId) {
        const classNames = {
            '7': '7ème année',
            '8': '8ème année',
            '9': '9ème année',
            'sec1': 'Secondaire 1',
            'sec2': 'Secondaire 2',
            'sec3': 'Secondaire 3'
        };
        return classNames[classId] || classId;
    }

    debugStorage() {
        const votesData = JSON.parse(localStorage.getItem('projectVotes') || '{}');
        console.log('Current localStorage content:', votesData);
        
        // Afficher les détails pour chaque projet
        Object.entries(votesData).forEach(([key, data]) => {
            if (data.votes > 0) {
                console.log(`Project ${key}:`, {
                    title: data.title,
                    votes: data.votes,
                    totalRating: data.totalRating,
                    averageRating: data.totalRating / data.votes,
                    class: data.class
                });
            }
        });

        // Afficher le nombre total de votes par classe
        const votesByClass = {};
        Object.entries(votesData).forEach(([key, data]) => {
            const classId = key.split('_')[0];
            if (!votesByClass[classId]) {
                votesByClass[classId] = 0;
            }
            votesByClass[classId] += data.votes;
        });
        console.log('Votes by class:', votesByClass);
    }

    ensureInitialData() {
        // S'assurer que les données initiales sont présentes
        if (!localStorage.getItem('projectVotes')) {
            console.log('Initializing project data...');
            localStorage.setItem('projectVotes', JSON.stringify(initialProjects));
        }
    }

    initializeEventListeners() {
        // Écouter les changements dans le localStorage pour les votes
        window.addEventListener('storage', (e) => {
            if (e.key === 'projectVotes') {
                console.log('Storage event detected:', e.newValue);
                this.updateRankings();
            }
        });

        // Écouter les événements personnalisés de vote
        window.addEventListener('projectVoted', (e) => {
            console.log('Project voted event received:', e.detail);
            this.updateRankings();
        });

        // Écouter le bouton d'actualisation
        const refreshButton = document.querySelector('.refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                console.log('Manual refresh triggered');
                this.updateRankings();
            });
        }

        // Mettre à jour les classements au chargement de la page
        window.addEventListener('load', () => {
            console.log('Page loaded, updating rankings...');
            this.updateRankings();
        });

        const classSelector = document.getElementById('classSelector');
        if (classSelector) {
            classSelector.value = this.currentClass;
            classSelector.addEventListener('change', (e) => {
                this.currentClass = e.target.value;
                this.updateRankings();
            });
        }
    }

    updateRankings() {
        console.log('Updating rankings...');
        const rankings = this.calculateRankings();
        console.log('Calculated rankings:', rankings);
        
        if (rankings.length === 0) {
            console.log('No rankings found, displaying empty state');
            this.displayNoVotesMessage();
        } else {
            console.log(`Found ${rankings.length} projects with votes`);
            this.displayRankings(rankings);
            this.updateGroupRankings(rankings);
        }
    }

    displayNoVotesMessage() {
        const globalRankingContainer = document.getElementById('globalRanking');
        const groupRankingContainer = document.getElementById('groupRanking');

        const className = this.currentClass === 'all' ? '' : this.getClassDisplayName(this.currentClass);
        const noVotesMessage = `
            <div class="no-votes-message">
                <i class="fas fa-info-circle"></i>
                <p>Aucun vote n'a encore été enregistré${className ? ` pour ${className}` : ''}</p>
            </div>
        `;

        if (globalRankingContainer) globalRankingContainer.innerHTML = noVotesMessage;
        if (groupRankingContainer) groupRankingContainer.innerHTML = noVotesMessage;
    }

    calculateRankings() {
        // Récupérer les données des votes depuis le localStorage
        const votesData = JSON.parse(localStorage.getItem('projectVotes') || '{}');
        console.log('Raw votes data:', votesData);
        const projects = [];

        // Convertir les données en tableau pour le tri
        Object.entries(votesData).forEach(([projectKey, data]) => {
            console.log(`Processing project ${projectKey}:`, data);
            if (data.votes > 0) {
                const classMatch = projectKey.match(/^(7|8|9|sec[1-3])_g(\d+)p(\d+)$/);
                if (classMatch) {
                    const [_, classId, groupId, projectId] = classMatch;
                    
                    if (this.currentClass === 'all' || this.currentClass === classId) {
                        projects.push({
                            id: projectKey,
                            title: data.title || `Projet ${projectId}`,
                            group: `Groupe ${groupId}`,
                            class: this.getClassDisplayName(classId),
                            rating: data.totalRating / data.votes,
                            votes: data.votes,
                            totalRating: data.totalRating,
                            groupId: `g${groupId}`,
                            classId: classId
                        });
                    }
                }
            }
        });

        // Trier les projets par note moyenne (décroissant)
        return projects.sort((a, b) => b.rating - a.rating);
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }

    displayRankings(rankings) {
        const globalRankingContainer = document.getElementById('globalRanking');
        if (!globalRankingContainer) {
            console.error('Global ranking container not found');
            return;
        }

        console.log('Displaying global rankings...');
        globalRankingContainer.innerHTML = '';

        rankings.forEach((project, index) => {
            console.log(`Displaying project at rank ${index + 1}:`, project);
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            rankingItem.style.animationDelay = `${index * 0.1}s`;

            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            
            rankingItem.innerHTML = `
                <div class="rank-number ${rankClass}">${index + 1}</div>
                <div class="project-info">
                    <div class="project-title">${project.title}</div>
                    <div class="project-details">
                        <span class="project-class">${project.class}</span> - 
                        <span class="project-group">${project.group}</span>
                    </div>
                </div>
                <div class="project-stats">
                    <div class="stat-item">
                        <div class="rating-stars">${this.generateStars(project.rating)}</div>
                        <div class="rating-value">${project.rating.toFixed(1)}</div>
                    </div>
                    <div class="stat-item votes-count">
                        <i class="fas fa-users"></i>
                        ${project.votes} vote${project.votes > 1 ? 's' : ''}
                    </div>
                </div>
            `;

            globalRankingContainer.appendChild(rankingItem);
        });
    }

    updateGroupRankings(rankings) {
        const groupRankingContainer = document.getElementById('groupRanking');
        if (!groupRankingContainer) {
            console.error('Group ranking container not found');
            return;
        }

        console.log('Updating group rankings...');

        // Regrouper les projets par groupe
        const groupedProjects = rankings.reduce((groups, project) => {
            const key = this.currentClass === 'all' ? 
                `${project.classId}_${project.groupId}` : 
                project.groupId;
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(project);
            return groups;
        }, {});

        groupRankingContainer.innerHTML = '';

        // Créer une section pour chaque groupe
        Object.entries(groupedProjects).forEach(([key, projects]) => {
            console.log(`Creating section for group ${key} with ${projects.length} projects`);
            const groupSection = document.createElement('div');
            groupSection.className = 'group-section mb-4';
            
            const [classId, groupId] = key.split('_');
            const title = this.currentClass === 'all' ? 
                `${this.getClassDisplayName(classId)} - Groupe ${groupId.replace('g', '')}` : 
                `Groupe ${groupId.replace('g', '')}`;

            groupSection.innerHTML = `
                <h3 class="group-title mb-3">
                    <i class="fas fa-users"></i>
                    ${title}
                </h3>
                <div class="group-rankings">
                    ${projects.map((project, index) => `
                        <div class="ranking-item" style="animation-delay: ${index * 0.1}s">
                            <div class="rank-number ${index < 3 ? `rank-${index + 1}` : ''}">${index + 1}</div>
                            <div class="project-info">
                                <div class="project-title">${project.title}</div>
                            </div>
                            <div class="project-stats">
                                <div class="stat-item">
                                    <div class="rating-stars">${this.generateStars(project.rating)}</div>
                                    <div class="rating-value">${project.rating.toFixed(1)}</div>
                                </div>
                                <div class="stat-item votes-count">
                                    <i class="fas fa-users"></i>
                                    ${project.votes} vote${project.votes > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            groupRankingContainer.appendChild(groupSection);
        });
    }
}

// Initialiser le gestionnaire de classement
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing RankingManager...');
    window.rankingManager = new RankingManager();
}); 