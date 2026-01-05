
import React, { useMemo, useState } from 'react';
import { FinishedProduct, Currency, View } from '../types';
import { getCurrencySymbol } from '../utils/i18n';
import { FileText, Share2, Download, ArrowLeft, TrendingUp, Package, Percent, Check, Loader2 } from 'lucide-react';

interface WarehouseReportProps {
  products: FinishedProduct[];
  currency: Currency;
  setView: (view: View) => void;
  t: (key: string) => string;
}

const WarehouseReport: React.FC<WarehouseReportProps> = ({ products, currency, setView, t }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const symbol = getCurrencySymbol(currency);

  const reportData = useMemo(() => {
    return products.map(p => {
      const history = p.history || [];
      const sales = history.filter(h => h.type === 'SALE').length;
      const returns = history.filter(h => h.type === 'RETURN').length;
      
      const returnRate = sales > 0 ? (returns / sales) * 100 : 0;
      const netUnits = sales - returns;
      const margin = (p.sellingPrice || 0) - (p.costPerUnit || 0);
      const totalProfit = netUnits * margin;

      return {
        id: p.id,
        name: p.name,
        stock: p.quantity,
        returnRate,
        profit: totalProfit,
        sales,
        returns
      };
    });
  }, [products]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      stock: acc.stock + curr.stock,
      profit: acc.profit + curr.profit,
      sales: acc.sales + curr.sales,
      returns: acc.returns + curr.returns
    }), { stock: 0, profit: 0, sales: 0, returns: 0 });
  }, [reportData]);

  const handleShare = async () => {
    let text = `📦 WAXPRO MANAGER - REPORT MAGAZZINO\n`;
    text += `📅 Data: ${new Date().toLocaleDateString()}\n`;
    text += `--------------------------------\n`;
    
    reportData.forEach(p => {
      text += `📍 ${p.name.toUpperCase()}\n`;
      text += `   📦 Giacenza: ${p.stock} pz\n`;
      text += `   🔄 Reso: ${p.returnRate.toFixed(1)}%\n`;
      text += `   💰 Profitto: ${symbol} ${p.profit.toFixed(2)}\n`;
      text += `--------------------------------\n`;
    });

    text += `🔥 TOTALI GENERALI\n`;
    text += `📦 Stock Totale: ${totals.stock} pz\n`;
    text += `💰 Profitto Totale: ${symbol} ${totals.profit.toFixed(2)}\n`;
    text += `--------------------------------\n`;
    text += `Powered by WaxPro Manager`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Report Magazzino WaxPro', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-to-download');
    if (!element) return;

    setIsGenerating(true);
    
    // Aggiungiamo temporaneamente la classe per il tema chiaro nel PDF
    element.classList.add('pdf-export-mode');

    const opt = {
      margin: 10,
      filename: `Report_WaxPro_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#f8f9fa', 
        logging: false 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      window.print();
    } finally {
      // Rimuoviamo la classe dopo la generazione
      element.classList.remove('pdf-export-mode');
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* HEADER AZIONI (NO-PRINT) */}
      <div className="flex items-center justify-between px-2 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('FINISHED_PRODUCTS')} className="text-zinc-500 hover:text-white p-2 transition-colors">
            <ArrowLeft size={28} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Report Generale</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleShare} 
            className={`p-3 rounded-2xl transition-all border ${copied ? 'bg-green-600 text-white border-green-500' : 'bg-zinc-800 text-wax-orange border-zinc-700'}`}
            title="Condividi"
          >
            {copied ? <Check size={24} /> : <Share2 size={24} />}
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className={`p-3 px-6 rounded-2xl bg-wax-orange text-zinc-900 border border-wax-orange shadow-lg hover:scale-105 transition-all flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
            title="Genera PDF"
          >
            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
            <span className="font-black text-sm uppercase tracking-[0.2em]">PDF</span>
          </button>
        </div>
      </div>

      {/* AREA REPORT (Questa verrà catturata per il PDF) */}
      <div id="report-to-download" className="space-y-6 bg-app-dark p-2 rounded-3xl transition-colors">
        {/* TITOLO "WAX PRO" VISIBILE NEL REPORT E NEL PDF */}
        <div className="text-center py-6 border-b border-zinc-800 mb-4 transition-colors">
          <h1 className="text-wax-orange text-4xl font-black tracking-[0.3em] uppercase italic">WAX PRO</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2 transition-colors">Inventory Report</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="app-card p-6 border-wax-orange/30 flex items-center gap-5 transition-colors">
             <div className="p-4 bg-wax-orange/10 rounded-3xl text-wax-orange transition-colors"><TrendingUp size={32} /></div>
             <div>
               <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] transition-colors">Profitto Totale Cumulato</span>
               <div className="text-3xl font-black text-white italic tracking-tighter transition-colors">{symbol} {totals.profit.toFixed(2)}</div>
             </div>
          </div>
          <div className="app-card p-6 border-zinc-800 flex items-center gap-5 transition-colors">
             <div className="p-4 bg-zinc-800 rounded-3xl text-zinc-400 transition-colors"><Package size={32} /></div>
             <div>
               <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] transition-colors">Pezzi Totali Stock</span>
               <div className="text-3xl font-black text-white italic tracking-tighter transition-colors">{totals.stock} <span className="text-sm font-normal text-zinc-600 uppercase">pz</span></div>
             </div>
          </div>
        </div>

        <div className="app-card overflow-hidden border-zinc-800 bg-zinc-900/40 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 transition-colors">
                  <th className="px-6 py-5">Prodotto</th>
                  <th className="px-6 py-5 text-center">Giacenza</th>
                  <th className="px-6 py-5 text-center">% Reso</th>
                  <th className="px-6 py-5 text-right">Guadagno ({symbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 transition-colors">
                {reportData.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white group-hover:text-wax-orange transition-colors">{p.name}</div>
                      <div className="text-[9px] text-zinc-600 font-bold uppercase mt-1 transition-colors">Venduti: {p.sales} | Resi: {p.returns}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${p.stock <= 5 ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Percent size={12} className="text-zinc-600 transition-colors" />
                        <span className={`font-bold transition-colors ${p.returnRate > 10 ? 'text-red-400' : 'text-zinc-400'}`}>{p.returnRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black italic text-wax-orange transition-colors">
                      {symbol} {p.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {reportData.length > 0 && (
                <tfoot>
                  <tr className="bg-wax-orange/5 font-black uppercase tracking-widest text-[10px] transition-colors">
                    <td className="px-6 py-6 text-zinc-500 transition-colors">TOTALE GENERALE</td>
                    <td className="px-6 py-6 text-center text-white text-lg italic transition-colors">{totals.stock}</td>
                    <td className="px-6 py-6"></td>
                    <td className="px-6 py-6 text-right text-wax-orange text-xl italic transition-colors">{symbol} {totals.profit.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {reportData.length === 0 && (
            <div className="py-20 text-center text-zinc-600 space-y-3">
               <Package size={48} className="mx-auto opacity-10" />
               <p className="text-xs uppercase font-black tracking-widest">Nessun dato disponibile</p>
            </div>
          )}
        </div>

        <div className="mt-10">
           <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden group transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-wax-orange/5 rounded-full -mr-16 -mt-16 blur-3xl transition-colors" />
              <h4 className="text-zinc-400 font-black text-xs uppercase tracking-[0.3em] mb-4 transition-colors">Nota Informativa</h4>
              <p className="text-zinc-500 text-xs leading-relaxed italic transition-colors">
                Il guadagno visualizzato viene calcolato sottraendo il costo di produzione al prezzo di vendita, moltiplicato per le unità effettivamente vendute (Vendite lorde - Resi).
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseReport;
