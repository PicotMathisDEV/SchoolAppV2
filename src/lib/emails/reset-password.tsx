import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface ForgotPasswordEmailProps {
  username: string;
  resetUrl: string;
  userEmail: string;
}

const ForgotPasswordEmail = ({ username, resetUrl, userEmail }: ForgotPasswordEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Réinitialisez votre mot de passe EduApp</Preview>
      <Tailwind>
        <Body className="bg-slate-100 font-sans py-10">
          <Container className="bg-white mx-auto max-w-xl rounded-2xl overflow-hidden shadow-sm">

            <Section className="bg-blue-600 px-10 py-6 text-center">
              <Text className="text-white font-bold text-lg m-0 tracking-wide">🔑 Réinitialisation du mot de passe</Text>
            </Section>

            <Section className="px-10 py-8">
              <Heading className="text-xl font-bold text-slate-900 m-0 mb-4">
                Réinitialisation de mot de passe
              </Heading>

              <Text className="text-base text-slate-600 leading-6 m-0 mb-3">
                Bonjour <strong>{username}</strong>,
              </Text>

              <Text className="text-base text-slate-600 leading-6 m-0 mb-3">
                Nous avons reçu une demande de réinitialisation du mot de passe
                pour le compte associé à <strong>{userEmail}</strong>.
              </Text>

              <Text className="text-base text-slate-600 leading-6 m-0 mb-6">
                Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                Ce lien expire dans <strong>24 heures</strong>.
              </Text>

              <Section className="text-center mb-8">
                <Button
                  href={resetUrl}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-bold no-underline box-border inline-block"
                >
                  Réinitialiser mon mot de passe →
                </Button>
              </Section>

              <Text className="text-sm text-slate-400 leading-5 m-0 mb-1">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              </Text>
              <Text className="text-sm leading-5 m-0 mb-6 break-all">
                <Link href={resetUrl} className="text-blue-600 underline">
                  {resetUrl}
                </Link>
              </Text>

              <Text className="text-sm text-slate-400 leading-5 m-0">
                Si vous n&apos;avez pas demandé cette réinitialisation, ignorez cet email.
                Votre mot de passe actuel reste inchangé.
              </Text>
            </Section>

            <Section className="bg-slate-50 px-10 py-5 border-t border-slate-200">
              <Text className="text-xs text-slate-400 m-0 text-center">
                Si vous n&apos;avez pas demandé cette réinitialisation, ignorez cet email.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
