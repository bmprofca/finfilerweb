import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  User, 
  Briefcase, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  DollarSign, 
  ArrowRight,
  Search,
  AlertCircle
} from 'lucide-react';
import { apiCall } from '../utils/apiCall';
import { useToast } from '../contexts/ToastContext';
import ManagementHub from '../components/common/ManagementHub';
import ManagementViewSwitcher from '../components/common/ManagementViewSwitcher';
import ManagementTable from '../components/common/ManagementTable';
import ManagementGrid from '../components/common/ManagementGrid';
import ManagementCard from '../components/common/ManagementCard';
import AdminSkeleton from '../components/SkeletonComponent';

const formatCurrency = (cents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const getServiceIcon = (name = '', type = '') => {
  const n = name.toLowerCase();
  const t = type.toLowerCase();
  
  if (n.includes('migration') || n.includes('server') || n.includes('node') || n.includes('hosting')) return Server;
  if (n.includes('personal') || n.includes('individual') || t.includes('personal')) return User;
  if (n.includes('business') || n.includes('llc') || t.includes('business') || t.includes('corporate')) return Briefcase;
  if (n.includes('audit') || n.includes('irs') || n.includes('defense') || t.includes('audit')) return ShieldCheck;
  if (n.includes('consultation') || n.includes('advisory') || n.includes('talk') || t.includes('advisory')) return MessageSquare;
  
  return Sparkles;
};

export default function Services() {
  const toast = useToast();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionId, setActiveActionId] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = activeTab === 'All' ? '' : activeTab.toLowerCase();
      const endpoint = `/services/list?page_no=1&limit=100&search=${encodeURIComponent(searchQuery)}&type=${encodeURIComponent(typeParam)}`;
      const response = await apiCall(endpoint);
      if (response.ok) {
        const body = await response.json();
        if (body.success && body.data) {
          setServices(body.data.services || []);
        } else {
          throw new Error('Failed to retrieve services data');
        }
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError(err.message || 'Server error. Failed to load services.');
      toast.error('Failed to load services. Please check your network.');
    } finally {
      setLoading(false);
    }
  }, [toast, activeTab, searchQuery]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePurchase = (service) => {
    toast.success(`Purchase process started for ${service.name}!`);
  };

  const handleToggleAction = (e, menuId) => {
    setActiveActionId(menuId);
  };

  const getActions = (service) => [
    {
      label: 'Purchase Service',
      icon: <DollarSign size={14} />,
      onClick: () => handlePurchase(service),
      className: 'text-indigo-600 hover:text-indigo-700 font-semibold',
    }
  ];

  // Static tabs containing standard categories
  const tabs = [
    { id: 'All', label: 'All Services' },
    { id: 'general', label: 'General' },
    { id: 'personal', label: 'Personal' },
    { id: 'business', label: 'Business' },
    { id: 'protection', label: 'Protection' },
    { id: 'advisory', label: 'Advisory' },
  ];

  // Server-side filtered services are directly bound to page view state
  const filteredServices = services;

  // Columns definition for ManagementTable
  const columns = [
    {
      key: 'name',
      label: 'Service Name',
      render: (row) => {
        const Icon = getServiceIcon(row.name, row.type);
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon size={16} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[300px]">{row.name}</p>
              <p className="text-[10px] text-slate-400">ID: {row.service_id}</p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 capitalize">
          {row.type}
        </span>
      )
    },
    {
      key: 'base_price',
      label: 'Base Price',
      render: (row) => (
        <span className="text-slate-600 font-medium">
          {formatCurrency(row.base_price)}
        </span>
      )
    },
    {
      key: 'tax_value',
      label: 'Tax (Rate)',
      render: (row) => (
        <span className="text-slate-600 font-medium">
          {formatCurrency(row.tax_value)} ({row.tax_rate}%)
        </span>
      )
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (row) => {
        if (row.discount_value > 0) {
          return (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-xs">
              -{formatCurrency(row.discount_value)} ({row.discount_percentage}%)
            </span>
          );
        }
        return <span className="text-slate-400">—</span>;
      }
    },
    {
      key: 'fees',
      label: 'Final Price',
      render: (row) => (
        <span className="text-sm font-bold text-indigo-600">
          {formatCurrency(row.fees)}
        </span>
      )
    }
  ];

  const summarySlot = (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 w-full sm:w-72 shadow-sm focus-within:border-indigo-500 transition">
      <Search size={14} className="text-slate-400" />
      <input
        type="text"
        placeholder="Search services..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  );

  return (
    <div className="py-4">
      <ManagementHub
        eyebrow="Our Services"
        title="Dynamic Solutions"
        description="Select from our range of dynamic business and tax-focused software solutions."
        accent="indigo"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={fetchServices}
        refreshing={loading}
        summary={summarySlot}
        widthClassName="max-w-[1400px]"
        actions={
          <ManagementViewSwitcher
            viewMode={viewMode}
            onChange={setViewMode}
            className="sm:w-auto"
          />
        }
      >
        {loading ? (
          <AdminSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm text-center px-4">
            <AlertCircle className="mb-4 text-red-500 h-12 w-12" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Error Loading Services</h3>
            <p className="text-slate-500 text-sm max-w-md mb-6">{error}</p>
            <button
              onClick={fetchServices}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm text-center px-4">
            <AlertCircle className="mb-4 text-slate-300 h-12 w-12" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Services Found</h3>
            <p className="text-slate-500 text-sm">We couldn't find any services matching your selection.</p>
          </div>
        ) : viewMode === 'table' ? (
          <ManagementTable
            rows={filteredServices}
            columns={columns}
            rowKey="service_id"
            accent="indigo"
            getActions={getActions}
            activeId={activeActionId}
            onToggleAction={handleToggleAction}
            onRowClick={handlePurchase}
          />
        ) : (
          <ManagementGrid viewMode="card">
            {filteredServices.map((service, index) => {
              const Icon = getServiceIcon(service.name, service.type);
              return (
                <ManagementCard
                  key={service.service_id}
                  title={service.name}
                  subtitle={service.type.toUpperCase()}
                  eyebrow={`ID: ${service.service_id}`}
                  icon={<Icon size={16} />}
                  accent="indigo"
                  hoverable={true}
                  activeId={activeActionId}
                  menuId={`card-${service.service_id}`}
                  onToggle={handleToggleAction}
                  actions={getActions(service)}
                  onClick={() => handlePurchase(service)}
                  delay={index * 0.05}
                  footer={
                    <div className="flex items-center justify-between w-full pt-1" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Cost</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-indigo-600">
                            {formatCurrency(service.fees)}
                          </span>
                          {service.discount_value > 0 && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {formatCurrency(service.total_fees)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handlePurchase(service)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
                      >
                        Get Started <ArrowRight size={13} />
                      </button>
                    </div>
                  }
                  badge={
                    service.discount_value > 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {service.discount_percentage}% OFF
                      </span>
                    ) : null
                  }
                >
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Base Price</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(service.base_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tax ({service.tax_rate}%)</span>
                      <span className="font-semibold text-slate-700">+{formatCurrency(service.tax_value)}</span>
                    </div>
                    {service.discount_value > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({service.discount_percentage}%)</span>
                        <span>-{formatCurrency(service.discount_value)}</span>
                      </div>
                    )}
                  </div>
                </ManagementCard>
              );
            })}
          </ManagementGrid>
        )}
      </ManagementHub>
    </div>
  );
}
