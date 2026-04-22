// Config.js - Divine constants and thresholds

export const SUPABASE_URL = 'https://kzcucjcyxybypncbdbws.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_saeUHGocDah-T2_709M6Fg_g26JtLXw';

export const PHI = 1618; // milliseconds
export const PI = 3142; // milliseconds

export const DIVINE_BANDS = {
    hermes: { index: 1, icon: '✈️', name: 'Hermes', freqValue: 6, targetWords: [3, 5], time: 1618, color: '#e8a87c' },
    apollo: { index: 2, icon: '☀️', name: 'Apollo', freqValue: 10, targetWords: [5, 10], time: 3236, color: '#f4d03f' },
    hephaestus: { index: 3, icon: '🔥', name: 'Hephaestus', freqValue: 13.5, targetWords: [10, 20], time: 4854, color: '#d45500' },
    demeter: { index: 4, icon: '🌾', name: 'Demeter', freqValue: 17.5, targetWords: [20, 40], time: 6472, color: '#6b8e23' },
    poseidon: { index: 5, icon: '🌊', name: 'Poseidon', freqValue: 25, targetWords: [40, 80], time: 8090, color: '#2c6e9e' },
    athena: { index: 6, icon: '🦉', name: 'Athena', freqValue: 35, targetWords: [80, 150], time: 9708, color: '#8e44ad' },
    zeus: { index: 7, icon: '⚡', name: 'Zeus', freqValue: 70, targetWords: [150, 300], time: 11326, color: '#9b59b6' }
};

export const FALLBACK_WORDS = [
    'threshold', 'whisper', 'wing', 'light', 'truth', 'forge', 'fire',
    'depth', 'weave', 'thunder', 'echo', 'shadow', 'ember', 'thread',
    'memory', 'longing', 'courage', 'fate', 'dream', 'silence', 'chaos'
];
