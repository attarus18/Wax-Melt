
import React, { useState, useMemo } from 'react';
import { FinishedProduct, View } from '../types';
// Rimosso DollarSign dagli import
import { Share2, ArrowLeft, Check, TrendingUp, RotateCcw, AlertCircle, BarChart3 } from 'lucide-react';
import { WaxProIcon } from './CustomIcons';

interface ProductStatisticsProps {
  product: FinishedProduct;
  setView: (view: View) => void;
}

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const ProductStatistics: React.FC<ProductStatisticsProps> = ({ product, setView }) => {
  const [period, setPeriod] = useState<Period>('MONTHLY');
  const [copied, setCopied] = useState(false);

  const periodData = useMemo(() => {
    const now = Date.now();
    const timeLimit = {
      DAILY: 7 * 24 * 60 * 60 * 1000,
      WEEKLY: 8 * 7 * 24 * 60 * 60 * 1000,
      MONTHLY: 12 * 30 * 24 * 60 * 60 * 1000,
      YEARLY: 5 * 365 * 24 * 60 * 60 * 1000
    }[period];

    const history = product.history || [];
    const filtered = history.filter(t => now - t.timestamp <= timeLimit);
    
    const sales = filtered.filter(t => t.type === 'SALE').length;
    const restocks = filtered.filter(t => t.type === 'RESTOCK').length;
    const returns = filtered.filter(t => t.type === 'RETURN').length;
    
    const netUnits = sales - returns;
    const revenue = netUnits * (product.sellingPrice || 0);

    return { 
      sales, 
      restocks, 
      returns, 
      revenue, 
      netUnits,
      totalMovements: sales + restocks + returns 
    };
  }, [product.history, product.sellingPrice, period]);

  const pieSlices = useMemo(() => {
    const { sales, restocks, returns, totalMovements } = periodData;
    if (totalMovements === 0) return [];

    let currentAngle = 0;
    const data = [
      { value: sales, color: '#f9a602', label: 'Vendite' },
      { value: restocks, color: '#22c55e', label: 'Riordini' },
      { value: returns, color: '#3b82f6', label: 'Resi' }
    ];

    return data.filter(d => d.value > 0).map(d => {
      const angle = (d.value / totalMovements) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const x1 = 50 + 42 * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = 50 + 42 * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = 50 + 42 * Math.cos((Math.PI * (currentAngle - 90)) / 180);
      const y2 = 50 + 42 * Math.sin((Math.PI * (currentAngle - 90)) / 180);
      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = `M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return { ...d, pathData, percentage: ((d.value / totalMovements) * 100).toFixed(1) };
    });
  }, [periodData]);

  const handleShare = async () => {
    const periodLabel = {
      DAILY: 'Ultimi 7 Giorni',
      WEEKLY: 'Ultime 8 Settimane',
      MONTHLY: 'Ultimi 12 Mesi',
      YEARLY: 'Ultimi 5 Anni'
    }[period];
    
    const text = `📊 WAXPRO MANAGER - REPORT VENDITE\n` +
                 `📦 Prodotto: ${product.name}\n` +
                 `📅 Periodo: ${periodLabel}\n` +
                 `------------------------------\n` +
                 `🛒 VENDITE: ${periodData.sales} pz\n` +
                 `🔄 RESI: ${periodData.returns} pz\n` +
                 `📦 RIORDINI: ${periodData.restocks} pz\n` +
                 `------------------------------\n` +
                 `💰 INCASSO VENDUTO: € ${periodData.revenue.toFixed(2)}\n` +
                 `📍 GIACENZA ATTUALE: ${product.quantity} pz`;

    try {
      if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        await navigator.share({ title: `WaxPro Report: ${product.name}`, text: text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (copyErr) {
        console.error("Errore condivisione:", copyErr);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('FINISHED_PRODUCTS')} className="text-zinc-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-wax-orange" size={32} /> {product.name}
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Performance e Venduto</p>
        </div>
      </div>

      <div className="flex bg-zinc-800 p-1 rounded-xl gap-1 shadow-inner">
        {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all ${
              period === p ? 'bg-wax-orange text-zinc-900 shadow-md scale-[1.02]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {p === 'DAILY' ? 'Giorno' : p === 'WEEKLY' ? 'Sett.' : p === 'MONTHLY' ? 'Mese' : 'Anno'}
          </button>
        ))}
      </div>

      <div className="app-card p-6 flex flex-col relative overflow-hidden min-h-[600px] border-wax-orange/30">
        <div className={`rounded-2xl p-6 mb-8 border transition-all duration-500 shadow-lg ${periodData.revenue >= 0 ? 'bg-zinc-900/60 border-wax-orange/20' : 'bg-red-900/20 border-red-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.15em]">Incasso Venduto Netto</span>
            {/* Rimosso il blocco con l'icona DollarSign qui */}
          </div>
          
          <div className={`text-5xl font-black mb-4 ${periodData.revenue >= 0 ? 'text-wax-orange' : 'text-red-500'}`}>
            € {periodData.revenue.toFixed(2)}
          </div>

          {!product.sellingPrice || product.sellingPrice === 0 ? (
            <div className="flex items-center gap-3 text-red-400 text-[10px] font-black bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-pulse">
              <AlertCircle size={18} /> PREZZO DI VENDITA NON IMPOSTATO! Modifica il prodotto per vedere l'incasso.
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
               <div className="flex justify-between items-center text-[10px] text-zinc-400">
                 <span className="font-medium uppercase tracking-wider">Formula Calcolo:</span>
                 <span className="bg-zinc-800 px-2 py-1 rounded-md">({periodData.sales} - {periodData.returns}) × {product.sellingPrice.toFixed(2)}€</span>
               </div>
               {periodData.returns > 0 && (
                 <div className="flex items-center gap-2 text-blue-400 text-[9px] font-bold uppercase italic tracking-wide">
                   <RotateCcw size={12} /> {periodData.returns} resi sottratti dall'incasso
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Vendite</div>
            <div className="text-xl font-black text-white">{periodData.sales}</div>
          </div>
          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Resi</div>
            <div className="text-xl font-black text-blue-400">{periodData.returns}</div>
          </div>
          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[8px] font-black uppercase mb-1">Riordini</div>
            <div className="text-xl font-black text-green-400">{periodData.restocks}</div>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center py-4">
          {pieSlices.length > 0 ? (
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                {pieSlices.map((slice, i) => (
                  <path
                    key={i}
                    d={slice.pathData}
                    fill={slice.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
                <circle cx="50" cy="50" r="30" fill="#18181b" />
                <text x="50" y="52" textAnchor="middle" fill="#52525b" fontSize="6" fontWeight="900" className="uppercase tracking-widest">Attività</text>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <BarChart3 className="text-wax-orange opacity-40" size={44} />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2 opacity-30">
              <TrendingUp size={48} className="mx-auto" />
              <p className="text-[10px] font-bold uppercase">Nessun dato per questo periodo</p>
            </div>
          )}
          
          <div className="mt-8 w-full grid grid-cols-1 gap-2">
            {pieSlices.map((slice, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }}></div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{slice.label}</span>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-white">{slice.value} units</span>
                   <span className="text-[8px] font-bold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{slice.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleShare}
          className={`mt-auto w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
            copied ? 'bg-green-600 text-white' : 'bg-white text-zinc-900 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {copied ? <Check size={20}/> : <Share2 size={24} />}
          {copied ? 'Copiato!' : 'Condividi Report'}
        </button>
      </div>
    </div>
  );
};

export default ProductStatistics;
