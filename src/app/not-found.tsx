'use client';
// src/app/not-found.tsx
import Link from 'next/link';
import { Button, Result } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
            <div className="text-center max-w-lg">
                <div className="mb-8">
                    <span className="text-9xl font-bold text-gray-200">404</span>
                    <div className="mt-[-20px]">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page non trouvée</h1>
                        <p className="text-gray-600 mb-8">
                            Désolé, la page que vous recherchez semble avoir disparu ou n'existe pas.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <Link href="/">
                        <Button
                            type="primary"
                            size="large"
                            icon={<HomeOutlined />}
                            className="min-w-[200px] h-12"
                        >
                            Retour à l'accueil
                        </Button>
                    </Link>

                    <Link href="/login" className="text-blue-500 hover:text-blue-700 mt-2">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}