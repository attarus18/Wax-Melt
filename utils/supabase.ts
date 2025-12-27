
import { createClient } from '@supabase/supabase-js';
import { InventoryState } from '../types';

// Inserisci qui l'URL e la Anon Key del tuo progetto Supabase
const supabaseUrl = 'https://kowbaeehxuapnpaskdma.supabase.co';
const supabaseAnonKey = 'sb_publishable_pwhDHfMCh8StGv0tXSLh8Q_d2gyzWxE';

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
      console.error("Supabase error during upsert:", error.message, error.details);
      throw error;
    }
    return true;
  } catch (e) {
    console.error("Cloud sync exception:", e);
    return false;
  }
};

export const fetchDataFromCloud = async (userId: string): Promise<InventoryState | null> => {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle(); // maybeSingle non lancia errore se non trova record
    
    if (error) throw error;
    return data ? (data.payload as InventoryState) : null;
  } catch (e) {
    console.error("Cloud fetch error:", e);
    return null;
  }
};
