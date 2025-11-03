import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const requiredEnv = (key: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') => {
	const value = process.env[key]

	if (!value) {
		throw new Error(
			`Missing Supabase configuration. Set ${key} in your environment before building the app.`,
		)
	}

	return value
}

let cachedClient: SupabaseClient | null = null

export const getSupabaseClient = () => {
	if (cachedClient) {
		return cachedClient
	}

	const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
	const supabaseAnonKey = requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

	cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	})

	return cachedClient
}
