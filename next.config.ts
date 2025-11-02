import type { NextConfig } from 'next'

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const repository = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? ''
const basePath = isGithubActions && repository ? `/${repository}` : undefined

const nextConfig: NextConfig = {
	reactCompiler: true,
	output: 'export',
	images: {
		unoptimized: true,
	},
	basePath,
	assetPrefix: basePath,
	trailingSlash: true,
}

export default nextConfig
