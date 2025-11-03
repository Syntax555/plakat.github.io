export const metadata = {
  title: 'Datenschutzerklärung',
}

const contactEmail = 'tolga_kaan_eskin@proton.me'

const overviewHighlights = [
  {
    title: 'Verantwortliche Stelle',
    body: (
      <>
        Tolga Kaan Eskin
        <br />
        Trettachweg 2, 89231 Neu-Ulm
        <br />
        <a href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
      </>
    ),
  },
  {
    title: 'Welche Daten fallen an?',
    body: (
      <>
        Server-Logdaten (IP-Adresse, Zeitstempel, Browser), Nutzungsdaten der Karte sowie Inhalte,
        die Sie freiwillig übermitteln (z. B. Pin-Beschreibungen).
      </>
    ),
  },
  {
    title: 'Warum verarbeiten wir Daten?',
    body: (
      <>
        Zur Bereitstellung der Website, Darstellung der Karte, Absicherung unserer Systeme und zur
        Bearbeitung von Anfragen.
      </>
    ),
  },
  {
    title: 'Ihre wichtigsten Rechte',
    body: (
      <>
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit sowie Widerspruch
        gegen Verarbeitungen nach Art. 21 DSGVO.
      </>
    ),
  },
]

const processingSections = [
  {
    title: 'Webhosting (GitHub Pages)',
    paragraphs: [
      'Diese Website wird als statisches Projekt bei GitHub Pages, einem Service der GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA, gehostet.',
      'Beim Aufruf werden technisch bedingt Ihre IP-Adresse, Datum und Uhrzeit, Browserversion sowie die aufgerufene Ressource in Server-Logfiles gespeichert. GitHub nutzt diese Daten ausschließlich zur Sicherstellung des Betriebs und zur Missbrauchserkennung.',
      'Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einer sicheren Bereitstellung. GitHub löscht Logdaten laut eigenen Angaben innerhalb weniger Wochen.',
    ],
  },
  {
    title: 'Datenbank & API (Supabase)',
    paragraphs: [
      'Pins, Statusangaben und Zeitstempel werden über Supabase (Supabase Inc.) innerhalb der EU gespeichert. Die Kommunikation mit der Datenbank ist durchgehend TLS-verschlüsselt.',
      'Verarbeitet werden u. a. Geokoordinaten, Beschreibungen, freiwillige Kontaktangaben sowie technische Metadaten (IP-Adresse, User-Agent). Die Speicherung erfolgt solange, wie der Inhalt für die Karte benötigt wird oder gesetzliche Pflichten bestehen.',
      'Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO (vertragliche bzw. vorvertragliche Maßnahmen) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem stabilen Service). Supabase setzt zur Absicherung den Cloudflare-Cookie __cf_bm ein (siehe Abschnitt Cookies).',
    ],
  },
  {
    title: 'Kartenmaterial (OpenStreetMap)',
    paragraphs: [
      'Für die Kartendarstellung nutzen wir Tiles der OpenStreetMap Foundation (OSMF), St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Großbritannien.',
      'Beim Laden werden Ihre IP-Adresse sowie Browserinformationen an OSMF-Server übermittelt. OSMF kann Cookies oder ähnliche Technologien nutzen, um Missbrauch zu verhindern.',
      'Die Nutzung erfolgt auf Basis von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer anschaulichen Darstellung). Wenn eine Einwilligung abgefragt wird, erfolgt die Verarbeitung zusätzlich nach Art. 6 Abs. 1 lit. a DSGVO.',
    ],
  },
]

const cookieInfos = [
  {
    title: 'Eigene Cookies',
    detail:
      'Wir setzen keine Tracking- oder Komfort-Cookies ein. Die Anwendung funktioniert ohne LocalStorage, SessionStorage oder vergleichbare Persistenzmechanismen für personenbezogene Daten.',
  },
  {
    title: 'Supabase / Cloudflare (__cf_bm)',
    detail:
      'Beim Aufruf der Supabase-API kann Cloudflare den Sicherheits-Cookie __cf_bm setzen. Er dient der Bot-Erkennung und schützt unsere Infrastruktur vor Missbrauch. Die Lebensdauer liegt in der Regel unter 30 Minuten. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.',
  },
]

