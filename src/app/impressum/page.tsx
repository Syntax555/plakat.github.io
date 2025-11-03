import Link from 'next/link'

export const metadata = {
	title: 'Impressum',
}

const email = 'tolga_kaan_eskin@proton.me'

export default function ImpressumPage() {
	return (
		<main className='mx-auto max-w-3xl px-4 py-12'>
			<h1 className='text-3xl font-semibold text-zinc-900'>Impressum</h1>
			<section className='mt-6 space-y-4 text-zinc-700'>
				<p>Tolga Kaan Eskin</p>
				<p>
					Trettachweg 2
					<br />
					89231 Neu-Ulm
				</p>
				<div>
					<p className='font-medium text-zinc-900'>Kontakt</p>
					<p>
						E-Mail:{' '}
						<Link
							className='text-blue-600 underline hover:text-blue-700'
							href={`mailto:${email}`}
						>
							{email}
						</Link>
					</p>
				</div>
			</section>
		</main>
	)
}
