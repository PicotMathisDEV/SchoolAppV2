"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email");
  const [countDown, setCountDown] = useState(() => {
    try {
      const savedEndTime = localStorage.getItem("emailCooldownEnd");
      if (savedEndTime) {
        const remaining = Math.floor(
          (parseInt(savedEndTime) - Date.now()) / 1000,
        );
        if (remaining > 0) {
          return remaining;
        } else {
          localStorage.removeItem("emailCooldownEnd");
        }
      }
    } catch (err) {

    }
    return 0;
  });

  useEffect(() => {
    if (countDown <= 0) return;

    const timer = setInterval(() => {
      setCountDown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("emailCooldownEnd");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countDown]);

  const handleResend = async () => {
    if (!userEmail || countDown > 0) return;

    try {
      await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: "/",
      });

      toast.success("Email de vérification envoyé");

      const endTime = Date.now() + 600000; 
      localStorage.setItem("emailCooldownEnd", endTime.toString());
      setCountDown(600);
    } catch (error) {
      toast.error("Erreur lors de l'envoi");

    }
  };

  return (
    <div className="bg-white flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
          </div>

          <CardTitle>Email de vérification envoyé</CardTitle>

          <CardDescription>
            Nous avons envoyé un email de vérification à{" "}
            <strong>{userEmail}</strong>.
            <br />
            Veuillez cliquer sur le lien pour activer votre compte.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 flex flex-col">
          <span className="text-s text-red-400">
            {countDown > 0
              ? `Avant de renvoyer un Email veuillez patienter : ${countDown}sec`
              : ""}
          </span>

          <Button
            onClick={handleResend}
            variant="outline"
            className={countDown > 0 ? "bg-gray-400 " : "bg-background "}
            disabled={countDown > 0 ? true : false}
          >
            Renvoyer l’email de vérification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
