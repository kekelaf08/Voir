class VoteManager {
    constructor() {
        // Vérifier si l'utilisateur est connecté
        this.checkAuth();

        this.classes = [
            { id: 1, name: 'Classe A' },
            { id: 2, name: 'Classe B' },
            { id: 3, name: 'Classe C' },
            { id: 4, name: 'Classe D' },
            { id: 5, name: 'Classe E' },
            { id: 6, name: 'Classe F' }
        ];

        this.projects = {
            1: [ // Classe A
                { id: 1, title: 'Green Energy', group: 'Groupe 1', image: 'path/to/image1.jpg' },
                { id: 2, title: 'Smart City', group: 'Groupe 2', image: 'path/to/image2.jpg' },
                // Ajoutez plus de projets...
            ],
            // Ajoutez plus de classes...
        };

        this.votedClasses = new Set(JSON.parse(localStorage.getItem('votedClasses') || '[]'));
        this.currentSection = 'accueil';
        this.userName = localStorage.getItem('userName') || 'Visiteur';

        this.bindEvents();
        this.initializeUI();
    }

    checkAuth() {
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');

        if (!userRole || !userName || userRole !== 'visitor') {
            window.location.href = 'connexion.html';
            return;
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Sélection de classe
        document.getElementById('classSelect').addEventListener('change', (e) => {
            this.loadProjects(e.target.value);
        });

        // Sélection de classe pour les commentaires
        document.getElementById('commentClassSelect').addEventListener('change', (e) => {
            this.loadComments(e.target.value);
        });

        // Formulaire de commentaire
        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });

        // Déconnexion
        document.querySelector('.nav-link[href="connexion.html"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });
    }

    handleLogout() {
        // Nettoyer les données de session
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        
        // Rediriger vers la page de connexion
        window.location.href = 'connexion.html';
    }

    initializeUI() {
        // Mettre à jour le nom de l'utilisateur
        document.getElementById('userName').textContent = this.userName;

        this.updateClassSelectors();
        this.updateVoteStatus();
        this.showSection(this.currentSection);
    }

    updateClassSelectors() {
        // Mise à jour des sélecteurs de classe
        const classSelectors = document.querySelectorAll('#classSelect, #commentClassSelect');
        
        classSelectors.forEach(selector => {
            selector.innerHTML = '<option value="">Choisir une classe...</option>';
            this.classes.forEach(classe => {
                const option = document.createElement('option');
                option.value = classe.id;
                option.textContent = classe.name;
                if (this.votedClasses.has(classe.id.toString())) {
                    option.disabled = selector.id === 'classSelect';
                }
                selector.appendChild(option);
            });
        });
    }

    updateVoteStatus() {
        const votedClassesDiv = document.getElementById('votedClasses');
        const remainingClassesDiv = document.getElementById('remainingClasses');

        votedClassesDiv.innerHTML = '';
        remainingClassesDiv.innerHTML = '';

        this.classes.forEach(classe => {
            const div = document.createElement('div');
            div.className = 'mb-2';
            
            if (this.votedClasses.has(classe.id.toString())) {
                div.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>${classe.name}`;
                votedClassesDiv.appendChild(div);
            } else {
                div.innerHTML = `<i class="fas fa-clock text-warning me-2"></i>${classe.name}`;
                remainingClassesDiv.appendChild(div);
            }
        });
    }

    showSection(section) {
        // Masquer toutes les sections
        document.querySelectorAll('section').forEach(s => s.style.display = 'none');
        
        // Afficher la section sélectionnée
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.style.display = 'block';
            this.currentSection = section;

            // Mettre à jour la navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${section}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    loadProjects(classId) {
        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = '';

        if (!classId) return;

        const projects = this.projects[classId] || [];
        projects.forEach(project => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="project-card">
                    <img src="${project.image}" class="project-image" alt="${project.title}">
                    <div class="project-info">
                        <h5 class="mb-2">${project.title}</h5>
                        <p class="text-muted mb-3">${project.group}</p>
                        <button class="vote-button" onclick="voteManager.vote(${classId}, ${project.id})"
                                ${this.votedClasses.has(classId.toString()) ? 'disabled' : ''}>
                            <i class="fas fa-vote-yea me-2"></i>Voter
                        </button>
                    </div>
                </div>
            `;
            projectsList.appendChild(col);
        });
    }

    vote(classId, projectId) {
        if (confirm('Confirmer votre vote pour ce projet ?')) {
            // Enregistrer le vote avec l'identité de l'utilisateur
            const vote = {
                classId,
                projectId,
                userId: this.userName,
                timestamp: new Date().toISOString()
            };

            // Stocker le vote (à remplacer par un appel API)
            const votes = JSON.parse(localStorage.getItem('votes') || '[]');
            votes.push(vote);
            localStorage.setItem('votes', JSON.stringify(votes));

            // Marquer la classe comme votée
            this.votedClasses.add(classId.toString());
            localStorage.setItem('votedClasses', JSON.stringify([...this.votedClasses]));

            // Mettre à jour l'interface
            this.updateClassSelectors();
            this.updateVoteStatus();
            this.loadProjects(classId);

            // Afficher confirmation
            alert('Vote enregistré avec succès !');
        }
    }

    loadComments(classId) {
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';

        if (!classId) return;

        // Charger les commentaires (à remplacer par un appel API)
        const comments = JSON.parse(localStorage.getItem(`comments_${classId}`) || '[]');

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="text-muted">Aucun commentaire pour le moment.</p>';
            return;
        }

        comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment-card';
            div.innerHTML = `
                <p class="mb-2">${comment.text}</p>
                <small class="text-muted">
                    ${comment.author} - ${new Date(comment.date).toLocaleDateString()}
                </small>
            `;
            commentsList.appendChild(div);
        });
    }

    submitComment() {
        const classId = document.getElementById('commentClassSelect').value;
        const commentText = document.querySelector('#commentForm textarea').value.trim();

        if (!classId || !commentText) {
            alert('Veuillez sélectionner une classe et écrire un commentaire.');
            return;
        }

        // Créer le commentaire
        const comment = {
            text: commentText,
            author: this.userName,
            date: new Date().toISOString()
        };

        // Sauvegarder le commentaire (à remplacer par un appel API)
        const comments = JSON.parse(localStorage.getItem(`comments_${classId}`) || '[]');
        comments.push(comment);
        localStorage.setItem(`comments_${classId}`, JSON.stringify(comments));

        // Réinitialiser le formulaire et recharger les commentaires
        document.querySelector('#commentForm textarea').value = '';
        this.loadComments(classId);

        // Confirmation
        alert('Commentaire posté avec succès !');
    }
}

// Initialisation
let voteManager;
document.addEventListener('DOMContentLoaded', () => {
    voteManager = new VoteManager();
}); 