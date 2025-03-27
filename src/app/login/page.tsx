'use client';
// src/app/login/page.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Alert, Layout } from 'antd';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Link from 'next/link';

// Composant qui utilise useSearchParams encapsulé dans Suspense
function LoginContent() {
    // Utilisons useState au lieu de useSearchParams pour éviter le problème
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Récupérer le paramètre d'erreur de l'URL côté client uniquement
    useEffect(() => {
        // Récupérer le paramètre d'erreur à partir de window.location
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        if (errorParam) {
            setError(errorParam);
        }
    }, []);

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
                setError("Une erreur est survenue lors de la vérification de votre session.");
            }
        };

        checkSession();
    }, [router]);

    return (
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
    );
}

export default function LoginPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Un simple délai pour montrer le spinner pendant un court moment
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

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
                <Suspense fallback={<Spin size="large" />}>
                    <LoginContent />
                </Suspense>
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