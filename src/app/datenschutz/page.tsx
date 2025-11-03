export const metadata = {
  title: 'Datenschutzerklärung',
}

const sections = {
  title: 'Datenschutz\u00aderklärung',
}

const overviewHighlights = [
  {
    title: 'Verantwortliche Stelle',
    body: (
      <>
        Tolga Kaan Eskin
        <br />
        Trettachweg 2, 89231 Neu-Ulm
        <br />
        <a href='mailto:Tolga_Kaan_Eskin@bsz-neu-ulm.de'>Tolga_Kaan_Eskin@bsz-neu-ulm.de</a>
      </>
    ),
  },
  {
    title: 'Welche Daten fallen an?',
    body: (
      <>
        Server-Logdaten (IP-Adresse, Zeitstempel, Browser), Nutzungsdaten der Karte sowie Inhalte,
        die Sie freiwillig übermitteln (z.&nbsp;B. Pin-Informationen).
      </>
    ),
  },
  {
    title: 'Warum erheben wir Daten?',
    body: (
      <>
        Zur Bereitstellung der Website, zur Darstellung der Karte, zur Absicherung unserer Systeme
        sowie, falls nötig, zur Bearbeitung von Anfragen.
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
      'Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einer sicheren und effizienten Bereitstellung der Website. GitHub löscht Logdaten nach eigenen Angaben innerhalb weniger Wochen.'
    ],
  },
  {
    title: 'Datenbank & API (Supabase)',
    paragraphs: [
      'Inhalte wie Pins, Statusangaben oder Zeitstempel werden über den Dienst Supabase (Supabase Inc.) in einer Datenbank mit Standort innerhalb der EU gespeichert. Die Kommunikation läuft ausschließlich verschlüsselt (TLS).',
      'Verarbeitet werden unter anderem Geokoordinaten, Beschreibungen, optionale Kontaktangaben sowie technische Meta-Daten des Requests. Die Daten werden solange gespeichert, wie sie für die Anzeige der Karte benötigt werden oder rechtliche Pflichten bestehen.',
      'Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung vorvertraglicher Maßnahmen bzw. vertraglicher Pflichten) sowie Art. 6 Abs. 1 lit. f DSGVO (Interesse an einer stabilen Bereitstellung). Supabase setzt zur Absicherung der Infrastruktur den Cookie __cf_bm von Cloudflare ein (siehe Abschnitt Cookies).' 
    ],
  },
  {
    title: 'Kartenmaterial (OpenStreetMap)',
    paragraphs: [
      'Für die Kartendarstellung verwenden wir Tiles der OpenStreetMap Foundation (OSMF), St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Großbritannien.',
      'Beim Laden der Karte werden mindestens Ihre IP-Adresse und Browserinformationen an Server der OSMF übertragen. OSMF kann Cookies oder vergleichbare Wiedererkennungstechnologien einsetzen.',
      'Die Nutzung erfolgt auf Basis von Art. 6 Abs. 1 lit. f DSGVO, weil wir ein berechtigtes Interesse an einer anschaulichen Darstellung von Standorten haben. Sofern eine entsprechende Einwilligung abgefragt wird, erfolgt die Verarbeitung zusätzlich auf Basis von Art. 6 Abs. 1 lit. a DSGVO.'
    ],
  },
]

const cookieInfos = [
  {
    title: 'Eigene Cookies',
    detail:
      'Wir setzen aktuell keine eigenen Tracking- oder Komfort-Cookies ein. Die Anwendung funktioniert vollständig ohne lokale Persistenz-Mechanismen wie LocalStorage oder SessionStorage für personenbezogene Daten.',
  },
  {
    title: 'Supabase / Cloudflare (__cf_bm)',
    detail:
      'Beim Aufruf der Supabase-API kann der Sicherheits-Cookie __cf_bm gesetzt werden. Er wird von Cloudflare genutzt, um Bots zu erkennen und unsere Infrastruktur vor Missbrauch zu schützen. Die Lebensdauer beträgt in der Regel unter 30 Minuten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Absicherung des Dienstes).',
  },
]

