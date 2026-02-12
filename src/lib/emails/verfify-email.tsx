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

interface VerifyEmailProps {
  username: string;
  verifyUrl: string;
}

const VerifyEmail = (props: VerifyEmailProps) => {
  const { username, verifyUrl } = props;
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Vérifiez votre adresse email pour activer votre compte</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="bg-white mx-auto px-10 py-10 max-w-2xl">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-black m-0 mb-4">
                Vérification de votre email
              </Heading>
            </Section>

            <Section className="mb-8">
              <Text className="text-base text-gray-800 leading-6 m-0 mb-4">
                Bonjour {username}
              </Text>
              <Text className="text-base text-gray-800 leading-6 m-0 mb-4">
                Pour finaliser la création de votre compte, veuillez vérifier
                votre adresse email en cliquant sur le bouton ci-dessous.
              </Text>
              <Text className="text-base text-gray-800 leading-6 m-0 mb-6">
                Cette étape est nécessaire pour sécuriser votre compte et vous
                permettre d&#39;accéder à tous les services.
              </Text>
            </Section>

            <Section className="text-center mb-8">
              <Button
                href={verifyUrl}
                className="bg-black text-white px-8 py-4 text-base font-medium no-underline rounded box-border"
              >
                Vérifier mon email
              </Button>
            </Section>

            <Section className="mb-8">
              <Text className="text-sm text-gray-600 leading-5 m-0 mb-2">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans
                votre navigateur :
              </Text>
              <Text className="text-sm text-gray-600 leading-5 m-0 break-all">
                {verifyUrl}
              </Text>
            </Section>

            <Section className="border-t border-solid border-gray-200 pt-6">
              <Text className="text-sm text-gray-600 leading-5 m-0 mb-2">
                <strong>Note de sécurité :</strong>
              </Text>
              <Text className="text-sm text-gray-600 leading-5 m-0">
                Ce lien de vérification expirera dans 10 minutes. Si vous
                n&#39;avez pas demandé cette vérification, vous pouvez ignorer
                cet email en toute sécurité.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
