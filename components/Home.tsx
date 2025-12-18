
import React from 'react';
import { View } from '../types';

interface HomeProps {
  setView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  return (
    <div className="flex items-center justify-center min-h-[85vh] py-8">
      <div className="app-card w-full max-w-sm p-8 flex flex-col items-center">
        <h1 className="text-wax-orange text-3xl font-bold mb-10 tracking-wider">WAX PRO</h1>
        
        <div className="w-full space-y-4">
          <button 
            onClick={() => setView('CALCULATOR')}
            className="app-button w-full text-lg shadow-lg"
          >
            Candle Calculator
          </button>
          
          <button 
            onClick={() => setView('PRODUCTION_COST')}
            className="app-button w-full text-lg shadow-lg"
          >
            Production Cost
          </button>

          <div className="pt-6 w-full flex flex-col items-center">
            <h2 className="text-wax-orange/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border-b border-wax-orange/20 w-full text-center pb-2">
              Gestione Magazzino
            </h2>
            
            <div className="w-full space-y-4">
              <button 
                onClick={() => setView('RAW_MATERIALS')}
                className="app-button w-full text-lg shadow-lg opacity-90"
              >
                Materie Prime
              </button>
              
              <button 
                onClick={() => setView('FINISHED_PRODUCTS')}
                className="app-button w-full text-lg shadow-lg opacity-90"
              >
                Prodotti Finiti
              </button>

              <button 
                onClick={() => setView('SETTINGS')}
                className="app-button w-full text-lg shadow-lg opacity-80 !bg-zinc-600 !text-white mt-4"
              >
                Impostazioni
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
