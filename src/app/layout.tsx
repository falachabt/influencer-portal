'use client';
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, Spin } from 'antd';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import UnauthorizedAccess from "@/components/UnauuthorizedAcess";

const inter = Inter({ subsets: ['latin'] });

// Définition des chemins protégés et publics
const PUBLIC_PATHS = ['/', '/login', '/signup', '/api/auth/callback'];
const PROTECTED_PATHS = ['/dashboard'];

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [isInfluencer, setIsInfluencer] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Vérifier si le chemin actuel est protégé ou public
    const isProtectedPath = PROTECTED_PATHS.some(path =>
        pathname === path || pathname?.startsWith(`${path}/`)
    );

    const isPublicPath = PUBLIC_PATHS.some(path =>
        pathname === path || pathname?.startsWith(`${path}/`)
    );

    // Fonction pour vérifier le statut d'influenceur
    const checkInfluencerStatus = async (userEmail: string) => {
        try {
            const { data, error } = await supabase
                .from('influencers')
                .select('id, email')
                .eq('email', userEmail)
                .single();

            if (data) {
                setIsInfluencer(true);
            } else {
                setError("Votre email n'est pas enregistré comme influenceur de Elearn Prepa.");
            }
        } catch (err) {
            console.error('Error checking influencer status:', err);
            setError('Une erreur est survenue lors de la vérification de votre statut d\'influenceur.');
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                setLoading(true);

                // Récupérer la session utilisateur
                const { data: { session } } = await supabase.auth.getSession();

                // Mettre à jour l'état utilisateur seulement si le composant est monté
                if (isMounted) {
                    if (session) {
                        setUser(session.user);

                        // Vérifier le statut d'influenceur si l'utilisateur a un email
                        if (session.user.email) {
                            await checkInfluencerStatus(session.user.email);
                        }
                    } else {
                        setUser(null);
                        setIsInfluencer(false);
                        setError(null);
                    }
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                if (isMounted) {
                    setError('Une erreur est survenue lors de l\'initialisation de l\'authentification.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Initialiser l'authentification
        initAuth();

        // Configurer l'écouteur d'authentification
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Éviter le traitement redondant si l'état utilisateur est déjà correct
                if (
                    (session && user && session.user.id === user.id) ||
                    (!session && !user)
                ) {
                    return;
                }

                if (isMounted) {
                    if (session) {
                        setUser(session.user);

                        // Vérifier le statut d'influenceur
                        if (session.user.email) {
                            await checkInfluencerStatus(session.user.email);
                        }
                    } else {
                        setUser(null);
                        setIsInfluencer(false);
                        setError(null);
                    }
                }
            }
        );

        // Nettoyer au démontage
        return () => {
            isMounted = false;
            if (authListener?.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    // Effet pour gérer les redirections basées sur l'authentification
    useEffect(() => {
        // Ne pas exécuter la logique de redirection pendant le chargement
        if (loading) return;

        // Rediriger si nécessaire
        if (!user && isProtectedPath) {
            // L'utilisateur n'est pas connecté et tente d'accéder à une page protégée
            router.push(`/login?redirectTo=${pathname}`);
        } else if (user && (pathname === '/login' || pathname === '/signup')) {
            // L'utilisateur est connecté et tente d'accéder aux pages d'authentification
            router.push('/dashboard');
        }
    }, [user, pathname, loading, isProtectedPath, router]);

    // Afficher le spinner pendant le chargement
    if (loading) {
        return (
            <html lang="fr" className={inter.className}>
            <body className="bg-gray-50">
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
            </body>
            </html>
        );
    }

    return (
        <html lang="fr" className={inter.className}>
        <head>
            <title>Espace Influenceurs | Elearn Prepa</title>
            <meta name="description" content="Espace dédié aux influenceurs de Elearn Prepa" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        </head>
        <body>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#059669',
                },
                components: {
                    Button: {
                        colorPrimary: '#059669',
                        colorPrimaryHover: '#047857',
                    },
                },
            }}
        >
            {/* Afficher l'erreur si l'utilisateur est connecté mais n'est pas un influenceur */}
            {user && error && !isInfluencer ? (
                <UnauthorizedAccess
                    message={error}
                    email={user.email || undefined}
                />
            ) : (
                // Afficher le contenu normal
                children
            )}
        </ConfigProvider>
        </body>
        </html>
    );
}