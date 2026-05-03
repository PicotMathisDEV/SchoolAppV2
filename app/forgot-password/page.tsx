"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/src/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await requestPasswordReset({ email, redirectTo: "/resetpassword" });
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {sent ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Email envoyé !</h1>
            <p className="text-slate-500 text-sm">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boite mail.
            </p>
            <Link href="/login" className="block mt-4 text-sm text-blue-600 font-semibold hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
              <p className="text-slate-500 text-sm mt-1">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : "Envoyer le lien"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
