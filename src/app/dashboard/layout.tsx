'use client';
// src/app/dashboard/layout.tsx
import { useState, useEffect, ReactNode } from 'react';
import { Spin, Layout, Button } from 'antd';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogoutOutlined } from '@ant-design/icons';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string | null>(null);
    const [isInfluencer, setIsInfluencer] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);

                // Vérifier si l'utilisateur est connecté
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // Si pas d'utilisateur, rediriger vers la page de login
                    router.replace('/login');
                    return;
                }

                // Vérifier si l'utilisateur est un influenceur
                const { data: influencerData, error } = await supabase
                    .from('influencers')
                    .select('id, name, email')
                    .eq('email', user.email)
                    .single();

                if (error || !influencerData) {
                    // Si pas un influenceur, rediriger vers la page de login
                    await supabase.auth.signOut();
                    router.replace('/login?error=Vous n\'êtes pas autorisé à accéder à cette page');
                    return;
                }

                // Configurer les états
                setUserName(influencerData.name || user.email);
                setIsInfluencer(true);
            } catch (error) {
                console.error('Erreur de vérification d\'authentification:', error);
                router.replace('/login?error=Erreur lors de la vérification de votre compte');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.replace('/login');
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    // Si l'utilisateur n'est pas un influenceur, ne pas afficher le contenu
    if (!isInfluencer) return null;

    return (
        <Layout className="dashboard-layout" style={{ minHeight: '100vh' }}>
            <Layout.Header className="navbar" style={{ height: 'auto', padding: 0 }}>
                <div className="container navbar-container">
                    <div className="navbar-brand">
                        <div className="mr-2">EP</div>
                        <div>Elearn Prepa</div>
                    </div>
                    <div className="flex items-center">
                        <span style={{ marginRight: '1rem', color: '#4B5563' }}>Bonjour, {userName}</span>
                        <Button
                            type="primary"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            danger
                        >
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </Layout.Header>

            {children}

            <Layout.Footer className="footer">
                © 2025 Elearn Prepa - Tous droits réservés
            </Layout.Footer>
        </Layout>
    );
}