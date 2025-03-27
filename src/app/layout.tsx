'use client';
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
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
            {children}
        </ConfigProvider>
        </body>
        </html>
    );
}