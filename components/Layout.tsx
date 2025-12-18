
import React from 'react';
import { View } from '../types';
import { Calculator, Box, Package, Settings, Flame } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
  const navItems = [
    { id: 'CALCULATOR' as View, label: 'Calcolatore', icon: Calculator },
    { id: 'RAW_MATERIALS' as View, label: 'Materie Prime', icon: Box },
    { id: 'FINISHED_PRODUCTS' as View, label: 'Prodotti Finiti', icon: Package },
    { id: 'SETTINGS' as View, label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-charcoal text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-gold w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight">WAXPRO <span className="text-gold">MANAGER</span></h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 pb-24 md:pb-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:static md:bg-transparent md:border-none md:shadow-none">
        <div className="container mx-auto flex justify-around md:justify-start md:gap-4 p-2 md:px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-xl transition-all ${
                activeView === item.id 
                ? 'text-gold bg-slate-900 md:px-4' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
