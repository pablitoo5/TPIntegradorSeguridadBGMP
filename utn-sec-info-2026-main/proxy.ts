import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Definimos las rutas protegidas
const isProtectedRoute = createRouteMatcher([
    '/students(.*)',
    '/api/chat(.*)'
])

export const proxy = clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        // 2. Llamamos a protect() directamente sobre el parámetro auth con un await
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};