'use client'

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent,
} from 'react'
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

const pendingIcon = L.divIcon({
	className: 'pin-marker pin-marker--pending',
	iconSize: [30, 42],
	iconAnchor: [15, 42],
	popupAnchor: [0, -38],
	html: `
		<span class="pin-marker__pin"></span>
		<span class="pin-marker__shadow"></span>
	`,
})

const deleteButtonClass = [
	'w-full',
	'rounded',
	'bg-red-600',
	'px-3',
	'py-2',
	'text-sm',
	'font-medium',
	'text-white',
	'hover:bg-red-700',
	'focus-visible:outline',
	'focus-visible:outline-2',
	'focus-visible:outline-offset-2',
	'focus-visible:outline-red-700',
	'cursor-pointer',
].join(' ')

const cancelButtonClass = [
	'rounded',
	'border',
	'border-zinc-300',
	'px-3',
	'py-2',
	'text-sm',
	'font-medium',
	'text-zinc-700',
	'hover:bg-zinc-100',
	'focus-visible:outline',
	'focus-visible:outline-2',
	'focus-visible:outline-offset-2',
	'focus-visible:outline-zinc-400',
	'cursor-pointer',
].join(' ')

const submitButtonClass = [
	'rounded',
	'bg-blue-600',
	'px-3',
	'py-2',
	'text-sm',
	'font-semibold',
	'text-white',
	'hover:bg-blue-700',
	'focus-visible:outline',
	'focus-visible:outline-2',
	'focus-visible:outline-offset-2',
	'focus-visible:outline-blue-700',
	'cursor-pointer',
].join(' ')

const legendContainerClass = [
	'mt-3',
	'flex',
	'flex-col',
	'gap-2',
	'cursor-default',
	'md:flex-row',
	'md:items-center',
	'md:gap-3',
].join(' ')

const legendLabelClass = [
	'text-sm',
	'font-semibold',
	'text-zinc-800',
].join(' ')

const legendListClass = [
	'flex',
	'flex-col',
	'gap-2',
	'md:flex-row',
	'md:gap-3',
].join(' ')

const legendItemClass = [
	'flex',
	'items-center',
	'gap-2',
	'text-sm',
	'text-zinc-600',
].join(' ')

const legendDotBaseClass = [
	'h-3',
	'w-3',
	'rounded-full',
	'border',
	'border-white',
	'shadow-sm',
].join(' ')

const legendDotDefaultClass = [legendDotBaseClass, 'bg-blue-600'].join(' ')

const legendDotPendingClass = [legendDotBaseClass, 'bg-orange-500'].join(' ')

const inputClassName = [
	'w-full',
	'rounded',
	'border',
	'border-zinc-300',
	'px-3',
	'py-2',
	'text-sm',
	'focus:border-blue-500',
	'focus:outline-none',
	'focus:ring-2',
	'focus:ring-blue-500/30',
].join(' ')

const textAreaClassName = [
	'w-full',
	'rounded',
	'border',
	'border-zinc-300',
	'px-3',
	'py-2',
	'text-sm',
	'focus:border-blue-500',
	'focus:outline-none',
	'focus:ring-2',
	'focus:ring-blue-500/30',
].join(' ')

function MapLegend() {
	return (
		<div className={legendContainerClass}>
			<p className={legendLabelClass}>Legende:</p>
			<div className={legendListClass}>
				<div className={legendItemClass}>
					<span className={legendDotDefaultClass} />
					<span>Bestehender Pin</span>
				</div>
				<div className={legendItemClass}>
					<span className={legendDotPendingClass} />
					<span>Neuer Pin (noch nicht gespeichert)</span>
				</div>
			</div>
		</div>
	)
}

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

	return sortPins(normalized)
}

function sortPins(entries: Pin[]): Pin[] {
	return [...entries].sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)
}

type PinPopupContentProps = {
	pin: Pin
	onDelete: (pinId: string) => void
	isDeleting: boolean
}

function PinPopupContent({ pin, onDelete, isDeleting }: PinPopupContentProps) {
	const handleDeleteClick = useCallback(() => {
		onDelete(pin.id)
	}, [onDelete, pin.id])

	return (
		<div className='space-y-2 cursor-default'>
			<div>
				<h3 className='text-base font-semibold text-zinc-900'>{pin.title}</h3>
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
				onClick={handleDeleteClick}
				className={deleteButtonClass}
				disabled={isDeleting}
			>
				{isDeleting ? 'Wird gelöscht...' : 'Pin löschen'}
			</button>
		</div>
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
				'Supabase ist nicht konfiguriert. Bitte Umgebungsvariablen prüfen.',
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
		async (event: FormEvent<HTMLFormElement>) => {
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

			const confirmed = window.confirm(
				'Willst du diesen Pin wirklich löschen?',
			)

			if (!confirmed) {
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
					setError('Der Pin konnte nicht gelöscht werden.')
				} else {
					setPins(previous => previous.filter(pin => pin.id !== pinId))
					setError(null)
				}
			} catch (deleteUnexpectedError) {
				console.error('Unexpected Supabase delete error', deleteUnexpectedError)
				setError('Der Pin konnte nicht gelöscht werden.')
			} finally {
				setDeletingId(null)
			}
		},
		[supabaseClient],
	)

	const handleTitleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target
			setFormState(previous => ({
				...previous,
				title: value,
			}))
		},
		[setFormState],
	)

	const handleDescriptionChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			const { value } = event.target
			setFormState(previous => ({
				...previous,
				description: value,
			}))
		},
		[setFormState],
	)

	const handleCancelNewPin = useCallback(() => {
		setNewPinLocation(null)
	}, [])

	const markers = useMemo(
		() =>
			pins.map(pin => (
				<Marker
					key={pin.id}
					position={[pin.latitude, pin.longitude]}
					icon={defaultIcon}
				>
					<Popup>
						<PinPopupContent
							pin={pin}
							onDelete={handleDelete}
							isDeleting={deletingId === pin.id}
						/>
					</Popup>
				</Marker>
			)),
		[deletingId, handleDelete, pins],
	)

	return (
		<div className='flex h-full flex-col gap-4'>
			<div className='rounded-lg bg-white p-4 shadow-sm cursor-default'>
				<h2 className='text-lg font-semibold text-zinc-900'>
					Karte der CSU Neu-Ulm
				</h2>
				<p className='mt-1 text-sm text-zinc-600'>
					Tippe oder klicke auf die Karte, um einen neuen Standort für ein
					Plakat zu setzen. Jeder Pin ist für alle sichtbar und kann mit einem
					Titel sowie einer optionalen Beschreibung versehen werden.
				</p>
				<MapLegend />
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
						<Marker position={newPinLocation} icon={pendingIcon}>
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
											onChange={handleTitleChange}
											required
											placeholder='Zum Beispiel: Plakat Laternenmast'
											className={inputClassName}
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
											onChange={handleDescriptionChange}
											rows={3}
											placeholder='Notizen zur Platzierung, z. B. Seite der Straße oder Besonderheiten'
											className={textAreaClassName}
										/>
									</div>
									<div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
										<button
											type='button'
											onClick={handleCancelNewPin}
											className={cancelButtonClass}
											disabled={isSubmitting}
										>
											Abbrechen
										</button>
										<button
											type='submit'
											className={submitButtonClass}
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
