"use client";

import { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  HelpCircle,
  ListOrdered,
  Unlock,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Lock,
  Plus,
  Users,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

/* ── Student schema ──────────────────────────────────────────────────────── */

function StudentContent() {
  return (
    <div className="space-y-6">
      {/* Visual schema */}
      <div className="space-y-3">
        {/* Page d'accueil */}
        <div className="flex justify-center">
          <div className="bg-blue-600 text-white rounded-2xl px-6 py-3 text-center shadow-md">
            <p className="font-black text-base">Page d&apos;accueil</p>
            <p className="text-xs text-blue-100 mt-0.5">Votre tableau de bord</p>
          </div>
        </div>

        {/* Arrow down + split */}
        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-blue-300" />
        </div>

        {/* Parcours + Libre accès */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <ListOrdered className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-bold text-blue-800 text-sm">Parcours</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Suivi de leçons et de quiz avec progression et note. Plusieurs étapes pour plusieurs chapitres.
            </p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Unlock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-bold text-blue-800 text-sm">Libre accès</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accès ouvert à tous les chapitres et quiz. Les quiz ne doivent pas forcément être effectués pour consulter les leçons.
            </p>
          </div>
        </div>

        {/* Arrow from Parcours */}
        <div className="flex justify-start pl-[calc(25%-10px)]">
          <ArrowDown className="w-5 h-5 text-blue-300" />
        </div>

        {/* Leçons */}
        <div className="w-1/2 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-bold text-blue-800 text-sm">Leçons</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Explications des composants avec images, textes et exemples pratiques.
          </p>
        </div>

        {/* Arrow down */}
        <div className="flex justify-start pl-[calc(25%-10px)]">
          <ArrowDown className="w-5 h-5 text-blue-300" />
        </div>

        {/* Quizz */}
        <div className="w-1/2 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-bold text-blue-800 text-sm">Quizz</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Disponibles à la fin des leçons. Doivent être validés pour passer à l&apos;étape suivante du parcours.
          </p>
        </div>
      </div>

      {/* Key rule */}
      <div className="bg-blue-600 rounded-2xl p-4 text-white">
        <p className="font-bold text-sm mb-1">Règle du parcours :</p>
        <div className="flex items-center gap-2 text-xs text-blue-100">
          <CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" />
          <span>Lire la leçon d&apos;abord → faire le quiz → étape suivante débloquée</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-100 mt-1.5">
          <Lock className="w-4 h-4 text-blue-200 shrink-0" />
          <span>Vous ne pouvez pas sauter une étape</span>
        </div>
      </div>
    </div>
  );
}

/* ── Teacher schema ──────────────────────────────────────────────────────── */

function TeacherContent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <BookOpen className="w-4 h-4" />, title: "Leçons", desc: "Créez des leçons avec texte, images, tableaux. Éditeur riche intégré." },
          { icon: <HelpCircle className="w-4 h-4" />, title: "Quiz", desc: "Questions avec options texte ou image. Cochez la bonne réponse avant de sauvegarder." },
          { icon: <ListOrdered className="w-4 h-4" />, title: "Parcours", desc: "Assemblez des étapes ordonnées : leçon + quiz. Les élèves progressent dans l'ordre." },
        ].map((item) => (
          <div key={item.title} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                {item.icon}
              </div>
              <p className="font-bold text-blue-800 text-sm">{item.title}</p>
            </div>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-blue-600" />
          <p className="font-bold text-blue-800">Gestion des classes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Créer une classe et ajouter des élèves (nom + email + mot de passe)</span>
          </div>
          <div className="flex items-start gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Assigner des parcours, leçons et quiz à chaque classe</span>
          </div>
          <div className="flex items-start gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Les élèves voient automatiquement le contenu assigné à leur classe</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-4 text-white">
        <p className="font-bold text-sm mb-1">Différence Parcours vs Accès direct :</p>
        <div className="text-xs text-blue-100 space-y-1">
          <p>• <strong>Parcours</strong> : ordre imposé, la leçon doit être lue avant le quiz</p>
          <p>• <strong>Direct</strong> (leçon/quiz assignés à la classe) : accès libre, sans prérequis</p>
        </div>
      </div>
    </div>
  );
}

/* ── Popup ───────────────────────────────────────────────────────────────── */

export default function GuidePopup({ role, userId }: { role: string; userId: string }) {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const permanent = localStorage.getItem(`guide_v1_${userId}`);
    const session = sessionStorage.getItem("guide_shown");
    if (!permanent && !session) {
      setOpen(true);
      sessionStorage.setItem("guide_shown", "1");
    }
  }, [userId]);

  const handleClose = () => {
    if (dontShow) localStorage.setItem(`guide_v1_${userId}`, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Comment utiliser l&apos;application ?
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {role === "teacher" ? "Vue professeur" : "Vue élève"} — accès au guide complet depuis le menu
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-4 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {role === "teacher" ? <TeacherContent /> : <StudentContent />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-blue-600"
            />
            <span className="text-sm text-slate-500">Ne plus afficher</span>
          </label>
          <div className="flex items-center gap-3">
            <Link
              href="/guide"
              onClick={handleClose}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              Guide complet →
            </Link>
            <button
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Commencer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
