
import React, { useState } from 'react';
import { View, Currency } from '../types';
import { getCurrencySymbol } from '../utils/i18n';

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
  const symbol = getCurrencySymbol(currency);

  const calculate = () => {
    const values = (Object.values(costs) as string[]).map(v => parseFloat(v) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    setTotal(sum);
  };

  const reset = () => {
    setCosts({ wax: '', wick: '', container: '', fragrance: '', color: '', shipping: '' });
    setTotal(null);
  };

  return (
    <div className="flex justify-center py-4 w-full">
      <div className="app-card w-full max-w-sm p-6 relative">
        <h2 className="text-wax-orange text-center font-bold text-xl mb-6">{t("prod_cost_btn")}</h2>

        <div className="space-y-3">
          {Object.keys(costs).map((key) => (
            <div key={key}>
              <label className="block text-sm mb-1 capitalize text-zinc-400">{t(key)} ({symbol})</label>
              <input 
                type="number"
                placeholder="0.00"
                value={costs[key as keyof typeof costs]}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setCosts({...costs, [key]: e.target.value})}
                className="app-input"
              />
            </div>
          ))}

          <div className="pt-4 space-y-3">
            <button onClick={calculate} className="app-button w-full">{t("calculate")}</button>
            <button onClick={reset} className="app-button w-full !bg-zinc-700 !text-white">{t("reset")}</button>
          </div>

          {total !== null && (
            <div className="mt-4 p-4 bg-black/30 rounded-lg border border-wax-orange/30 text-center animate-in zoom-in-95">
              <span className="text-sm text-slate-400">{t("total_cost")}:</span>
              <div className="text-2xl font-bold text-wax-orange">{symbol} {total.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionCost;
