"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setError("Lien invalide ou expiré");
        return;
      }

      const { error: resetError } = await resetPassword({ newPassword: password, token });
      if (resetError) {
        setError(resetError.message || "Une erreur est survenue");
      } else {
        toast.success("Mot de passe modifié avec succès !");
        setTimeout(() => router.push("/login"), 500);
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h1>
          <p className="text-slate-500 text-sm mt-1">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Nouveau mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-semibold text-slate-700">
              Confirmer le mot de passe
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              required
            />
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
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Modification…</> : "Changer mon mot de passe"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
