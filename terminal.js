// terminal.js - Kairos Terminal Kernel
// Production Node #1 - DeepSeek

// Supabase configuration (replace with your actual project values)
const SUPABASE_URL = 'https://kzcucjcyxybypncbdbws.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_saeUHGocDah-T2_709M6Fg_g26JtLXw';

// Global state
let supabase = null;
let currentUser = null;

// Command registry
const commands = {};

// Terminal initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Bootstrap database
    await bootstrapDatabase();
    
    // Set up terminal handlers
    setupTerminal();
    
    // Print welcome message
    printToTerminal('Kairos Terminal v1.0 (MVP Kernel)');
    printToTerminal('Type "help" for available commands.');
    printToTerminal('');
    
    // Focus input
    document.getElementById('command').focus();
});

function setupTerminal() {
    const commandInput = document.getElementById('command');
    const terminal = document.getElementById('terminal');
    
    commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmdLine = commandInput.value;
            if (cmdLine.trim()) {
                printToTerminal(`> ${cmdLine}`);
                processCommand(cmdLine);
            }
            commandInput.value = '';
            commandInput.focus();
            
            // Auto-scroll
            terminal.scrollTop = terminal.scrollHeight;
        }
    });
}

function printToTerminal(text) {
    const terminal = document.getElementById('terminal');
    const line = document.createElement('div');
    line.textContent = text;
    terminal.appendChild(line);
}

async function processCommand(cmdLine) {
    const parts = cmdLine.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if (commands[cmd]) {
        try {
            const output = await commands[cmd](args);
            if (output) printToTerminal(output);
        } catch (err) {
            printToTerminal(`Error: ${err.message}`);
        }
    } else {
        printToTerminal(`Unknown command: ${cmd}. Type "help" for available commands.`);
    }
}

async function bootstrapDatabase() {
    // Check if tables exist by attempting to query them
    const tables = ['entries', 'relationships', 'motifs'];
    const missingTables = [];
    
    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
            if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
                missingTables.push(table);
            }
        } catch (err) {
            missingTables.push(table);
        }
    }
    
    // Create missing tables using raw SQL via RPC
    if (missingTables.length > 0) {
        printToTerminal(`Bootstrapping database: creating ${missingTables.join(', ')}...`);
        
        for (const table of missingTables) {
            await createTable(table);
        }
        
        printToTerminal('Database bootstrap complete.');
    }
}

async function createTable(tableName) {
    let sql = '';
    
    switch(tableName) {
        case 'entries':
            sql = `
                CREATE TABLE IF NOT EXISTS entries (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    label TEXT NOT NULL,
                    body TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_entries_label ON entries(label);
            `;
            break;
        case 'relationships':
            sql = `
                CREATE TABLE IF NOT EXISTS relationships (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    source_id UUID REFERENCES entries(id) ON DELETE CASCADE,
                    target_id UUID REFERENCES entries(id) ON DELETE CASCADE,
                    type TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id);
                CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id);
            `;
            break;
        case 'motifs':
            sql = `
                CREATE TABLE IF NOT EXISTS motifs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `;
            break;
    }
    
    if (sql) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
            // Fallback: try using the REST API to create via raw query if RPC not available
            printToTerminal(`Warning: Could not create ${tableName} table. Please run SQL manually.`);
        }
    }
}

// Command Handlers

commands.help = async () => {
    return `Available commands:
  help        - Show this help message
  clear       - Clear terminal output
  schema      - List all tables and their columns
  create <table> <column1:type> <column2:type> ... - Create a new table
  insert <table> <json> - Insert a row into a table
  query <table> <filter> - Query rows from a table
  random      - Return a random entry
  forgotten   - Return entries with no relationships`;
};

commands.clear = async () => {
    document.getElementById('terminal').innerHTML = '';
    return null;
};

commands.schema = async () => {
    const tables = ['entries', 'relationships', 'motifs'];
    let output = 'Database Schema:\n';
    
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(0);
        if (!error && data) {
            output += `\n${table}:\n`;
            if (data.length === 0 && data.columns) {
                output += `  Columns: ${data.columns.join(', ')}\n`;
            } else if (data.length > 0) {
                output += `  Columns: ${Object.keys(data[0]).join(', ')}\n`;
            }
        } else {
            output += `\n${table}: Table not found\n`;
        }
    }
    
    return output;
};

commands.create = async (args) => {
    if (args.length < 2) return 'Usage: create <table> <column1:type> <column2:type> ...';
    
    const tableName = args[0];
    const columnDefs = args.slice(1);
    
    let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (id UUID PRIMARY KEY DEFAULT gen_random_uuid()`;
    
    for (const def of columnDefs) {
        const [colName, colType] = def.split(':');
        if (colName && colType) {
            sql += `, ${colName} ${colType.toUpperCase()}`;
        }
    }
    sql += `, created_at TIMESTAMP DEFAULT NOW());`;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) return `Error creating table: ${error.message}`;
    return `Table '${tableName}' created successfully.`;
};

commands.insert = async (args) => {
    if (args.length < 2) return 'Usage: insert <table> <json>';
    
    const tableName = args[0];
    let jsonStr = args.slice(1).join(' ');
    
    try {
        const data = JSON.parse(jsonStr);
        const { error } = await supabase.from(tableName).insert(data);
        if (error) throw error;
        return `Inserted into '${tableName}'.`;
    } catch (err) {
        return `Error: ${err.message}`;
    }
};

commands.query = async (args) => {
    if (args.length < 2) return 'Usage: query <table> <filter>';
    
    const tableName = args[0];
    const filter = args[1];
    
    let query = supabase.from(tableName).select('*');
    
    if (filter && filter.includes('=')) {
        const [key, value] = filter.split('=');
        query = query.eq(key, value);
    }
    
    const { data, error } = await query;
    if (error) return `Error: ${error.message}`;
    if (!data || data.length === 0) return 'No results found.';
    
    return data.map(row => JSON.stringify(row, null, 2)).join('\n');
};

commands.random = async () => {
    const { data, error } = await supabase.from('entries').select('*');
    if (error) return `Error: ${error.message}`;
    if (!data || data.length === 0) return 'No entries found.';
    
    const random = data[Math.floor(Math.random() * data.length)];
    return `Random Entry:\n${JSON.stringify(random, null, 2)}`;
};

commands.forgotten = async () => {
    // Get all entries that are never used as source in relationships
    const { data: entries, error: entriesError } = await supabase.from('entries').select('*');
    if (entriesError) return `Error: ${entriesError.message}`;
    
    const { data: relations, error: relError } = await supabase.from('relationships').select('source_id');
    if (relError && !relError.message.includes('does not exist')) return `Error: ${relError.message}`;
    
    const relatedIds = new Set((relations || []).map(r => r.source_id));
    const forgotten = (entries || []).filter(e => !relatedIds.has(e.id));
    
    if (forgotten.length === 0) return 'No forgotten entries found.';
    return `Forgotten Entries (${forgotten.length}):\n${forgotten.map(e => `- ${e.label}`).join('\n')}`;
};
