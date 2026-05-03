"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message || "Identifiants incorrects");
        toast.error("Vérifiez votre boite mail si votre compte n'est pas encore vérifié");
      } else {
        router.push("/dashboard");
        toast.success("Connecté !");
      }
    } catch {
      setError("Une erreur s'est produite lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Se connecter</h1>
          <p className="text-slate-500 text-sm mt-1">Entrez vos informations pour vous connecter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean@exemple.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Mot de passe</Label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                Mot de passe oublié ?
              </Link>
            </div>
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
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</> : "Se connecter"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
