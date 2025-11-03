import { NextRequest, NextResponse } from 'next/server'

const TILE_BASE_URL = 'https://tile.openstreetmap.org'
const TILE_USER_AGENT =
	process.env.NEXT_PUBLIC_TILE_USER_AGENT ??
	'PlakatApp/1.0 (tile proxy; contact: admin@example.com)'

const isCoordinate = (value: string) => /^[0-9]+$/.test(value)
const isTileFilename = (value: string) => /^[0-9]+\.png$/.test(value)

export const revalidate = 60 * 60 // cache successful responses for 1 hour

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ z: string; x: string; y: string }> },
) {
	const { z, x, y } = await context.params

	if (!z || !x || !y || !isCoordinate(z) || !isCoordinate(x) || !isTileFilename(y)) {
		return NextResponse.json(
			{ error: 'Invalid tile coordinates' },
			{
				status: 400,
				headers: {
					Server: 'Plakat',
					'Cache-Control': 'no-store',
				},
			},
		)
	}

	const upstreamUrl = `${TILE_BASE_URL}/${z}/${x}/${y}`

	const upstreamResponse = await fetch(upstreamUrl, {
		headers: {
			'User-Agent': TILE_USER_AGENT,
		},
	})

	if (!upstreamResponse.ok || !upstreamResponse.body) {
		return NextResponse.json(
			{ error: 'Tile not available' },
			{
				status: upstreamResponse.status,
				headers: {
					Server: 'Plakat',
					'Cache-Control': 'no-store',
				},
			},
		)
	}

	const contentType = upstreamResponse.headers.get('content-type') ?? 'image/png'
	const cacheControl =
		upstreamResponse.headers.get('cache-control') ?? 'public, max-age=86400, immutable'

	const response = new NextResponse(upstreamResponse.body, {
		status: upstreamResponse.status,
		headers: {
			'Content-Type': contentType,
			'Cache-Control': cacheControl,
			Server: 'Plakat',
		},
	})

	return response
}
