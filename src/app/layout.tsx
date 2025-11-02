import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
	title: 'Plakatkarte CSU Neu-Ulm',
	description:
		'Standorte für CSU-Plakate verwalten, teilen und Abbau-Termine im Blick behalten.',
	openGraph: {
		title: 'Plakatkarte CSU Neu-Ulm',
		description:
			'Finde alle Plakatstandorte und die anstehenden Abbau-Termine der CSU Neu-Ulm.',
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
			</body>
		</html>
	)
}
