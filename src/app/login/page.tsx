'use client';
// src/app/login/page.tsx
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Alert, Layout } from 'antd';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorParam = searchParams.get('error');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(errorParam);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Vérifier si l'utilisateur est déjà connecté
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Vérifier si l'utilisateur est un influenceur
                    const { data: influencerData } = await supabase
                        .from('influencers')
                        .select('id')
                        .eq('email', session.user.email)
                        .single();

                    if (influencerData) {
                        // Si c'est un influenceur, rediriger vers le dashboard
                        router.replace('/dashboard');
                        return;
                    }

                    // Si connecté mais pas influenceur, déconnecter
                    await supabase.auth.signOut();
                    setError("Votre email n'est pas enregistré comme influenceur de Elearn Prepa.");
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <Layout.Header className="navbar" style={{ backgroundColor: 'white', padding: 0, height: 'auto' }}>
                <div className="container navbar-container">
                    <Link href="/" className="navbar-brand">
                        <div className="mr-2">EP</div>
                        <div>Elearn Prepa</div>
                    </Link>
                </div>
            </Layout.Header>

            {/* Contenu principal */}
            <Layout.Content className="flex-grow flex items-center justify-center p-4">
                <div className="card" style={{ maxWidth: '28rem', width: '100%' }}>
                    <div style={{ padding: '2rem' }}>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">Espace Influenceurs</h1>
                            <p className="text-gray-600 mt-2">Connectez-vous pour accéder à votre tableau de bord</p>
                        </div>

                        {error && (
                            <Alert
                                message="Erreur"
                                description={error}
                                type="error"
                                showIcon
                                className="mb-6"
                            />
                        )}

                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: '#059669',
                                            brandAccent: '#047857',
                                        },
                                        borderWidths: {
                                            buttonBorderWidth: '1px',
                                            inputBorderWidth: '1px',
                                        },
                                        radii: {
                                            borderRadiusButton: '6px',
                                            buttonBorderRadius: '6px',
                                            inputBorderRadius: '6px',
                                        },
                                    },
                                },
                                className: {
                                    button: 'w-full font-medium',
                                },
                            }}
                            theme="light"
                            providers={['google']}
                            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`}
                            onlyThirdPartyProviders={true}
                        />

                        <div className="mt-8 text-center text-gray-500 text-sm">
                            <p>Réservé aux partenaires de Elearn Prepa</p>
                        </div>
                    </div>
                </div>
            </Layout.Content>

            {/* Footer */}
            <Layout.Footer className="footer">
                <div className="container">
                    <p>© 2025 Elearn Prepa - Tous droits réservés</p>
                </div>
            </Layout.Footer>
        </Layout>
    );
}