const rightsList = [
  'Auskunft über gespeicherte personenbezogene Daten (Art. 15 DSGVO)',
  'Berichtigung unrichtiger oder unvollständiger Daten (Art. 16 DSGVO)',
  'Löschung personenbezogener Daten, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO)',
  'Einschränkung der Verarbeitung unter den Voraussetzungen des Art. 18 DSGVO',
  'Widerspruch gegen Verarbeitungen nach Art. 6 Abs. 1 lit. e oder f DSGVO (Art. 21 DSGVO)',
  'Datenübertragbarkeit, soweit technisch möglich und rechtlich zulässig (Art. 20 DSGVO)',
  'Beschwerde bei einer Datenschutzaufsichtsbehörde, z. B. dem BayLDA',
]

const contactLines = ['Tolga Kaan Eskin', 'Trettachweg 2', '89231 Neu-Ulm', 'Deutschland']

export default function DatenschutzPage() {
  return (
    <main className='legal-page prose prose-zinc mx-auto max-w-4xl px-4 py-12 lg:py-16'>
      <header className='legal-page__hero'>
        <p className='legal-page__eyebrow'>Rechtliches</p>
        <h1>Datenschutzerklärung</h1>
        <p className='legal-page__lede'>Transparente Informationen zum Umgang mit personenbezogenen Daten.</p>
      </header>

      <article className='prose prose-zinc mt-10 max-w-none lg:prose-lg'>
        <section className='legal-page__section'>
          <h2>1. Datenschutz auf einen Blick</h2>
          <p>Die wichtigsten Informationen kompakt zusammengefasst.</p>
          <div className='grid gap-6 md:grid-cols-2'>
            {overviewHighlights.map((item) => (
              <article key={item.title} className='rounded-2xl border border-border/40 bg-muted/30 p-4 shadow-inner'>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='legal-page__section'>
          <h2>2. Verantwortliche Stelle</h2>
          <p>Die Verantwortliche im Sinne der DSGVO ist:</p>
          <address className='not-italic'>
            {contactLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div>
              E-Mail: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          </address>
          <p>
            Für Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte erreichen Sie uns jederzeit unter der genannten E-Mail-Adresse.
          </p>
        </section>

        <section className='legal-page__section'>
          <h2>3. Verarbeitungszwecke und Rechtsgrundlagen</h2>
          <p>Die wichtigsten Verarbeitungssituationen im Überblick:</p>
          <div className='space-y-8'>
            {processingSections.map((section) => (
              <article key={section.title} className='space-y-3'>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph, idx) => (
                  <p key={`${section.title}-${idx}`}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className='legal-page__section'>
          <h2>4. Cookies und ähnliche Technologien</h2>
          <p>Wir minimieren dauerhaft den Einsatz von Cookies. Drittanbieter setzen dennoch technische Cookies ein:</p>
          <div className='space-y-4'>
            {cookieInfos.map((cookie) => (
              <article key={cookie.title}>
                <h3>{cookie.title}</h3>
                <p>{cookie.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='legal-page__section'>
          <h2>5. Ihre Rechte</h2>
          <p>Sie können jederzeit die folgenden Rechte geltend machen:</p>
          <ul>
            {rightsList.map((right) => (
              <li key={right}>{right}</li>
            ))}
          </ul>
        </section>

        <section className='legal-page__section'>
          <h2>6. Quellen & Stand</h2>
          <p>Stand: November 2025</p>
          <p>
            Teile dieser Datenschutzerklärung basieren auf Vorlagen von <a href='https://www.e-recht24.de' target='_blank' rel='noreferrer'>e-recht24.de</a> und wurden für dieses Projekt angepasst.
          </p>
        </section>
      </article>
    </main>
  )
}
