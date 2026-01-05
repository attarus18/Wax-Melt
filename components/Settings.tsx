
import React, { useState, useEffect } from 'react';
import { Trash2, Globe, User, LogIn, LogOut, Key, Mail, RefreshCw, UserPlus, Cloud, UserX, X, ChevronRight, Fingerprint, AlertCircle, CheckCircle2, ShieldAlert, Lock, Check, Coins } from 'lucide-react';
import { Language, Currency, UserProfile } from '../types';
import { supabase, requestPasswordReset, updateAccountPassword, deleteUserDataAndCloud } from '../utils/supabase';

interface SettingsProps {
  onClearData: () => void;
  t: (key: string) => string;
  lang: Language;
  currency: Currency;
  user: UserProfile | null;
  isSyncing: boolean;
  isConverting?: boolean;
  lastSynced?: number;
  onSyncNow: () => void;
  onLogout: () => void;
  onUpdateSettings: (settings: { language: Language; currency: Currency }) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onClearData, t, lang, currency, user, isSyncing, isConverting, lastSynced, onSyncNow, onLogout, onUpdateSettings 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [showAccountCenter, setShowAccountCenter] = useState(false);
  const [activeEditAction, setActiveEditAction] = useState<'PASSWORD' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (!showAccountCenter) {
      setActiveEditAction(null);
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess(false);
      setEditError(null);
    }
  }, [showAccountCenter]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    setAuthMessage(null);
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMessage("Account creato! Verifica l'email.");
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setAuthError(e.message || "Errore di autenticazione");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setEditError("La password deve avere almeno 6 caratteri");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setEditError("Le password non corrispondono");
      return;
    }

    setEditLoading(true);
    setPasswordSuccess(false);
    setEditError(null);
    
    try {
      const { error } = await updateAccountPassword(newPassword);
      if (error) throw error;
      
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmNewPassword('');
      
      setTimeout(() => {
        setPasswordSuccess(false);
        setActiveEditAction(null);
      }, 3000);
    } catch (e: any) {
      setEditError(e.message || "Impossibile aggiornare la password");
    } finally {
      setEditLoading(false);
    }
  };

  const handleFinalDelete = async () => {
    if (!user) return;
    setEditLoading(true);
    try {
      await deleteUserDataAndCloud();
      localStorage.clear();
      onClearData(); 
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (e: any) {
      alert("ERRORE DURANTE IL RESET:\n\n" + (e.message || "Errore di connessione."));
    } finally {
      setEditLoading(false);
    }
  };

  const closeSuccessAndLogout = () => {
    setShowDeleteSuccess(false);
    setShowAccountCenter(false);
    onLogout(); 
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Mai";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 w-full animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-black text-white px-2 tracking-tighter italic uppercase">IMPOSTAZIONI</h2>

      {isConverting && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="app-card p-10 flex flex-col items-center gap-6 text-center border-wax-orange shadow-[0_0_80px_rgba(249,166,2,0.3)]">
            <div className="relative">
              <RefreshCw className="text-wax-orange animate-spin" size={60} />
              <Coins className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={24} />
            </div>
            <div>
              <h3 className="text-white font-black text-xl uppercase tracking-widest italic mb-2">Conversione Prezzi</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Aggiornamento magazzino con cambio in tempo reale...</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in" />
          <div className="app-card w-full max-w-sm p-10 relative z-10 animate-in zoom-in-95 border-green-500/50 shadow-[0_0_100px_rgba(34,197,94,0.3)] text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500/30">
              <CheckCircle2 className="text-green-500" size={50} />
            </div>
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-4 italic">DATI ELIMINATI</h3>
            <p className="text-zinc-400 text-xs font-bold leading-relaxed uppercase tracking-widest mb-10">
              La cancellazione totale dei dati è avvenuta con successo. L'inventario locale e cloud è stato svuotato.
            </p>
            <button 
              onClick={closeSuccessAndLogout}
              className="w-full py-5 bg-green-600 text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:bg-green-500"
            >
              CHIUDI E ESCI
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl animate-in fade-in" onClick={() => !editLoading && setShowDeleteConfirm(false)} />
          <div className="app-card w-full max-w-xs p-8 relative z-10 animate-in zoom-in-95 border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.6)]">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-500/20 w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 border-red-600/30 animate-pulse">
                <ShieldAlert className="text-red-500" size={50} />
              </div>
              <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-4 italic text-balance leading-none">RESET MAGAZZINO</h3>
              <p className="text-zinc-400 text-[10px] font-bold leading-relaxed uppercase tracking-[0.2em] mb-10 mt-4">
                L'account <span className="text-white underline">{user?.email}</span> resterà ATTIVO. <br/><br/>
                Verranno eliminati permanentemente: <br/>
                • <span className="text-red-500 font-black">Tutti i prodotti e materiali</span><br/>
                • <span className="text-red-500">I dati salvati nel Cloud</span><br/>
                • <span className="text-red-500">Il database locale</span>
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={handleFinalDelete} 
                  disabled={editLoading}
                  className="w-full py-5 bg-red-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:bg-red-500 flex items-center justify-center gap-3"
                >
                  {editLoading ? <RefreshCw className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  {editLoading ? "CANCELLAZIONE..." : "SÌ, ELIMINA DATI"}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  disabled={editLoading}
                  className="w-full py-4 bg-zinc-800 text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:text-white transition-colors"
                >
                  ANNULLA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAccountCenter && user && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in" onClick={() => !editLoading && setShowAccountCenter(false)} />
          <div className="app-card w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 border-wax-orange/30 shadow-[0_0_80px_rgba(249,166,2,0.2)]">
            <div className="flex justify-between items-center mb-8 px-2">
              <h3 className="text-white font-black text-xl uppercase tracking-widest italic flex items-center gap-3">
                <Fingerprint className="text-wax-orange" size={24} /> CENTRO ACCOUNT
              </h3>
              <button onClick={() => setShowAccountCenter(false)} disabled={editLoading} className="text-zinc-500 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center gap-2 mb-2">
                   <Mail className="text-zinc-600" size={14} />
                   <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em]">Email Account</span>
                </div>
                <div className="text-white font-black text-lg truncate opacity-90">{user.email}</div>
              </div>

              <div className={`bg-zinc-900/60 p-5 rounded-2xl border transition-all duration-300 ${activeEditAction === 'PASSWORD' ? 'border-wax-orange/30' : 'border-zinc-800/80'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="text-zinc-600" size={14} />
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em]">Sicurezza</span>
                  </div>
                  <button 
                    onClick={() => setActiveEditAction(activeEditAction === 'PASSWORD' ? null : 'PASSWORD')} 
                    className="text-wax-orange text-[10px] font-black uppercase tracking-widest hover:underline px-2 py-1"
                  >
                    {activeEditAction === 'PASSWORD' ? 'CHIUDI' : 'CAMBIA'}
                  </button>
                </div>

                {activeEditAction !== 'PASSWORD' ? (
                   <div className="text-zinc-600 font-black tracking-[0.4em] py-1">••••••••••••</div>
                ) : (
                  <div className="mt-4 space-y-4 pt-4 border-t border-zinc-800 animate-in slide-in-from-top-2">
                    {passwordSuccess ? (
                      <div className="bg-green-500/20 border border-green-500/50 p-5 rounded-2xl flex flex-col items-center gap-3 text-green-500 animate-in zoom-in-95 text-center">
                        <CheckCircle2 size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Password aggiornata!</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nuova Password</label>
                          <input 
                            type="password" 
                            placeholder="Min 6 caratteri" 
                            className="app-input text-sm font-bold bg-zinc-950/50 border-zinc-800" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Conferma Password</label>
                          <input 
                            type="password" 
                            placeholder="Ripeti password" 
                            className={`app-input text-sm font-bold bg-zinc-950/50 ${confirmNewPassword && !passwordsMatch ? 'border-red-500/50' : 'border-zinc-800'}`} 
                            value={confirmNewPassword} 
                            onChange={e => setConfirmNewPassword(e.target.value)} 
                          />
                        </div>
                        {editError && (
                          <div className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-xl">
                            <AlertCircle size={14} /> {editError}
                          </div>
                        )}
                        <button 
                          onClick={handleChangePassword} 
                          disabled={editLoading || !passwordsMatch || newPassword.length < 6} 
                          className={`w-full py-4 bg-wax-orange text-zinc-900 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all ${(!passwordsMatch || newPassword.length < 6) ? 'opacity-30 grayscale cursor-not-allowed' : 'active:scale-95 shadow-wax-orange/30'}`}
                        >
                          {editLoading ? <RefreshCw className="animate-spin mx-auto" size={18} /> : "AGGIORNA ORA"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  disabled={editLoading}
                  className="w-full py-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-900/40 transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 size={18} /> SVUOTA TUTTO IL MAGAZZINO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => !forgotLoading && setShowForgotModal(false)} />
          <div className="app-card w-full max-sm p-8 relative z-10 animate-in zoom-in-95 border-wax-orange/50 shadow-[0_0_60px_rgba(249,166,2,0.2)]">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-wax-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-wax-orange/30">
                <Key className="text-wax-orange" size={32} />
              </div>
              <h3 className="text-white font-black text-xl uppercase tracking-tighter italic">Recupero Password</h3>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotLoading(true);
              const { error } = await requestPasswordReset(forgotEmail);
              if (error) setForgotError(error.message || "Errore invio email"); else setForgotSuccess(true);
              setForgotLoading(false);
            }} className="space-y-4">
              <input type="email" placeholder="Indirizzo Email" className="app-input bg-zinc-900" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              {forgotSuccess ? (
                <div className="text-green-500 text-center font-black text-[10px] uppercase tracking-widest bg-green-500/10 p-5 rounded-2xl border border-green-500/30">Email inviata! Controlla la posta.</div>
              ) : (
                <button type="submit" disabled={forgotLoading} className="app-button w-full shadow-lg">
                  {forgotLoading ? <RefreshCw className="animate-spin" size={20} /> : "Invia Link Reset"}
                </button>
              )}
              {forgotError && <div className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{forgotError}</div>}
            </form>
          </div>
        </div>
      )}

      <section className="app-card overflow-hidden border-wax-orange/40">
        <div className="p-1.5 bg-gradient-to-r from-wax-orange to-amber-900" />
        <div className="p-6">
          <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-wax-orange flex items-center gap-2 mb-6">
            <Cloud size={16} /> ACCOUNT CLOUD
          </h3>
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-wax-orange/20 rounded-full flex items-center justify-center text-wax-orange font-black text-xl border border-wax-orange/30 shrink-0">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="flex-grow truncate">
                  <div className="text-white font-bold truncate text-sm">{user.email}</div>
                  <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Sincronizzato: {formatLastSync(lastSynced)}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setShowAccountCenter(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all border border-zinc-700 active:scale-[0.98]">
                  <div className="flex items-center gap-3"><User size={18} className="text-wax-orange" /><span>Gestione Account</span></div>
                  <ChevronRight size={18} className="text-zinc-600" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={onSyncNow} disabled={isSyncing} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-wax-orange text-zinc-900 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 text-[10px]">
                    {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Cloud size={16} />} Sync
                  </button>
                  <button onClick={onLogout} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest transition-all active:scale-95 border border-zinc-700 text-[10px]">
                    <LogOut size={16} /> Esci
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange" size={18} />
                  <input type="email" placeholder="Email" className="app-input pl-12 py-4" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wax-orange" size={18} />
                  <input type="password" placeholder="Password" className="app-input pl-12 py-4" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                 <button type="button" onClick={() => { setForgotSuccess(false); setForgotError(null); setForgotEmail(email); setShowForgotModal(true); }} className="text-[9px] font-black uppercase tracking-widest text-wax-orange hover:underline">Password Dimenticata?</button>
              </div>
              {authError && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] rounded-xl font-bold uppercase">{authError}</div>}
              {authMessage && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] rounded-xl font-bold uppercase">{authMessage}</div>}
              <button type="submit" disabled={loading} className="app-button w-full py-4 shadow-xl">
                {loading ? <RefreshCw size={20} className="animate-spin" /> : (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
                {isRegistering ? 'Registrati' : 'Accedi'}
              </button>
              <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-[10px] text-zinc-500 hover:text-wax-orange uppercase font-black tracking-[0.2em] text-center">
                {isRegistering ? 'Hai già un account? ACCEDI' : 'Non hai un account? REGISTRATI'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="app-card p-6 space-y-6">
        <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
          <Coins size={16} /> VALUTA E CAMBIO
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(['EUR', 'USD'] as Currency[]).map((c) => (
            <button 
              key={c} 
              onClick={() => !isConverting && onUpdateSettings({ language: lang, currency: c })} 
              className={`py-6 rounded-2xl font-black text-2xl transition-all border relative flex items-center justify-center ${
                currency === c 
                ? 'bg-wax-orange text-zinc-900 border-wax-orange shadow-lg scale-[1.02]' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
              } ${isConverting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {c === 'EUR' ? '€' : '$'}
              <span className="text-[10px] absolute bottom-2 font-bold tracking-widest">{c}</span>
              {currency === c && <Check className="absolute top-2 right-2" size={14} />}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center">
          * Il cambio converte automaticamente tutti gli importi salvati
        </p>
      </section>

      <section className="app-card p-6 space-y-6">
        <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
          <Globe size={16} /> LINGUA INTERFACCIA
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {['it', 'en', 'fr', 'de', 'es', 'ar', 'zh'].map((l) => (
            <button key={l} onClick={() => onUpdateSettings({ language: l as Language, currency })} className={`py-4 rounded-xl font-bold transition-all border ${lang === l ? 'bg-wax-orange text-zinc-900 border-wax-orange' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="app-card p-6 border-red-900/20 bg-zinc-900/10">
        <button onClick={() => { if (window.confirm("Resettare tutti i dati locali?")) onClearData(); }} className="flex items-center justify-between w-full p-4 hover:bg-red-500/5 rounded-2xl transition-all border border-zinc-800/50">
          <div className="text-left">
            <div className="font-bold text-zinc-400 text-sm italic">Reset Database Locale</div>
            <div className="text-[9px] uppercase font-black text-zinc-600 tracking-widest mt-1">Svuota memoria del dispositivo</div>
          </div>
          <Trash2 className="text-zinc-700" />
        </button>
      </section>
    </div>
  );
};

export default Settings;
