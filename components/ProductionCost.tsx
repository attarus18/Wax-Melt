
import React, { useState } from 'react';
import { View, Currency } from '../types';
import { getCurrencySymbol } from '../utils/i18n';
import { 
  Flame, 
  Scissors, 
  Box, 
  Droplets, 
  Palette, 
  Truck, 
  Calculator, 
  RotateCcw,
  Share2,
  Check
} from 'lucide-react';

interface ProductionCostProps {
  setView: (view: View) => void;
  t: (key: string) => string;
  currency: Currency;
}

const ProductionCost: React.FC<ProductionCostProps> = ({ setView, t, currency }) => {
  const [costs, setCosts] = useState({
    wax: '',
    wick: '',
    container: '',
    fragrance: '',
    color: '',
    shipping: ''
  });
  const [total, setTotal] = useState<number | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const symbol = getCurrencySymbol(currency);

  const costIcons: Record<string, React.ReactNode> = {
    wax: <Flame size={20} />,
    wick: <Scissors size={20} />,
    container: <Box size={20} />,
    fragrance: <Droplets size={20} />,
    color: <Palette size={20} />,
    shipping: <Truck size={20} />
  };

  const calculate = () => {
    const values = (Object.values(costs) as string[]).map(v => parseFloat(v) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    setTotal(sum);
  };

  const handleShare = async () => {
    if (total === null) return;

    let itemsText = "";
    // Cast to [string, string][] to ensure key and value are recognized as strings for t() and parseFloat()
    (Object.entries(costs) as [string, string][]).forEach(([key, value]) => {
      if (value && parseFloat(value) > 0) {
        itemsText += `• ${t(key)}: ${symbol} ${parseFloat(value).toFixed(2)}\n`;
      }
    });

    const text = `📊 WAX PRO - ${t("prod_cost_btn")}\n` +
                 `--------------------------\n` +
                 itemsText +
                 `--------------------------\n` +
                 `💰 ${t("total_cost")}: ${symbol} ${total.toFixed(2)}\n\n` +
                 `Powered by WaxPro Manager`;

    try {
      if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `WAX PRO - Report Costi`,
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Errore condivisione:", err);
    }
  };

  const reset = () => {
    setCosts({ wax: '', wick: '', container: '', fragrance: '', color: '', shipping: '' });
    setTotal(null);
    setCopied(false);
  };

  return (
    <div className="flex justify-center py-4 w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="app-card w-full max-w-sm p-6 relative border-wax-orange/30">
        <h2 className="text-wax-orange text-center font-black text-xl mb-8 uppercase tracking-tighter italic">
          {t("prod_cost_btn")}
        </h2>

        <div className="space-y-5">
          {Object.keys(costs).map((key) => (
            <div key={key} className="group">
              <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest mb-2 transition-colors ${activeField === key ? 'text-wax-orange' : 'text-zinc-400'}`}>
                <span className={`transition-all duration-300 ${activeField === key ? 'text-wax-orange scale-110' : 'text-zinc-300'}`}>
                  {costIcons[key]}
                </span>
                {t(key)} ({symbol})
              </label>
              <input 
                type="number"
                placeholder="0.00"
                value={costs[key as keyof typeof costs]}
                onFocus={(e) => {
                  e.target.select();
                  setActiveField(key);
                }}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setCosts({...costs, [key]: e.target.value})}
                className="app-input font-bold text-lg py-3"
              />
            </div>
          ))}

          <div className="pt-6 space-y-3">
            <button 
              onClick={calculate} 
              className="app-button w-full shadow-[0_10px_25px_rgba(249,166,2,0.3)] py-4"
            >
              <Calculator size={20} />
              {t("calculate")}
            </button>
            <button 
              onClick={reset} 
              className="app-button w-full !bg-zinc-800 !text-zinc-400 hover:!text-white border border-zinc-700/50 py-4"
            >
              <RotateCcw size={20} />
              {t("reset")}
            </button>
          </div>

          {total !== null && (
            <div className="mt-6 p-6 bg-wax-orange/10 rounded-2xl border-2 border-wax-orange/30 text-center animate-in zoom-in-95 shadow-[0_0_40px_rgba(249,166,2,0.15)] flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
                {t("total_cost")}
              </span>
              <div className="text-5xl font-black text-wax-orange italic mb-6">
                {symbol} {total.toFixed(2)}
              </div>
              
              <button 
                onClick={handleShare}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-white text-zinc-900 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {copied ? <Check size={20} /> : <Share2 size={20} />}
                {copied ? t("copiato") || "Copiato!" : t("condividi")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionCost;
