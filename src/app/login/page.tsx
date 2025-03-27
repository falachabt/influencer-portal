'use client';
// src/app/login/page.tsx
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Alert } from 'antd';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    router.push(redirectTo);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setError("Une erreur est survenue lors de la vérification de votre session.");
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, [router, redirectTo]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar fixe */}
            <nav className="navbar">
                <div className="container navbar-container">
                    <Link href="/" className="navbar-brand">
                        <div className="mr-2">EP</div>
                        <div>Elearn Prepa</div>
                    </Link>
                </div>
            </nav>

            {/* Contenu principal - avec ajustement pour la navbar fixe */}
            <div className="flex-grow flex items-center justify-center p-4">
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
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2025 Elearn Prepa - Tous droits réservés</p>
                </div>
            </footer>
        </div>
    );
}