// Données initiales des projets
export const initialProjects = {
    // 7ème année
    '7_g1p1': {
        title: 'EcoSphere',
        description: 'Système de surveillance environnementale',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: '7ème'
    },
    '7_g1p2': {
        title: 'RoboGarden',
        description: 'Robot de jardinage automatisé',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: '7ème'
    },

    // 8ème année
    '8_g1p1': {
        title: 'SmartHome',
        description: 'Système domotique intelligent',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: '8ème'
    },
    '8_g1p2': {
        title: 'WeatherStation',
        description: 'Station météo connectée',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: '8ème'
    },

    // 9ème année
    '9_g1p1': {
        title: 'QuantumSim',
        description: 'Simulateur d\'algorithmes quantiques',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: '9ème'
    },
    '9_g1p2': {
        title: 'BioTech',
        description: 'Analyse génomique avec IA',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: '9ème'
    },

    // Secondaire 1
    'sec1_g1p1': {
        title: 'NanoBot',
        description: 'Robot microscopique médical',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: 'Secondaire 1'
    },
    'sec1_g1p2': {
        title: 'AstroSim',
        description: 'Simulateur astronomique',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: 'Secondaire 1'
    },

    // Secondaire 2
    'sec2_g1p1': {
        title: 'AIAssistant',
        description: 'Assistant pédagogique intelligent',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: 'Secondaire 2'
    },
    'sec2_g1p2': {
        title: 'VirtualLab',
        description: 'Laboratoire virtuel de chimie',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: 'Secondaire 2'
    },

    // Secondaire 3
    'sec3_g1p1': {
        title: 'DataViz',
        description: 'Visualisation de données scientifiques en 3D',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: 'Secondaire 3'
    },
    'sec3_g1p2': {
        title: 'RoboLearn',
        description: 'Plateforme d\'apprentissage de la robotique',
        votes: 0,
        totalRating: 0,
        group: 'Groupe 1',
        class: 'Secondaire 3'
    }
};

import { initializeProjects } from './firebase-config.js';

// Initialiser les données dans Firebase
document.addEventListener('DOMContentLoaded', async () => {
    await initializeProjects(initialProjects);
}); 