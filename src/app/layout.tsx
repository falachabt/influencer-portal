'use client';
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { useState, useEffect, ReactNode } from 'react';
import { ConfigProvider, Spin } from 'antd';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import './globals.css';
import UnauthorizedAccess from "@/components/UnauuthorizedAcess";

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(null);
    const [isInfluencer, setIsInfluencer] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fonction pour vérifier si l'utilisateur est un influenceur
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

        // Fonction principale pour initialiser l'état d'authentification
        const initAuthState = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    if (session.user.email) {
                        await checkInfluencerStatus(session.user.email);
                    }
                } else {
                    setUser(null);
                    setIsInfluencer(false);
                    setError(null);
                }
            } catch (err) {
                console.error('Error initializing auth state:', err);
                setError('Une erreur est survenue lors de la vérification de votre compte.');
            } finally {
                setLoading(false);
            }
        };

        // Initialiser l'état d'authentification
        initAuthState();

        // Configurer l'écouteur d'événements d'authentification
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                // Ne pas refaire le travail si l'état utilisateur est déjà bon
                if (
                    (!session && !user) ||
                    (session?.user?.id === user?.id)
                ) {
                    return;
                }

                // Mettre à jour l'état utilisateur
                if (session?.user) {
                    setUser(session.user);
                    if (session.user.email) {
                        await checkInfluencerStatus(session.user.email);
                    }
                } else {
                    setUser(null);
                    setIsInfluencer(false);
                    setError(null);
                }
            }
        );

        // Nettoyer l'écouteur d'événements
        return () => {
            if (authListener?.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [user?.id]); // Dépendance sur user.id plutôt que sur le tableau vide

    // Indicateur de chargement
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