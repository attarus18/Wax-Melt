
import React, { useState } from 'react';
import { Home as HomeIcon, Save } from 'lucide-react';
import { View, FinishedProduct } from '../types';

interface CalculatorProps {
  setView: (view: View) => void;
  onAddProduct?: (product: FinishedProduct) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ setView, onAddProduct }) => {
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

  const handleSaveProduction = () => {
    if (!result || !onAddProduct) return;
    
    const name = window.prompt("Inserisci un nome per questo lotto (es: Lotto Lavanda #1):");
    if (!name) return;

    const newProduct: FinishedProduct = {
      id: crypto.randomUUID(),
      name: name,
      quantity: 1, // Assumiamo 1 candela per ora, o potremmo chiedere all'utente
      costPerUnit: 0, 
      containerSize: totalWeight,
      fragrancePercentage: fragrancePercent,
      createdAt: Date.now()
    };

    onAddProduct(newProduct);
    alert("Produzione registrata nel magazzino prodotti finiti!");
    setView('FINISHED_PRODUCTS');
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
          className="absolute top-4 left-1/2 -translate-x-1/2 text-wax-orange border border-wax-orange p-1 rounded-full bg-zinc-800"
        >
          <HomeIcon size={20} />
        </button>

        <h2 className="text-wax-orange text-center font-bold text-xl mt-8 mb-6">Candle Calculator</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Unit of measure</label>
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
            <label className="block text-sm mb-1 text-zinc-400">Total weight</label>
            <input 
              type="number"
              value={totalWeight}
              onChange={(e) => setTotalWeight(Number(e.target.value))}
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-zinc-400">Fragrance % (1-35)</label>
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
            <label className="block text-sm mb-1 text-zinc-400">Color % (0-25)</label>
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
            <button onClick={calculate} className="app-button w-full">Calculate</button>
            <button onClick={reset} className="app-button w-full !bg-zinc-700 !text-white">Reset</button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-black/40 rounded-xl space-y-2 border border-wax-orange/30 animate-in fade-in zoom-in-95">
              <div className="flex justify-between"><span>Cera:</span> <span className="text-wax-orange font-bold">{result.wax.toFixed(2)} {unit}</span></div>
              <div className="flex justify-between"><span>Fragranza:</span> <span className="text-wax-orange font-bold">{result.fragrance.toFixed(2)} {unit}</span></div>
              <div className="flex justify-between"><span>Colore:</span> <span className="text-wax-orange font-bold">{result.color.toFixed(2)} {unit}</span></div>
              
              <button 
                onClick={handleSaveProduction}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={18} />
                Registra in Magazzino
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
