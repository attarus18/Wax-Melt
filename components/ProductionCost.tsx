
import React, { useState } from 'react';
import { Home as HomeIcon } from 'lucide-react';
import { View } from '../types';

interface ProductionCostProps {
  setView: (view: View) => void;
}

const ProductionCost: React.FC<ProductionCostProps> = ({ setView }) => {
  const [costs, setCosts] = useState({
    wax: '',
    wick: '',
    container: '',
    fragrance: '',
    color: '',
    shipping: ''
  });
  const [total, setTotal] = useState<number | null>(null);

  const calculate = () => {
    // Fix: Explicitly cast Object.values to string[] to resolve the 'unknown' argument error in parseFloat
    const values = (Object.values(costs) as string[]).map(v => parseFloat(v) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    setTotal(sum);
  };

  const reset = () => {
    setCosts({ wax: '', wick: '', container: '', fragrance: '', color: '', shipping: '' });
    setTotal(null);
  };

  return (
    <div className="flex justify-center py-4">
      <div className="app-card w-full max-w-sm p-6 relative">
        <button 
          onClick={() => setView('HOME')}
          className="absolute top-4 left-1/2 -translate-x-1/2 text-wax-orange border border-wax-orange p-1 rounded-full"
        >
          <HomeIcon size={20} />
        </button>

        <h2 className="text-wax-orange text-center font-bold text-xl mt-8 mb-6">Production Cost</h2>

        <div className="space-y-3">
          {Object.keys(costs).map((key) => (
            <div key={key}>
              <label className="block text-sm mb-1 capitalize">{key} cost</label>
              <input 
                type="number"
                placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} cost (€)`}
                value={costs[key as keyof typeof costs]}
                onChange={(e) => setCosts({...costs, [key]: e.target.value})}
                className="app-input"
              />
            </div>
          ))}

          <div className="pt-4 space-y-3">
            <button onClick={calculate} className="app-button w-full">Calculate</button>
            <button onClick={reset} className="app-button w-full">Reset</button>
          </div>

          {total !== null && (
            <div className="mt-4 p-4 bg-black/30 rounded-lg border border-wax-orange/30 text-center">
              <span className="text-sm text-slate-400">Total Cost:</span>
              <div className="text-2xl font-bold text-wax-orange">€ {total.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionCost;
