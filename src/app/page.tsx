'use client';
// src/app/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col">
        {/* Navbar fixe */}
        <nav className="navbar">
          <div className="container navbar-container">
            <Link href="/" className="navbar-brand">
              <div className="mr-2">EP</div>
              <div>Elearn Prepa</div>
            </Link>
            <Link href="/login">
              <button className="btn btn-primary">
                Connexion
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Section - avec padding-top ajusté pour compenser la navbar fixe */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                Boostez votre influence
              </h1>
              <p className="hero-subtitle">
                Notre plateforme exclusive donne aux influenceurs de Elearn Prepa les outils pour suivre l'impact de leurs codes promo et maximiser leur portée.
              </p>
              <Link href="/login">
                <button className="btn btn-primary btn-lg">
                  Accéder à mon espace
                  <ArrowRightOutlined style={{ marginLeft: '0.5rem' }} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Espace Influenceurs
              </h2>
              <p className="text-gray-500 mt-2">
                Réservé aux partenaires de Elearn Prepa
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  1
                </div>
                <h3 className="feature-title">Suivez vos performances</h3>
                <p className="feature-description">
                  Visualisez en temps réel l'utilisation de vos codes promo.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  2
                </div>
                <h3 className="feature-title">Analysez votre impact</h3>
                <p className="feature-description">
                  Mesurez le chiffre d'affaires généré par vos recommandations.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  3
                </div>
                <h3 className="feature-title">Maximisez vos revenus</h3>
                <p className="feature-description">
                  Optimisez vos stratégies grâce aux données détaillées.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="hero" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div className="container">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                Prêt à commencer ?
              </h3>
              <Link href="/login">
                <button className="btn btn-primary btn-lg">
                  Accéder à mon espace
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>© 2025 Elearn Prepa - Tous droits réservés</p>
          </div>
        </footer>
      </div>
  );
}