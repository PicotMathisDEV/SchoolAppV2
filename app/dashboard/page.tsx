"use client";

import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import DropMenu from "../_components/DropMenu";
import { getStudentDashboard } from "@/src/lib/actions/quiz-attempt-action";
import { joinClassByCode } from "@/src/lib/actions/action";
import Link from "next/link";
import { ChevronRight, GraduationCap, ListOrdered, Users, LogIn } from "lucide-react";
import GuidePopup from "../_components/GuidePopup";
import { toast } from "sonner";

type DashboardData = Awaited<ReturnType<typeof getStudentDashboard>>;

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    try {
      const result = await joinClassByCode(joinCode);
      toast.success(`Vous avez rejoint la classe ${result.className} !`);
      setJoinCode("");
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Code invalide");
    } finally {
      setIsJoining(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const d = await getStudentDashboard();
      setData(d);
    } catch (err) {
      console.error("[dashboard] fetchData error:", err);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session?.user.role === "teacher") router.push("/gestion");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Chargement…</p>
      </div>
    );
  }

  const { myClasses, myParcours } = data ?? { myClasses: [], myParcours: [] };

  return (
    <div className="min-h-screen bg-slate-50">
      <GuidePopup role={session.user.role ?? "student"} userId={session.user.id} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour, {session.user.name} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {myParcours.length > 0
                ? `${myParcours.length} parcours`
                : "Tableau de bord élève"}
            </p>
          </div>
          <DropMenu
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              role: session.user.role,
            }}
          />
        </div>

        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Code d'invitation (ex: AB12CD)"
            maxLength={6}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={isJoining || !joinCode.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            <LogIn className="w-4 h-4" />
            {isJoining ? "…" : "Rejoindre"}
          </button>
        </form>

        {myClasses.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {myClasses.map((classe) => (
              <div
                key={classe.id}
                className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm">Classe {classe.name}</p>
                  <p className="text-xs text-slate-400">
                    Prof. {classe.teacher.name}
                    <span className="mx-1.5">·</span>
                    <Users className="w-3 h-3 inline -mt-0.5" /> {classe._count.students} élève{classe._count.students !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {myParcours.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun parcours disponible.</p>
            <p className="text-slate-400 text-sm mt-1">
              Demande à ton professeur de t&apos;en assigner un.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myParcours.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/parcours/${p.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <ListOrdered className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p._count.steps} étape{p._count.steps !== 1 ? "s" : ""} · {p.teacher.name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
