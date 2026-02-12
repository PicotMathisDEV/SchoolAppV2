import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface DeleteAccountProps {
  username: string;
  Url: string;
}

const DeleteAccountConfirmation = (props: DeleteAccountProps) => {
  const { username, Url } = props;

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Confirmez la suppression de votre compte</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="bg-white mx-auto px-10 py-10 max-w-2xl">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-black m-0 mb-4">
                Suppression de votre compte
              </Heading>
            </Section>

            <Section className="mb-8">
              <Text className="text-base text-gray-800 leading-6 m-0 mb-4">
                Bonjour {username},
              </Text>
              <Text className="text-base text-gray-800 leading-6 m-0 mb-4">
                Nous avons reçu une demande de suppression de votre compte.
                Cette action est irréversible et entraînera la perte définitive
                de toutes vos données.
              </Text>
              <Text className="text-base text-gray-800 leading-6 m-0 mb-6">
                Si vous êtes certain de vouloir supprimer votre compte, cliquez
                sur le bouton ci-dessous pour confirmer cette action.
              </Text>
            </Section>

            <Section className="text-center mb-8">
              <Button
                href={Url}
                className="bg-black text-white px-8 py-4 text-base font-medium no-underline rounded-lg box-border"
              >
                Confirmer la suppression
              </Button>
            </Section>

            <Section className="mb-8">
              <Text className="text-sm text-gray-600 leading-5 m-0 mb-2">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans
                votre navigateur :
              </Text>
              <Text className="text-sm text-gray-600 leading-5 m-0 break-all">
                {Url}
              </Text>
            </Section>

            <Section className="border-t border-solid border-gray-200 pt-6">
              <Text className="text-sm text-gray-600 leading-5 m-0 mb-2">
                <strong>Important :</strong>
              </Text>
              <Text className="text-sm text-gray-600 leading-5 m-0">
                Ce lien de confirmation expirera dans 24 heures. Si vous
                n&apos;avez pas demandé cette suppression, ignorez cet email et
                votre compte restera actif.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

DeleteAccountConfirmation.PreviewProps = {
  username: "Jean Dupont",
  confirmUrl: "https://example.com/confirm-delete-account?token=abc123",
};

export default DeleteAccountConfirmation;
