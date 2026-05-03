"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Users, Loader2 } from "lucide-react";

type Role = "student" | "teacher";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    try {
      const res = await signUp.email({ email, name, password, role });
      if (res.error) {
        setError(res.error.message || "La création du compte a échoué");
      } else {
        router.push(`/verification-sent?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError("Une erreur s'est produite lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-slate-500 text-sm mt-1">Entrez vos informations pour vous inscrire</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Je suis…</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === "student"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-bold">Élève</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === "teacher"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-bold">Professeur</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nom</Label>
            <Input id="name" type="text" placeholder="Jean Dupont" value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
            <Input id="email" type="email" placeholder="jean@exemple.com" value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mot de passe</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirmer le mot de passe</Label>
            <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500" required />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</> : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
