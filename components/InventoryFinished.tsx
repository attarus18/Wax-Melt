
import React, { useState } from 'react';
import { FinishedProduct, TransactionType, Currency, Language } from '../types';
import { getCurrencySymbol } from '../utils/i18n';
import { Package, ShoppingCart, Trash2, Plus, X, RefreshCw, RotateCcw, AlertTriangle, BarChart3, BellRing, Settings } from 'lucide-react';

interface InventoryFinishedProps {
  products: FinishedProduct[];
  onAdd: (product: FinishedProduct) => void;
  onUpdate: (product: FinishedProduct) => void;
  onTransaction: (id: string, type: TransactionType) => void;
  onDelete: (id: string) => void;
  onShowStats: (id: string) => void;
  t: (key: string) => string;
  currency: Currency;
  lang: Language;
}

const InventoryFinished: React.FC<InventoryFinishedProps> = ({ 
  products, onAdd, onUpdate, onTransaction, onDelete, onShowStats, t, currency, lang 
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinishedProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<FinishedProduct | null>(null);
  const symbol = getCurrencySymbol(currency);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '' as string | number,
    reorderLevel: '5' as string | number,
    costPerUnit: '' as string | number,
    sellingPrice: '' as string | number,
    containerSize: 200,
    fragrancePercentage: 10
  });

  const handleAdd = () => {
    if (newProduct.name && newProduct.quantity !== '') {
      onAdd({
        name: newProduct.name,
        quantity: Number(newProduct.quantity) || 0,
        reorderLevel: Number(newProduct.reorderLevel) || 0,
        costPerUnit: Number(newProduct.costPerUnit) || 0,
        sellingPrice: Number(newProduct.sellingPrice) || 0,
        containerSize: newProduct.containerSize,
        fragrancePercentage: newProduct.fragrancePercentage,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        history: []
      });
      setShowAdd(false);
      setNewProduct({ name: '', quantity: '', reorderLevel: '5', costPerUnit: '', sellingPrice: '', containerSize: 200, fragrancePercentage: 10 });
    }
  };

  const handleUpdate = () => {
    if (editingProduct) {
      onUpdate(editingProduct);
      setEditingProduct(null);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setProductToDelete(null);
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Modal di Conferma Cancellazione */}
      {productToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setProductToDelete(null)} />
          <div className="app-card w-full max-w-xs p-6 relative z-10 animate-in zoom-in-95 duration-200 border-red-500/50">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg uppercase tracking-wider">{t("confirm_action")}</h3>
                <p className="text-zinc-400 text-sm mt-2">
                  {t("conferma_elimina")} <span className="text-white font-bold">"{productToDelete.name}"</span>?
                </p>
                <p className="text-red-400/60 text-[10px] uppercase font-bold mt-1 tracking-widest">{t("delete_irreversible")}</p>
              </div>
              <div className="flex w-full gap-3 pt-2">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                >
                  {t("no")}
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all active:scale-95"
                >
                  {t("si_elimina")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal di Modifica Prodotto */}
      {editingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingProduct(null)} />
          <div className="app-card w-full max-w-md p-6 relative z-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-wax-orange font-bold text-xl uppercase tracking-wider">Modifica Prodotto</h3>
              <button 
                onClick={() => setProductToDelete(editingProduct)}
                className="text-zinc-500 hover:text-red-500 p-2 transition-colors"
                title={t("conferma_elimina")}
              >
                <Trash2 size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">{t("nome_prodotto")}</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="app-input"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t("costo")} ({symbol})</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingProduct.costPerUnit}
                  onChange={e => setEditingProduct({...editingProduct, costPerUnit: Number(e.target.value)})}
                  className="app-input"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t("prezzo")} ({symbol})</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingProduct.sellingPrice}
                  onChange={e => setEditingProduct({...editingProduct, sellingPrice: Number(e.target.value)})}
                  className="app-input border-wax-orange/30"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t("reorder_level")}</label>
                <input 
                  type="number" 
                  value={editingProduct.reorderLevel}
                  onChange={e => setEditingProduct({...editingProduct, reorderLevel: Number(e.target.value)})}
                  className="app-input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-zinc-800 text-zinc-400 hover:text-white"
              >
                {t("annulla")}
              </button>
              <button 
                onClick={handleUpdate}
                className="flex-1 py-3 rounded-xl font-bold bg-wax-orange text-zinc-900 shadow-lg active:scale-95"
              >
                {t("salva")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-white">{t("finished_prod_btn")}</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-wax-orange text-zinc-900 p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          {showAdd ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showAdd && (
        <div className="app-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-wax-orange text-lg">{t("nuovo_prodotto")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">{t("nome_prodotto")}</label>
              <input 
                type="text" 
                placeholder="es: Candela Lavanda"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">{t("quantita")}</label>
              <input 
                type="number" 
                placeholder="es: 10"
                value={newProduct.quantity}
                onFocus={(e) => e.target.select()}
                onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">{t("reorder_level")}</label>
              <input 
                type="number" 
                placeholder="es: 5"
                value={newProduct.reorderLevel}
                onFocus={(e) => e.target.select()}
                onChange={e => setNewProduct({...newProduct, reorderLevel: e.target.value})}
                className="app-input border-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">{t("costo")} ({symbol})</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={newProduct.costPerUnit}
                onFocus={(e) => e.target.select()}
                onChange={e => setNewProduct({...newProduct, costPerUnit: e.target.value})}
                className="app-input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">{t("prezzo")} ({symbol})</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={newProduct.sellingPrice}
                onFocus={(e) => e.target.select()}
                onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})}
                className="app-input border-wax-orange/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">{t("annulla")}</button>
            <button onClick={handleAdd} className="app-button px-8">{t("salva")}</button>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-zinc-800/30 rounded-2xl border-2 border-dashed border-zinc-700">
          <Package className="mx-auto mb-2 opacity-20" size={48} />
          <p>{t("nessun_prodotto")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => {
            const isLowStock = p.quantity <= (p.reorderLevel || 0);
            return (
              <div key={p.id} className={`app-card overflow-hidden flex flex-col transition-colors ${isLowStock ? 'border-red-500/60' : 'border-wax-orange/40'}`}>
                <div className="p-5 flex-grow relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    {isLowStock && (
                      <div className="p-1.5 rounded-full bg-red-500/20 text-red-500 animate-pulse-red" title={t("reorder_alert")}>
                        <BellRing size={20} />
                      </div>
                    )}
                    <button 
                      onClick={() => onShowStats(p.id)}
                      className={`p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors text-wax-orange`}
                      title={t("statistiche")}
                    >
                      <BarChart3 size={28} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6 pr-20">
                    <button 
                      onClick={() => setEditingProduct(p)} 
                      className="text-zinc-600 hover:text-wax-orange transition-colors shrink-0"
                      title="Impostazioni"
                    >
                      <Settings size={22} />
                    </button>
                    <h3 className="font-bold text-xl text-white leading-tight">{p.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2 bg-black/40 rounded-xl flex flex-col items-center border border-zinc-800">
                      <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-wider">{t("costo")}</span>
                      <span className="text-sm font-bold text-zinc-300">{symbol} {p.costPerUnit?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="p-2 bg-wax-orange/10 rounded-xl flex flex-col items-center border border-wax-orange/20">
                      <span className="text-[8px] font-bold uppercase text-wax-orange/70 tracking-wider">{t("prezzo")}</span>
                      <span className="text-sm font-bold text-wax-orange">{symbol} {p.sellingPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-zinc-900/80 space-y-3 border-t border-wax-orange/10">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${isLowStock ? 'text-red-400' : 'text-zinc-500'}`}>{t("giacenza")}</span>
                      <div className={`text-2xl font-black ${isLowStock ? 'text-red-500' : 'text-white'}`}>{p.quantity} <span className="text-xs font-normal text-zinc-500">pz</span></div>
                    </div>
                    <button 
                      onClick={() => onTransaction(p.id, 'SALE')}
                      disabled={p.quantity <= 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                        p.quantity > 0 
                        ? 'app-button shadow-lg active:scale-95' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {t("vendi")}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => onTransaction(p.id, 'RESTOCK')}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl font-bold bg-zinc-700 text-white hover:bg-zinc-600 transition-colors active:scale-95"
                    >
                      <RefreshCw size={16} />
                      {t("carico")}
                    </button>
                    <button 
                      onClick={() => onTransaction(p.id, 'RETURN')}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl font-bold bg-zinc-700 text-white hover:bg-zinc-600 transition-colors active:scale-95"
                    >
                      <RotateCcw size={16} />
                      {t("reso")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryFinished;
