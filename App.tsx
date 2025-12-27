
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
import { CheckCircle2, Globe, Coins, BellRing } from 'lucide-react';
import { supabase, syncDataToCloud, fetchDataFromCloud } from './utils/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [state, setState] = useState<InventoryState>({ 
    finishedProducts: [], 
    rawMaterials: [],
    settings: undefined 
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'LANG' | 'CURR' | null>(null);
  
  const stateRef = useRef(state);
  // Fixed: Use ReturnType<typeof setTimeout> to avoid "Cannot find namespace 'NodeJS'" error in browser-only environments.
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
    // 1. Salva sempre in locale (IndexedDB)
    await saveToDB(stateRef.current);
    
    // 2. Sincronizzazione Cloud
    if (user) {
      if (forceCloud) {
        setIsSyncing(true);
        const success = await syncDataToCloud(user.id, stateRef.current);
        if (success) {
          showNotification("Sincronizzazione completata");
          setState(prev => ({ ...prev, lastSynced: Date.now() }));
        } else {
          showNotification("Errore sincronizzazione cloud", "error");
        }
        setIsSyncing(false);
      } else {
        // Debounce: Aspetta che l'utente finisca di fare modifiche prima di inviare al cloud
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
          setIsSyncing(true);
          await syncDataToCloud(user.id, stateRef.current);
          setIsSyncing(false);
        }, 3000); // 3 secondi di pausa dopo l'ultima modifica
      }
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      let finalState: InventoryState;

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
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
      
      if (!finalState.settings || !finalState.settings.language) {
        setOnboardingStep('LANG');
      } else if (!finalState.settings.currency) {
        setOnboardingStep('CURR');
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        if (event === 'SIGNED_IN') {
          showNotification("Accesso effettuato!");
          const cloudData = await fetchDataFromCloud(session.user.id);
          if (cloudData) {
            setState(prev => ({ ...prev, ...cloudData }));
            if (cloudData.settings?.language) setOnboardingStep(null);
          }
        }
      } else {
        setUser(null);
        if (event === 'SIGNED_OUT') {
          showNotification("Sessione chiusa", "warning");
          const localData = await loadFromDB();
          setState(localData);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  const updateState = (newState: InventoryState) => {
    setState(newState);
    stateRef.current = newState;
    persistData(false);
  };

  const setLanguage = (lang: Language) => {
    const newState = { ...stateRef.current, settings: { language: lang, currency: stateRef.current.settings?.currency || '' as Currency } };
    updateState(newState);
    setOnboardingStep('CURR');
  };

  const setCurrency = (curr: Currency) => {
    if (!stateRef.current.settings?.language) return;
    const newState = { ...stateRef.current, settings: { language: stateRef.current.settings.language, currency: curr } };
    updateState(newState);
    setOnboardingStep(null);
  };

  const lang = state.settings?.language || 'en';
  const t = (key: string) => getTranslation(lang, key);

  const addFinishedProduct = (product: FinishedProduct) => {
    const productWithHistory = { ...product, history: product.history || [] };
    updateState({ ...state, finishedProducts: [...state.finishedProducts, productWithHistory] });
    showNotification(t("prodotto_registrato"));
  };

  const updateProduct = (updatedProduct: FinishedProduct) => {
    const newState = {
      ...state,
      finishedProducts: state.finishedProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    };
    updateState(newState);
    showNotification(t("salva_success") || "Modifiche salvate!");
  };

  const addTransaction = (productId: string, type: TransactionType) => {
    let alerted = false;
    const newState = {
      ...state,
      finishedProducts: state.finishedProducts.map(p => {
        if (p.id === productId) {
          const newQty = type === 'SALE' ? Math.max(0, p.quantity - 1) : p.quantity + 1;
          const newHistory = [...(p.history || []), {
            id: crypto.randomUUID(),
            type,
            timestamp: Date.now()
          }];
          
          if (type === 'SALE' && newQty <= (p.reorderLevel || 0)) {
            alerted = true;
          }

          return { ...p, quantity: newQty, history: newHistory };
        }
        return p;
      })
    };
    updateState(newState);
    
    if (alerted) {
      showNotification(t("reorder_alert"), 'warning');
    } else {
      const msg = type === 'SALE' ? t("vendi_success") : type === 'RESTOCK' ? t("carico_success") : t("reso_success");
      showNotification(msg);
    }
  };

  const deleteProduct = (id: string) => {
    updateState({ ...state, finishedProducts: state.finishedProducts.filter(p => p.id !== id) });
    showNotification(t("eliminato"));
  };

  const renderView = () => {
    const commonProps = { setView, t, lang, currency: state.settings?.currency || 'EUR' };
    
    switch(view) {
      case 'HOME': return <Home {...commonProps} user={user} />;
      case 'CALCULATOR': return <Calculator {...commonProps} onAddProduct={addFinishedProduct} />;
      case 'PRODUCTION_COST': return <ProductionCost {...commonProps} />;
      case 'FINISHED_PRODUCTS': return (
        <InventoryFinished 
          {...commonProps}
          products={state.finishedProducts} 
          onAdd={addFinishedProduct} 
          onUpdate={updateProduct}
          onTransaction={addTransaction} 
          onDelete={deleteProduct}
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
          onSyncNow={() => persistData(true)}
          onSyncComplete={() => {}}
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
      {/* Onboarding Overlay */}
      {onboardingStep && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-app-dark/95 backdrop-blur-xl">
          <div className="app-card w-full max-w-sm p-8 flex flex-col items-center text-center animate-in zoom-in-95">
            {onboardingStep === 'LANG' ? (
              <>
                <Globe className="text-wax-orange mb-6" size={48} />
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Seleziona Lingua</h2>
                <div className="w-full max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {['it', 'en', 'fr', 'de', 'es', 'ar', 'zh'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => setLanguage(l as Language)}
                      className="w-full py-4 rounded-xl bg-zinc-800 hover:bg-wax-orange hover:text-zinc-900 transition-all font-bold text-lg border border-zinc-700 active:scale-95"
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Coins className="text-wax-orange mb-6" size={48} />
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">{t("valuta")}</h2>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => setCurrency('EUR')} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-zinc-800 border-2 border-transparent hover:border-wax-orange transition-all">
                    <span className="text-4xl font-black text-wax-orange">€</span>
                    <span className="font-bold text-white uppercase tracking-widest text-xs">Euro</span>
                  </button>
                  <button onClick={() => setCurrency('USD')} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-zinc-800 border-2 border-transparent hover:border-wax-orange transition-all">
                    <span className="text-4xl font-black text-wax-orange">$</span>
                    <span className="font-bold text-white uppercase tracking-widest text-xs">Dollar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notifiche Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className={`bg-zinc-900 border-2 ${toast.type === 'error' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-wax-orange shadow-[0_0_30px_rgba(249,166,2,0.2)]'} px-6 py-4 rounded-2xl flex items-center gap-3`}>
            {toast.type === 'error' || toast.type === 'warning' ? <BellRing className="text-red-500 animate-bounce" size={24} /> : <CheckCircle2 className="text-wax-orange" size={24} />}
            <span className={`font-bold uppercase text-xs tracking-widest ${toast.type === 'error' || toast.type === 'warning' ? 'text-red-500' : 'text-white'}`}>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Barra di Navigazione Superiore */}
      <div className="w-full max-w-sm flex justify-start items-center mb-6 px-2 mt-8 sm:mt-0 h-12">
         {view !== 'HOME' && (
           <button onClick={() => setView('HOME')} className="text-wax-orange flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-zinc-700 shadow-xl transition-all hover:bg-zinc-700 active:scale-95">
             <span className="text-xs font-black tracking-[0.15em] uppercase">{t("back_home")}</span>
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
