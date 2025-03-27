// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Liste des chemins publics qui ne nécessitent pas d'authentification
const PUBLIC_PATHS = ['/login', '/signup', '/', '/api/auth/callback'];
// Liste des chemins qui nécessitent l'authentification
const PROTECTED_PATHS = ['/dashboard'];

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Extraire le chemin de la requête
    const path = req.nextUrl.pathname;

    // Ignorer les ressources statiques et les favicons pour éviter des appels inutiles
    if (
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.includes('favicon') ||
        path.startsWith('/images')
    ) {
        return res;
    }

    // Vérifier si le chemin actuel nécessite une authentification
    const isProtectedPath = PROTECTED_PATHS.some(protectedPath =>
        path === protectedPath || path.startsWith(`${protectedPath}/`)
    );

    // Vérifier si le chemin actuel est un chemin public
    const isPublicPath = PUBLIC_PATHS.some(publicPath =>
        path === publicPath || path.startsWith(`${publicPath}/`)
    );

    // Si le chemin n'est ni protégé ni public explicitement, nous pouvons laisser passer
    if (!isProtectedPath && !isPublicPath) {
        return res;
    }

    // Récupérer la session utilisateur
    const { data: { session } } = await supabase.auth.getSession();

    // Rediriger l'utilisateur non authentifié vers la page de connexion
    if (!session && isProtectedPath) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Rediriger l'utilisateur authentifié depuis les pages d'authentification vers le tableau de bord
    if (session && isPublicPath && (path === '/login' || path === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
// Exclure explicitement les ressources statiques et les images
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    ],
};