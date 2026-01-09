import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  Calculator as CalcIcon, Package, Settings as SettingsIcon, Flame, 
  Trash2, Plus, ShoppingCart, RefreshCw, Cloud, LogIn, LogOut, 
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIGURAZIONE ---
const supabase = createClient(
  'https://kowbaeehxuapnpaskdma.supabase.co',
  'sb_publishable_fA3lMAAmwaJOm-ipynMOQg_mEOkDgkP'
);

// --- TIPI ---
type View = 'HOME' | 'CALCULATOR' | 'FINISHED_PRODUCTS' | 'SETTINGS';
interface FinishedProduct {
  id: string;
  name: string;
  quantity: number;
}
interface AppState {
  finishedProducts: FinishedProduct[];
  settings: { language: 'it' | 'en'; currency: 'EUR' | 'USD' };
}

// --- STORAGE ---
const STORAGE_KEY = 'waxpro_gh_storage';
const saveLocal = (state: AppState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const loadLocal = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { finishedProducts: [], settings: { language: 'it', currency: 'EUR' } };
};

// --- COMPONENTI ---
const Header = ({ setView, view }: { setView: (v: View) => void, view: View }) => (
  <div className="w-full max-w-sm flex justify-between items-center mb-6 px-2 mt-6 h-12">
    <div className="flex items-center gap-2">
      <Flame className="text-wax-orange" size={28} />
      <h1 className="text-xl font-black tracking-tighter italic">WAXPRO <span className="text-wax-orange">MANAGER</span></h1>
    </div>
    {view !== 'HOME' && (
      <button onClick={() => setView('HOME')} className="text-wax-orange bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700 text-[10px] font-black uppercase">Home</button>
    )}
  </div>
);

