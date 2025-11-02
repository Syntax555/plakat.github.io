'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(
	() => import('./map-view').then(module => module.MapView),
	{
		ssr: false,
		loading: () => (
			<div className='flex h-[70vh] w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-sm text-zinc-500'>
				Karte wird geladen...
			</div>
		),
	},
)

export default function MapViewClient() {
	return <MapView />
}
