
import React, { useState } from 'react';
import { FinishedProduct, TransactionType, Currency, Language } from '../types';
import { getCurrencySymbol } from '../utils/i18n';
import { Package, ShoppingCart, Trash2, Plus, X, RefreshCw, RotateCcw, AlertTriangle, BarChart3, BellRing, Settings, FileText } from 'lucide-react';

interface InventoryFinishedProps {
  products: FinishedProduct[];
  onAdd: (product: FinishedProduct) => void;
  onUpdate: (product: FinishedProduct) => void;
  onTransaction: (id: string, type: TransactionType) => void;
  onDelete: (id: string) => void;
  onShowStats: (id: string) => void;
  setView: (view: any) => void;
  t: (key: string) => string;
  currency: Currency;
  lang: Language;
}

const InventoryFinished: React.FC<InventoryFinishedProps> = ({ 
  products, onAdd, onUpdate, onTransaction, onDelete, onShowStats, setView, t, currency, lang 
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
      {productToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setProductToDelete(null)} />
          <div className="app-card w-full max-w-xs p-8 relative z-10 animate-in zoom-in-95 border-red-500/50">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertTriangle className="text-red-500" size={40} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg uppercase">{t("confirm_action")}</h3>
                <p className="text-zinc-400 text-sm mt-2">
                  {t("conferma_elimina")} <span className="text-white font-bold">"{productToDelete.name}"</span>?
                </p>
              </div>
              <div className="flex w-full gap-3 pt-4">
                <button onClick={() => setProductToDelete(null)} className="flex-1 py-4 rounded-xl font-black bg-zinc-800 text-zinc-400">{t("no")}</button>
                <button onClick={confirmDelete} className="flex-1 py-4 rounded-xl font-black bg-red-600 text-white shadow-lg">{t("si_elimina")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingProduct(null)} />
          <div className="app-card w-full max-w-md p-8 relative z-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-wax-orange font-black text-2xl uppercase italic tracking-tighter">Modifica Prodotto</h3>
              <button onClick={() => setProductToDelete(editingProduct)} className="text-zinc-500 hover:text-red-500 p-2 transition-colors"><Trash2 size={24} /></button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="app-label">{t("nome_prodotto")}</label>
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="app-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="app-label">{t("costo")} ({symbol})</label>
                  <input type="number" step="0.01" value={editingProduct.costPerUnit} onChange={e => setEditingProduct({...editingProduct, costPerUnit: Number(e.target.value)})} className="app-input" />
                </div>
                <div>
                  <label className="app-label">{t("prezzo")} ({symbol})</label>
                  <input type="number" step="0.01" value={editingProduct.sellingPrice} onChange={e => setEditingProduct({...editingProduct, sellingPrice: Number(e.target.value)})} className="app-input" />
                </div>
              </div>
              <div>
                <label className="app-label">{t("reorder_level")}</label>
                <input type="number" value={editingProduct.reorderLevel} onChange={e => setEditingProduct({...editingProduct, reorderLevel: Number(e.target.value)})} className="app-input" />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 rounded-2xl font-black bg-zinc-800 text-zinc-500">{t("annulla")}</button>
              <button onClick={handleUpdate} className="flex-1 py-4 rounded-2xl font-black bg-wax-orange text-zinc-900 shadow-xl">{t("salva")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 px-2">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t("finished_prod_btn")}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('WAREHOUSE_REPORT')}
              className="bg-zinc-800 text-wax-orange p-3 rounded-2xl shadow-lg border border-zinc-700 hover:scale-105 transition-transform flex items-center gap-2"
              title="Report Generale"
            >
              <FileText size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Report</span>
            </button>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="bg-wax-orange text-zinc-900 p-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              {showAdd ? <X size={24} /> : <Plus size={24} />}
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="app-card p-8 space-y-6 animate-in fade-in slide-in-from-top-4 mx-2">
          <h3 className="font-black text-wax-orange text-xl uppercase italic tracking-tighter">{t("nuovo_prodotto")}</h3>
          <div className="space-y-4">
            <div>
              <label className="app-label">{t("nome_prodotto")}</label>
              <input type="text" placeholder="es: Candela Lavanda" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="app-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="app-label">{t("quantita")}</label>
                <input type="number" placeholder="es: 10" value={newProduct.quantity} onFocus={(e) => e.target.select()} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} className="app-input" />
              </div>
              <div>
                <label className="app-label">{t("reorder_level")}</label>
                <input type="number" placeholder="es: 5" value={newProduct.reorderLevel} onFocus={(e) => e.target.select()} onChange={e => setNewProduct({...newProduct, reorderLevel: e.target.value})} className="app-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="app-label">{t("costo")} ({symbol})</label>
                <input type="number" step="0.01" placeholder="0.00" value={newProduct.costPerUnit} onFocus={(e) => e.target.select()} onChange={e => setNewProduct({...newProduct, costPerUnit: e.target.value})} className="app-input" />
              </div>
              <div>
                <label className="app-label">{t("prezzo")} ({symbol})</label>
                <input type="number" step="0.01" placeholder="0.00" value={newProduct.sellingPrice} onFocus={(e) => e.target.select()} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} className="app-input" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button onClick={handleAdd} className="app-button">{t("salva")}</button>
            <button onClick={() => setShowAdd(false)} className="py-4 text-zinc-500 font-black uppercase text-xs tracking-widest">{t("annulla")}</button>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="py-24 text-center text-zinc-600 bg-zinc-900/40 rounded-3xl border-2 border-dashed border-zinc-800 mx-2">
          <Package className="mx-auto mb-4 opacity-10" size={64} />
          <p className="font-black uppercase tracking-widest text-xs">{t("nessun_prodotto")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
          {products.map(p => {
            const isLowStock = p.quantity <= (p.reorderLevel || 0);
            return (
              <div key={p.id} className={`app-card overflow-hidden flex flex-col transition-all duration-300 ${isLowStock ? 'border-red-500 shadow-[0_10px_40px_rgba(239,68,68,0.2)]' : 'border-wax-orange/40 hover:border-wax-orange shadow-2xl'}`}>
                <div className="p-6 flex-grow relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {isLowStock && (
                      <div className="p-2 rounded-full bg-red-500/20 text-red-500 animate-pulse-red" title={t("reorder_alert")}>
                        <BellRing size={20} />
                      </div>
                    )}
                    <button onClick={() => onShowStats(p.id)} className="p-2.5 rounded-2xl bg-zinc-800 text-wax-orange hover:bg-zinc-700 transition-colors" title={t("statistiche")}><BarChart3 size={24} /></button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-8 pr-24">
                    <button onClick={() => setEditingProduct(p)} className="p-2 bg-zinc-800 rounded-xl text-zinc-500 hover:text-wax-orange transition-colors"><Settings size={20} /></button>
                    <h3 className="font-black text-xl text-white italic tracking-tighter uppercase truncate">{p.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-col items-center">
                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-1">{t("costo")}</span>
                      <span className="text-lg font-black text-zinc-300">{symbol}{p.costPerUnit?.toFixed(2)}</span>
                    </div>
                    <div className="p-3 bg-wax-orange/5 rounded-2xl border border-wax-orange/20 flex flex-col items-center">
                      <span className="text-[8px] font-black uppercase text-wax-orange/70 tracking-widest mb-1">{t("prezzo")}</span>
                      <span className="text-lg font-black text-wax-orange">{symbol}{p.sellingPrice?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-zinc-900/90 space-y-4 border-t border-wax-orange/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`text-[9px] uppercase font-black tracking-[0.2em] ${isLowStock ? 'text-red-400' : 'text-zinc-500'}`}>{t("giacenza")}</span>
                      <div className={`text-4xl font-black italic tracking-tighter ${isLowStock ? 'text-red-500' : 'text-white'}`}>{p.quantity} <span className="text-sm font-normal text-zinc-500 not-italic uppercase tracking-widest ml-1">pz</span></div>
                    </div>
                    <button 
                      onClick={() => onTransaction(p.id, 'SALE')}
                      disabled={p.quantity <= 0}
                      className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all ${
                        p.quantity > 0 
                        ? 'bg-wax-orange text-zinc-900 shadow-xl shadow-wax-orange/20 hover:scale-[1.02] active:scale-95' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed grayscale'
                      }`}
                    >
                      <ShoppingCart size={20} />
                      {t("vendi")}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onTransaction(p.id, 'RESTOCK')} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-all uppercase tracking-widest"><RefreshCw size={16} />{t("carico")}</button>
                    <button onClick={() => onTransaction(p.id, 'RETURN')} className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-all uppercase tracking-widest"><RotateCcw size={16} />{t("reso")}</button>
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
