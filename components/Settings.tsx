
import React from 'react';
import { Trash2, Download, Upload, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClearData }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Impostazioni App</h2>

      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Gestione Dati
          </h3>
          <p className="text-sm text-slate-500">
            Tutti i dati dell'applicazione sono salvati localmente nel tuo browser. Se cancelli la cache del browser, i dati potrebbero andare persi.
          </p>
        </div>

        <div className="grid gap-4">
          <button 
            onClick={() => {
                const data = localStorage.getItem('waxpro_manager_data');
                if (data) {
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `waxpro-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                }
            }}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
          >
            <div>
              <div className="font-bold text-slate-700">Esporta Backup</div>
              <div className="text-xs text-slate-500">Scarica un file JSON con tutti i tuoi dati</div>
            </div>
            <Download className="text-slate-400" />
          </button>

          <label className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <div>
              <div className="font-bold text-slate-700">Importa Backup</div>
              <div className="text-xs text-slate-500">Ripristina i dati da un file salvato precedentemente</div>
            </div>
            <Upload className="text-slate-400" />
            <input 
                type="file" 
                className="hidden" 
                accept=".json"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const content = event.target?.result as string;
                            try {
                                JSON.parse(content);
                                localStorage.setItem('waxpro_manager_data', content);
                                window.location.reload();
                            } catch (err) {
                                alert("File non valido");
                            }
                        };
                        reader.readAsText(file);
                    }
                }}
            />
          </label>

          <button 
            onClick={() => {
              if (window.confirm("Sei sicuro di voler cancellare TUTTI i dati? Questa azione non è reversibile.")) {
                onClearData();
              }
            }}
            className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-left"
          >
            <div>
              <div className="font-bold text-red-600">Resetta Applicazione</div>
              <div className="text-xs text-red-400">Elimina ogni materiale, ricetta e prodotto</div>
            </div>
            <Trash2 className="text-red-400" />
          </button>
        </div>
      </section>

      <div className="text-center text-slate-400 text-xs">
        <p>WaxPro Manager v1.0.0</p>
        <p>© 2024 - Progettato per l'eccellenza artigiana</p>
      </div>
    </div>
  );
};

export default Settings;
