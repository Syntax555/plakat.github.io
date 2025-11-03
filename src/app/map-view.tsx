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
	expiresAt: string
}

type FormState = {
	title: string
	description: string
	expiresAt: string
}

const ACCESS_HASH = process.env.NEXT_PUBLIC_ACCESS_HASH ?? ''
const ACCESS_STORAGE_KEY = 'plakat-access-hash'

const toHexString = (buffer: ArrayBuffer) =>
	Array.from(new Uint8Array(buffer))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('')

const computeSHA256 = async (value: string) => {
	if (!globalThis.crypto?.subtle) {
		throw new Error('Kryptografische Funktionen werden nicht unterstützt.')
	}

	const encoder = new TextEncoder()
	const data = encoder.encode(value)
	const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
	return toHexString(digest)
}

const getTodayDateInputValue = () => {
	const now = new Date()
	// Normalize to local timezone so HTML date inputs show the correct day
	const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
	return local.toISOString().split('T')[0]
}

const createInitialFormState = (): FormState => ({
	title: '',
	description: '',
	expiresAt: getTodayDateInputValue(),
})

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

const expiredIcon = L.divIcon({
	className: 'pin-marker pin-marker--expired',
	iconSize: [30, 42],
	iconAnchor: [15, 42],
	popupAnchor: [0, -38],
	html: `
		<span class="pin-marker__pin"></span>
		<span class="pin-marker__shadow"></span>
	`,
})

type PasswordGateProps = {
	onSuccess: () => void
}

const PasswordGate = ({ onSuccess }: PasswordGateProps) => {
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isVerifying, setIsVerifying] = useState(false)

	const handlePasswordChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setPassword(event.target.value)
			if (error) {
				setError(null)
			}
		},
		[error],
	)

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (!ACCESS_HASH) {
				setError('Zugriff ist nicht konfiguriert.')
				return
			}

			setIsVerifying(true)
			try {
				const hashedInput = await computeSHA256(password)
				if (hashedInput === ACCESS_HASH) {
					if (typeof window !== 'undefined') {
						window.localStorage.setItem(ACCESS_STORAGE_KEY, hashedInput)
					}
					setPassword('')
					setError(null)
					onSuccess()
				} else {
					setError('Falsches Passwort.')
				}
			} catch (hashError) {
				console.error('Passwortprüfung fehlgeschlagen', hashError)
				setError('Passwortprüfung ist derzeit nicht möglich.')
			} finally {
				setIsVerifying(false)
			}
		},
		[password, onSuccess],
	)

	return (
		<div className='flex h-full min-h-screen flex-col items-center justify-center bg-zinc-100 p-4'>
			<div className='w-full max-w-sm rounded-lg bg-white p-6 shadow-sm'>
				<h1 className='text-lg font-semibold text-zinc-900'>
					Zugriff geschützt
				</h1>
				<p className='mt-2 text-sm text-zinc-600'>
					Bitte gib das Passwort ein, um die Karte zu öffnen.
				</p>
				<form className='mt-4 space-y-3' onSubmit={handleSubmit}>
					<div className='space-y-1'>
						<label
							className='text-sm font-medium text-zinc-900'
							htmlFor='access-password'
						>
							Passwort
						</label>
						<input
							id='access-password'
							type='password'
							value={password}
							onChange={handlePasswordChange}
							required
							autoComplete='current-password'
							className='w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
						/>
					</div>
					{error ? (
						<p className='text-sm text-red-600'>{error}</p>
					) : null}
					<button
						type='submit'
						className='w-full rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60'
						disabled={isVerifying}
					>
						{isVerifying ? 'Wird geprüft...' : 'Freischalten'}
					</button>
				</form>
			</div>
		</div>
	)
}

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

const legendDotExpiredClass = [legendDotBaseClass, 'bg-red-600'].join(' ')

const infoPanelCardClass = [
	'overflow-hidden',
	'rounded-lg',
	'bg-white',
	'shadow-sm',
].join(' ')

const infoPanelToggleButtonClass = [
	'flex',
	'w-full',
	'items-center',
	'justify-between',
	'gap-3',
	'px-4',
	'py-3',
	'text-left',
	'text-sm',
	'font-semibold',
	'text-blue-900',
	'transition',
	'duration-150',
	'hover:bg-blue-50',
	'focus-visible:outline-none',
	'focus-visible:ring-2',
	'focus-visible:ring-blue-400/70',
].join(' ')

