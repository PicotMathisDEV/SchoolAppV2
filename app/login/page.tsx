"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
      const res = await signIn.email({
        email,
        password,
      });
      if (res.error) {
        setError(
          res.error.message ||
            "La connexion au compte a échoué, verifiez votre voite mail",
        );
        toast.error(
          <div className="text-sm">
            Si votre compte n&apos;est pas vérifié, pensez a regardez votre
            boite mail
          </div>,
        );
      } else {
        router.push("/dashboard");
        toast.success(`Connecté`);
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la cconnexion au compte");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className=" bg-white flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Se connecter</CardTitle>
          <CardDescription>
            Entrez vos informations pour vous connecter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Jean@exemple.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onBlur={() => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    setError("Veuillez entrer une adresse email valide");
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <div className="mt-4 space-y-2 text-center text-sm ">
          <Link href="forgot-password" className="text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
          <div>
            Pas de compte ?
            <Link
              href="/signup"
              className="text-primary hover:underline font-semibold"
            >
              {" "}
              Creer un compte
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
