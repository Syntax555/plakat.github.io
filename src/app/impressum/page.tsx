import Link from 'next/link'

export const metadata = {
  title: 'Impressum',
}

const email = 'tolga_kaan_eskin@proton.me'

const addressLines = ['Tolga Kaan Eskin', 'Trettachweg 2', '89231 Neu-Ulm', 'Deutschland']

const infoSections = [
  {
    title: 'Angaben gemäß § 5 TMG',
    body: (
      <>
        {addressLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
        <div>
          E-Mail:{' '}
          <Link className='underline decoration-dotted underline-offset-4' href={`mailto:${email}`}>
            {email}
          </Link>
        </div>
      </>
    ),
  },
  {
    title: 'Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)',
    body: <>Tolga Kaan Eskin, Anschrift wie oben.</>,
  },
  {
    title: 'Hosting & technische Infrastruktur',
    body: (
      <>
        Diese Website wird statisch über GitHub Pages (GitHub, Inc., USA) ausgeliefert. Daten wie Pins und Statusangaben
        speichern wir in einer Supabase-Instanz innerhalb der EU. Beide Dienste verarbeiten IP-Adressen und technische
        Logdaten, um den sicheren Betrieb zu gewährleisten.
      </>
    ),
  },
]

const legalTexts = [
  {
    title: 'Haftung für Inhalte',
    content: (
      <>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
        Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte
        fremde Informationen zu überwachen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
        nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
        Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
      </>
    ),
  },
  {
    title: 'Haftung für Links',
    content: (
      <>
        Unser Angebot enthält Links zu externen Websites. Auf deren Inhalte haben wir keinen Einfluss, weshalb wir keine
        Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
        verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei Bekanntwerden von
        Rechtsverletzungen werden wir derartige Links umgehend entfernen.
      </>
    ),
  },
  {
    title: 'Urheberrecht',
    content: (
      <>
        Die auf dieser Website erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Eine Vervielfältigung,
        Bearbeitung oder Verbreitung bedarf der schriftlichen Zustimmung des jeweiligen Autors. Downloads und Kopien
        dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
      </>
    ),
  },
  {
    title: 'Streitbeilegung',
    content: (
      <>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
        <Link className='underline decoration-dotted underline-offset-4' href='https://ec.europa.eu/consumers/odr/'>
          https://ec.europa.eu/consumers/odr/
        </Link>
        . Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </>
    ),
  },
]

export default function ImpressumPage() {
  return (
    <main className='legal-page prose prose-zinc mx-auto max-w-4xl px-4 py-12 lg:py-16'>
      <header className='legal-page__hero'>
        <p className='legal-page__eyebrow'>Rechtliches</p>
        <h1>Impressum</h1>
        <p className='legal-page__lede'>Transparente Pflichtangaben nach § 5 TMG und § 18 MStV.</p>
      </header>

      <article className='prose prose-zinc mt-10 max-w-none lg:prose-lg'>
        <section className='legal-page__section'>
          <div className='grid gap-6 md:grid-cols-2'>
            {infoSections.map((section) => (
              <article key={section.title} className='rounded-2xl border border-border/40 bg-muted/30 p-4 shadow-inner'>
                <h2>{section.title}</h2>
                <div className='space-y-2 text-sm leading-relaxed'>{section.body}</div>
              </article>
            ))}
          </div>
        </section>

        <section className='legal-page__section'>
          <div className='space-y-6'>
            {legalTexts.map((entry) => (
              <article key={entry.title}>
                <h2>{entry.title}</h2>
                <p className='leading-relaxed'>{entry.content}</p>
              </article>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
