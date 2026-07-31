'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Send, Frown, Meh, Smile, Laugh, Heart, RotateCcw } from 'lucide-react';

const NIVEAUX = [
  { note: 1, label: 'Rien compris', color: 'bg-red-500 hover:bg-red-600', icon: Frown },
  { note: 2, label: 'Pas très clair', color: 'bg-orange-500 hover:bg-orange-600', icon: Meh },
  { note: 3, label: 'Moyennement', color: 'bg-yellow-500 hover:bg-yellow-600', icon: Smile },
  { note: 4, label: 'Bien compris', color: 'bg-emerald-500 hover:bg-emerald-600', icon: Laugh },
  { note: 5, label: 'Parfaitement', color: 'bg-green-600 hover:bg-green-700', icon: Heart },
];

export default function StudentPage() {
  const [code, setCode] = useState('');
  const [moduleData, setModuleData] = useState<any>(null);
  const [noteSelectionnee, setNoteSelectionnee] = useState<number | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [soumis, setSoumis] = useState(false);
  const [erreur, setErreur] = useState('');

  // Rejoindre une session de cours via le code à 4-6 caractères
  const rejoindreSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('code_session', code.trim().toUpperCase())
      .single();

    if (error || !data) {
      setErreur('Code de session introuvable.');
      return;
    }

    setModuleData(data);
  };

  // Envoyer le vote anonyme
  const envoyerEvaluation = async () => {
    if (!noteSelectionnee || !moduleData) return;

    const { error } = await supabase.from('evaluations').insert({
      module_id: moduleData.id,
      note: noteSelectionnee,
      commentaire: commentaire.trim() || null,
    });

    if (error) {
      setErreur("Erreur lors de l'envoi de votre évaluation.");
    } else {
      setSoumis(true);
    }
  };

  // Réinitialiser le formulaire pour évaluer un autre cours
  const reinitialiserFormulaire = () => {
    setModuleData(null);
    setCode('');
    setNoteSelectionnee(null);
    setCommentaire('');
    setSoumis(false);
    setErreur('');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
        
        {/* Étape 1 : Saisie du code si pas encore accédé */}
        {!moduleData && (
          <div>
            <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Évaluation de cours</h1>
            <p className="text-slate-500 text-center text-sm mb-6">Entrez le code fourni par votre formateur</p>
            
            <form onSubmit={rejoindreSession} className="space-y-4">
              <input
                type="text"
                placeholder="Ex: X8Y2"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center text-2xl font-mono uppercase tracking-widest py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                maxLength={6}
                required
              />
              {erreur && <p className="text-red-500 text-sm text-center">{erreur}</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition"
              >
                Rejoindre le module
              </button>
            </form>
          </div>
        )}

        {/* Étape 2 : Formulaire de vote */}
        {moduleData && !soumis && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Module en cours</span>
              <button
                onClick={reinitialiserFormulaire}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Changer de code
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">{moduleData.titre}</h2>

            <p className="text-sm font-medium text-slate-700 mb-3">Comment avez-vous assimilé ce cours ?</p>
            
            <div className="space-y-2 mb-6">
              {NIVEAUX.map((item) => {
                const Icon = item.icon;
                const isSelected = noteSelectionnee === item.note;
                return (
                  <button
                    key={item.note}
                    onClick={() => setNoteSelectionnee(item.note)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-white font-medium transition ${item.color} ${
                      isSelected ? 'ring-4 ring-slate-900 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Un commentaire anonyme ? (Optionnel)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Une question, une remarque sur le rythme..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-20"
              />
            </div>

            <button
              onClick={envoyerEvaluation}
              disabled={!noteSelectionnee}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" /> Envoyer mon avis
            </button>
          </div>
        )}

        {/* Étape 3 : Confirmation + Bouton de retour */}
        {soumis && (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-slate-800 mb-1">Merci pour votre retour !</h3>
            <p className="text-slate-500 text-sm mb-6">
              Votre évaluation a bien été enregistrée de manière 100% anonyme.
            </p>

            <button
              onClick={reinitialiserFormulaire}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Évaluer un autre module
            </button>
          </div>
        )}

      </div>
    </main>
  );
}