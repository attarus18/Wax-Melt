
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Home from './components/Home';
import Calculator from './components/Calculator';
import ProductionCost from './components/ProductionCost';
import InventoryFinished from './components/InventoryFinished';
import ProductStatistics from './components/ProductStatistics';
import WarehouseReport from './components/WarehouseReport';
import Settings from './components/Settings';
import { View, InventoryState, FinishedProduct, TransactionType, Language, Currency, UserProfile } from './types';
import { loadFromDB, saveToDB, clearDB } from './utils/storage';
import { getTranslation } from './utils/i18n';
import { GoogleGenAI } from "@google/genai";
import { CheckCircle2, Globe, Coins, AlertCircle, RefreshCw, ShieldCheck, Lock, Check } from 'lucide-react';
import { supabase, syncDataToCloud, fetchDataFromCloud, updateAccountPassword } from './utils/supabase';

const App: React.FC = () => {
  const checkRecovery = () => {
    return window.location.hash.includes('type=recovery') || 
           window.location.search.includes('type=recovery') ||
           window.location.hash.includes('access_token=');
  };

  const [view, setView] = useState<View>('HOME');
  const [state, setState] = useState<InventoryState>({ 
    finishedProducts: [], 
    rawMaterials: [],
    settings: { language: 'it', currency: 'EUR' },
    lastSynced: undefined
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'LANG' | 'CURR' | null>(null);
  
  const [isRecovering, setIsRecovering] = useState(checkRecovery());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const stateRef = useRef(state);
  const userRef = useRef(user);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
    document.documentElement.dir = state.settings?.language === 'ar' ? 'rtl' : 'ltr';
  }, [state]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const persistData = useCallback(async (forceCloud = false) => {
    const currentState = stateRef.current;
    const currentUser = userRef.current;
    
    await saveToDB(currentState);
    
    if (currentUser) {
      if (forceCloud) {
        setIsSyncing(true);
        const result = await syncDataToCloud(currentUser.id, currentState);
        if (result.success) {
          showNotification("Sincronizzato!");
          setState(prev => ({ ...prev, lastSynced: Date.now() }));
        } else {
          showNotification("Errore cloud", "error");
        }
        setIsSyncing(false);
      } else {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
          if (!userRef.current) return;
          setIsSyncing(true);
          const res = await syncDataToCloud(userRef.current.id, stateRef.current);
          if (res.success) {
             setState(prev => ({ ...prev, lastSynced: Date.now() }));
          }
          setIsSyncing(false);
        }, 3000);
      }
    }
  }, []);

  const updateState = (newState: InventoryState, skipCloud = false) => {
    setState(newState);
    stateRef.current = newState;
    if (!skipCloud) {
      persistData(false);
    } else {
      saveToDB(newState);
    }
  };

  // Funzione per convertire i prezzi utilizzando Gemini AI + Google Search
  const handleCurrencyUpdate = async (newCurrency: Currency) => {
    const oldCurrency = state.settings?.currency || 'EUR';
    if (oldCurrency === newCurrency) return;

    setIsConverting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Qual è il tasso di cambio attuale da ${oldCurrency} a ${newCurrency}? Rispondi ESCLUSIVAMENTE con il numero decimale (es. 1.08).`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const rate = parseFloat(response.text?.trim() || "1");
      
      if (isNaN(rate) || rate === 0) throw new Error("Tasso di cambio non valido");

      const convertedProducts = state.finishedProducts.map(p => ({
        ...p,
        costPerUnit: (p.costPerUnit || 0) * rate,
        sellingPrice: (p.sellingPrice || 0) * rate
      }));

      const convertedMaterials = state.rawMaterials.map(m => ({
        ...m,
        unitPrice: (m.unitPrice || 0) * rate
      }));

      updateState({
        ...state,
        finishedProducts: convertedProducts,
        rawMaterials: convertedMaterials,
        settings: {
          ...state.settings!,
          currency: newCurrency
        }
      });

      showNotification(`Convertito con tasso: ${rate.toFixed(4)}`);
    } catch (error) {
      console.error("Errore conversione:", error);
      showNotification("Errore recupero tasso di cambio", "error");
      // Aggiorniamo comunque la valuta visiva anche se il calcolo fallisce
      updateState({
        ...state,
        settings: { ...state.settings!, currency: newCurrency }
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsSyncing(true);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      
      await supabase.auth.signOut();
      
      const cleanState: InventoryState = { 
        finishedProducts: [], 
        rawMaterials: [], 
        settings: stateRef.current.settings 
      };
      
      userRef.current = null;
      setUser(null);
      updateState(cleanState, true);
      await clearDB();
      
      setView('HOME');
      showNotification("Sessione chiusa", "warning");
    } catch (e) {
      console.error("Errore logout:", e);
      setUser(null);
      userRef.current = null;
      setView('HOME');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearData = async () => {
    try {
      await clearDB();
      const resetState: InventoryState = { 
        finishedProducts: [], 
        rawMaterials: [], 
        settings: state.settings 
      };
      updateState(resetState);
      setView('HOME');
      showNotification("Database resettato", "success");
    } catch (e) {
      showNotification("Errore reset", "error");
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification("Password non uguali", "error");
      return;
    }
    setRecoveryLoading(true);
    try {
      const { error } = await updateAccountPassword(newPassword);
      if (error) throw error;
      showNotification("Password aggiornata!");
      setIsRecovering(false);
      window.location.hash = '';
      setView('HOME');
    } catch (e: any) {
      showNotification(e.message || "Errore ripristino", "error");
    } finally {
      setRecoveryLoading(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const localData = await loadFromDB();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = { id: session.user.id, email: session.user.email || '' };
        setUser(profile);
        userRef.current = profile;
        
        setIsSyncing(true);
        const cloudData = await fetchDataFromCloud(session.user.id);
        if (cloudData) {
          const merged = { ...localData, ...cloudData };
          setState(merged);
          stateRef.current = merged;
        } else {
          setState(localData);
          stateRef.current = localData;
        }
        setIsSyncing(false);
      } else {
        setState(localData);
        stateRef.current = localData;
      }
      
      if (!localData.settings?.language) setOnboardingStep('LANG');
      else if (!localData.settings?.currency) setOnboardingStep('CURR');
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = { id: session.user.id, email: session.user.email || '' };
        setUser(profile);
        userRef.current = profile;
        if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
        if (event === 'SIGNED_IN') {
           setIsSyncing(true);
           const cloud = await fetchDataFromCloud(session.user.id);
           if (cloud) updateState(cloud);
           setIsSyncing(false);
        }
      } else {
        setUser(null);
        userRef.current = null;
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const lang = state.settings?.language || 'it';
  const t = (key: string) => getTranslation(lang, key);

  const renderView = () => {
    const commonProps = { setView, t, lang, currency: state.settings?.currency || 'EUR' };
    switch(view) {
      case 'HOME': return <Home {...commonProps} user={user} />;
      case 'CALCULATOR': return <Calculator {...commonProps} />;
      case 'PRODUCTION_COST': return <ProductionCost {...commonProps} />;
      case 'FINISHED_PRODUCTS': return (
        <InventoryFinished {...commonProps} products={state.finishedProducts} onAdd={p => updateState({ ...state, finishedProducts: [...state.finishedProducts, p] })} onUpdate={p => updateState({ ...state, finishedProducts: state.finishedProducts.map(old => old.id === p.id ? p : old) })} onTransaction={(id, type) => {
           updateState({ ...state, finishedProducts: state.finishedProducts.map(p => p.id === id ? { ...p, quantity: type === 'SALE' ? Math.max(0, p.quantity - 1) : p.quantity + 1, history: [...(p.history || []), { id: crypto.randomUUID(), type, timestamp: Date.now() }] } : p)});
        }} onDelete={id => updateState({ ...state, finishedProducts: state.finishedProducts.filter(p => p.id !== id) })} onShowStats={id => { setSelectedProductId(id); setView('PRODUCT_STATS'); }} />
      );
      case 'PRODUCT_STATS':
        const product = state.finishedProducts.find(p => p.id === selectedProductId);
        return product ? <ProductStatistics {...commonProps} product={product} /> : <Home {...commonProps} user={user} />;
      case 'WAREHOUSE_REPORT':
        return <WarehouseReport {...commonProps} products={state.finishedProducts} />;
      case 'SETTINGS': return (
        <Settings 
          {...commonProps} 
          user={user} 
          isSyncing={isSyncing} 
          isConverting={isConverting} 
          lastSynced={state.lastSynced} 
          onSyncNow={() => persistData(true)} 
          onLogout={handleLogout} 
          onUpdateSettings={settings => {
            if (settings.currency !== state.settings?.currency) {
              handleCurrencyUpdate(settings.currency);
            } else {
              updateState({...state, settings});
            }
          }} 
          onClearData={handleClearData} 
        />
      );
      default: return <Home {...commonProps} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-app-dark flex flex-col items-center p-4 relative overflow-x-hidden">
      {onboardingStep && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-app-dark/95 backdrop-blur-xl">
          <div className="app-card w-full max-w-sm p-8 flex flex-col items-center text-center">
            {onboardingStep === 'LANG' ? (
              <div className="w-full">
                <Globe className="text-wax-orange mb-6 mx-auto" size={48} />
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter italic">LINGUA</h2>
                <div className="grid grid-cols-2 gap-2">
                  {['it', 'en', 'fr', 'de', 'es', 'ar', 'zh'].map(l => (
                    <button key={l} onClick={() => { updateState({ ...state, settings: { language: l as Language, currency: 'EUR' } }); setOnboardingStep('CURR'); }} className="py-4 rounded-xl bg-zinc-800 font-bold border border-zinc-700">{l.toUpperCase()}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <Coins className="text-wax-orange mb-6 mx-auto" size={48} />
                <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter italic">VALUTA</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { updateState({ ...state, settings: { ...state.settings!, currency: 'EUR' } }); setOnboardingStep(null); }} className="p-6 rounded-2xl bg-zinc-800 border-2 border-transparent hover:border-wax-orange"><span className="text-4xl font-black text-wax-orange">€</span></button>
                  <button onClick={() => { updateState({ ...state, settings: { ...state.settings!, currency: 'USD' } }); setOnboardingStep(null); }} className="p-6 rounded-2xl bg-zinc-800 border-2 border-transparent hover:border-wax-orange"><span className="text-4xl font-black text-wax-orange">$</span></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top-10 fade-in"><div className={`bg-zinc-900 border-2 ${toast.type === 'error' ? 'border-red-500' : 'border-wax-orange'} px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl`}><span className={`font-bold uppercase text-xs tracking-widest ${toast.type === 'error' ? 'text-red-500' : 'text-white'}`}>{toast.message}</span></div></div>)}
      <div className="w-full max-w-sm flex justify-start items-center mb-6 px-2 mt-8 h-12 no-print">{view !== 'HOME' && (<button onClick={() => setView('HOME')} className="text-wax-orange flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-zinc-700 transition-all active:scale-95"><span className="text-xs font-black tracking-widest uppercase">Home</span></button>)}</div>
      <main className="w-full flex-grow flex flex-col items-center">{renderView()}</main>
    </div>
  );
};

export default App;
