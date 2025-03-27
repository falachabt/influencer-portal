// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Créer un client Supabase avec les cookies de la requête
    const supabase = createMiddlewareClient({ req, res });

    // Vérifier si l'utilisateur est authentifié
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Extraire le chemin de la requête
    const path = req.nextUrl.pathname;

    // Protéger le chemin /dashboard
    // if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    //     if (!user) {
    //         // L'utilisateur n'est pas authentifié, rediriger vers login
    //         const redirectUrl = req.nextUrl.clone();
    //         redirectUrl.pathname = '/login';
    //         redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    //         return NextResponse.redirect(redirectUrl);
    //     }
    // }

    // Rediriger l'utilisateur authentifié de login vers dashboard
    if ((path === '/login' || path === '/signup') && user) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/login',
        '/signup',
    ],
};