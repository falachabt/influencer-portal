'use client';
// src/components/UnauthorizedAccess.tsx
import React from 'react';
import { Button, Result } from 'antd';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {useRouter} from "next/navigation";

interface UnauthorizedAccessProps {
    message: string;
    email?: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ message, email }) => {
    const router = useRouter();
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-container">
                    <Link href="/" className="navbar-brand">
                        <div className="mr-2">EP</div>
                        <div>Elearn Prepa</div>
                    </Link>
                </div>
            </nav>

            {/* Contenu principal */}
            <div className="flex-grow flex items-center justify-center p-4">
                <Result
                    status="403"
                    title="Accès refusé"
                    subTitle={message}
                    extra={[
                        <div key="email" style={{
                            marginBottom: '1rem',
                            backgroundColor: '#f3f4f6',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            textAlign: 'left'
                        }}>
                            {email && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Email utilisé: </strong>
                                    <span>{email}</span>
                                </div>
                            )}
                            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Veuillez contacter l'administrateur si vous pensez que c'est une erreur.
                            </div>
                        </div>,
                        <Button
                            key="logout"
                            type="primary"
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.push('/');
                            }}
                            style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                        >
                            Déconnexion
                        </Button>
                    ]}
                />
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2025 Elearn Prepa - Tous droits réservés</p>
                </div>
            </footer>
        </div>
    );
};

export default UnauthorizedAccess;