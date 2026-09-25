import Link from "next/link";
import BlobBackground from "../components/BlobBackground";
import EkkoLogo from "../components/EkkoLogo";

export const metadata = {
  title: "Nous contacter — EKKO",
  description: "Contacter l'équipe EKKO pour une question sur une vocapsule ou une commande.",
};

const email = "vosekko@outlook.com";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="home" />
      <nav className="relative z-10 flex items-center justify-between gap-4 px-6 py-6 md:px-14">
        <EkkoLogo size="md" />
        <Link href="/" className="ekko-serif text-xs uppercase tracking-widest" style={{ color: "#c9a96e" }}>
          ← Accueil
        </Link>
      </nav>
      <section className="relative z-10 mx-auto max-w-xl px-6 py-16 text-center md:py-24">
        <p className="ekko-serif mb-4 text-xs uppercase tracking-widest" style={{ color: "#c9a96e" }}>EKKO · Contact</p>
        <h1 className="ekko-serif mb-6 text-3xl font-normal md:text-4xl" style={{ color: "#f0e8d8" }}>Nous contacter</h1>
        <p className="ekko-serif mb-8 text-sm leading-7" style={{ color: "rgba(240,232,216,0.7)" }}>
          Une question sur votre vocapsule, un porte-clé ou une commande ? Écrivez-nous à cette adresse :
        </p>
        <a href={`mailto:${email}`} className="ekko-serif inline-block rounded-xl border px-6 py-4 text-base break-all" style={{ color: "#f0e8d8", borderColor: "rgba(201,169,110,0.4)", background: "rgba(201,169,110,0.12)" }}>
          {email}
        </a>
        <p className="ekko-serif mt-6 text-xs leading-6" style={{ color: "rgba(240,232,216,0.5)" }}>
          Si le lien n&apos;ouvre pas votre messagerie, copiez l&apos;adresse ci-dessus dans votre application e-mail.
        </p>
      </section>
    </main>
  );
}
