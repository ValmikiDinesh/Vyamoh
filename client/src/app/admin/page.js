'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCurrencyRupee, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineCube } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          api.get('/admin/dashboard?period=30'),
          api.get('/admin/sales-chart?days=30'),
        ]);
        setStats(dashRes.data.stats);
        setChartData(chartRes.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}</div>;

  const s = stats || {};
  const COLORS = ['#e85d3a', '#f59e0b', '#10b981', '#6366f1'];

  const statCards = [
    { label: 'Revenue', value: formatPrice(s.revenue || 0), icon: HiOutlineCurrencyRupee, gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' },
    { label: 'Orders', value: s.totalOrders || 0, icon: HiOutlineShoppingCart, gradient: 'linear-gradient(135deg, rgba(232,93,58,0.15), rgba(232,93,58,0.05))' },
    { label: 'Customers', value: s.totalUsers || 0, icon: HiOutlineUsers, gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))' },
    { label: 'Products', value: s.totalProducts || 0, icon: HiOutlineCube, gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-6" style={{ background: card.gradient, border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-3">
              <card.icon size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card">
          <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Revenue (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.map((d) => ({ ...d, revenue: d.revenue / 100 }))}>
                <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e85d3a" stopOpacity={0.3} /><stop offset="95%" stopColor="#e85d3a" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#e85d3a" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>COD vs Prepaid</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: 'COD', value: s.codVsPrepaid?.cod || 0 }, { name: 'Prepaid', value: s.codVsPrepaid?.prepaid || 0 }]}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {[0, 1].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick stats & Recent orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Key Metrics</h3>
          <div className="space-y-4">
            {[{ label: 'Avg Order Value', value: formatPrice(s.avgOrderValue || 0) }, { label: 'Return Rate', value: `${s.returnRate || 0}%` }, { label: 'Cancellation Rate', value: `${s.cancellationRate || 0}%` }].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Orders</h3>
          <div className="space-y-3">
            {(s.recentOrders || []).slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{o.orderNumber}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.user?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatPrice(o.totalAmount)}</p>
                  <span className={`${o.status === 'delivered' ? 'badge-success' : o.status === 'cancelled' ? 'badge-danger' : 'badge-warning'} text-xs`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
