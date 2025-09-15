import * as Crypto from 'expo-crypto'; // Importado para gerar IDs únicos
import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Inicializa o banco de dados SQLite e cria todas as tabelas necessárias.
 */
export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('mindcare.db');

        // Tabela para registros de sentimentos
        await db.runAsync(`
      CREATE TABLE IF NOT EXISTS feelings_log (
        id INTEGER PRIMARY KEY NOT NULL,
        feeling TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        timestamp TEXT NOT NULL
      );
    `);

        // Tabela para agendamentos de consultas
        await db.runAsync(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY NOT NULL,
        professional_name TEXT NOT NULL,
        professional_title TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        appointment_date TEXT NOT NULL
      );
    `);

        // Tabela de metas do usuário
        await db.runAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL, -- ALTERADO: Para ser compatível com IDs da API
        userPersonId TEXT NOT NULL,
        description TEXT NOT NULL,
        numberDays INTEGER NOT NULL,
        daysCompleted INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

        // ✅ NOVO: Tabela para rastrear o último clique em cada meta
        await db.runAsync(`
      CREATE TABLE IF NOT EXISTS goal_clicks (
        goalId TEXT PRIMARY KEY NOT NULL,
        lastClickDate TEXT NOT NULL
      );
    `);

        console.log("✅ Banco SQLite inicializado com sucesso.");
    } catch (error) {
        console.error("❌ Erro ao inicializar SQLite:", error);
    }
};

/**
 * Adiciona um sentimento no banco.
 */
export const addFeelingLog = async (feeling, timestamp) => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        // CORRIGIDO: A variável 'date' não estava definida.
        const date = timestamp.split(' ')[0];
        const result = await db.runAsync(
            "INSERT INTO feelings_log (feeling, date, note, timestamp) VALUES (?, ?, ?, ?);",
            [feeling, date, null, timestamp]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("❌ Erro ao adicionar sentimento:", error);
        throw error;
    }
};

/**
 * Atualiza a nota de um sentimento específico.
 */
export const updateFeelingNote = async (id, note) => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        await db.runAsync(
            "UPDATE feelings_log SET note = ? WHERE id = ?;",
            [note, id]
        );
    } catch (error) {
        console.error("❌ Erro ao atualizar nota:", error);
        throw error;
    }
};

/**
 * Retorna a próxima consulta agendada.
 */
export const getNextAppointment = async () => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        const now = new Date().toISOString();
        const result = await db.getFirstAsync(
            "SELECT * FROM appointments WHERE appointment_date > ? ORDER BY appointment_date ASC LIMIT 1;",
            [now]
        );
        return result || null;
    } catch (error) {
        console.error("❌ Erro ao buscar próxima consulta:", error);
        throw error;
    }
};

/**
 * Adiciona uma consulta de exemplo caso não exista nenhuma.
 */
export const addSampleAppointment = async () => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        const result = await db.getFirstAsync("SELECT COUNT(*) as count FROM appointments;");
        const count = result?.count ?? 0;

        if (count === 0) {
            const sample = {
                professional_name: 'Dra. Alessandra',
                professional_title: 'Psicóloga',
                email: 'alessandra.psi@gmail.com',
                phone: '18 99756-2102',
                address: 'Rua das Flores, 123, Birigui - SP',
                appointment_date: '2025-10-15',
            };
            await db.runAsync(
                `INSERT INTO appointments 
         (professional_name, professional_title, email, phone, address, appointment_date) 
         VALUES (?, ?, ?, ?, ?, ?);`,
                [
                    sample.professional_name,
                    sample.professional_title,
                    sample.email,
                    sample.phone,
                    sample.address,
                    sample.appointment_date,
                ]
            );
        }
    } catch (error) {
        console.error("❌ Erro ao adicionar consulta de exemplo:", error);
        throw error;
    }
};

export const insertFeelingInDB = async ({
    date,
    time,
    feeling
}) => {
    if (!db) throw new Error("Banco não inicializado");
    const timestamp = `${date} ${time}`;
    try {
        const result = await db.runAsync(
            "INSERT INTO feelings_log (feeling, date, note, timestamp) VALUES (?, ?, ?, ?);",
            [feeling, date, null, timestamp]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("❌ Erro ao inserir sentimento:", error);
        throw error;
    }
};

/**
 * Atualiza a nota do último sentimento registrado no dia.
 */
export const updateLastFeelingNote = async (note) => {
    if (!db) throw new Error("Banco não inicializado");
    const today = new Date().toISOString().split('T')[0];
    try {
        const result = await db.getFirstAsync(
            "SELECT id FROM feelings_log WHERE timestamp LIKE ? ORDER BY id DESC LIMIT 1;",
            [`${today}%`]
        );

        if (!result) return false;

        const id = result.id;
        await db.runAsync(
            "UPDATE feelings_log SET note = ? WHERE id = ?;",
            [note, id]
        );
        return true;
    } catch (error) {
        console.error("❌ Erro ao atualizar nota:", error);
        throw error;
    }
};

export const mostrarNotas = async () => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        return await db.getAllAsync("SELECT note FROM feelings_log;");
    } catch (error) {
        console.error("❌ Erro ao buscar notas:", error);
        throw error;
    }
};

export const countFeelingPDay = async () => {
    if (!db) throw new Error("Banco não inicializado");
    const today = new Date().toISOString().split('T')[0];
    try {
        return await db.getAllAsync(
            `SELECT feeling, COUNT(id) as total 
       FROM feelings_log 
       WHERE timestamp LIKE ? 
       GROUP BY feeling;`,
            [`${today}%`]
        );
    } catch (error) {
        console.error("❌ Erro ao buscar quantidade por sentimento:", error);
        throw error;
    }
};


// --- Funções de Metas (Goals) ---

/**
 * Salva uma nova meta no banco de dados local. Gera um ID se não for fornecido.
 */
export const saveLocalGoal = async ({ id, userPersonId, description, numberDays }) => {
    if (!db) throw new Error("Banco não inicializado");
    const goalId = id || Crypto.randomUUID(); // Usa o ID da API ou gera um novo
    const createdAt = new Date().toISOString();
    return await db.runAsync(
        `INSERT INTO goals (id, userPersonId, description, numberDays, daysCompleted, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
        [goalId, userPersonId, description, numberDays, 0, createdAt]
    );
};

