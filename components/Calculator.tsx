
import React, { useState } from 'react';
import { View, Currency } from '../types';
import { getCurrencySymbol } from '../utils/i18n';
import { 
  Share2, 
  Check, 
  Scale, 
  Droplets, 
  Palette, 
  Ruler, 
  Calculator as CalcIcon, 
  RotateCcw 
} from 'lucide-react';

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
  const symbol = getCurrencySymbol(currency);

  const calculate = () => {
    const fragranceWeight = (totalWeight * fragrancePercent) / 100;
    const colorWeight = (totalWeight * colorPercent) / 100;
    const waxWeight = totalWeight - fragranceWeight - colorWeight;
    setResult({ wax: waxWeight, fragrance: fragranceWeight, color: colorWeight });
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `📊 WAX PRO - ${t("calc_btn")} (${symbol})\n` +
                 `--------------------------\n` +
                 `${t("total_weight")}: ${totalWeight}${unit}\n` +
                 `${t("wax")}: ${result.wax.toFixed(2)}${unit}\n` +
                 `${t("fragrance")}: ${result.fragrance.toFixed(2)}${unit}\n` +
                 `${t("color")}: ${result.color.toFixed(2)}${unit}\n` +
                 `--------------------------\n` +
                 `Powered by WaxPro Manager`;
    try {
      if (navigator.share) await navigator.share({ title: `WAX PRO - Formula`, text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {}
  };

  return (
    <div className="flex justify-center py-4 w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="app-card w-full max-w-sm p-8 border-wax-orange/30">
        <h2 className="text-wax-orange text-center font-black text-2xl mb-10 uppercase tracking-tighter italic">{t("calc_btn")}</h2>

        <div className="space-y-8">
          <div>
            <label className="app-label flex items-center gap-2"><Ruler size={14}/>{t("unit_measure")}</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="app-input">
              <option value="g">Grammi (g)</option>
              <option value="kg">Chilogrammi (kg)</option>
              <option value="lb">Libbre (lb)</option>
              <option value="oz">Once (oz)</option>
            </select>
          </div>

          <div>
            <label className="app-label flex items-center gap-2"><Scale size={14}/>{t("total_weight")} ({unit.toUpperCase()})</label>
            <input type="number" value={totalWeight} onFocus={(e) => e.target.select()} onChange={(e) => setTotalWeight(Number(e.target.value))} className="app-input text-2xl py-4" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="app-label flex items-center gap-2 mb-0"><Droplets size={14}/>{t("fragrance")} %</label>
              <span className="text-wax-orange font-black">{fragrancePercent}%</span>
            </div>
            <input type="range" min="1" max="35" value={fragrancePercent} onChange={(e) => setFragrancePercent(Number(e.target.value))} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="app-label flex items-center gap-2 mb-0"><Palette size={14}/>{t("color")} %</label>
              <span className="text-wax-orange font-black">{colorPercent}%</span>
            </div>
            <input type="range" min="0" max="25" value={colorPercent} onChange={(e) => setColorPercent(Number(e.target.value))} />
          </div>

          <div className="pt-6 space-y-4">
            <button onClick={calculate} className="app-button shadow-[0_10px_30px_rgba(249,166,2,0.3)]"><CalcIcon size={24} />{t("calculate")}</button>
            <button onClick={() => { setTotalWeight(100); setResult(null); }} className="app-button !bg-zinc-800 !text-zinc-500 hover:!text-white border border-zinc-700/50"><RotateCcw size={20} />{t("reset")}</button>
          </div>

          {result && (
            <div className="mt-8 p-6 bg-wax-orange/5 rounded-3xl border-2 border-wax-orange/30 space-y-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-wax-orange/10 pb-3">
                <span className="text-[10px] font-black uppercase text-zinc-500">{t("wax")}</span>
                <span className="text-xl font-black text-white italic">{result.wax.toFixed(2)} {unit}</span>
              </div>
              <div className="flex justify-between items-center border-b border-wax-orange/10 pb-3">
                <span className="text-[10px] font-black uppercase text-zinc-500">{t("fragrance")}</span>
                <span className="text-xl font-black text-white italic">{result.fragrance.toFixed(2)} {unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500">{t("color")}</span>
                <span className="text-xl font-black text-white italic">{result.color.toFixed(2)} {unit}</span>
              </div>
              <button onClick={handleShare} className={`mt-6 app-button !py-4 !rounded-2xl ${copied ? '!bg-green-600 !text-white' : '!bg-white !text-zinc-900'}`}>
                {copied ? <Check size={20} /> : <Share2 size={20} />}
                {copied ? t("copiato") : t("condividi")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
