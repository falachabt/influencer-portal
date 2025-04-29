'use client';
// src/app/dashboard/page.tsx
import React, { useState, useEffect } from 'react';
import { Card,  Statistic, Button,  Table, Tag, Spin, Alert, Tooltip, Layout } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import {
    LogoutOutlined,
    CopyOutlined,
    CheckOutlined,
    DollarOutlined,
    ShoppingOutlined,
    PercentageOutlined,
    RiseOutlined
} from '@ant-design/icons';
import {useRouter} from "next/navigation";

const { Header, Content } = Layout;

// Types
interface Payment {
    id: string;
    amount: number; // Montant après réduction
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

interface ExtendedPromoCodeUsage extends PromoCodeUsage {
    originalAmount?: number; // Montant avant réduction
}

export default function Dashboard() {
    const [loading, setLoading] = useState<boolean>(true);
    const [influencer, setInfluencer] = useState<Influencer | null>(null);
    const [usageData, setUsageData] = useState<ExtendedPromoCodeUsage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState<boolean>(false);
    const router = useRouter();

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

                        // Calculer le montant initial pour chaque transaction
                        const extendedData = (usageStats as PromoCodeUsage[]).map(item => {
                            const discountPercentage = influencerData.discount_percentage / 100;
                            const finalAmount = item.payment?.amount || 0;

                            // Calcul correct du montant original
                            // Si le montant final représente 1% du prix (pour une réduction de 99%)
                            // alors le montant original = montant final / (1 - 0.99) = montant final / 0.01 = montant final * 100
                            const originalAmount = Math.round(finalAmount / (1 - discountPercentage));

                            return {
                                ...item,
                                originalAmount: originalAmount
                            };
                        });

                        setUsageData(extendedData);
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

    // Filtrer uniquement les commandes complétées
    const completedUsageData = usageData.filter(item => item.payment?.status === 'completed');

    // Chiffre d'affaires total (montant initial pour les commandes complétées)
    const totalOriginalRevenue = completedUsageData.reduce((sum, item) =>
        sum + (item.originalAmount || 0), 0);

    // Chiffre d'affaires après réduction (montant final pour les commandes complétées)
    const totalRevenue = completedUsageData.reduce((sum, item) =>
        sum + (item.payment?.amount || 0), 0);

    // Montant total des réductions
    const totalDiscount = totalOriginalRevenue - totalRevenue;

    // Nombre de commandes complétées
    const completedOrders = completedUsageData.length;

    // Formater le prix
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0
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
    const chartData = completedUsageData
        .map(item => {
            const originalAmount = item.originalAmount || 0;
            const finalAmount = item.payment.amount;
            const discount = originalAmount - finalAmount;

            return {
                date: new Date(item.created_at).toLocaleDateString(),
                originalAmount,
                discount,
                finalAmount
            };
        })
        .slice(0, 10);

    // Regrouper les données par date
    const groupedChartData = chartData.reduce((acc, curr) => {
        const existingEntry = acc.find(item => item.date === curr.date);
        if (existingEntry) {
            existingEntry.originalAmount += curr.originalAmount;
            existingEntry.discount += curr.discount;
            existingEntry.finalAmount += curr.finalAmount;
        } else {
            acc.push(curr);
        }
        return acc;
    }, [] as { date: string; originalAmount: number; discount: number; finalAmount: number }[]);

    // Colonnes pour le tableau des dernières commandes
    const columns = [
        {
            title: 'Date',
            dataIndex: ['payment', 'created_at'],
            key: 'date',
            render: (text: string) => text ? new Date(text).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Montant initial',
            key: 'originalAmount',
            render: (_: any, record: ExtendedPromoCodeUsage) => {
                return formatPrice(record.originalAmount || 0);
            },
        },
        {
            title: 'Réduction',
            key: 'discount',
            render: (_n : any, record: ExtendedPromoCodeUsage) => {
                const originalAmount = record.originalAmount || 0;
                const finalAmount = record.payment?.amount || 0;
                const discount = originalAmount - finalAmount;
                return formatPrice(discount);
            },
        },
        {
            title: 'Montant final',
            dataIndex: ['payment', 'amount'],
            key: 'amount',
            render: (amount: number) => amount ? formatPrice(amount) : 'N/A',
        },
        {
            title: 'Statut',
            dataIndex: ['payment', 'status'],
            key: 'status',
            render: (status: string) => {
                if (!status) return <Tag color="gray">Inconnu</Tag>;

                let color = 'default';
                let text = status;

                if (status === 'completed') {
                    color = 'success';
                    text = 'Complété';
                } else if (status === 'pending') {
                    color = 'warning';
                    text = 'En attente';
                } else if (status === 'initialized') {
                    color = 'processing';
                    text = 'Initialisé';
                }

                return <Tag color={color}>{text}</Tag>;
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
        <Layout className="" style={{ minHeight: '100vh' }}>
            <Header className="navbar" style={{ height: 'auto', padding: 0, backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div className="container navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 2rem' }}>
                    <div className="navbar-brand" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                        <div>Elearn Prepa</div>
                    </div>
                    <div className="flex items-center">
                        <Button
                            type="primary"
                            icon={<LogoutOutlined />}
                            onClick={() => {
                                supabase.auth.signOut();
                                router.push('/login');
                            }}
                            danger
                            style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                        >
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </Header>

            <Content style={{ backgroundColor: '#F9FAFB' }} className="content-with-fixed-header">
                <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div className="card promo-card" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <div style={{ flex: '1' }}>
                                <h3 className="stats-title" style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }}>Votre code promo</h3>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="promo-code" style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: '#059669'
                                    }}>{influencer?.promo_code}</div>
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
                                <span className="promo-discount" style={{
                                    backgroundColor: '#ECFDF5',
                                    color: '#059669',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    fontWeight: 'bold'
                                }}>
                                    {influencer?.discount_percentage}% de réduction
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }} className="stats-grid">
                        <div className="stats-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <Statistic
                                title="Commandes"
                                value={completedOrders}
                                prefix={<ShoppingOutlined />}
                                valueStyle={{ color: '#059669' }}
                            />
                        </div>
                        <div className="stats-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <Statistic
                                title="Chiffre d'affaires (avant réduction)"
                                value={formatPrice(totalOriginalRevenue)}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: '#047857' }}
                            />
                        </div>
                        <div className="stats-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <Statistic
                                title="Chiffre d'affaires (après réduction)"
                                value={formatPrice(totalRevenue)}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: '#059669' }}
                            />
                        </div>
                        <div className="stats-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <Statistic
                                title="Réductions générées"
                                value={formatPrice(totalDiscount)}
                                prefix={<PercentageOutlined />}
                                valueStyle={{ color: '#34d399' }}
                            />
                        </div>
                        <div className="stats-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}>
                            <Statistic
                                title="Impact moyen par commande"
                                value={formatPrice(completedOrders > 0 ? totalDiscount / completedOrders : 0)}
                                prefix={<RiseOutlined />}
                                valueStyle={{ color: '#059669' }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: '1rem'
                    }} className="content-grid">
                        <Card title="Évolution des ventes" className="mb-6" style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
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
                                            <Legend />
                                            <Bar name="Montant initial" dataKey="originalAmount" fill="#047857" />
                                            <Bar name="Réduction" dataKey="discount" fill="#34d399" />
                                            <Bar name="Montant final" dataKey="finalAmount" fill="#059669" />
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

                        <Card title="Détail des commandes" className="mb-6"
                              style={{borderRadius: '0.5rem', overflow: 'hidden'}}>
                            <div className="overflow-x-auto">
                                <Table
                                    columns={columns}
                                    dataSource={usageData}
                                    rowKey="id"
                                    pagination={{pageSize: 5}}
                                    size="middle"
                                    scroll={{x: 800}}
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </Content>
        </Layout>
    );
}