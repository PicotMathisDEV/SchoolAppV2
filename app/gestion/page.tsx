"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DropMenu from "../_components/DropMenu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClassAction } from "@/src/lib/actions/action";
import { toast } from "sonner";
import { unauthorized } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { getClasses } from "@/src/lib/actions/get-classes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Plus } from "lucide-react";
interface Classe {
  id: string;
  name: string;
  students?: [];
}

export default function Page() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [nameValue, setnameValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const data = await getClasses();
      setClasses(data);
    };

    fetchClasses();
  }, []);

  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading ...</p>
      </div>
    );
  }

  if (session?.user.role != "teacher") {
    return unauthorized();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createClassAction(nameValue, session.user.id, session.user.name);
      window.location.reload();
      setnameValue("");
      toast.success("Classe créée !");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Mes Classes
          </h1>
          <p className="text-muted-foreground font-medium">
            Gérez vos classes et suivez vos élèves.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95 gap-2 px-6 rounded-full font-semibold cursor-pointer">
                <Plus className="w-5 h-5" /> Créer une classe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl gap-1">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold text-slate-800">
                  Nouvelle classe
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  Indiquez le nom de la classe (ex: T01, Terminale S). Vous
                  pourrez y ajouter des élèves et des leçons après.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <form className="py-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-bold text-slate-700"
                    >
                      Nom de la classe
                    </Label>
                    <Input
                      id="name"
                      placeholder="ex: T01"
                      className="h-12 border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl transition-all"
                      required
                      onChange={(e) => setnameValue(e.target.value)}
                    />
                  </div>
                </div>
              </form>

              <AlertDialogFooter className="sm:gap-3">
                <AlertDialogCancel className="rounded-xl border-slate-200 font-medium cursor-pointer">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="bg-blue-600! hover:bg-blue-700! text-white rounded-xl px-8 font-bold transition-all cursor-pointer"
                >
                  {isSubmitting ? "Création..." : "Confirmer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropMenu
            user={{
              name: session?.user?.name,
              email: session?.user?.email,
              image: session?.user?.image,
              role: session?.user?.role,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
        {classes.map((item) => (
          <Card
            key={item.id}
            className="group relative flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl bg-white"
          >
            <div className="relative h-44 overflow-hidden rounded-t-lg">
              <Image
                src="/classes.png"
                alt="Illustration Classe"
                fill
                priority
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>

            <CardHeader className="p-5">
              <div className="space-y-2">
                <CardTitle className="text-xl font-extrabold text-slate-800 line-clamp-1">
                  Classe de {item.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-bold text-slate-500">
                    {`${item.students?.length || 0} élèves`}
                  </span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 mt-auto">
              <Link href={`/gestion/${item.id}`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none font-bold py-6 rounded-2xl transition-all flex items-center justify-between px-6 group/btn cursor-pointer">
                  Gérer la classe
                  <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
