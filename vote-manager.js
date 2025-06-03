// Gestionnaire de l'état global
const VoteManager = {
    // État initial
    state: {
        projects: [],
        classes: {
            '7': { name: '7ème année', groups: [] },
            '8': { name: '8ème année', groups: [] },
            '9': { name: '9ème année', groups: [] },
            's1': { name: 'Secondaire 1', groups: [] },
            's2': { name: 'Secondaire 2', groups: [] },
            's3': { name: 'Secondaire 3', groups: [] }
        },
        votes: [],
        users: []
    },

    // Initialisation
    init() {
        // Charger les données du localStorage s'il y en a
        const savedState = localStorage.getItem('voteManagerState');
        if (savedState) {
            this.state = JSON.parse(savedState);
        }

        // Migrer les anciennes données si nécessaires
        this.migrateOldData();
        
        this.saveState();
    },

    // Migrer les anciennes données du format projectVotes vers le nouveau format
    migrateOldData() {
        const oldData = localStorage.getItem('projectVotes');
        if (oldData) {
            try {
                const projectsData = JSON.parse(oldData);
                Object.entries(projectsData).forEach(([key, project]) => {
                    if (key.startsWith('7_')) {
                        const [_, groupId, projectId] = key.match(/g(\d+)p(\d+)$/);
                        this.addProject({
                            title: project.title,
                            description: project.description,
                            classId: '7',
                            groupId: parseInt(groupId),
                            votes: project.votes || 0,
                            totalRating: project.totalRating || 0,
                            voters: []
                        });
                    }
                });
                // Supprimer les anciennes données après la migration
                localStorage.removeItem('projectVotes');
            } catch (e) {
                console.error('Erreur lors de la migration des données:', e);
            }
        }
    },

    // Sauvegarder l'état
    saveState() {
        localStorage.setItem('voteManagerState', JSON.stringify(this.state));
        // Déclencher un événement de mise à jour
        window.dispatchEvent(new CustomEvent('voteManagerUpdate'));
    },

    // Ajouter un nouveau projet
    addProject(project) {
        project.id = Date.now(); // ID unique basé sur le timestamp
        project.votes = project.votes || 0;
        project.totalRating = project.totalRating || 0;
        project.voters = project.voters || [];
        this.state.projects.push(project);
        this.saveState();
        return project;
    },

    // Ajouter un nouveau groupe
    addGroup(classId, group) {
        group.id = Date.now();
        if (this.state.classes[classId]) {
            this.state.classes[classId].groups.push(group);
            this.saveState();
            return group;
        }
        return null;
    },

    // Voter pour un projet
    voteForProject(projectId, userId, rating) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project && !project.voters.includes(userId)) {
            project.votes++;
            project.totalRating = (project.totalRating || 0) + rating;
            project.voters.push(userId);
            this.saveState();
            return true;
        }
        return false;
    },

    // Obtenir tous les projets
    getProjects(classId = null) {
        if (classId) {
            return this.state.projects.filter(p => p.classId === classId);
        }
        return this.state.projects;
    },

    // Obtenir tous les groupes d'une classe
    getGroups(classId) {
        return this.state.classes[classId]?.groups || [];
    },

    // Mettre à jour un projet
    updateProject(projectId, updates) {
        const index = this.state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.state.projects[index] = { ...this.state.projects[index], ...updates };
            this.saveState();
            return true;
        }
        return false;
    },

    // Supprimer un projet
    deleteProject(projectId) {
        const index = this.state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.state.projects.splice(index, 1);
            this.saveState();
            return true;
        }
        return false;
    },

    // Obtenir les statistiques
    getStats() {
        return {
            totalProjects: this.state.projects.length,
            totalVotes: this.state.projects.reduce((sum, p) => sum + p.votes, 0),
            averageVotes: this.state.projects.length > 0 
                ? this.state.projects.reduce((sum, p) => sum + p.votes, 0) / this.state.projects.length 
                : 0,
            projectsByClass: Object.keys(this.state.classes).reduce((acc, classId) => {
                acc[classId] = this.getProjects(classId).length;
                return acc;
            }, {})
        };
    }
};

// Initialiser le gestionnaire
document.addEventListener('DOMContentLoaded', () => {
    VoteManager.init();
});

// Exporter pour utilisation dans d'autres fichiers
window.VoteManager = VoteManager; 