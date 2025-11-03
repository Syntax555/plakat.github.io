import type { Metadata } from 'next'
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
	'min-h-screen',
	'bg-zinc-50',
	'font-sans',
	'text-zinc-900',
	'antialiased',
].join(' ')

const metadataDescription = [
	'Standorte für CSU-Plakate verwalten, teilen',
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='de'>
			<body
				suppressHydrationWarning
				className={bodyClassName}
			>
				{children}
				<footer className='mt-12 border-t border-zinc-200 bg-white/80'>
					<div className='mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-6 text-sm text-zinc-600 sm:flex-row sm:justify-between'>
						<p>&copy; {new Date().getFullYear()} Tolga Kaan Eskin</p>
						<nav className='flex items-center gap-4'>
							<Link
								className='hover:text-zinc-900'
								href='/impressum'
							>
								Impressum
							</Link>
							<Link
								className='hover:text-zinc-900'
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
