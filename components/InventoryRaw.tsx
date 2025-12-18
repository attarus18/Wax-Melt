
import React, { useState } from 'react';
import { RawMaterial, MaterialType, InventoryState } from '../types';
import { Plus, Trash2, Edit3, PackageOpen, Tag, Scale, DollarSign } from 'lucide-react';

interface InventoryRawProps {
  materials: RawMaterial[];
  onAdd: (material: RawMaterial) => void;
  onDelete: (id: string) => void;
}

const InventoryRaw: React.FC<InventoryRawProps> = ({ materials, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({
    name: '',
    type: 'WAX',
    quantity: 0,
    unitPrice: 0,
    unit: 'g'
  });

  const handleAdd = () => {
    if (newMaterial.name && newMaterial.type) {
      // For WAX we might input price per KG, but we store unit price (per g)
      let calculatedUnitPrice = newMaterial.unitPrice || 0;
      if (newMaterial.type === 'WAX' || newMaterial.type === 'FRAGRANCE' || newMaterial.type === 'DYE') {
        // Assume the user inputs "Price per KG or Liter"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Magazzino Materie Prime</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-gold hover:bg-gold/90 text-white p-2 rounded-full shadow-lg transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-700">Aggiungi Nuovo Materiale</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Nome Materiale"
              value={newMaterial.name}
              onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
              className="p-2 border border-slate-300 rounded-lg outline-none focus:border-gold"
            />
            <select 
              value={newMaterial.type}
              onChange={e => setNewMaterial({...newMaterial, type: e.target.value as MaterialType})}
              className="p-2 border border-slate-300 rounded-lg outline-none focus:border-gold"
            >
              <option value="WAX">Cera</option>
              <option value="FRAGRANCE">Fragranza</option>
              <option value="WICK">Stoppino</option>
              <option value="CONTAINER">Contenitore</option>
              <option value="PACKAGING">Packaging</option>
              <option value="DYE">Colore</option>
            </select>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Quantità"
                value={newMaterial.quantity || ''}
                onChange={e => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-gold"
              />
            </div>
            <input 
              type="number" 
              placeholder={newMaterial.type === 'WAX' || newMaterial.type === 'FRAGRANCE' ? 'Prezzo al KG/L' : 'Prezzo al PZ'}
              value={newMaterial.unitPrice || ''}
              onChange={e => setNewMaterial({...newMaterial, unitPrice: Number(e.target.value)})}
              className="p-2 border border-slate-300 rounded-lg outline-none focus:border-gold"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Annulla</button>
            <button onClick={handleAdd} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">Salva</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <PackageOpen className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nessun materiale in inventario. Aggiungine uno per iniziare.</p>
          </div>
        ) : (
          materials.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-start group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(m.type)}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.type}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800">{m.name}</h3>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Scale size={14} className="text-slate-400" />
                    <span className={`text-sm font-semibold ${m.quantity < 100 ? 'text-red-500' : 'text-slate-600'}`}>
                      {m.quantity.toFixed(0)} {m.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600">€ {(m.unitPrice * (m.unit === 'g/ml' ? 1000 : 1)).toFixed(2)} / {m.unit === 'g/ml' ? 'kg' : 'pz'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDelete(m.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryRaw;
