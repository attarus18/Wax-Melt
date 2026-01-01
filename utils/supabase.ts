
import { createClient } from '@supabase/supabase-js';
import { InventoryState } from '../types';

const supabaseUrl = 'https://kowbaeehxuapnpaskdma.supabase.co';
// Utilizziamo la Publishable Key fornita (Anon Key) per l'accesso client-side sicuro
const supabaseAnonKey = 'sb_publishable_fA3lMAAmwaJOm-ipynMOQg_mEOkDgkP'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const syncDataToCloud = async (userId: string, state: InventoryState) => {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        user_id: userId, 
        payload: state,
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id' });
    
    if (error) {
      console.error("Supabase Sync Error:", error);
      return { success: false, message: "Errore Sincronizzazione", details: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, message: "Errore di rete", details: e.message };
  }
};

export const fetchDataFromCloud = async (userId: string): Promise<InventoryState | null> => {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) return null;
    return data ? (data.payload as InventoryState) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Funzioni di gestione Account
 */

export const requestPasswordReset = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
};

export const updateAccountPassword = async (newPassword: string) => {
  return await supabase.auth.updateUser({ password: newPassword });
};

export const deleteUserDataAndCloud = async (userId: string) => {
  // Eliminiamo i dati dalla tabella user_data legati all'utente
  const { error: dbError } = await supabase
    .from('user_data')
    .delete()
    .eq('user_id', userId);
    
  if (dbError) throw dbError;
  
  // Effettuiamo il logout dell'utente
  return await supabase.auth.signOut();
};
