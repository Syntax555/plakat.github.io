import type { Metadata } from 'next'
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
				<VersionUpdatePrompt />
			</body>
		</html>
	)
}
