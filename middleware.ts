import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // update user's auth session
  // console.log("middleware called")
  return await updateSession(request)
}

export const config = {
  matcher: ["/api/:path*"], // ✅ applies to all API routes
};