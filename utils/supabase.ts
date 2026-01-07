
import { createClient } from '@supabase/supabase-js';
import { InventoryState } from '../types';

const supabaseUrl = 'https://kowbaeehxuapnpaskdma.supabase.co';
const supabaseAnonKey = 'sb_publishable_fA3lMAAmwaJOm-ipynMOQg_mEOkDgkP'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getErrorMessage = (error: any): string => {
  if (!error) return "Errore non specificato";
  if (typeof error === 'string') return error;
  return error.message || error.error_description || "Errore di comunicazione con il server";
};

/**
 * Recupera i dati dal cloud per un determinato utente.
 * Ritorna null se non ci sono dati o se c'è un errore gestibile.
 */
export const fetchDataFromCloud = async (userId: string): Promise<InventoryState | null> => {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('payload, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Errore fetching cloud:", error.message);
      return null;
    }
    
    if (data && data.payload) {
      const state = data.payload as InventoryState;
      // Sincronizziamo il timestamp se disponibile nel DB
      return {
        ...state,
        lastSynced: data.updated_at ? new Date(data.updated_at).getTime() : Date.now()
      };
    }
    
    return null;
  } catch (e) {
    console.error("Errore critico durante il fetch cloud:", e);
    return null;
  }
};

/**
 * Sincronizza lo stato locale sul cloud.
 */
export const syncDataToCloud = async (userId: string, state: InventoryState) => {
  try {
    if (!userId) return { success: false, message: "Utente non autenticato" };

    // Prepariamo il payload pulito (rimuoviamo metadati temporanei se necessario)
    const { lastSynced, ...payloadToSync } = state;

    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        user_id: userId, 
        payload: payloadToSync,
        updated_at: new Date().toISOString() 
      }, { 
        onConflict: 'user_id' 
      });
    
    if (error) {
      console.error("Errore upsert Supabase:", error.message);
      return { success: false, message: "Sincronizzazione fallita", details: error.message };
    }
    
    return { success: true };
  } catch (e: any) {
    return { success: false, message: "Errore di connessione", details: getErrorMessage(e) };
  }
};

/**
 * Elimina i dati dal cloud (Reset di fabbrica).
 */
export const deleteUserDataAndCloud = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Sessione non valida. Effettua il login.");

    const { error: dbError } = await supabase
      .from('user_data')
      .delete()
      .eq('user_id', user.id);
    
    if (dbError) throw new Error(`Errore database: ${dbError.message}`);

    return { success: true };
  } catch (e: any) {
    const message = getErrorMessage(e);
    console.error("Errore pulizia cloud:", message);
    throw new Error(message);
  }
};

export const requestPasswordReset = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '#type=recovery',
  });
};

export const updateAccountPassword = async (newPassword: string) => {
  return await supabase.auth.updateUser({ password: newPassword });
};
