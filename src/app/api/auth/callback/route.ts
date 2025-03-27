// src/app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        try {
            const cookieStore = cookies();
            const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

            // Échanger le code contre une session
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            console.log("error", error);

            if (error) {
                console.error("Erreur lors de l'échange du code:", error);
                return NextResponse.redirect(
                    new URL(`/login?error=${encodeURIComponent("Erreur d'authentification")}`, request.url)
                );
            }

            // Après avoir échangé le code, vérifier si l'utilisateur est un influenceur
            const { data: { user } } = await supabase.auth.getUser();

            if (user && user.email) {
                const { data: influencerData, error: influencerError } = await supabase
                    .from('influencers')
                    .select('id')
                    .eq('email', user.email)
                    .single();

                if (influencerError || !influencerData) {
                    // Si ce n'est pas un influenceur, le déconnecter et rediriger avec erreur
                    await supabase.auth.signOut();
                    return NextResponse.redirect(
                        new URL(`/login?error=${encodeURIComponent("Votre email n'est pas enregistré comme influenceur")}`, request.url)
                    );
                }
            }
        } catch (error) {
            console.error("Exception lors de l'authentification:", error);
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent("Erreur lors de l'authentification")}`, request.url)
            );
        }
    }

    // Rediriger vers le dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
}