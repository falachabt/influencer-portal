// src/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import {NextRequest, NextResponse} from 'next/server';

export async function middleware(req : NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Rafraîchir la session si nécessaire
    const { data: { session } } = await supabase.auth.getSession();

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page privée
    if (!session && req.nextUrl.pathname !== '/login' && req.nextUrl.pathname !== '/signup' && !req.nextUrl.pathname.startsWith('/api/')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    } else if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return res;
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images/|api/auth/).*)',
    ],
};