const App = () => {
  const [view, setView] = useState<View>('HOME');
  const [state, setState] = useState<AppState>(loadLocal());
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'info' | 'error' | 'success' } | null>(null);

  const fetchFromCloud = async (userId: string) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.from('user_data').select('payload').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (data?.payload) {
        setState(data.payload);
        saveLocal(data.payload);
      }
    } catch (e: any) {
      console.error("Cloud error:", e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToCloud = async (userId: string, data: AppState) => {
    setIsSyncing(true);
    try {
      await supabase.from('user_data').upsert({ 
        user_id: userId, 
        payload: data, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id' });
    } catch (e: any) {
      console.error("Sync error:", e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const profile = { id: session.user.id, email: session.user.email! };
        setUser(profile);
        fetchFromCloud(profile.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const profile = { id: session.user.id, email: session.user.email! };
        setUser(profile);
        if (event === 'SIGNED_IN') fetchFromCloud(profile.id);
      } else {
        setUser(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleUpdateState = (newState: AppState) => {
    setState(newState);
    saveLocal(newState);
    if (user) syncToCloud(user.id, newState);
  };

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-app-dark flex flex-col items-center p-4">
      <Header setView={setView} view={view} />

      {statusMsg && (
        <div className={`fixed top-4 z-50 px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-pulse ${statusMsg.type === 'error' ? 'bg-red-950 border-red-500 text-red-200' : 'bg-zinc-900 border-wax-orange text-wax-orange'}`}>
          {statusMsg.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
          <span className="text-xs font-black uppercase tracking-widest">{statusMsg.text}</span>
        </div>
      )}

      <main className="w-full flex flex-col items-center">
        {view === 'HOME' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-sm space-y-4">
             <div className="app-card w-full p-8 text-center">
                <h2 className="text-3xl font-black text-wax-orange italic mb-8 uppercase tracking-widest">MENU</h2>
                <div className="space-y-3">
                  <button onClick={() => setView('FINISHED_PRODUCTS')} className="app-button">
                    <Package size={24}/> Magazzino
                  </button>
                  <button onClick={() => setView('CALCULATOR')} className="app-button opacity-90">
                    <CalcIcon size={24}/> Calcolatore
                  </button>
                  <button onClick={() => setView('SETTINGS')} className="app-button !bg-zinc-700 !text-zinc-300">
                    <SettingsIcon size={24}/> Impostazioni
                  </button>
                </div>
             </div>
             {user && (
               <div className="bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{user.email}</span>
               </div>
             )}
          </div>
        )}

        {view === 'FINISHED_PRODUCTS' && (
          <div className="w-full max-w-sm space-y-4">
            <h2 className="text-2xl font-black italic text-white uppercase px-2">Inventario</h2>
            <div className="space-y-3">
              {state.finishedProducts.length === 0 ? (
                <div className="app-card p-12 text-center text-zinc-600 border-dashed border-zinc-800">
                   <p className="text-[10px] uppercase font-black tracking-widest">Nessun prodotto</p>
                </div>
              ) : (
                state.finishedProducts.map(p => (
                  <div key={p.id} className="app-card p-5 flex justify-between items-center border-zinc-800">
                    <div>
                      <h3 className="font-black text-white uppercase text-sm italic">{p.name}</h3>
                      <div className="text-wax-orange font-black text-3xl tabular-nums">{p.quantity} <span className="text-xs text-zinc-500">pz</span></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const updated = state.finishedProducts.map(old => old.id === p.id ? { ...old, quantity: Math.max(0, old.quantity - 1) } : old);
                        handleUpdateState({ ...state, finishedProducts: updated });
                      }} className="bg-zinc-800 p-4 rounded-2xl text-wax-orange border border-zinc-700"><ShoppingCart size={20} /></button>
                      <button onClick={() => {
                        const updated = state.finishedProducts.map(old => old.id === p.id ? { ...old, quantity: old.quantity + 1 } : old);
                        handleUpdateState({ ...state, finishedProducts: updated });
                      }} className="bg-wax-orange p-4 rounded-2xl text-zinc-900"><Plus size={20} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => {
              const name = prompt("Nome prodotto?");
              if (name) handleUpdateState({ ...state, finishedProducts: [...state.finishedProducts, { id: crypto.randomUUID(), name, quantity: 0 }] });
            }} className="app-button mt-4">+ AGGIUNGI</button>
          </div>
        )}

        {view === 'SETTINGS' && (
          <div className="w-full max-w-sm space-y-6">
             <div className="app-card p-6">
                <h3 className="text-wax-orange font-black mb-6 uppercase italic flex items-center gap-2"><Cloud size={18}/> Cloud Sync</h3>
                {!user ? (
                  <button onClick={async () => {
                    const email = prompt("Email?");
                    const password = prompt("Password?");
                    if (email && password) {
                      const { error } = await supabase.auth.signInWithPassword({ email, password });
                      if (error) {
                        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
                        if (signUpErr) showToast(signUpErr.message, 'error');
                        else showToast("Conferma email!", "success");
                      } else showToast("Loggato!", "success");
                    }
                  }} className="app-button">Accedi</button>
                ) : (
                  <button onClick={() => supabase.auth.signOut()} className="app-button !bg-zinc-800 !text-white">Esci</button>
                )}
             </div>
             <button onClick={() => { if(confirm("Cancellare tutto?")) { localStorage.clear(); location.reload(); } }} className="app-button !bg-red-950 !text-red-500 border border-red-900/30">Reset Database Locale</button>
          </div>
        )}

        {view === 'CALCULATOR' && (
          <div className="w-full max-w-sm app-card p-8">
             <h2 className="text-wax-orange font-black text-xl mb-6 uppercase">Calcolatore</h2>
             <div className="space-y-4">
                <div>
                   <label className="app-label">Peso Candela (g)</label>
                   <input type="number" defaultValue={200} className="app-input" id="c_total" />
                </div>
                <div>
                   <label className="app-label">Fragranza (%)</label>
                   <input type="number" defaultValue={10} className="app-input" id="c_frag" />
                </div>
                <button onClick={() => {
                   const total = Number((document.getElementById('c_total') as any).value);
                   const fragP = Number((document.getElementById('c_frag') as any).value);
                   const fragW = (total * fragP) / 100;
                   const waxW = total - fragW;
                   alert(`Cera: ${waxW.toFixed(1)}g\nFragranza: ${fragW.toFixed(1)}g`);
                }} className="app-button">Calcola</button>
             </div>
          </div>
        )}
      </main>

      {isSyncing && (
        <div className="fixed bottom-6 right-6 bg-wax-orange text-app-dark p-3 rounded-full shadow-2xl animate-sync">
          <RefreshCw className="animate-spin" size={24}/>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
