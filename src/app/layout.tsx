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
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isInfluencer, setIsInfluencer] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setUser(session.user);

                    // Vérifier si l'email est celui d'un influenceur
                    if (session.user.email) {
                        const { data, error } = await supabase
                            .from('influencers')
                            .select('id, email')
                            .eq('email', session.user.email)
                            .single();

                        if (data) {
                            setIsInfluencer(true);
                        } else {
                            setError("Votre email n'est pas enregistré comme influenceur de Elearn Prepa.");
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking user:', error);
                setError('Une erreur est survenue lors de la vérification de votre compte.');
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Écouter les changements d'authentification
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setUser(session.user);

                    // Vérifier si l'email est celui d'un influenceur
                    if (session.user.email) {
                        const { data, error } = await supabase
                            .from('influencers')
                            .select('id, email')
                            .eq('email', session.user.email)
                            .single();

                        if (data) {
                            setIsInfluencer(true);
                        } else {
                            setError("Votre email n'est pas enregistré comme influenceur de Elearn Prepa.");
                        }
                    }
                } else {
                    setUser(null);
                    setIsInfluencer(false);
                    setError(null);
                }
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

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