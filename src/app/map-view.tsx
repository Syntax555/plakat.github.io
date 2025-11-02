'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMapEvents,
} from 'react-leaflet'
import L, { type LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase-client'

type Pin = {
	id: string
	title: string
	description?: string
	latitude: number
	longitude: number
	createdAt: string
}

type FormState = {
	title: string
	description: string
}

const SUPABASE_TABLE = 'Pins'

const defaultCenter: [number, number] = [48.392578, 10.011085]

const defaultIcon = L.divIcon({
	className: 'pin-marker',
	iconSize: [30, 42],
	iconAnchor: [15, 42],
	popupAnchor: [0, -38],
	html: `
		<span class="pin-marker__pin"></span>
		<span class="pin-marker__shadow"></span>
	`,
})

function MapClickHandler({
	onClick,
}: {
	onClick: (event: LeafletMouseEvent) => void
}) {
	useMapEvents({
		click(event) {
			onClick(event)
		},
	})
	return null
}

function normalizePins(data: unknown): Pin[] {
	if (!Array.isArray(data)) {
		return []
	}

	const normalized: Pin[] = []

	for (const item of data) {
		if (!item || typeof item !== 'object') {
			continue
		}

		const candidate = item as Partial<Pin> & {
			latitude?: unknown
			longitude?: unknown
			created_at?: unknown
		}

		const id = typeof candidate.id === 'string' ? candidate.id : null
		const title = typeof candidate.title === 'string' ? candidate.title : null
		const latitude = Number(candidate.latitude)
		const longitude = Number(candidate.longitude)
		const createdAtRaw =
			typeof candidate.createdAt === 'string'
				? candidate.createdAt
				: typeof candidate.created_at === 'string'
					? candidate.created_at
					: null
		const createdAt =
			createdAtRaw && !Number.isNaN(Date.parse(createdAtRaw))
				? createdAtRaw
				: null

		if (
			!id ||
			!title ||
			!Number.isFinite(latitude) ||
			!Number.isFinite(longitude) ||
			!createdAt
		) {
			continue
		}

		normalized.push({
			id,
			title,
			description:
				typeof candidate.description === 'string'
					? candidate.description
					: undefined,
			latitude,
			longitude,
			createdAt,
		})
	}

	return normalized.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)
}

function sortPins(entries: Pin[]): Pin[] {
	return [...entries].sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)
}

