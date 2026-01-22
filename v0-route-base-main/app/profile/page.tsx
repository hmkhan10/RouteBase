'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { Navbar } from '@/components/navbar';
import { apiClient } from '@/lib/api-client';
import {
    User,
    ShoppingBag,
    Download,
    Calendar,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Edit2,
    Save,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserProfile {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface Order {
    id: number;
    amount: number;
    status: string;
    saas_plan_id: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
    const [profile, setProfile] = useState<UserProfile>({
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UserProfile>({
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await apiClient.getCurrentUser();
                setProfile(data);
                setEditForm(data);
            } catch (error) {
                console.error('Failed to fetch user profile', error);
            }
        };

        const fetchOrders = async () => {
            try {
                const data = await apiClient.getOrderHistory();
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchOrders();
    }, []);

    const handleEdit = () => {
        setEditForm(profile);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditForm(profile);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setUpdateLoading(true);
        try {
            await apiClient.updateProfile(editForm);
            setProfile(editForm);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            case 'pending': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0C10] p-20">
            <Navbar />
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Account</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Manage your profile and view transaction history</p>
                </header>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'profile' ? 'bg-white text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                    >
                        Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'orders' ? 'bg-white text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                    >
                        Order History
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <GlassCard className="p-10 rounded-3xl border-white/5">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                                    <User className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">User Settings</h3>
                                    <p className="text-muted-foreground">Manage your personal information</p>
                                </div>
                            </div>
                            
                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                                            <Input
                                                name="username"
                                                value={editForm.username}
                                                onChange={handleInputChange}
                                                className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={editForm.email}
                                                onChange={handleInputChange}
                                                className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
                                            <Input
                                                name="first_name"
                                                value={editForm.first_name || ''}
                                                onChange={handleInputChange}
                                                className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                                            <Input
                                                name="last_name"
                                                value={editForm.last_name || ''}
                                                onChange={handleInputChange}
                                                className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleSave}
                                            disabled={updateLoading}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-black px-8 py-6 font-bold uppercase tracking-widest text-xs rounded-xl"
                                        >
                                            {updateLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="border-white/10 rounded-xl px-8 py-6 font-bold uppercase tracking-widest text-xs"
                                        >
                                            <span className="flex items-center gap-2">
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</label>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium">{profile.username}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium">{profile.email}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium">{profile.first_name || 'Not set'}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm font-medium">{profile.last_name || 'Not set'}</div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleEdit}
                                        variant="outline"
                                        className="border-white/10 rounded-xl px-8 py-6 font-bold uppercase tracking-widest text-xs"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Edit2 className="w-4 h-4" />
                                            Update Profile
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-6 rounded-3xl border border-white/5 bg-white/5 animate-pulse">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white/10 rounded-2xl" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-white/10 rounded" />
                                                    <div className="h-3 w-48 bg-white/10 rounded" />
                                                </div>
                                            </div>
                                            <div className="h-8 w-24 bg-white/10 rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <GlassCard className="p-20 rounded-3xl text-center border-white/5">
                                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                                <p className="text-muted-foreground text-sm">When you make a purchase, it will appear here.</p>
                            </GlassCard>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <GlassCard key={order.id} className="p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold">Order #RB-{order.id}</span>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                                                            {getStatusIcon(order.status)}
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{order.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span>PKR {Number(order.amount).toLocaleString()}</span>
                                                        {order.saas_plan_id && (
                                                            <span className="text-emerald-400 font-bold uppercase tracking-tighter">SaaS Pro</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white group-hover:translate-x-1 transition-all"
                                                onClick={() => window.print()}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Receipt</span>
                                                <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                                            </Button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
