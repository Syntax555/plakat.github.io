import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type SupabaseEnvKey = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

const readEnv = (key: SupabaseEnvKey) => {
	const value = process.env[key]
	if (!value) {
		console.warn(
			`Missing Supabase configuration. Set ${key} in your environment before building the app.`,
		)
	}
	return value
}

let cachedClient: SupabaseClient | null | undefined

export const getSupabaseClient = (): SupabaseClient | null => {
	if (cachedClient !== undefined) {
		return cachedClient
	}

	const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
	const supabaseAnonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

	if (!supabaseUrl || !supabaseAnonKey) {
		cachedClient = null
		return cachedClient
	}

	cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	})

	return cachedClient
}
