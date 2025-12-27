
import React, { useState } from 'react';
import { View, Currency } from '../types';
import { Share2, Check } from 'lucide-react';

interface CalculatorProps {
  setView: (view: View) => void;
  onAddProduct?: (product: any) => void;
  t: (key: string) => string;
  currency: Currency;
}

const Calculator: React.FC<CalculatorProps> = ({ setView, t, currency }) => {
  const [unit, setUnit] = useState('g');
  const [totalWeight, setTotalWeight] = useState(100);
  const [fragrancePercent, setFragrancePercent] = useState(5);
  const [colorPercent, setColorPercent] = useState(1);
  const [result, setResult] = useState<{wax: number, fragrance: number, color: number} | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const fragranceWeight = (totalWeight * fragrancePercent) / 100;
    const colorWeight = (totalWeight * colorPercent) / 100;
    const waxWeight = totalWeight - fragranceWeight - colorWeight;
    setResult({ wax: waxWeight, fragrance: fragranceWeight, color: colorWeight });
  };

  const handleShare = async () => {
    if (!result) return;

    const text = `📊 WAX PRO - ${t("calc_btn")}\n` +
                 `--------------------------\n` +
                 `${t("total_weight")}: ${totalWeight}${unit}\n` +
                 `${t("wax")}: ${result.wax.toFixed(2)}${unit}\n` +
                 `${t("fragrance")}: ${result.fragrance.toFixed(2)}${unit}\n` +
                 `${t("color")}: ${result.color.toFixed(2)}${unit}\n` +
                 `--------------------------\n` +
                 `Powered by WaxPro Manager`;

    try {
      if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `WAX PRO - Formula`,
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
    setTotalWeight(100);
    setFragrancePercent(5);
    setColorPercent(1);
    setResult(null);
  };

  return (
    <div className="flex justify-center py-4 w-full">
      <div className="app-card w-full max-w-sm p-6 relative">
        <h2 className="text-wax-orange text-center font-bold text-xl mb-6">{t("calc_btn")}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-zinc-400">{t("unit_measure")}</label>
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="app-input"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="oz">oz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-zinc-400">{t("total_weight")}</label>
            <input 
              type="number"
              value={totalWeight}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTotalWeight(Number(e.target.value))}
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-zinc-400">{t("fragrance")} % (1-35)</label>
            <input 
              type="range"
              min="1"
              max="35"
              value={fragrancePercent}
              onChange={(e) => setFragrancePercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-wax-orange font-bold mt-1">{fragrancePercent}%</div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-zinc-400">{t("color")} % (0-25)</label>
            <input 
              type="range"
              min="0"
              max="25"
              value={colorPercent}
              onChange={(e) => setColorPercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-wax-orange font-bold mt-1">{colorPercent}%</div>
          </div>

          <div className="pt-4 space-y-3">
            <button onClick={calculate} className="app-button w-full">{t("calculate")}</button>
            <button onClick={reset} className="app-button w-full !bg-zinc-700 !text-white">{t("reset")}</button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-black/40 rounded-xl space-y-2 border border-wax-orange/30 animate-in fade-in zoom-in-95">
              <div className="flex justify-between"><span>{t("wax")}:</span> <span className="text-wax-orange font-bold">{result.wax.toFixed(2)} {unit}</span></div>
              <div className="flex justify-between"><span>{t("fragrance")}:</span> <span className="text-wax-orange font-bold">{result.fragrance.toFixed(2)} {unit}</span></div>
              <div className="flex justify-between"><span>{t("color")}:</span> <span className="text-wax-orange font-bold">{result.color.toFixed(2)} {unit}</span></div>
              
              <button 
                onClick={handleShare}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-white text-zinc-900 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? t("copiato") || "Copiato!" : t("condividi")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
