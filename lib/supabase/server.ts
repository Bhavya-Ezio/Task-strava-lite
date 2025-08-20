import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  // console.log(cookieStore)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// @/lib/supabase/server.ts
// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Use this function to create a Supabase client in Server Components or API routes
// export function createClient(cookieStore: ReadonlyRequestCookies) {
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get: (name: string) => cookieStore.get(name)?.value,
//         // The middleware handles setting cookies, so these can be ignored in the client
//         // creation function for API routes as the cookies are already on the request.
//         set: (name: string, value: string, options) => {},
//         remove: (name: string, options) => {},
//       },
//     }
//   );
// }