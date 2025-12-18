
import React, { useState } from 'react';
import { Home as HomeIcon } from 'lucide-react';
import { View } from '../types';

interface CalculatorProps {
  setView: (view: View) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ setView }) => {
  const [unit, setUnit] = useState('g');
  const [totalWeight, setTotalWeight] = useState(100);
  const [fragrancePercent, setFragrancePercent] = useState(5);
  const [colorPercent, setColorPercent] = useState(1);
  const [result, setResult] = useState<{wax: number, fragrance: number, color: number} | null>(null);

  const calculate = () => {
    const fragranceWeight = (totalWeight * fragrancePercent) / 100;
    const colorWeight = (totalWeight * colorPercent) / 100;
    const waxWeight = totalWeight - fragranceWeight - colorWeight;
    setResult({ wax: waxWeight, fragrance: fragranceWeight, color: colorWeight });
  };

  const reset = () => {
    setTotalWeight(100);
    setFragrancePercent(5);
    setColorPercent(1);
    setResult(null);
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

        <h2 className="text-wax-orange text-center font-bold text-xl mt-8 mb-6">Candle Calculator</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Unit of measure</label>
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="app-input"
            >
              <option value="g">g</option>
              <option value="oz">oz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Total weight</label>
            <input 
              type="number"
              value={totalWeight}
              onChange={(e) => setTotalWeight(Number(e.target.value))}
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Fragrance % (1-35)</label>
            <input 
              type="range"
              min="1"
              max="35"
              value={fragrancePercent}
              onChange={(e) => setFragrancePercent(Number(e.target.value))}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="text-wax-orange font-bold mt-1">{fragrancePercent}%</div>
          </div>

          <div>
            <label className="block text-sm mb-1">Color % (0-25)</label>
            <input 
              type="range"
              min="0"
              max="25"
              value={colorPercent}
              onChange={(e) => setColorPercent(Number(e.target.value))}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="text-wax-orange font-bold mt-1">{colorPercent}%</div>
          </div>

          <div className="pt-4 space-y-3">
            <button onClick={calculate} className="app-button w-full">Calculate</button>
            <button onClick={reset} className="app-button w-full">Reset</button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-black/30 rounded-lg space-y-2 border border-wax-orange/30">
              <div className="flex justify-between"><span>Cera:</span> <span className="text-wax-orange">{result.wax.toFixed(2)} {unit}</span></div>
              <div className="flex justify-between"><span>Fragranza:</span> <span className="text-wax-orange">{result.fragrance.toFixed(2)} {unit}</span></div>
              <div className="flex justify-between"><span>Colore:</span> <span className="text-wax-orange">{result.color.toFixed(2)} {unit}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
