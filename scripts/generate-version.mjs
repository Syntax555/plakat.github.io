import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const targetPath = resolve(process.cwd(), 'public', 'version.json')

const version =
	process.env.NEXT_PUBLIC_APP_VERSION ??
	process.env.NEXT_BUILD_ID ??
	process.env.VERCEL_GIT_COMMIT_SHA ??
	new Date().toISOString()

const payload = JSON.stringify({ version }, null, 2)

mkdirSync(dirname(targetPath), { recursive: true })
writeFileSync(targetPath, `${payload}\n`, 'utf8')

console.log(`[generate-version] wrote ${targetPath} with version "${version}"`)
