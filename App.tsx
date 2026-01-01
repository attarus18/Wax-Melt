
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Home from './components/Home';
import Calculator from './components/Calculator';
import ProductionCost from './components/ProductionCost';
import InventoryFinished from './components/InventoryFinished';
import ProductStatistics from './components/ProductStatistics';
import Settings from './components/Settings';
import { View, InventoryState, FinishedProduct, TransactionType, Language, Currency, UserProfile } from './types';
import { loadFromDB, saveToDB } from './utils/storage';
import { getTranslation } from './utils/i18n';
import { CheckCircle2, Globe, Coins, BellRing, AlertCircle, Key, RefreshCw, X, ShieldCheck, Lock, Check } from 'lucide-react';
import { supabase, syncDataToCloud, fetchDataFromCloud, updateAccountPassword } from './utils/supabase';

const App: React.FC = () => {
  // RILEVAMENTO IMMEDIATO E SINCRONO: Blocchiamo l'app se siamo in un flow di recupero tramite URL
  const getInitialRecoveryState = () => {
    return window.location.hash.includes('type=recovery') || 
           window.location.search.includes('type=recovery') ||
           window.location.hash.includes('error_code=404'); // Fallback per token scaduti/errati
  };

  const [view, setView] = useState<View>('HOME');
  const [state, setState] = useState<InventoryState>({ 
    finishedProducts: [], 
    rawMaterials: [],
    settings: undefined,
    lastSynced: undefined
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'LANG' | 'CURR' | null>(null);
  
  // Stati per il Reset Password Forzato (Area Sicura)
  const [isRecovering, setIsRecovering] = useState(getInitialRecoveryState());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const stateRef = useRef(state);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
    if (state.settings?.language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [state]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const persistData = useCallback(async (forceCloud = false) => {
    await saveToDB(stateRef.current);
    if (user) {
      if (forceCloud) {
        setIsSyncing(true);
        const result = await syncDataToCloud(user.id, stateRef.current);
        if (result.success) {
          showNotification("Sincronizzazione completata");
          const now = Date.now();
          setState(prev => ({ ...prev, lastSynced: now }));
          stateRef.current.lastSynced = now;
          await saveToDB(stateRef.current);
        } else {
          showNotification(result.message, "error");
        }
        setIsSyncing(false);
      } else {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
          setIsSyncing(true);
          const result = await syncDataToCloud(user.id, stateRef.current);
          if (result.success) {
             const now = Date.now();
             setState(prev => ({ ...prev, lastSynced: now }));
          }
          setIsSyncing(false);
        }, 5000);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      setIsSyncing(true);
      await supabase.auth.signOut();
      setUser(null);
      const cleanState: InventoryState = { 
        finishedProducts: [], 
        rawMaterials: [], 
        settings: stateRef.current.settings 
      };
      setState(cleanState);
      stateRef.current = cleanState;
      await saveToDB(cleanState);
      localStorage.removeItem('waxpro_manager_data');
      setView('HOME');
      showNotification("Account disconnesso", "warning");
    } catch (e: any) {
      showNotification("Errore logout", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification("Le password non corrispondono!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showNotification("La password deve essere di almeno 6 caratteri", "error");
      return;
    }

    setRecoveryLoading(true);
    try {
      const { error } = await updateAccountPassword(newPassword);
      if (error) throw error;
      
      showNotification("Password aggiornata correttamente!");
      
      // Pulizia totale dopo il successo
      setIsRecovering(false);
      setNewPassword('');
      setConfirmPassword('');
      
      // Pulizia URL per evitare loop di recupero al refresh
      window.location.hash = '';
      window.history.replaceState(null, '', window.location.pathname);
      
      setView('HOME');
    } catch (e: any) {
      showNotification(e.message || "Errore durante l'aggiornamento", "error");
    } finally {
      setRecoveryLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Se siamo in recovery, la sessione deve essere pronta per aggiornare la password
      if (session) setSessionReady(true);

      let finalState: InventoryState;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        
        // Se non stiamo recuperando la password, carichiamo i dati cloud
        if (!isRecovering) {
          setIsSyncing(true);
          const cloudData = await fetchDataFromCloud(session.user.id);
          const localData = await loadFromDB();
          finalState = { ...localData, ...(cloudData || {}) };
          setState(finalState);
          setIsSyncing(false);
        } else {
          finalState = await loadFromDB();
          setState(finalState);
        }
      } else {
        finalState = await loadFromDB();
        setState(finalState);
      }
      
      if (!finalState.settings || !finalState.settings.language) {
        setOnboardingStep('LANG');
      } else if (!finalState.settings.currency) {
        setOnboardingStep('CURR');
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        setSessionReady(true);
        
        // INTERCETTAZIONE EVENTO RECUPERO
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovering(true);
        }

        // Caricamento dati solo se non siamo in fase di reset critico
        if (event === 'SIGNED_IN' && !isRecovering) {
          const cloudData = await fetchDataFromCloud(session.user.id);
          if (cloudData) {
            setState(prev => ({ ...prev, ...cloudData }));
            if (cloudData.settings?.language) setOnboardingStep(null);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsRecovering(false);
        setView('HOME');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [isRecovering]);

  const updateState = (newState: InventoryState) => {
    setState(newState);
    stateRef.current = newState;
    persistData(false);
  };

  const lang = state.settings?.language || 'en';
  const t = (key: string) => getTranslation(lang, key);

  // SCHERMATA RESET PASSWORD (PRIORITÀ MASSIMA - BLOCCO UI)
  if (isRecovering) {
    const passwordsMatch = newPassword.length >= 6 && newPassword === confirmPassword;

    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[500] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        <div className="w-full max-w-sm app-card p-10 border-wax-orange shadow-[0_0_120px_rgba(249,166,2,0.2)] animate-in zoom-in-95 duration-700">
          {!sessionReady ? (
            <div className="flex flex-col items-center gap-6 py-10">
              <RefreshCw className="text-wax-orange animate-spin" size={48} />
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Verifica Sicurezza...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="bg-wax-orange/10 w-24 h-24 rounded-full flex items-center justify-center mb-8 border border-wax-orange/30 shadow-[0_0_50px_rgba(249,166,2,0.15)]">
                <ShieldCheck className="text-wax-orange" size={48} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Area di Ripristino</h2>
              <p className="text-zinc-500 text-[10px] mb-10 font-bold leading-relaxed uppercase tracking-[0.2em]">
                Inserisci la nuova password <span className="text-wax-orange">due volte</span> per confermare l'aggiornamento.
              </p>
              
              <form onSubmit={handleRecoverySubmit} className="w-full space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-wax-orange transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="Nuova Password" 
                    className="app-input pl-12 py-4 bg-zinc-900 border-zinc-800 text-lg font-bold"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <Check className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passwordsMatch ? 'text-green-500' : 'text-zinc-600 group-focus-within:text-wax-orange'}`} size={18} />
                  <input 
                    type="password" 
                    placeholder="Ripeti Password" 
                    className={`app-input pl-12 py-4 bg-zinc-900 border-zinc-800 text-lg font-bold ${confirmPassword && !passwordsMatch ? 'border-red-500/50' : ''}`}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>

                {confirmPassword && !passwordsMatch && (
                   <p className="text-red-500 text-[9px] font-black uppercase tracking-widest animate-pulse">Le password non corrispondono!</p>
                )}
                
                <button 
                  type="submit" 
                  disabled={recoveryLoading || !passwordsMatch}
                  className={`app-button w-full py-5 text-sm font-black shadow-2xl active:scale-95 transition-all mt-4 ${!passwordsMatch ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                >
                  {recoveryLoading ? <RefreshCw className="animate-spin" size={20} /> : "CONFERMA E AGGIORNA"}
                </button>
                
                <div className="pt-8">
                  <button 
                    type="button" 
                    onClick={() => { setIsRecovering(false); window.location.hash = ''; setView('HOME'); }}
                    className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.25em] hover:text-white transition-colors"
                  >
                    Torna al login / Homepage
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div className="mt-12 flex items-center gap-3 opacity-30 grayscale pointer-events-none">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[9px] font-black tracking-[0.4em] uppercase">Sessione Protetta WaxPro Secure</span>
        </div>
      </div>
    );
  }

  const renderView = () => {
    const commonProps = { setView, t, lang, currency: state.settings?.currency || 'EUR' };
    switch(view) {
      case 'HOME': return <Home {...commonProps} user={user} />;
      case 'CALCULATOR': return <Calculator {...commonProps} />;
      case 'PRODUCTION_COST': return <ProductionCost {...commonProps} />;
      case 'FINISHED_PRODUCTS': return (
        <InventoryFinished 
          {...commonProps}
          products={state.finishedProducts} 
          onAdd={(p) => updateState({ ...state, finishedProducts: [...state.finishedProducts, p] })} 
          onUpdate={(p) => updateState({ ...state, finishedProducts: state.finishedProducts.map(old => old.id === p.id ? p : old) })}
          onTransaction={(id, type) => {
             const newState = { ...state, finishedProducts: state.finishedProducts.map(p => {
               if (p.id === id) {
                 const newQty = type === 'SALE' ? Math.max(0, p.quantity - 1) : p.quantity + 1;
                 return { ...p, quantity: newQty, history: [...(p.history || []), { id: crypto.randomUUID(), type, timestamp: Date.now() }] };
               }
               return p;
             })};
             updateState(newState);
          }} 
          onDelete={(id) => updateState({ ...state, finishedProducts: state.finishedProducts.filter(p => p.id !== id) })}
          onShowStats={(id) => { setSelectedProductId(id); setView('PRODUCT_STATS'); }}
        />
      );
      case 'PRODUCT_STATS':
        const product = state.finishedProducts.find(p => p.id === selectedProductId);
        return product ? <ProductStatistics {...commonProps} product={product} /> : <Home {...commonProps} user={user} />;
      case 'SETTINGS': return <Settings 
          {...commonProps}
          user={user}
          isSyncing={isSyncing}
          lastSynced={state.lastSynced}
          onSyncNow={() => persistData(true)}
          onLogout={handleLogout}
          onUpdateSettings={(settings) => updateState({ ...state, settings })}
          onClearData={() => {
            const fresh = { finishedProducts: [], rawMaterials: [], settings: state.settings };
            updateState(fresh);
            setView('HOME');
            showNotification(t("dati_cancellati"));
          }} />;
      default: return <Home {...commonProps} user={user} />;
    }
  };

  return (
    <div className={`min-h-screen bg-app-dark flex flex-col items-center p-4 relative overflow-x-hidden ${lang === 'ar' ? 'font-arabic' : ''}`}>
      
      {onboardingStep && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-app-dark/95 backdrop-blur-xl">
          <div className="app-card w-full max-w-sm p-8 flex flex-col items-center text-center animate-in zoom-in-95">
            {onboardingStep === 'LANG' ? (
              <div className="w-full">
                <Globe className="text-wax-orange mb-6 mx-auto" size={48} />
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Seleziona Lingua</h2>
                <div className="w-full max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-center">
                  {['it', 'en', 'fr', 'de', 'es', 'ar', 'zh'].map((l) => (
                    <button key={l} onClick={() => { updateState({ ...stateRef.current, settings: { language: l as Language, currency: 'EUR' } }); setOnboardingStep('CURR'); }} className="w-full py-4 rounded-xl bg-zinc-800 hover:bg-wax-orange hover:text-zinc-900 transition-all font-bold text-lg border border-zinc-700 active:scale-95">
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <Coins className="text-wax-orange mb-6 mx-auto" size={48} />
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Valuta</h2>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => { updateState({ ...stateRef.current, settings: { ...stateRef.current.settings!, currency: 'EUR' } }); setOnboardingStep(null); }} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-zinc-800 border-2 border-transparent hover:border-wax-orange transition-all">
                    <span className="text-4xl font-black text-wax-orange">€</span>
                  </button>
                  <button onClick={() => { updateState({ ...stateRef.current, settings: { ...stateRef.current.settings!, currency: 'USD' } }); setOnboardingStep(null); }} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-zinc-800 border-2 border-transparent hover:border-wax-orange transition-all">
                    <span className="text-4xl font-black text-wax-orange">$</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className={`bg-zinc-900 border-2 ${toast.type === 'error' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-wax-orange shadow-[0_0_30px_rgba(249,166,2,0.2)]'} px-6 py-4 rounded-2xl flex items-center gap-3`}>
            {toast.type === 'error' || toast.type === 'warning' ? <AlertCircle className="text-red-500 animate-bounce" size={24} /> : <CheckCircle2 className="text-wax-orange" size={24} />}
            <span className={`font-bold uppercase text-xs tracking-widest ${toast.type === 'error' || toast.type === 'warning' ? 'text-red-500' : 'text-white'}`}>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm flex justify-start items-center mb-6 px-2 mt-8 sm:mt-0 h-12">
         {view !== 'HOME' && (
           <button onClick={() => setView('HOME')} className="text-wax-orange flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-zinc-700 shadow-xl transition-all hover:bg-zinc-700 active:scale-95">
             <span className="text-xs font-black tracking-[0.15em] uppercase">Home</span>
           </button>
         )}
      </div>

      <main className="w-full flex-grow flex flex-col items-center">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