export function MapView() {
	const [pins, setPins] = useState<Pin[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [newPinLocation, setNewPinLocation] = useState<[number, number] | null>(
		null,
	)
	const [formState, setFormState] = useState<FormState>({
		title: '',
		description: '',
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const supabaseClient = supabase

	useEffect(() => {
		if (!supabaseClient) {
			setError(
				'Supabase ist nicht konfiguriert. Bitte Umgebungsvariablen pruefen.',
			)
			setIsLoading(false)
			return
		}

		let isMounted = true

		const loadPins = async () => {
			setIsLoading(true)
			const { data, error: loadError } = await supabaseClient
				.from(SUPABASE_TABLE)
				.select('*')
				.order('created_at', { ascending: false })

			if (!isMounted) {
				return
			}

			if (loadError) {
				console.error('Failed to load pins from Supabase', loadError)
				setError('Die Pins konnten nicht geladen werden.')
			} else {
				setPins(normalizePins(data ?? []))
				setError(null)
			}

			setIsLoading(false)
		}

		void loadPins()

		const channel = supabaseClient
			.channel('public:pins-stream')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: SUPABASE_TABLE },
				payload => {
					if (!payload) {
						return
					}

					setPins(previousPins => {
						if (payload.eventType === 'DELETE') {
							const removedId =
								typeof payload.old === 'object' && payload.old !== null
									? (payload.old as { id?: string }).id
									: undefined
							if (!removedId) {
								return previousPins
							}
							return previousPins.filter(pin => pin.id !== removedId)
						}

						const normalized = normalizePins(
							payload.new ? [payload.new] : [],
						)
						if (!normalized.length) {
							return previousPins
						}

						const [updatedPin] = normalized
						const filtered = previousPins.filter(
							pin => pin.id !== updatedPin.id,
						)
						return sortPins([updatedPin, ...filtered])
					})
				},
			)
			.subscribe()

		return () => {
			isMounted = false
			void channel.unsubscribe()
		}
	}, [supabaseClient])

	const handleMapClick = useCallback((event: LeafletMouseEvent) => {
		setNewPinLocation([event.latlng.lat, event.latlng.lng])
		setFormState({ title: '', description: '' })
	}, [])

	const submitNewPin = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (!newPinLocation) {
				return
			}

			const trimmedTitle = formState.title.trim()
			if (!trimmedTitle) {
				setError('Bitte gib dem Pin einen Titel.')
				return
			}

			const trimmedDescription = formState.description.trim()

			setIsSubmitting(true)

			if (!supabaseClient) {
				setError('Supabase ist nicht konfiguriert.')
				setIsSubmitting(false)
				return
			}

			try {
				const newPinRecord = {
					title: trimmedTitle,
					description: trimmedDescription ? trimmedDescription : null,
					latitude: newPinLocation[0],
					longitude: newPinLocation[1],
				}

				const { data, error: insertError } = await supabaseClient
					.from(SUPABASE_TABLE)
					.insert(newPinRecord)
					.select()
					.maybeSingle()

				if (insertError || !data) {
					console.error('Failed to insert pin via Supabase', insertError)
					setError('Der Pin konnte nicht gespeichert werden.')
				} else {
					const [insertedPin] = normalizePins([data])
					if (insertedPin) {
						setPins(previous =>
							sortPins([
								insertedPin,
								...previous.filter(pin => pin.id !== insertedPin.id),
							]),
						)
					}
					setNewPinLocation(null)
					setFormState({ title: '', description: '' })
					setError(null)
				}
			} catch (insertUnexpectedError) {
				console.error('Unexpected Supabase error', insertUnexpectedError)
				setError('Der Pin konnte nicht gespeichert werden.')
			} finally {
				setIsSubmitting(false)
			}
		},
		[
			formState.description,
			formState.title,
			newPinLocation,
			supabaseClient,
		],
	)

	const handleDelete = useCallback(
		async (pinId: string) => {
			if (!pinId) {
				return
			}

			setDeletingId(pinId)

			if (!supabaseClient) {
				setError('Supabase ist nicht konfiguriert.')
				setDeletingId(null)
				return
			}

			try {
				const { error: deleteError } = await supabaseClient
					.from(SUPABASE_TABLE)
					.delete()
					.eq('id', pinId)

				if (deleteError) {
					console.error('Failed to delete pin via Supabase', deleteError)
					setError('Der Pin konnte nicht geloescht werden.')
				} else {
					setPins(previous => previous.filter(pin => pin.id !== pinId))
					setError(null)
				}
			} catch (deleteUnexpectedError) {
				console.error('Unexpected Supabase delete error', deleteUnexpectedError)
				setError('Der Pin konnte nicht geloescht werden.')
			} finally {
				setDeletingId(null)
			}
		},
		[supabaseClient],
	)

	const markers = useMemo(
		() =>
			pins.map(pin => (
				<Marker
					key={pin.id}
					position={[pin.latitude, pin.longitude]}
					icon={defaultIcon}
				>
					<Popup>
						<div className='space-y-2'>
							<div>
								<h3 className='text-base font-semibold text-zinc-900'>
									{pin.title}
								</h3>
								{pin.description ? (
									<p className='text-sm text-zinc-600 whitespace-pre-wrap'>
										{pin.description}
									</p>
								) : (
									<p className='text-sm italic text-zinc-500'>
										Keine Beschreibung hinterlegt.
									</p>
								)}
							</div>
							<button
								type='button'
								onClick={() => handleDelete(pin.id)}
								className='w-full rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'
								disabled={deletingId === pin.id}
							>
								{deletingId === pin.id
									? 'Wird geloescht...'
									: 'Pin loeschen'}
							</button>
						</div>
					</Popup>
				</Marker>
			)),
		[deletingId, handleDelete, pins],
	)

	return (
		<div className='flex h-full flex-col gap-4'>
			<div className='rounded-lg bg-white p-4 shadow-sm'>
				<h2 className='text-lg font-semibold text-zinc-900'>
					Karte der CSU Neu-Ulm
				</h2>
				<p className='mt-1 text-sm text-zinc-600'>
					Tippe oder klicke auf die Karte, um einen neuen Standort fuer ein
					Plakat zu setzen. Jeder Pin ist fuer alle sichtbar und kann mit einem
					Titel sowie einer optionalen Beschreibung versehen werden.
				</p>
				{error ? (
					<p className='mt-2 text-sm text-red-600'>{error}</p>
				) : null}
				{isLoading ? (
					<p className='mt-2 text-sm text-zinc-500'>Pins werden geladen...</p>
				) : null}
			</div>
			<div className='flex-1 overflow-hidden rounded-lg border border-zinc-200 shadow-sm'>
				<MapContainer
					center={defaultCenter}
					zoom={15}
					className='h-[70vh] w-full md:h-[calc(100vh-220px)]'
					scrollWheelZoom
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>
					<MapClickHandler onClick={handleMapClick} />
					{markers}
					{newPinLocation ? (
						<Marker position={newPinLocation} icon={defaultIcon}>
							<Popup>
								<form className='space-y-3' onSubmit={submitNewPin}>
									<div className='space-y-1'>
										<label
											className='text-sm font-medium text-zinc-900'
											htmlFor='pin-title'
										>
											Titel
										</label>
										<input
											id='pin-title'
											type='text'
											value={formState.title}
											onChange={event =>
												setFormState(previous => ({
													...previous,
													title: event.target.value,
												}))
											}
											required
											placeholder='Zum Beispiel: Plakat Laternenmast'
											className='w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
										/>
									</div>
									<div className='space-y-1'>
										<label
											className='text-sm font-medium text-zinc-900'
											htmlFor='pin-description'
										>
											Beschreibung (optional)
										</label>
										<textarea
											id='pin-description'
											value={formState.description}
											onChange={event =>
												setFormState(previous => ({
													...previous,
													description: event.target.value,
												}))
											}
											rows={3}
											placeholder='Notizen zur Platzierung, z. B. Seite der Strasse oder Besonderheiten'
											className='w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
										/>
									</div>
									<div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
										<button
											type='button'
											onClick={() => setNewPinLocation(null)}
											className='rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400'
											disabled={isSubmitting}
										>
											Abbrechen
										</button>
										<button
											type='submit'
											className='rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
											disabled={isSubmitting}
										>
											{isSubmitting ? 'Speichern...' : 'Pin speichern'}
										</button>
									</div>
								</form>
							</Popup>
						</Marker>
					) : null}
				</MapContainer>
			</div>
		</div>
	)
}
