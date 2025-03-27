// src/app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';

    if (code) {
        try {
            const cookieStore = cookies();
            const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

            // Échanger le code contre une session et stocker dans les cookies
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error("Erreur lors de l'échange du code pour la session:", error);
                // On pourrait ajouter un paramètre d'erreur ici pour l'afficher dans l'UI
                return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Échec de l'authentification")}`, request.url));
            }
        } catch (error) {
            console.error("Exception lors de l'authentification:", error);
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Erreur inattendue lors de l'authentification")}`, request.url));
        }
    }

    // Rediriger vers le dashboard ou la page demandée
    return NextResponse.redirect(new URL(redirectTo, request.url));
}