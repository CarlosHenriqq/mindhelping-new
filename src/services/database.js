import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Inicializa o banco de dados SQLite
 */
export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('mindcare.db');

        await db.runAsync(`
      CREATE TABLE IF NOT EXISTS feelings_log (
        id INTEGER PRIMARY KEY NOT NULL,
        feeling TEXT NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        timestamp TEXT NOT NULL
      );
    `);

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
      
await db.runAsync(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userPersonId TEXT NOT NULL,
    description TEXT NOT NULL,
    numberDays INTEGER NOT NULL,
    daysCompleted INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);
     console.log("✅ Banco SQLite inicializado com sucesso.");
    } catch (error) {
        console.error("❌ Erro ao inicializar SQLite:", error);
    }
};

/**
 * Adiciona um sentimento no banco
 */
export const addFeelingLog = async (feeling, timestamp) => {
    if (!db) throw new Error("Banco não inicializado");

    try {
        const result = await db.runAsync(
            "INSERT INTO feelings_log (feeling, date, note, timestamp) VALUES (?, ?, ?,?);",
            [feeling, date, null, timestamp]
        );

        return result.lastInsertRowId;
    } catch (error) {
        console.error("❌ Erro ao adicionar sentimento:", error);
        throw error;
    }
};

/**
 * Atualiza a nota de um sentimento específico
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
 * Retorna a próxima consulta agendada
 */
export const getNextAppointment = async () => {
    if (!db) throw new Error("Banco não inicializado");

    try {
        const now = new Date().toISOString();

        const result = await db.getAllAsync(
            "SELECT * FROM appointments WHERE appointment_date > ? ORDER BY appointment_date ASC LIMIT 1;",
            [now]
        );

        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error("❌ Erro ao buscar próxima consulta:", error);
        throw error;
    }
};

/**
 * Adiciona uma consulta de exemplo caso não exista nenhuma
 */
export const addSampleAppointment = async () => {
    if (!db) throw new Error("Banco não inicializado");

    try {
        const result = await db.getAllAsync("SELECT COUNT(*) as count FROM appointments;");
        const count = result[0]?.count ?? 0;

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

            
        } else {
            }
    } catch (error) {
        console.error("❌ Erro ao adicionar consulta de exemplo:", error);
        throw error;
    }
};

export const insertFeelingInDB = async ({ date, time, feeling }) => {
    if (!db) throw new Error("Banco não inicializado");

    const timestamp = `${date} ${time}`;

    try {
        const result = await db.runAsync(
            "INSERT INTO feelings_log (feeling, note, timestamp) VALUES (?, ?, ?);",
            [feeling, null, timestamp]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error("❌ Erro ao inserir sentimento:", error);
        throw error;
    }
};

/**
 * Atualiza a nota do último sentimento registrado no dia
 */
export const updateLastFeelingNote = async (note) => {
    if (!db) throw new Error("Banco não inicializado");

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const result = await db.getAllAsync(
            "SELECT id FROM feelings_log WHERE timestamp LIKE ? ORDER BY id DESC LIMIT 1;",
            [`${today}%`]
        );

        if (result.length === 0) return false;

        const id = result[0].id;

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
        const result = await db.getAllAsync("SELECT note FROM feelings_log;");
        
        return result;
    } catch (error) {
        console.error("❌ Erro ao buscar notas:", error);
        throw error;
    }
};

export const countFeelingPDay = async () => {
    if (!db) throw new Error("Banco não inicializado");

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const result = await db.getAllAsync(
            `SELECT feeling, COUNT(id) as total 
       FROM feelings_log 
       WHERE timestamp LIKE ? 
       GROUP BY feeling;`,
            [`${today}%`]
        );

        
        return result;
    } catch (error) {
        console.error("❌ Erro ao buscar quantidade por sentimento:", error);
        throw error;
    }
};

export const saveLocalGoal = async ({ userPersonId, description, numberDays }) => {
    const createdAt = new Date().toISOString();
    return await db.runAsync(
        `INSERT INTO goals (userPersonId, description, numberDays, daysCompleted, created_at)
     VALUES (?, ?, ?, ?, ?);`,
        [userPersonId, description, numberDays, 0, createdAt]
    );
};

export const getLocalGoals = async () => {
    return await db.getAllAsync("SELECT * FROM goals ORDER BY created_at DESC;");
};

export const updateGoalProgress = async (goalId, newProgress) => {
    return await db.runAsync(
        "UPDATE goals SET daysCompleted = ? WHERE id = ?;",
        [newProgress, goalId]
    );
};

export const getLastClickDate = async (goalId) => {
    const result = await db.getAllAsync(
        "SELECT lastClickDate FROM goal_clicks WHERE goalId = ?;",
        [goalId]
    );
    return result.length > 0 ? result[0].lastClickDate : null;
};

export const setLastClickDate = async (goalId, date) => {
    await db.runAsync(
        `INSERT OR REPLACE INTO goal_clicks (goalId, lastClickDate) VALUES (?, ?);`,
        [goalId, date]
    );
}

