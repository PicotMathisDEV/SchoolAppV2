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

const VerifyEmail = ({ username, verifyUrl }: VerifyEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Vérifiez votre adresse email pour activer votre compte</Preview>
      <Tailwind>
        <Body className="bg-slate-100 py-10 font-sans">
          <Container className="bg-white mx-auto max-w-xl rounded-2xl overflow-hidden shadow-sm">

            <Section className="bg-blue-600 px-10 py-6 text-center">
              <Text className="text-white font-bold text-lg m-0 tracking-wide">✉ Vérification d&apos;email</Text>
            </Section>

            <Section className="px-10 py-8">
              <Heading className="text-xl font-bold text-slate-900 m-0 mb-4">
                Vérifiez votre email
              </Heading>
              <Text className="text-base text-slate-600 leading-6 m-0 mb-3">
                Bonjour <strong>{username}</strong>,
              </Text>
              <Text className="text-base text-slate-600 leading-6 m-0 mb-3">
                Merci de vous être inscrit sur EduApp. Pour activer votre compte,
                cliquez sur le bouton ci-dessous.
              </Text>
              <Text className="text-base text-slate-600 leading-6 m-0 mb-6">
                Ce lien expire dans <strong>10 minutes</strong>.
              </Text>

              <Section className="text-center mb-8">
                <Button
                  href={verifyUrl}
                  className="bg-blue-600 text-white px-8 py-4 text-base font-bold no-underline rounded-xl box-border inline-block"
                >
                  Vérifier mon email →
                </Button>
              </Section>

              <Text className="text-sm text-slate-400 leading-5 m-0 mb-1">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              </Text>
              <Text className="text-sm text-blue-600 leading-5 m-0 break-all">
                {verifyUrl}
              </Text>
            </Section>

            <Section className="bg-slate-50 px-10 py-5 border-t border-slate-200">
              <Text className="text-xs text-slate-400 m-0 text-center">
                Si vous n&apos;avez pas créé de compte, ignorez cet email.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
