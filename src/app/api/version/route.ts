import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const version =
	process.env.NEXT_PUBLIC_APP_VERSION ??
	process.env.NEXT_BUILD_ID ??
	process.env.VERCEL_GIT_COMMIT_SHA ??
	'dev'

export function GET() {
	return NextResponse.json(
		{ version },
		{
			headers: {
				'Cache-Control': 'no-store, max-age=0',
				'Content-Type': 'application/json; charset=utf-8',
			},
		},
	)
}
