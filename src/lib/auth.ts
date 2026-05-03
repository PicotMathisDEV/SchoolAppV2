import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/src/lib/prisma";
import { Resend } from "resend";
import { render } from "@react-email/components";
import ForgotPasswordEmail from "./emails/reset-password";
import VerifyEmail from "./emails/verfify-email";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = "no-reply@schoolappproject.shop";

export const teacherCreatedEmails = new Set<string>();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    expiresIn: 3600,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {

      if (teacherCreatedEmails.has(user.email)) {
        teacherCreatedEmails.delete(user.email);
        return;
      }
      try {
        const html = await render(VerifyEmail({ username: user.name, verifyUrl: url }));
        const result = await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: "Vérifier votre Email",
          html,
          text: `Bonjour ${user.name},\n\nVérifiez votre adresse email : ${url}`,
        });
        if (result.error) {
          console.error("[Resend] sendVerificationEmail error:", result.error);
        }
      } catch (err) {
        console.error("[Resend] sendVerificationEmail exception:", err);
      }
    },
  },
  plugins: [],
  emailAndPassword: {
    requireEmailVerification: true,
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        const html = await render(
          ForgotPasswordEmail({ username: user.name, resetUrl: url, userEmail: user.email }),
        );
        const result = await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: "Réinitialisation de votre mot de passe",
          html,
          text: `Bonjour ${user.name},\n\nRéinitialisez votre mot de passe : ${url}`,
        });
        if (result.error) {
          console.error("[Resend] sendResetPassword error:", result.error);
        }
      } catch (err) {
        console.error("[Resend] sendResetPassword exception:", err);
      }
    },
  },
});
