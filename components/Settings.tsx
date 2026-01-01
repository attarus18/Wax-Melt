
import React, { useState } from 'react';
import { Trash2, ShieldAlert, Globe, User, LogIn, LogOut, Key, Mail, RefreshCw, UserPlus, Cloud, CheckCircle2, UserX, X } from 'lucide-react';
import { Language, Currency, UserProfile } from '../types';
import { supabase, requestPasswordReset, updateAccountPassword, deleteUserDataAndCloud } from '../utils/supabase';

interface SettingsProps {
  onClearData: () => void;
  t: (key: string) => string;
  lang: Language;
  currency: Currency;
  user: UserProfile | null;
  isSyncing: boolean;
  lastSynced?: number;
  onSyncNow: () => void;
  onLogout: () => void;
  onUpdateSettings: (settings: { language: Language; currency: Currency }) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onClearData, t, lang, currency, user, isSyncing, lastSynced, onSyncNow, onLogout, onUpdateSettings 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // Stati per il Modal Password Dimenticata
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthMessage(null);
    
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMessage("Account creato! Controlla la tua email per confermare.");
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

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Inserisci la tua email");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const { error } = await requestPasswordReset(forgotEmail);
      if (error) throw error;
      setForgotSuccess(true);
    } catch (e: any) {
      setForgotError(e.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert("La password deve avere almeno 6 caratteri");
      return;
    }
    setLoading(true);
    try {
      const { error } = await updateAccountPassword(newPassword);
      if (error) throw error;
      alert("Password aggiornata con successo!");
      setShowPasswordChange(false);
      setNewPassword('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirm = window.confirm("ATTENZIONE: Questa azione eliminerà permanentemente tutti i tuoi dati salvati sul Cloud. Vuoi procedere?");
    if (confirm) {
      setLoading(true);
      try {
        await deleteUserDataAndCloud(user.id);
        onClearData(); // Pulisce anche i dati locali
        onLogout();
      } catch (e: any) {
        alert("Errore durante l'eliminazione: " + e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Mai sincronizzato";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-black text-white px-2 tracking-tight uppercase tracking-tighter">IMPOSTAZIONI</h2>

      {/* MODAL PASSWORD DIMENTICATA */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => !forgotLoading && setShowForgotModal(false)} />
          <div className="app-card w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 border-wax-orange/50 shadow-[0_0_50px_rgba(249,166,2,0.1)]">
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              disabled={forgotLoading}
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="bg-wax-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-wax-orange/20">
                <Key className="text-wax-orange" size={32} />
              </div>
              <h3 className="text-white font-black text-xl uppercase tracking-tighter">Recupero Password</h3>
              <p className="text-zinc-500 text-xs mt-2 font-medium">Inserisci la tua email per ricevere il link di ripristino.</p>
            </div>

            {forgotSuccess ? (
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-2">
                <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-500 text-sm rounded-2xl font-bold">
                  Email inviata con successo! Controlla la tua posta.
                </div>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="app-button w-full py-4"
                >
                  Ho capito
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange" size={18} />
                  <input 
                    type="email" 
                    placeholder="La tua email" 
                    className="app-input pl-12 py-4" 
                    required 
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                  />
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] rounded-xl font-bold flex items-center gap-2 uppercase tracking-widest">
                    <ShieldAlert size={14} /> {forgotError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={forgotLoading}
                  className="app-button w-full py-4 shadow-[0_10px_20px_rgba(249,166,2,0.15)] active:scale-95 transition-all"
                >
                  {forgotLoading ? <RefreshCw size={20} className="animate-spin" /> : "Richiedi Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <section className="app-card overflow-hidden border-wax-orange/40 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
        <div className="p-1.5 bg-gradient-to-r from-wax-orange via-amber-600 to-amber-900" />
        <div className="p-6">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-wax-orange mb-6 flex items-center gap-2">
            <User size={16} /> ACCOUNT CLOUD
          </h3>
          
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-wax-orange/20 rounded-full flex items-center justify-center text-wax-orange font-black text-xl border border-wax-orange/30">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Account Attivo</div>
                  <div className="text-white font-bold truncate text-sm">{user.email}</div>
                </div>
                {lastSynced && (
                  <div className="flex flex-col items-end">
                    <CheckCircle2 size={14} className="text-wax-orange mb-1" />
                    <span className="text-[8px] text-zinc-500 uppercase font-bold">Sync {formatLastSync(lastSynced)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onSyncNow}
                  disabled={isSyncing || loading}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-wax-orange font-black uppercase tracking-widest transition-all border border-zinc-700 active:scale-95 disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Cloud size={18} />}
                  Sincronizza
                </button>
                <button 
                  onClick={onLogout}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black uppercase tracking-widest transition-all border border-zinc-700 active:scale-95"
                >
                  <LogOut size={18} />
                  Esci
                </button>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                 <button 
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="w-full py-3 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 text-zinc-500 font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  {showPasswordChange ? 'Chiudi Cambio Password' : 'Cambia Password'}
                </button>

                {showPasswordChange && (
                  <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-700 animate-in slide-in-from-top-2 space-y-3">
                    <input 
                      type="password" 
                      placeholder="Nuova Password" 
                      className="app-input text-xs"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <button 
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="w-full py-2.5 bg-wax-orange text-zinc-900 rounded-lg font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                      Conferma Nuova Password
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full py-3 mt-4 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <UserX size={14} /> Cancella Account e Dati
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange" size={18} />
                    <input type="email" placeholder="Email" className="app-input pl-12 py-4" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange" size={18} />
                    <input type="password" placeholder="Password" className="app-input pl-12 py-4" required={!loading} minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end">
                   <button 
                    type="button" 
                    onClick={() => { setForgotSuccess(false); setForgotError(null); setForgotEmail(email); setShowForgotModal(true); }}
                    className="text-[9px] font-black uppercase tracking-widest text-wax-orange hover:underline"
                   >
                     Password Dimenticata?
                   </button>
                </div>

                {authError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-bold flex items-center gap-3">
                    <ShieldAlert size={18} /> {authError}
                  </div>
                )}

                {authMessage && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-xl font-bold flex items-center gap-3">
                    <CheckCircle2 size={18} /> {authMessage}
                  </div>
                )}

                <button type="submit" disabled={loading} className="app-button w-full py-4 shadow-xl">
                  {loading ? <RefreshCw size={20} className="animate-spin" /> : (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
                  {isRegistering ? 'Crea Account' : 'Accedi'}
                </button>
                <button type="button" onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); setAuthMessage(null); }} className="w-full text-[10px] text-zinc-500 hover:text-wax-orange uppercase font-black tracking-[0.2em] text-center">
                  {isRegistering ? 'Hai già un account? ACCEDI' : 'Non hai un account? REGISTRATI'}
                </button>
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
                className={`py-3 rounded-xl font-bold transition-all border ${lang === l ? 'bg-wax-orange text-zinc-900 border-wax-orange' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="app-card p-6 border-red-900/20 bg-zinc-900/20">
        <button 
          onClick={() => { if (window.confirm("Eliminare tutto dal dispositivo? I dati sul cloud resteranno intatti.")) onClearData(); }}
          className="flex items-center justify-between w-full p-4 bg-zinc-900/40 hover:bg-zinc-800 rounded-2xl transition-all border border-zinc-800"
        >
          <div className="text-left">
            <div className="font-bold text-zinc-400 text-sm">Resetta App Locale</div>
            <div className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Svuota memoria interna</div>
          </div>
          <Trash2 className="text-zinc-500" />
        </button>
      </section>
    </div>
  );
};

export default Settings;
