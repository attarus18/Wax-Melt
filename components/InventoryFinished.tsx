
import React, { useState } from 'react';
import { FinishedProduct } from '../types';
import { Package, ShoppingCart, Calendar, Info, Trash2, Plus, X } from 'lucide-react';

interface InventoryFinishedProps {
  products: FinishedProduct[];
  onAdd: (product: FinishedProduct) => void;
  onSell: (id: string) => void;
  onDelete: (id: string) => void;
}

const InventoryFinished: React.FC<InventoryFinishedProps> = ({ products, onAdd, onSell, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<FinishedProduct>>({
    name: '',
    quantity: 1,
    costPerUnit: 0,
    containerSize: 200,
    fragrancePercentage: 10
  });

  const handleAdd = () => {
    if (newProduct.name && newProduct.quantity !== undefined) {
      onAdd({
        ...newProduct as FinishedProduct,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      });
      setShowAdd(false);
      setNewProduct({ name: '', quantity: 1, costPerUnit: 0, containerSize: 200, fragrancePercentage: 10 });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-white">Prodotti Finiti</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-wax-orange text-zinc-900 p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          {showAdd ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showAdd && (
        <div className="app-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-wax-orange text-lg">Aggiungi Prodotto Manualmente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Nome Prodotto</label>
              <input 
                type="text" 
                placeholder="es: Candela Lavanda 200ml"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Quantità</label>
              <input 
                type="number" 
                value={newProduct.quantity}
                onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Costo Unitario (€)</label>
              <input 
                type="number" 
                step="0.01"
                value={newProduct.costPerUnit}
                onChange={e => setNewProduct({...newProduct, costPerUnit: Number(e.target.value)})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Dimensione (ml/g)</label>
              <input 
                type="number" 
                value={newProduct.containerSize}
                onChange={e => setNewProduct({...newProduct, containerSize: Number(e.target.value)})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">% Fragranza</label>
              <input 
                type="number" 
                value={newProduct.fragrancePercentage}
                onChange={e => setNewProduct({...newProduct, fragrancePercentage: Number(e.target.value)})}
                className="app-input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Annulla</button>
            <button onClick={handleAdd} className="app-button px-8">Salva Prodotto</button>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-zinc-800/30 rounded-2xl border-2 border-dashed border-zinc-700">
          <Package className="mx-auto mb-2 opacity-20" size={48} />
          <p>Nessun prodotto finito in magazzino.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="app-card overflow-hidden flex flex-col border-wax-orange/40">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-white">{p.name}</h3>
                  <button onClick={() => onDelete(p.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-500"><Info size={14}/> Formato</span>
                    <span className="font-medium text-zinc-300">{p.containerSize}ml | {p.fragrancePercentage}% fragr.</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-500"><Calendar size={14}/> Data</span>
                    <span className="font-medium text-zinc-300">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4 p-3 bg-black/40 rounded-xl flex justify-between items-center border border-wax-orange/10">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Costo Unitario</span>
                    <span className="text-xl font-bold text-wax-orange">€ {p.costPerUnit?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-zinc-900/80 flex justify-between items-center border-t border-wax-orange/10">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Giacenza</span>
                  <div className="text-2xl font-black text-white">{p.quantity} <span className="text-xs font-normal text-zinc-500">pz</span></div>
                </div>
                <button 
                  onClick={() => onSell(p.id)}
                  disabled={p.quantity <= 0}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${
                    p.quantity > 0 
                    ? 'app-button shadow-lg active:scale-95' 
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ShoppingCart size={18} />
                  Vendi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryFinished;