/**
 * Retorna todas as metas salvas localmente.
 */
export const getLocalGoals = async () => {
    if (!db) throw new Error("Banco não inicializado");
    return await db.getAllAsync("SELECT * FROM goals ORDER BY created_at DESC;");
};

/**
 * Atualiza o progresso (dias completos) de uma meta específica.
 */
export const updateGoalProgress = async (goalId, newProgress) => {
    if (!db) throw new Error("Banco não inicializado");
    return await db.runAsync(
        "UPDATE goals SET daysCompleted = ? WHERE id = ?;",
        [newProgress, goalId]
    );
};

/**
 * Retorna a data do último clique para uma meta específica.
 */
export const getLastClickDate = async (goalId) => {
    if (!db) throw new Error("Banco não inicializado");
    const result = await db.getFirstAsync(
        "SELECT lastClickDate FROM goal_clicks WHERE goalId = ?;",
        [goalId]
    );
    return result?.lastClickDate || null;
};

/**
 * Salva ou atualiza a data do último clique para uma meta.
 */
export const setLastClickDate = async (goalId, date) => {
    if (!db) throw new Error("Banco não inicializado");
    return await db.runAsync(
        `INSERT OR REPLACE INTO goal_clicks (goalId, lastClickDate) VALUES (?, ?);`,
        [goalId, date]
    );
};

/**
 * Conta o número de metas que foram concluídas.
 */
export const getMaxGoalsCompleted = async () => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        // CORRIGIDO: Adicionado "AS qtde" e usado getFirstAsync
        const result = await db.getFirstAsync(
            "SELECT COUNT(id) AS qtde FROM goals WHERE daysCompleted >= numberDays;"
        );
        return result?.qtde || 0;
    } catch (error) {
        console.error("❌ Erro ao buscar metas concluídas:", error);
        return 0; // Retorna 0 em caso de erro
    }
};

/**
 * Exclui uma meta do banco de dados local.
 */
export const deleteLocalGoal = async (metaId) => {
    if (!db) throw new Error("Banco não inicializado");
    try {
        // CORRIGIDO: Nome da tabela era 'metas', agora é 'goals'.
        await db.runAsync("DELETE FROM goals WHERE id = ?;", [metaId]);
        console.log(`Meta ${metaId} deletada localmente.`);
    } catch (error) {
        console.log(`❌ Erro ao deletar meta ${metaId} localmente:`, error);
        throw error;
    }
};