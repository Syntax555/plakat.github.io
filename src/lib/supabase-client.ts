import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
	console.warn(
		'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL in your environment before building the app.',
	)
}

if (!supabaseAnonKey) {
	console.warn(
		'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment before building the app.',
	)
}

let cachedClient: SupabaseClient | null | undefined

export const getSupabaseClient = (): SupabaseClient | null => {
	if (cachedClient !== undefined) {
		return cachedClient
	}

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
