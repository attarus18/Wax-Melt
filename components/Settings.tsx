
import React, { useState } from 'react';
import { Trash2, ShieldAlert, Globe, Coins, User, LogIn, LogOut, Key, Mail, RefreshCw, UserPlus, Cloud } from 'lucide-react';
import { Language, Currency, UserProfile } from '../types';
import { supabase } from '../utils/supabase';

interface SettingsProps {
  onClearData: () => void;
  t: (key: string) => string;
  lang: Language;
  currency: Currency;
  user: UserProfile | null;
  isSyncing: boolean;
  onSyncNow: () => void;
  onLogout: () => void;
  onUpdateSettings: (settings: { language: Language; currency: Currency }) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onClearData, t, lang, currency, user, isSyncing, onSyncNow, onLogout, onUpdateSettings 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
        });
        if (error) throw error;
        alert("Account creato! Controlla la tua email per confermare.");
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm("Vuoi disconnetterti? I tuoi dati rimarranno al sicuro sul cloud.")) {
      onLogout();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-black text-white px-2 tracking-tight">IMPOSTAZIONI</h2>

      <section className="app-card overflow-hidden border-wax-orange/40">
        <div className="p-1.5 bg-gradient-to-r from-wax-orange via-amber-600 to-amber-900" />
        <div className="p-6">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-wax-orange mb-6 flex items-center gap-2">
            <User size={16} /> ACCOUNT CLOUD
          </h3>
          
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-wax-orange/20 rounded-full flex items-center justify-center text-wax-orange font-black text-xl">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Email Collegata</div>
                  <div className="text-white font-bold truncate">{user.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-wax-orange font-black uppercase tracking-widest transition-all border border-zinc-700 active:scale-95 disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Cloud size={18} />}
                  Sincronizza
                </button>
                <button 
                  onClick={handleLogoutClick}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-800 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50 text-zinc-400 font-black uppercase tracking-widest transition-all border border-zinc-700 active:scale-95"
                >
                  <LogOut size={18} />
                  Esci
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleAuth} className="space-y-4">
                <p className="text-xs text-zinc-400 mb-6 font-medium leading-relaxed">
                  {isRegistering 
                    ? "Crea un account per sincronizzare i tuoi dati su tutti i dispositivi."
                    : "Accedi per recuperare i tuoi dati sincronizzati."}
                </p>
                
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="app-input pl-12 py-4" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="app-input pl-12 py-4" 
                      required 
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold flex items-center gap-3">
                    <ShieldAlert size={18} /> {authError}
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="app-button w-full shadow-xl py-4"
                  >
                    {loading ? <RefreshCw size={20} className="animate-spin" /> : (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
                    {isRegistering ? 'Crea Account' : 'Accedi'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[10px] text-zinc-500 hover:text-wax-orange uppercase font-black tracking-[0.2em]"
                  >
                    {isRegistering ? 'Hai già un account? ACCEDI' : 'Non hai un account? REGISTRATI'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className="app-card p-6 space-y-8">
        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
            <Globe size={16} /> LINGUA
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {['it', 'en', 'fr', 'es'].map((l) => (
              <button 
                key={l}
                onClick={() => onUpdateSettings({ language: l as Language, currency })}
                className={`py-3 rounded-xl font-bold transition-all border ${
                  lang === l 
                  ? 'bg-wax-orange text-zinc-900 border-wax-orange' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-2">
            <Coins size={16} /> VALUTA
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onUpdateSettings({ language: lang, currency: 'EUR' })}
              className={`py-4 rounded-2xl font-black transition-all border ${
                currency === 'EUR' ? 'bg-zinc-800 text-wax-orange border-wax-orange' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              EURO
            </button>
            <button 
              onClick={() => onUpdateSettings({ language: lang, currency: 'USD' })}
              className={`py-4 rounded-2xl font-black transition-all border ${
                currency === 'USD' ? 'bg-zinc-800 text-wax-orange border-wax-orange' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              USD
            </button>
          </div>
        </div>
      </section>

      <section className="app-card p-6">
        <button 
          onClick={() => {
            if (window.confirm("Attenzione: eliminerà TUTTO dal dispositivo. Proseguire?")) {
              onClearData();
            }
          }}
          className="flex items-center justify-between w-full p-4 bg-red-900/10 hover:bg-red-900/20 rounded-2xl transition-all text-left border border-red-900/20"
        >
          <div>
            <div className="font-bold text-red-500">Resetta Applicazione</div>
            <div className="text-[9px] uppercase font-black text-red-800 tracking-widest">Elimina dati locali</div>
          </div>
          <Trash2 className="text-red-500" />
        </button>
      </section>
    </div>
  );
};

export default Settings;
