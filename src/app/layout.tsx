import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { VersionUpdatePrompt } from '../components/version-update-prompt'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap',
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap',
})

const bodyClassName = [
	geistSans.variable,
	geistMono.variable,
	'flex',
	'flex-col',
	'min-h-screen',
	'bg-zinc-50',
	'font-sans',
	'text-zinc-900',
	'antialiased',
].join(' ')

const metadataDescription = [
	'Standorte f\u00fcr CSU-Plakate verwalten, teilen',
	'und Abbau-Termine im Blick behalten.',
].join(' ')

const metadataOgDescription = [
	'Finde alle Plakatstandorte',
	'und die anstehenden Abbau-Termine der CSU Neu-Ulm.',
].join(' ')

export const metadata: Metadata = {
	title: 'Plakatkarte CSU Neu-Ulm',
	description: metadataDescription,
	openGraph: {
		title: 'Plakatkarte CSU Neu-Ulm',
		description: metadataOgDescription,
	},
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='de'>
			<head>
				<meta
					httpEquiv='Cache-Control'
					content='public, max-age=600, stale-while-revalidate=60'
				/>
			</head>
			<body
				suppressHydrationWarning
				className={bodyClassName}
			>
				<header className='bg-blue-900 px-6 py-5 text-white shadow'>
					<div className='mx-auto flex w-full max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between'>
						<div>
							<p className='text-sm uppercase tracking-wide text-blue-200'>
								CSU Neu-Ulm
							</p>
							<h1 className='text-2xl font-semibold'>
								Plakat-Planung auf einen Blick
							</h1>
						</div>
						<nav className='flex flex-wrap items-center gap-3 text-sm font-semibold'>
							<Link
								className='rounded-md bg-white px-4 py-2 text-blue-900 shadow transition hover:bg-blue-100'
								href='/'
							>
								Zur Karte
							</Link>
						</nav>
					</div>
				</header>
				<div className='flex-1 w-full'>{children}</div>
				<footer className='mt-12 border-t border-zinc-200 bg-white/90'>
					<div className='mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between'>
						<p className='text-center md:text-left'>
							Copyright &copy; {new Date().getFullYear()} Tolga Kaan Eskin. Alle
							Rechte vorbehalten.
						</p>
						<nav className='flex items-center justify-center gap-6 md:justify-end'>
							<Link
								className='transition-colors hover:text-zinc-900'
								href='/impressum'
							>
								Impressum
							</Link>
							<Link
								className='transition-colors hover:text-zinc-900'
								href='/datenschutz'
							>
								Datenschutz
							</Link>
						</nav>
					</div>
				</footer>
				<VersionUpdatePrompt />
			</body>
		</html>
	)
}
