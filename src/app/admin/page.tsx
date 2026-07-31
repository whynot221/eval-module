'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, BarChart3, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [titre, setTitre] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Générer un code unique à 4 caractères
  const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  // Charger la liste des modules
  const chargerModules = async () => {
    const { data } = await supabase.from('modules').select('*').order('created_at', { ascending: false });
    if (data) setModules(data);
  };

  useEffect(() => {
    chargerModules();
  }, []);

  // Créer un nouveau module
  const creerModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    const codeSession = generateCode();
    const { data, error } = await supabase
      .from('modules')
      .insert({ titre, code_session: codeSession })
      .select()
      .single();

    if (!error && data) {
      setTitre('');
      chargerModules();
      afficherStats(data);
    }
  };

  // Charger les votes pour un module précis
  const afficherStats = async (mod: any) => {
    setSelectedModule(mod);
    setLoading(true);
    const { data } = await supabase
      .from('evaluations')
      .select('*')
      .eq('module_id', mod.id)
      .order('created_at', { ascending: false });

    if (data) setEvaluations(data);
    setLoading(false);
  };

  // Calcul de la moyenne
  const moyenne = evaluations.length > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.note, 0) / evaluations.length).toFixed(1)
    : 0;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Espace Formateur</h1>
            <p className="text-slate-500 text-sm">Gérez vos modules et suivez la compréhension</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Colonne 1 : Créer & Lister les modules */}
          <div className="space-y-4">
            {/* Formulaire de création */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" /> Nouveau cours
              </h2>
              <form onSubmit={creerModule} className="space-y-3">
                <input
                  type="text"
                  placeholder="Titre du module (ex: PHP Avancé)"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition"
                >
                  Créer et générer le code
                </button>
              </form>
            </div>

            {/* Liste des modules créés */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-700 uppercase mb-3">Vos modules</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => afficherStats(m)}
                    className={`w-full text-left p-3 rounded-xl border transition flex justify-between items-center ${
                      selectedModule?.id === m.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{m.titre}</p>
                      <p className="text-xs text-slate-400">Code : <span className="font-mono text-indigo-600 font-bold">{m.code_session}</span></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne 2 & 3 : Statistiques du module sélectionné */}
          <div className="md:col-span-2">
            {selectedModule ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold">
                      Code Élèves : {selectedModule.code_session}
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">{selectedModule.titre}</h2>
                  </div>
                  <button
                    onClick={() => afficherStats(selectedModule)}
                    className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                    title="Rafraîchir"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* KPI / Moyenne */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-medium">Note moyenne / 5</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{moyenne}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 font-medium">Votes reçus</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-1">{evaluations.length}</p>
                  </div>
                </div>

                {/* Feed de commentaires */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" /> Remarques des élèves
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {evaluations.map((ev) => (
                      <div key={ev.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-indigo-600">Note : {ev.note}/5</span>
                          <span className="text-xs text-slate-400">
                            {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 italic">
                          {ev.commentaire ? `"${ev.commentaire}"` : 'Pas de commentaire'}
                        </p>
                      </div>
                    ))}
                    {evaluations.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-4">Aucune évaluation enregistrée pour ce cours pour le moment.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Créez ou sélectionnez un module à gauche pour voir les résultats.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}