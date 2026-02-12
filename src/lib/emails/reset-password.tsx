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

const ForgotPasswordEmail = (props: ForgotPasswordEmailProps) => {
  const { username, resetUrl, userEmail } = props;

  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Réinitialisez votre mot de passe</Preview>
        <Body className="bg-gray-100 font-sans py-10">
          <Container className="bg-white rounded-xl px-8 py-10 mx-auto max-w-150">
            <Section className="text-center mb-8">
              <Heading className="text-[28px] font-bold text-black m-0">
                Réinitialisation de mot de passe
              </Heading>
            </Section>

            <Section className="mb-8">
              <Text className="text-[16px] text-gray-800 leading-6 mb-4">
                Bonjour, {username}
              </Text>

              <Text className="text-[16px] text-gray-800 leading-6 mb-4">
                Nous avons reçu une demande de réinitialisation de mot de passe
                pour votre compte associé à l&apos;adresse email{" "}
                <strong>{userEmail}</strong>.
              </Text>

              <Text className="text-[16px] text-gray-800 leading-6 mb-6">
                Pour créer un nouveau mot de passe, cliquez sur le bouton
                ci-dessous :
              </Text>

              <Section className="text-center mb-8">
                <Button
                  href={resetUrl}
                  className="bg-black text-white px-8 py-3 rounded-[6px] text-[16px] font-semibold no-underline box-border inline-block"
                >
                  Réinitialiser mon mot de passe
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 leading-5 mb-4">
                Si le bouton ne fonctionne pas, vous pouvez copier et coller ce
                lien dans votre navigateur :
              </Text>

              <Text className="text-[14px] text-gray-800 leading-5 mb-6 break-all">
                <Link href={resetUrl} className="text-gray-800 underline">
                  {resetUrl}
                </Link>
              </Text>

              <Text className="text-[14px] text-gray-600 leading-5 mb-4">
                <strong>Important :</strong> Ce lien expirera dans 24 heures
                pour des raisons de sécurité.
              </Text>

              <Text className="text-[14px] text-gray-600 leading-5">
                Si vous n&apos;avez pas demandé cette réinitialisation, vous
                pouvez ignorer cet email en toute sécurité. Votre mot de passe
                actuel restera inchangé.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;
