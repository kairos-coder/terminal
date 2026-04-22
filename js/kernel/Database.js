// Database.js - Supabase connection and CRUD

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './Config.js';

let db = null;

export async function initDatabase() {
    if (!window.supabase) {
        throw new Error('Supabase client not loaded');
    }
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return db;
}

export function getDb() { return db; }

export async function insertEntry(entry) {
    return await db.from('terminal_entries').insert(entry);
}

export async function getRandomEntries(limit = 5) {
    const { data } = await db.from('terminal_entries').select('*').limit(limit);
    return data || [];
}

export async function getRandomWords(limit = 10) {
    const { data } = await db.from('one_word_primitives').select('word').limit(limit);
    return data || [];
}

export async function getEntryCount() {
    const { count } = await db.from('terminal_entries').select('*', { count: 'exact', head: true });
    return count || 0;
}