const rightsList = [
  'Auskunft über gespeicherte personenbezogene Daten (Art. 15 DSGVO)',
  'Berichtigung unrichtiger oder unvollständiger Daten (Art. 16 DSGVO)',
  'Löschung personenbezogener Daten, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO)',
  'Einschränkung der Verarbeitung unter den Voraussetzungen des Art. 18 DSGVO',
  'Widerspruch gegen Verarbeitungen, die auf Art. 6 Abs. 1 lit. e oder f DSGVO gestützt sind (Art. 21 DSGVO)',
  'Datenübertragbarkeit, soweit technisch möglich und rechtlich zulässig (Art. 20 DSGVO)',
  'Beschwerde bei einer Datenschutzaufsichtsbehörde, z. B. dem Bayerischen Landesamt für Datenschutzaufsicht (BayLDA)'
]

const contactLines = [
  'Tolga Kaan Eskin',
  'Trettachweg 2',
  '89231 Neu-Ulm',
  'Deutschland',
]

export default function DatenschutzPage() {
  return (
    <main className='datenschutz-page prose prose-zinc mx-auto max-w-4xl px-4 py-12 lg:py-16'>
      <header className='datenschutz-page__hero'>
        <p className='datenschutz-page__eyebrow'>Rechtliches</p>
        <h1>{sections.title}</h1>
        <p className='datenschutz-page__lede'>
          Transparente Informationen zum Umgang mit personenbezogenen Daten auf dieser Plattform.
        </p>
      </header>

      <article className='prose prose-zinc mt-10 max-w-none lg:prose-lg'>
        <section className='datenschutz-page__section'>
          <h2>1. Datenschutz auf einen Blick</h2>
          <p>
            Die folgenden Punkte fassen zusammen, welche Daten wir verarbeiten, wofür wir sie nutzen und an wen Sie
            sich wenden können.
          </p>

          <div className='grid gap-6 md:grid-cols-2'>
            {overviewHighlights.map((item) => (
              <article key={item.title} className='rounded-2xl border border-border/40 bg-muted/30 p-4 shadow-inner'>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='datenschutz-page__section'>
          <h2>2. Verantwortliche Stelle</h2>
          <p>Die verantwortliche Stelle im Sinne der DSGVO ist:</p>
          <address className='not-italic'>
            {contactLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div>E-Mail: <a href='mailto:Tolga_Kaan_Eskin@bsz-neu-ulm.de'>Tolga_Kaan_Eskin@bsz-neu-ulm.de</a></div>
          </address>
          <p>
            Für alle Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie sich unter der oben genannten
            E-Mail-Adresse melden.
          </p>
        </section>

        <section className='datenschutz-page__section'>
          <h2>3. Verarbeitungszwecke und Rechtsgrundlagen</h2>
          <p>
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unserer Dienste, zur
            Kommunikation oder zur IT-Sicherheit erforderlich ist. Die wichtigsten Verarbeitungen im Überblick:
          </p>
          <div className='space-y-8'>
            {processingSections.map((section) => (
              <article key={section.title} className='space-y-3'>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className='datenschutz-page__section'>
          <h2>4. Cookies und ähnliche Technologien</h2>
          <p>
            Unser Ziel ist es, so wenig Daten wie möglich zu speichern. Daher verzichten wir auf Tracking- und
            Marketing-Cookies. Drittanbieter setzen jedoch teilweise technische Cookies ein:
          </p>
          <div className='space-y-4'>
            {cookieInfos.map((cookie) => (
              <article key={cookie.title}>
                <h3>{cookie.title}</h3>
                <p>{cookie.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='datenschutz-page__section'>
          <h2>5. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht, die unten aufgeführten Betroffenenrechte geltend zu machen. Am einfachsten
            erreichen Sie uns dafür per E-Mail. Darüber hinaus steht Ihnen ein Beschwerderecht bei jeder
            Datenschutzaufsichtsbehörde zu.
          </p>
          <ul>
            {rightsList.map((right) => (
              <li key={right}>{right}</li>
            ))}
          </ul>
        </section>

        <section className='datenschutz-page__section'>
          <h2>6. Quellen & Stand</h2>
          <p>Stand: November 2025</p>
          <p>
            Teile dieser Datenschutzerklärung basieren auf Vorlagen von{' '}
            <a href='https://www.e-recht24.de' target='_blank' rel='noreferrer'>
              e-recht24.de
            </a>{' '}
            und wurden für dieses Projekt individuell angepasst.
          </p>
        </section>
      </article>
    </main>
  )
}
