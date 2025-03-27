'use client';
// src/app/dashboard/page.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Table, Tag, Spin, Alert, Tooltip, Layout } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import {
    LogoutOutlined,
    CopyOutlined,
    CheckOutlined,
    DollarOutlined,
    ShoppingOutlined,
    PercentageOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

// Types
interface Payment {
    id: string;
    amount: number;
    trx_reference: string;
    status: string;
    created_at: string;
    user_id: string;
    cart_id: string;
}

interface PromoCodeUsage {
    id: string;
    influencer_id: string;
    created_at: string;
    discount_amount: number;
    payment: Payment;
}

interface Influencer {
    id: string;
    name: string;
    email: string;
    promo_code: string;
    discount_percentage: number;
    valid_from: string;
    valid_until: string | null;
}

export default function Dashboard() {
    const [loading, setLoading] = useState<boolean>(true);
    const [influencer, setInfluencer] = useState<Influencer | null>(null);
    const [usageData, setUsageData] = useState<PromoCodeUsage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Récupérer l'utilisateur connecté
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Récupérer les données de l'influenceur
                    const { data: influencerData, error: influencerError } = await supabase
                        .from('influencers')
                        .select('*')
                        .eq('email', user.email)
                        .single();

                    if (influencerError) throw influencerError;
                    setInfluencer(influencerData as Influencer);

                    // Récupérer les données d'utilisation du code promo
                    if (influencerData.id) {
                        const { data: usageStats, error: usageError } = await supabase
                            .from('promo_code_usage')
                            .select(`
                *,
                payment:payments(
                  id,
                  amount,
                  trx_reference,
                  status,
                  created_at,
                  user_id,
                  cart_id
                )
              `)
                            .eq('influencer_id', influencerData.id)
                            .order('created_at', { ascending: false });

                        if (usageError) throw usageError;
                        setUsageData(usageStats as PromoCodeUsage[]);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Une erreur est survenue lors du chargement de vos données.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculer les statistiques
    const totalRevenue = usageData?.reduce((sum, item) =>
        item.payment?.status === 'completed' ? sum + item.payment.amount : sum, 0) || 0;

    const totalDiscount = usageData?.reduce((sum, item) =>
        item.payment?.status === 'completed' ? sum + item.discount_amount : sum, 0) || 0;

    const completedOrders = usageData?.filter(item =>
        item.payment?.status === 'completed').length || 0;

    // Formater le prix
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF'
        }).format(price);
    };

    // Copier le code promo
    const copyPromoCode = () => {
        if (influencer?.promo_code) {
            navigator.clipboard.writeText(influencer.promo_code);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    // Préparer les données pour le graphique
    const chartData = usageData
        .filter(item => item.payment?.status === 'completed')
        .map(item => ({
            date: new Date(item.created_at).toLocaleDateString(),
            amount: item.payment.amount,
            discount: item.discount_amount,
        }))
        .slice(0, 10);

    // Regrouper les données par date
    const groupedChartData = chartData.reduce((acc, curr) => {
        const existingEntry = acc.find(item => item.date === curr.date);
        if (existingEntry) {
            existingEntry.amount += curr.amount;
            existingEntry.discount += curr.discount;
        } else {
            acc.push(curr);
        }
        return acc;
    }, [] as { date: string; amount: number; discount: number }[]);

    // Colonnes pour le tableau des dernières commandes
    const columns = [
        {
            title: 'Date',
            dataIndex: ['payment', 'created_at'],
            key: 'date',
            render: (text: string) => text ? new Date(text).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Montant',
            dataIndex: ['payment', 'amount'],
            key: 'amount',
            render: (amount: number) => amount ? formatPrice(amount) : 'N/A',
        },
        {
            title: 'Réduction',
            dataIndex: 'discount_amount',
            key: 'discount',
            render: (amount: number) => amount ? formatPrice(amount) : 'N/A',
        },
        {
            title: 'Statut',
            dataIndex: ['payment', 'status'],
            key: 'status',
            render: (status: string) => {
                if (!status) return <Tag color="gray">Inconnu</Tag>;
                return (
                    <Tag color={status === 'completed' ? 'success' : 'warning'}>
                        {status === 'completed' ? 'Complété' : status}
                    </Tag>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem' }} className="min-h-screen">
                <Alert
                    message="Erreur"
                    description={error}
                    type="error"
                    showIcon
                    style={{ maxWidth: '28rem', margin: '0 auto' }}
                />
            </div>
        );
    }

    return (
        <Layout className="dashboard-layout" style={{ minHeight: '100vh' }}>
            <Header className="navbar" style={{ height: 'auto', padding: 0 }}>
                <div className="container navbar-container">
                    <div className="navbar-brand">
                        <div className="mr-2">EP</div>
                        <div>Elearn Prepa</div>
                    </div>
                    <div className="flex items-center">
                        <span style={{ marginRight: '1rem', color: '#4B5563' }}>Bonjour, {influencer?.name}</span>
                        <Button
                            type="primary"
                            icon={<LogoutOutlined />}
                            onClick={() => supabase.auth.signOut()}
                            danger
                        >
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </Header>

            <Content style={{ backgroundColor: '#F9FAFB' }} className="content-with-fixed-header">
                <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div className="card promo-card">
                            <div style={{ flex: '1' }}>
                                <h3 className="stats-title">Votre code promo</h3>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="promo-code">{influencer?.promo_code}</div>
                                    <Tooltip title={codeCopied ? 'Copié!' : 'Copier le code'}>
                                        <Button
                                            type="text"
                                            icon={codeCopied ? <CheckOutlined style={{ color: '#059669' }} /> : <CopyOutlined />}
                                            onClick={copyPromoCode}
                                            style={{ marginLeft: '0.5rem' }}
                                        />
                                    </Tooltip>
                                </div>
                                <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                    Réduction de {influencer?.discount_percentage}%{' '}
                                    {influencer?.valid_until
                                        ? `jusqu'au ${new Date(influencer.valid_until).toLocaleDateString()}`
                                        : "sans limite de durée"}
                                </div>
                            </div>
                            <div>
                                <span className="promo-discount">
                                    {influencer?.discount_percentage}% de réduction
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }} className="stats-grid">
                        <div className="stats-card">
                            <Statistic
                                title="Commandes"
                                value={completedOrders}
                                prefix={<ShoppingOutlined />}
                                valueStyle={{ color: '#059669' }}
                            />
                        </div>
                        <div className="stats-card">
                            <Statistic
                                title="Chiffre d'affaires"
                                value={formatPrice(totalRevenue)}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: '#059669' }}
                            />
                        </div>
                        <div className="stats-card">
                            <Statistic
                                title="Réductions offertes"
                                value={formatPrice(totalDiscount)}
                                prefix={<PercentageOutlined />}
                                valueStyle={{ color: '#059669' }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: '1rem'
                    }} className="content-grid">
                        <Card title="Dernières commandes" className="mb-6">
                            <Table
                                columns={columns}
                                dataSource={usageData}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                size="middle"
                            />
                        </Card>

                        <Card title="Évolution des ventes" className="mb-6">
                            {groupedChartData.length > 0 ? (
                                <div style={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={groupedChartData.reverse()}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <RechartsTooltip formatter={(value: number) => formatPrice(value)} />
                                            <Bar name="Montant" dataKey="amount" fill="#059669" />
                                            <Bar name="Réduction" dataKey="discount" fill="#34d399" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2.5rem 0',
                                    color: '#6B7280'
                                }}>
                                    Aucune donnée disponible pour le graphique
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </Content>

            <Footer className="footer">
                © 2025 Elearn Prepa - Tous droits réservés
            </Footer>
        </Layout>
    );
}