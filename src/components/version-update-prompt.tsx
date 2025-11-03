'use client'

import { useEffect, useRef, useState } from 'react'

const CHECK_INTERVAL_MS = 60_000
const AUTO_RELOAD_DELAY_MS = 30_000
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

type NextWindow = Window & {
	__NEXT_DATA__?: {
		assetPrefix?: string
	}
}

const normalizeBasePath = (input: string | null | undefined) => {
	if (!input) {
		return ''
	}

	const trimmed = input.trim().replace(/\/+$/, '')
	if (!trimmed || trimmed === '.') {
		return ''
	}

	return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const detectBasePathFromDocument = () => {
	if (typeof document === 'undefined' || typeof window === 'undefined') {
		return ''
	}

	const scriptElements = Array.from(
		document.querySelectorAll<HTMLScriptElement>('script[src*="/_next/"]'),
	)

	for (const script of scriptElements) {
		const src = script.getAttribute('src')
		if (!src) {
			continue
		}

		try {
			const url = new URL(src, window.location.origin)
			const staticIndex = url.pathname.indexOf('/_next/')
			if (staticIndex > 0) {
				return url.pathname.slice(0, staticIndex)
			}
		} catch {
			continue
		}
	}

	if (window.location.hostname.endsWith('.github.io')) {
		const segments = window.location.pathname.split('/').filter(Boolean)
		if (segments.length > 0) {
			return `/${segments[0]}`
		}
	}

	return ''
}

const getVersionEndpoint = () => {
	const envBasePath = normalizeBasePath(BASE_PATH)
	if (envBasePath) {
		return `${envBasePath}/version.json`
	}

	if (typeof window !== 'undefined') {
		const nextWindow = window as NextWindow
		const assetPrefix = normalizeBasePath(nextWindow.__NEXT_DATA__?.assetPrefix)
		if (assetPrefix) {
			return `${assetPrefix}/version.json`
		}
	}

	const documentBasePath = normalizeBasePath(detectBasePathFromDocument())
	if (documentBasePath) {
		return `${documentBasePath}/version.json`
	}

	return '/version.json'
}

const overlayClass = [
	'fixed',
	'inset-0',
	'z-50',
	'flex',
	'items-center',
	'justify-center',
	'bg-black/40',
	'px-4',
	'py-8',
]

const cardClass = [
	'w-full',
	'max-w-md',
	'rounded-lg',
	'bg-white',
	'p-6',
	'shadow-xl',
	'space-y-4',
]

const headingClass = [
	'text-lg',
	'font-semibold',
	'text-zinc-900',
]

const messageClass = [
	'text-sm',
	'text-zinc-600',
]

const buttonRowClass = [
	'flex',
	'flex-col',
	'gap-2',
	'sm:flex-row',
	'sm:justify-end',
]

const primaryButtonClass = [
	'rounded',
	'bg-blue-600',
	'px-4',
	'py-2',
	'text-sm',
	'font-semibold',
	'text-white',
	'hover:bg-blue-700',
	'focus-visible:outline',
	'focus-visible:outline-2',
	'focus-visible:outline-offset-2',
	'focus-visible:outline-blue-700',
	'transition-colors',
]

const secondaryButtonClass = [
	'rounded',
	'border',
	'border-zinc-300',
	'px-4',
	'py-2',
	'text-sm',
	'font-medium',
	'text-zinc-700',
	'hover:bg-zinc-100',
	'focus-visible:outline',
	'focus-visible:outline-2',
	'focus-visible:outline-offset-2',
	'focus-visible:outline-zinc-400',
	'transition-colors',
]

type VersionPayload = {
	version?: string
}

export function VersionUpdatePrompt() {
	const [visible, setVisible] = useState(false)
	const knownVersionRef = useRef<string | null>(null)

	useEffect(() => {
		let subscribed = true
		const versionEndpoint = getVersionEndpoint()

		const checkVersion = async () => {
			try {
				const response = await fetch(`${versionEndpoint}?ts=${Date.now()}`, {
					cache: 'no-store',
				})
				if (!response.ok) {
					return
				}
				const payload = (await response.json()) as VersionPayload
				const incoming = payload.version ?? null

				if (knownVersionRef.current === null) {
					knownVersionRef.current = incoming
					return
				}

				if (
					incoming &&
					knownVersionRef.current &&
					incoming !== knownVersionRef.current &&
					subscribed
				) {
					knownVersionRef.current = incoming
					setVisible(true)
				}
			} catch (versionError) {
				console.error('Version check failed', versionError)
			}
		}

		void checkVersion()
		const intervalId = window.setInterval(checkVersion, CHECK_INTERVAL_MS)

		return () => {
			subscribed = false
			window.clearInterval(intervalId)
		}
	}, [])

	useEffect(() => {
		if (!visible) {
			return
		}
		const timerId = window.setTimeout(() => {
			window.location.reload()
		}, AUTO_RELOAD_DELAY_MS)

		return () => {
			window.clearTimeout(timerId)
		}
	}, [visible])

	if (!visible) {
		return null
	}

	return (
		<div className={overlayClass.join(' ')}>
			<div className={cardClass.join(' ')}>
				<h2 className={headingClass.join(' ')}>Neue Version verfügbar</h2>
				<p className={messageClass.join(' ')}>
					Wir haben eine aktualisierte Version dieser Seite veröffentlicht. Um
					alle Änderungen zu sehen, lade die Seite bitte neu. Ein automatischer
					Reload erfolgt in wenigen Sekunden.
				</p>
				<div className={buttonRowClass.join(' ')}>
					<button
						type='button'
						onClick={() => window.location.reload()}
						className={primaryButtonClass.join(' ')}
					>
						Seite aktualisieren
					</button>
					<button
						type='button'
						onClick={() => setVisible(false)}
						className={secondaryButtonClass.join(' ')}
					>
						Später
					</button>
				</div>
			</div>
		</div>
	)
}
