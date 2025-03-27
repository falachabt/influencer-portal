// src/app/metadata.ts
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: 'Portail Influenceurs',
        template: '%s | Portail Influenceurs',
    },
    description: 'Plateforme dédiée aux influenceurs pour suivre leurs performances et l\'impact de leurs codes promo',
    keywords: ['influenceur', 'code promo', 'statistiques', 'partenariat', 'affiliation'],
    authors: [{ name: 'Elearn Prepa', url: 'https://www.elearn.ezadrive.com' }],
    creator: 'Elearn Prepa',
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: 'https://influenceurs.elearn.ezadrive.com',
        title: 'Portail Influenceurs',
        description: 'Plateforme dédiée aux influenceurs pour suivre leurs performances et l\'impact de leurs codes promo',
        siteName: 'Portail Influenceurs',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Portail Influenceurs',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Portail Influenceurs',
        description: 'Plateforme dédiée aux influenceurs pour suivre leurs performances et l\'impact de leurs codes promo',
        images: ['/twitter-image.jpg'],
        creator: '@elearnprepa',
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon.png', type: 'image/png', sizes: '32x32' },
        ],
        apple: [
            { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    manifest: '/site.webmanifest',
    robots: {
        index: false,
        follow: true,
    },
};