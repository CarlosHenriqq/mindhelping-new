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

    // ... (todo o seu código de tratamento de variáveis continua o mesmo)
    const goalId = String(id || Crypto.randomUUID()).substring(0, 36);
    const userIdStr = String(userPersonId);
    const descriptionStr = String(description);
    const numberDaysInt = parseInt(numberDays, 10);
    const daysCompleted = 0;
    const createdAt = new Date().toISOString();

    // 🔴 ADICIONE ESTE LOG DE DEPURAÇÃO 🔴
    const valuesToInsert = [goalId, userIdStr, descriptionStr, numberDaysInt, daysCompleted, createdAt];
    console.log("--- DEBUG SQLITE ---");
    console.log("Valores para inserir:", JSON.stringify(valuesToInsert, null, 2));
    console.log("Tipos dos valores:", valuesToInsert.map(v => typeof v));
    console.log("--------------------");

    try {
        await db.runAsync(
            `INSERT OR REPLACE INTO goals 
                 (id, userPersonId, description, numberDays, daysCompleted, created_at)
             VALUES (?, ?, ?, ?, ?, ?);`,
            valuesToInsert // Use a variável que criamos
        );
        console.log(`✅ Meta local salva com sucesso: ${goalId}`);
        return goalId;
    } catch (error) {
        console.error("❌ Erro ao salvar meta local:", error);
        throw error;
    }
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


// No seu arquivo de banco de dados (ex: database.js)

// ... (suas outras funções como initDatabase, saveLocalGoal, etc.)

/**
 * ⚠️ FUNÇÃO DE RESET: Apaga todas as tabelas do banco de dados.
 * Use apenas para desenvolvimento para limpar o banco e recomeçar do zero.
 */
export const resetDatabase = async () => {
    if (!db) {
        // Garante que o banco está aberto antes de tentar apagar
        await initDatabase();
    }
    try {
        console.log("⚠️  Iniciando reset completo do banco de dados...");
        
        // Apaga as tabelas uma por uma
        await db.runAsync(`DROP TABLE IF EXISTS goals;`);
        await db.runAsync(`DROP TABLE IF EXISTS goal_clicks;`);
        await db.runAsync(`DROP TABLE IF EXISTS appointments;`);
        await db.runAsync(`DROP TABLE IF EXISTS feelings_log;`);
        
        console.log("✅ Todas as tabelas foram removidas com sucesso.");

        // Opcional, mas recomendado: Recria as tabelas imediatamente
        console.log("Re-inicializando o banco para criar as tabelas com o schema correto...");
        await initDatabase(); // Essa função vai rodar os `CREATE TABLE IF NOT EXISTS` novamente

    } catch (error) {
        console.error("❌ Erro ao resetar o banco de dados:", error);
    }
};