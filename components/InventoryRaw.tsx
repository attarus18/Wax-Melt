
import React, { useState } from 'react';
import { RawMaterial, MaterialType, Currency } from '../types';
import { getCurrencySymbol } from '../utils/i18n';
import { Plus, Trash2, PackageOpen, Tag, Scale, X } from 'lucide-react';

interface InventoryRawProps {
  materials: RawMaterial[];
  onAdd: (material: RawMaterial) => void;
  onDelete: (id: string) => void;
  currency: Currency;
}

const InventoryRaw: React.FC<InventoryRawProps> = ({ materials, onAdd, onDelete, currency }) => {
  const [showAdd, setShowAdd] = useState(false);
  const symbol = getCurrencySymbol(currency);
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({
    name: '',
    type: 'WAX',
    quantity: 0,
    unitPrice: 0,
    unit: 'g'
  });

  const handleAdd = () => {
    if (newMaterial.name && newMaterial.type) {
      let calculatedUnitPrice = newMaterial.unitPrice || 0;
      if (newMaterial.type === 'WAX' || newMaterial.type === 'FRAGRANCE' || newMaterial.type === 'DYE') {
        calculatedUnitPrice = (newMaterial.unitPrice || 0) / 1000;
      }

      onAdd({
        ...newMaterial as RawMaterial,
        id: crypto.randomUUID(),
        unitPrice: calculatedUnitPrice,
        unit: (newMaterial.type === 'WAX' || newMaterial.type === 'FRAGRANCE' || newMaterial.type === 'DYE') ? 'g/ml' : 'pz'
      });
      setShowAdd(false);
      setNewMaterial({ name: '', type: 'WAX', quantity: 0, unitPrice: 0 });
    }
  };

  const getIcon = (type: MaterialType) => {
    switch(type) {
      case 'WAX': return <Scale className="text-amber-600" size={18} />;
      case 'FRAGRANCE': return <PackageOpen className="text-purple-600" size={18} />;
      case 'WICK': return <Tag className="text-blue-600" size={18} />;
      case 'CONTAINER': return <PackageOpen className="text-slate-600" size={18} />;
      default: return <Tag className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Materie Prime</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-wax-orange text-zinc-900 p-2 rounded-full shadow-lg"
        >
          {showAdd ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showAdd && (
        <div className="app-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-black text-wax-orange text-xs uppercase tracking-widest">Nuovo Materiale</h3>
          <div className="grid grid-cols-1 gap-4">
            <input 
              type="text" 
              placeholder="Nome"
              value={newMaterial.name}
              onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
              className="app-input"
            />
            <select 
              value={newMaterial.type}
              onChange={e => setNewMaterial({...newMaterial, type: e.target.value as MaterialType})}
              className="app-input"
            >
              <option value="WAX">Cera</option>
              <option value="FRAGRANCE">Fragranza</option>
              <option value="WICK">Stoppino</option>
              <option value="CONTAINER">Contenitore</option>
              <option value="PACKAGING">Packaging</option>
              <option value="DYE">Colore</option>
            </select>
            <input 
              type="number" 
              placeholder="Quantità"
              value={newMaterial.quantity || ''}
              onChange={e => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})}
              className="app-input"
            />
            <input 
              type="number" 
              placeholder={newMaterial.type === 'WAX' || newMaterial.type === 'FRAGRANCE' ? `Prezzo al KG/L (${symbol})` : `Prezzo al PZ (${symbol})`}
              value={newMaterial.unitPrice || ''}
              onChange={e => setNewMaterial({...newMaterial, unitPrice: Number(e.target.value)})}
              className="app-input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="text-zinc-500 text-xs font-bold uppercase">Annulla</button>
            <button onClick={handleAdd} className="app-button px-6 py-2 text-xs">Salva</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 px-2">
        {materials.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 bg-zinc-900/40 rounded-2xl border-2 border-dashed border-zinc-800">
            <PackageOpen className="mx-auto mb-2 opacity-20" size={40} />
            <p className="text-[10px] uppercase font-black tracking-widest">Nessun materiale</p>
          </div>
        ) : (
          materials.map(m => (
            <div key={m.id} className="app-card p-5 flex justify-between items-center border-zinc-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(m.type)}
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{m.type}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{m.name}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] font-black text-zinc-400">
                    {m.quantity.toFixed(0)} {m.unit}
                  </span>
                  <span className="text-[10px] text-wax-orange font-black">
                    {symbol} {(m.unitPrice * (m.unit === 'g/ml' ? 1000 : 1)).toFixed(2)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onDelete(m.id)}
                className="text-zinc-600 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryRaw;
