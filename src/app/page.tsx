import MapView from './map-view.client'

export default function Home() {
	return (
		<main className='mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8'>
			<MapView />
		</main>
	)
}
