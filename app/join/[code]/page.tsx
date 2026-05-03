"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { joinClassByCode } from "@/src/lib/actions/action";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [status, setStatus] = useState<"idle" | "joining" | "success" | "error">("idle");
  const [className, setClassName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/login?redirect=/join/${code}`);
    }
  }, [session, isPending, code, router]);

  const handleJoin = async () => {
    setStatus("joining");
    try {
      const result = await joinClassByCode(code);
      setClassName(result.className);
      setStatus("success");
      toast.success(`Vous avez rejoint la classe ${result.className} !`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Code invalide");
      setStatus("error");
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8 text-blue-600" />
        </div>

        {status === "success" ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Classe rejointe !</h1>
              <p className="text-slate-500 text-sm mt-1">
                Vous faites maintenant partie de la classe <strong>{className}</strong>.
              </p>
            </div>
            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Aller au tableau de bord
              </Button>
            </Link>
          </>
        ) : status === "error" ? (
          <>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Lien invalide</h1>
              <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer">Tableau de bord</Button>
              </Link>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                onClick={() => setStatus("idle")}
              >
                Réessayer
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Rejoindre une classe</h1>
              <p className="text-slate-500 text-sm mt-1">
                Code : <span className="font-mono font-bold text-blue-600">{code.toUpperCase()}</span>
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Vous allez rejoindre la classe liée à ce code d&apos;invitation.
              </p>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
              disabled={status === "joining"}
              onClick={handleJoin}
            >
              {status === "joining" ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Connexion...</>
              ) : (
                "Rejoindre la classe"
              )}
            </Button>
            <Link href="/dashboard" className="block text-sm text-slate-400 hover:text-slate-600">
              Annuler
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
