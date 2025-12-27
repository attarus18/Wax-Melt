
import React from 'react';
import { View, UserProfile } from '../types';
import { Cloud, ArrowRight } from 'lucide-react';

interface HomeProps {
  setView: (view: View) => void;
  t: (key: string) => string;
  user: UserProfile | null;
}

const Home: React.FC<HomeProps> = ({ setView, t, user }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8 w-full max-w-sm space-y-6">
      {!user && (
        <button 
          onClick={() => setView('SETTINGS')}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-wax-orange/10 to-transparent border border-wax-orange/20 flex items-center justify-between group hover:border-wax-orange/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wax-orange/20 rounded-xl">
              <Cloud className="text-wax-orange" size={20} />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-wax-orange tracking-widest">Sincronizza Cloud</div>
              <div className="text-xs text-zinc-400">Salva i tuoi dati per sempre</div>
            </div>
          </div>
          <ArrowRight className="text-wax-orange opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" size={20} />
        </button>
      )}

      <div className="app-card w-full p-8 flex flex-col items-center">
        <h1 className="text-wax-orange text-3xl font-black mb-10 tracking-widest uppercase italic">{t("home_title")}</h1>
        
        <div className="w-full space-y-4">
          <button 
            onClick={() => setView('CALCULATOR')}
            className="app-button w-full text-lg shadow-lg"
          >
            {t("calc_btn")}
          </button>
          
          <button 
            onClick={() => setView('PRODUCTION_COST')}
            className="app-button w-full text-lg shadow-lg"
          >
            {t("prod_cost_btn")}
          </button>

          <div className="pt-6 w-full flex flex-col items-center">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 w-full text-center pb-2">
              Gestione Magazzino
            </h2>
            
            <div className="w-full space-y-4">
              <button 
                onClick={() => setView('FINISHED_PRODUCTS')}
                className="app-button w-full text-lg shadow-lg opacity-90"
              >
                {t("finished_prod_btn")}
              </button>

              <button 
                onClick={() => setView('SETTINGS')}
                className="app-button w-full text-lg shadow-lg opacity-80 !bg-zinc-700 !text-white mt-4"
              >
                {t("settings_btn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
