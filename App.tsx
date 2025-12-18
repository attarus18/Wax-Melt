
import React, { useState } from 'react';
import Home from './components/Home';
import Calculator from './components/Calculator';
import ProductionCost from './components/ProductionCost';
import InventoryRaw from './components/InventoryRaw';
import InventoryFinished from './components/InventoryFinished';
import Settings from './components/Settings';
import { View, InventoryState, RawMaterial, FinishedProduct } from './types';
import { loadState, saveState } from './utils/storage';
import { Box, Package, Settings as SettingsIcon, Home as HomeIcon } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [state, setState] = useState<InventoryState>(loadState());

  const updateState = (newState: InventoryState) => {
    setState(newState);
    saveState(newState);
  };

  const addRawMaterial = (material: RawMaterial) => {
    updateState({ ...state, materials: [...state.materials, material] });
  };

  const deleteRawMaterial = (id: string) => {
    updateState({ ...state, materials: state.materials.filter(m => m.id !== id) });
  };

  const addFinishedProduct = (product: FinishedProduct) => {
    updateState({ ...state, finishedProducts: [...state.finishedProducts, product] });
  };

  const sellProduct = (id: string) => {
    updateState({
      ...state,
      finishedProducts: state.finishedProducts.map(p => 
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p
      )
    });
  };

  const deleteProduct = (id: string) => {
    updateState({ ...state, finishedProducts: state.finishedProducts.filter(p => p.id !== id) });
  };

  const renderView = () => {
    switch(view) {
      case 'HOME':
        return <Home setView={setView} />;
      case 'CALCULATOR':
        return <Calculator setView={setView} onAddProduct={addFinishedProduct} />;
      case 'PRODUCTION_COST':
        return <ProductionCost setView={setView} />;
      case 'RAW_MATERIALS':
        return <InventoryRaw materials={state.materials} onAdd={addRawMaterial} onDelete={deleteRawMaterial} />;
      case 'FINISHED_PRODUCTS':
        return <InventoryFinished products={state.finishedProducts} onAdd={addFinishedProduct} onSell={sellProduct} onDelete={deleteProduct} />;
      case 'SETTINGS':
        return <Settings onClearData={() => {
          const fresh = { materials: [], finishedProducts: [] };
          updateState(fresh);
          setView('HOME');
        }} />;
      default:
        return <Home setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-app-dark flex flex-col items-center p-4">
      {view !== 'HOME' && (
        <div className="w-full max-w-sm flex justify-start items-center mb-4 px-2">
           <button onClick={() => setView('HOME')} className="text-wax-orange flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700 shadow-sm transition-all hover:bg-zinc-800">
             <HomeIcon size={18} /> <span className="text-xs font-bold tracking-widest uppercase">Indietro</span>
           </button>
        </div>
      )}

      <main className="w-full flex-grow">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
