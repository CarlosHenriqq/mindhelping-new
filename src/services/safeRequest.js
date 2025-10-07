import NetInfo from "@react-native-community/netinfo";
import { deletePendingRequest, getPendingRequests, insertPendingRequest } from "./database";

/**
 * Faz uma requisição segura:
 * - Se tiver internet → chama a API diretamente
 * - Se NÃO tiver internet → salva no SQLite (pending_requests)
 */
export const safeRequest = async (endpoint, method, body) => {
  const state = await NetInfo.fetch();

  if (state.isConnected) {
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erro na API");

      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao chamar API online:", error);
      // fallback → salva offline
      await insertPendingRequest(endpoint, method, body);
      return null;
    }
  } else {
    console.log("📴 Sem internet → salvando requisição offline");
    await insertPendingRequest(endpoint, method, body);
    return null;
  }
};

/**
 * Sincroniza todas as requisições pendentes no SQLite quando voltar a internet
 */
export const syncPendingRequests = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const pending = await getPendingRequests();
  console.log(`🔄 Sincronizando ${pending.length} requisições pendentes...`);

  for (const req of pending) {
    try {
      const response = await fetch(req.endpoint, {
        method: req.method,
        headers: { "Content-Type": "application/json" },
        body: req.body,
      });

      if (response.ok) {
        console.log(`✅ Requisição sincronizada: ${req.endpoint}`);
        await deletePendingRequest(req.id);
      } else {
        console.error(`⚠️ Falha ao reenviar ${req.endpoint}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${req.endpoint}:`, error);
    }
  }
};

// 🔌 Detecta reconexão automática e chama sync
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    console.log("🌐 Internet voltou → iniciando sincronização...");
    syncPendingRequests();
  }
});
