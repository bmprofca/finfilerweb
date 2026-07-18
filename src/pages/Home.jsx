import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientRoute } from "../constants/routes";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { HomeDashboardSkeleton } from "../components/SkeletonComponent";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatStatusLabel = (status) =>
  String(status || "Unknown")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

function ServiceImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-400 dark:from-indigo-950 dark:to-slate-800 ${className}`}
      >
        <Sparkles size={28} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
  const accents = {
    indigo:
      "from-indigo-500/15 to-indigo-500/5 text-indigo-600 border-indigo-200/70 dark:border-indigo-900/50",
    emerald:
      "from-emerald-500/15 to-emerald-500/5 text-emerald-600 border-emerald-200/70 dark:border-emerald-900/50",
    amber:
      "from-amber-500/15 to-amber-500/5 text-amber-600 border-amber-200/70 dark:border-amber-900/50",
    violet:
      "from-violet-500/15 to-violet-500/5 text-violet-600 border-violet-200/70 dark:border-violet-900/50",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-soft ${accents[accent]}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 dark:bg-slate-900/50">
          <Icon size={20} />
        </div>
        <span className="text-sm font-semibold text-primary-foreground">
          {label}
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight text-primary-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-secondary-foreground">{hint}</p>}
    </motion.div>
  );
}

function PendingPaymentCard({ order }) {
  return (
    <Link
      to={clientRoute(`/orders/${order.order_id}`)}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-primary px-4 py-4 transition hover:border-amber-300 hover:bg-amber-500/5"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-primary-foreground">
            {order.name || order.service_name || "Order"}
          </p>
          {order.is_partially_paid && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Partial
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-secondary-foreground">
          {order.service_name} · {formatStatusLabel(order.status)}
        </p>
        <p className="mt-1 text-[11px] text-secondary-foreground/80">
          Due {formatCurrency(order.remaining_amount)}
          {order.paid_amount > 0
            ? ` · Paid ${formatCurrency(order.paid_amount)}`
            : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <span className="text-xs font-semibold">Pay now</span>
        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}

function PopularServiceCard({ service, onSelect }) {
  const hasDiscount = Number(service.discount_value) > 0;

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(service.service_id)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-secondary text-left shadow-soft transition hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <ServiceImage
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {service.order_count > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {service.order_count} orders
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {service.type}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-primary-foreground">
          {service.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-lg font-bold text-primary-foreground">
              {formatCurrency(service.fees)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-secondary-foreground line-through">
                {formatCurrency(service.base_price)}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            View
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFetching = useRef(false);

  const fetchDashboard = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall("/report/dashboard");
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setDashboard(body.data);
      } else {
        throw new Error(body.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
      toast.error("Failed to load dashboard.");
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const displayName =
    dashboard?.user?.first_name || user?.first_name || user?.mobile || "there";

  if (loading) {
    return <HomeDashboardSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="mb-4 text-red-500">{error || "Dashboard unavailable."}</p>
        <button
          type="button"
          onClick={fetchDashboard}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    statistics,
    pending_payments: pendingPayments,
    popular_services: popularServices,
  } = dashboard;

  return (
    <motion.div
      className="mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={itemVariants}
        className="relative mb-5 overflow-hidden rounded-lg border border-indigo-200/60 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-4 text-white shadow-md dark:border-indigo-900 sm:p-5"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-indigo-100">Welcome back</p>
            <h1 className="font-display mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Hello, {displayName}
            </h1>
            <p className="mt-1.5 text-sm text-indigo-100/90">
              Manage filings, track payments, and discover services on FinFiler.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={clientRoute("/services")}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
            >
              <Sparkles size={15} />
              Browse services
            </Link>
            <Link
              to={clientRoute("/orders")}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ClipboardList size={15} />
              My orders
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Total orders"
          value={statistics.total_orders}
          hint={`${statistics.active_orders} active`}
          accent="indigo"
        />
        <StatCard
          icon={Wallet}
          label="Total paid"
          value={formatCurrency(statistics.total_paid)}
          hint="Across all orders"
          accent="emerald"
        />
        <StatCard
          icon={CreditCard}
          label="Pending payments"
          value={statistics.pending_payment_count}
          hint={
            statistics.pending_payment_amount > 0
              ? `${formatCurrency(statistics.pending_payment_amount)} due`
              : "All caught up"
          }
          accent="amber"
        />
        <StatCard
          icon={Building2}
          label="Businesses"
          value={statistics.businesses_count}
          hint={`${statistics.documents_count} documents uploaded`}
          accent="violet"
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-5">
        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-border bg-secondary p-5 shadow-soft sm:p-6 lg:col-span-3"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <CreditCard size={18} />
                </div>
                <h2 className="text-lg font-bold text-primary-foreground">
                  Pending payments
                </h2>
              </div>
              <p className="mt-1 text-sm text-secondary-foreground">
                Orders waiting for payment to move forward
              </p>
            </div>
            {pendingPayments.length > 0 && (
              <Link
                to={clientRoute("/orders")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all
              </Link>
            )}
          </div>

          {pendingPayments.length > 0 ? (
            <div className="space-y-3">
              {pendingPayments.map((order) => (
                <PendingPaymentCard key={order.order_id} order={order} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-primary/50 px-4 py-10 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
              <p className="text-sm font-semibold text-primary-foreground">
                No pending payments
              </p>
              <p className="mt-1 text-xs text-secondary-foreground">
                You&apos;re all set. Explore services to place a new order.
              </p>
              <Link
                to={clientRoute("/services")}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Browse services
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-border bg-secondary p-5 shadow-soft sm:p-6 lg:col-span-2"
        >
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">
                Quick snapshot
              </h2>
              <p className="text-xs text-secondary-foreground">
                Your account at a glance
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Completed orders",
                value: statistics.completed_orders,
                icon: ClipboardList,
              },
              {
                label: "Active orders",
                value: statistics.active_orders,
                icon: FileText,
              },
              {
                label: "Documents",
                value: statistics.documents_count,
                icon: FolderOpen,
                link: clientRoute("/documents"),
              },
              {
                label: "Businesses registered",
                value: statistics.businesses_count,
                icon: Building2,
                link: clientRoute("/firms"),
              },
            ].map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center justify-between rounded-xl border border-border bg-primary px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-indigo-600 dark:text-indigo-400">
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-primary-foreground">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary-foreground">
                    {item.value}
                  </span>
                </div>
              );

              return item.link ? (
                <Link
                  key={item.label}
                  to={item.link}
                  className="block transition hover:opacity-90"
                >
                  {content}
                </Link>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>
        </motion.section>
      </div>

      <motion.section
        variants={itemVariants}
        className="rounded-2xl border border-border bg-secondary p-5 shadow-soft sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                <Sparkles size={18} />
              </div>
              <h2 className="text-lg font-bold text-primary-foreground">
                Popular services
              </h2>
            </div>
            <p className="mt-1 text-sm text-secondary-foreground">
              Most ordered by FinFiler users right now
            </p>
          </div>
          <Link
            to={clientRoute("/services")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all services
            <ArrowRight size={14} />
          </Link>
        </div>

        {popularServices.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {popularServices.map((service) => (
              <PopularServiceCard
                key={service.service_id}
                service={service}
                onSelect={(serviceId) => navigate(clientRoute(`/services/${serviceId}`))}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm text-secondary-foreground">
              No services available yet.
            </p>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
