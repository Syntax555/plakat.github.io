import MapView from './map-view.client'

export default function Home() {
	return (
		<div className='flex min-h-screen flex-col bg-zinc-100'>
			<header className='bg-blue-900 px-6 py-5 text-white shadow'>
				<div className='mx-auto flex w-full max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-between'>
					<div>
						<p className='text-sm uppercase tracking-wide text-blue-200'>
							CSU Neu-Ulm
						</p>
						<h1 className='text-2xl font-semibold'>
							Plakat-Planung auf einen Blick
						</h1>
					</div>
				</div>
			</header>
			<main className='mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8'>
				<MapView />
			</main>
		</div>
	)
}