const infoPanelIconClass = [
	'h-5',
	'w-5',
	'flex-shrink-0',
	'text-blue-900',
	'transition-transform',
	'duration-200',
].join(' ')

const infoPanelBodyBaseClass = [
	'space-y-3',
	'border-t',
	'border-zinc-200',
	'px-4',
	'py-4',
].join(' ')

const tileLayerAttribution = [
	'&copy; <a href="https://www.openstreetmap.org/copyright">',
	'OpenStreetMap</a> Mitwirkende',
].join(' ')

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

const INFO_PANEL_STORAGE_KEY = 'plakat-info-panel-open'
const INFO_PANEL_OPEN = 'open'
const INFO_PANEL_CLOSED = 'closed'

const mapContainerWrapperClass = [
	'flex-1',
	'overflow-hidden',
	'rounded-lg',
	'border',
	'border-zinc-200',
	'shadow-sm',
].join(' ')

const descriptionPlaceholder = [
	'Notizen zur Platzierung,',
	'z. B. Seite der Straße oder Besonderheiten',
].join(' ')

function isPinExpired(expiresAt: string): boolean {
	const parsed = new Date(expiresAt)
	if (Number.isNaN(parsed.getTime())) {
		return false
	}
	const endOfDay = new Date(parsed)
	endOfDay.setHours(23, 59, 59, 999)
	return endOfDay.getTime() < Date.now()
}

function formatDateShort(value: string): string {
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) {
		return value
	}
	return parsed.toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

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
				<div className={legendItemClass}>
					<span className={legendDotExpiredClass} />
					<span>Abbau überfällig (bitte prüfen)</span>
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
			expires_at?: unknown
			expiresAt?: unknown
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
		const expiresAtRaw =
			typeof candidate.expiresAt === 'string'
				? candidate.expiresAt
				: typeof candidate.expires_at === 'string'
					? candidate.expires_at
					: null
		const expiresAt =
			expiresAtRaw && !Number.isNaN(Date.parse(expiresAtRaw))
				? expiresAtRaw
				: null

		if (
			!id ||
			!title ||
			!Number.isFinite(latitude) ||
			!Number.isFinite(longitude) ||
			!createdAt ||
			!expiresAt
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
			expiresAt,
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
	expired: boolean
}

function PinPopupContent({
	pin,
	onDelete,
	isDeleting,
	expired,
}: PinPopupContentProps) {
	const expiryLabel = expired
		? 'Abbau überfällig seit'
		: 'Abbau spätestens am'
	const expiryValueClass = expired ? 'text-red-600 font-semibold' : undefined

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
				<p className='text-sm text-zinc-600'>
					<span className='font-medium text-zinc-800'>{expiryLabel}:</span>{' '}
					<span className={expiryValueClass}>
						{formatDateShort(pin.expiresAt)}
					</span>
				</p>
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
	const [isAuthenticated, setIsAuthenticated] = useState(() => !ACCESS_HASH)
	const [isAuthReady, setIsAuthReady] = useState(() => !ACCESS_HASH)
	const [pins, setPins] = useState<Pin[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [newPinLocation, setNewPinLocation] = useState<[number, number] | null>(
		null,
	)
	const [formState, setFormState] = useState<FormState>(createInitialFormState)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [isInfoOpen, setIsInfoOpen] = useState(true)
	const supabaseClient = supabase

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		const storedState = window.localStorage.getItem(INFO_PANEL_STORAGE_KEY)
		if (storedState === INFO_PANEL_CLOSED) {
			setIsInfoOpen(false)
		}
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		try {
			window.localStorage.setItem(
				INFO_PANEL_STORAGE_KEY,
				isInfoOpen ? INFO_PANEL_OPEN : INFO_PANEL_CLOSED,
			)
		} catch (storageError) {
			console.warn('Failed to persist info panel state', storageError)
		}
	}, [isInfoOpen])

	useEffect(() => {
		if (!ACCESS_HASH) {
			return
		}
		if (typeof window === 'undefined') {
			return
		}

		const storedHash = window.localStorage.getItem(ACCESS_STORAGE_KEY)
		if (storedHash && storedHash === ACCESS_HASH) {
			setIsAuthenticated(true)
		}
		setIsAuthReady(true)
	}, [])

	useEffect(() => {
		if (!isAuthenticated) {
			return
		}

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
	}, [isAuthenticated, supabaseClient])

	const handleMapClick = useCallback((event: LeafletMouseEvent) => {
		setNewPinLocation([event.latlng.lat, event.latlng.lng])
		setFormState(createInitialFormState())
	}, [])

	const toggleInfoPanel = useCallback(() => {
		setIsInfoOpen(previous => !previous)
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
			const expiresAtValue = formState.expiresAt

			if (!expiresAtValue) {
				setError('Bitte wähle einen Abbau-Termin.')
				return
			}

			const expiresAtDate = new Date(expiresAtValue)
			if (Number.isNaN(expiresAtDate.getTime())) {
				setError('Der Abbau-Termin ist ungültig.')
				return
			}

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
					expires_at: expiresAtValue,
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
					setFormState(createInitialFormState())
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
			formState.expiresAt,
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

	const handleExpiresAtChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const { value } = event.target
			setFormState(previous => ({
				...previous,
				expiresAt: value,
			}))
		},
		[setFormState],
	)

	const handleCancelNewPin = useCallback(() => {
		setNewPinLocation(null)
		setFormState(createInitialFormState())
	}, [])

	const markers = useMemo(
		() =>
			pins.map(pin => {
				const expired = isPinExpired(pin.expiresAt)
				const markerIcon = expired ? expiredIcon : defaultIcon

				return (
					<Marker
						key={pin.id}
						position={[pin.latitude, pin.longitude]}
						icon={markerIcon}
					>
						<Popup>
							<PinPopupContent
								pin={pin}
								onDelete={handleDelete}
								isDeleting={deletingId === pin.id}
								expired={expired}
							/>
						</Popup>
					</Marker>
				)
			}),
		[deletingId, handleDelete, pins],
	)

	if (!isAuthReady) {
		return null
	}

	if (!isAuthenticated) {
		return (
			<PasswordGate
				onSuccess={() => {
					setIsAuthenticated(true)
					setIsAuthReady(true)
				}}
			/>
		)
	}

	return (
		<div className='flex h-full min-h-0 flex-col gap-4'>
			<div className={infoPanelCardClass}>
				<button
					type='button'
					onClick={toggleInfoPanel}
					className={infoPanelToggleButtonClass}
					aria-expanded={isInfoOpen}
					aria-controls='map-info-panel'
				>
					<span>Hinweise &amp; Legende</span>
					<svg
						className={`${infoPanelIconClass} ${isInfoOpen ? 'rotate-180' : ''}`}
						viewBox='0 0 24 24'
						fill='none'
						aria-hidden='true'
					>
						<path
							d='M6 7.5L12 13.5L18 7.5'
							stroke='currentColor'
							strokeWidth='1.8'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<path
							d='M6 12L12 18L18 12'
							stroke='currentColor'
							strokeWidth='1.8'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</button>
				<div
					id='map-info-panel'
					className={`${infoPanelBodyBaseClass} ${isInfoOpen ? 'block' : 'hidden'}`}
				>
					<p className='text-sm text-zinc-600'>
						Tippe oder klicke auf die Karte, um einen neuen Standort für ein
						Plakat zu setzen. Jeder Pin ist für alle sichtbar und kann mit einem
						Titel sowie einer optionalen Beschreibung versehen werden.
					</p>
					<p className='text-sm text-zinc-600'>
						Bitte hinterlege auch einen Abbau-Termin, damit fällige Plakate
						schnell erkannt und entfernt werden können.
					</p>
					<MapLegend />
				</div>
				{error ? (
					<div className='border-t border-red-100 bg-red-50 px-4 py-3'>
						<p className='text-sm text-red-600'>{error}</p>
					</div>
				) : null}
				{isLoading ? (
					<div className='border-t border-zinc-200 px-4 py-3'>
						<p className='text-sm text-zinc-500'>Pins werden geladen...</p>
					</div>
				) : null}
			</div>
			<div className={mapContainerWrapperClass}>
				<MapContainer
					center={defaultCenter}
					zoom={15}
					className='h-full min-h-[320px] w-full'
					scrollWheelZoom
				>
					<TileLayer
						attribution={tileLayerAttribution}
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
											placeholder={descriptionPlaceholder}
											className={textAreaClassName}
										/>
									</div>
									<div className='space-y-1'>
										<label
											className='text-sm font-medium text-zinc-900'
											htmlFor='pin-expires-at'
										>
											Abbau-Termin
										</label>
										<input
											id='pin-expires-at'
											type='date'
											value={formState.expiresAt}
											onChange={handleExpiresAtChange}
											required
											className={inputClassName}
										/>
										<p className='text-xs text-zinc-500'>
											Ab diesem Datum markiert die Karte den Pin rot.
										</p>
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
