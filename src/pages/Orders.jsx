import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clientRoute } from "../constants/routes";
import { motion } from "framer-motion";
import {
  ClipboardList,
  AlertCircle,
  ChevronRight,
  Search,
  Loader2,
  RefreshCw,
  Building2,
  Calendar,
  CreditCard,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import Pagination from "../components/common/PaginationComponent";
import PageHeader from "../components/common/PageHeader";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const STATUS_CONFIG = {
  created: {
    label: "Created",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    ring: "ring-slate-200 dark:ring-slate-700",
  },
  "in process": {
    label: "In Process",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    ring: "ring-blue-100 dark:ring-blue-900",
  },
  "pending from client": {
    label: "Pending (Client)",
    color: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    ring: "ring-amber-100 dark:ring-amber-900",
  },
  "pending from department": {
    label: "Pending (Dept)",
    color: "bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    ring: "ring-orange-100 dark:ring-orange-900",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    ring: "ring-emerald-100 dark:ring-emerald-900",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    ring: "ring-red-100 dark:ring-red-900",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    ring: "ring-slate-200 dark:ring-slate-700",
  };

const FILTER_TABS = [
  { id: "all", label: "All", status: "" },
  { id: "created", label: "Created", status: "created" },
  { id: "in_process", label: "In Process", status: "in process" },
  { id: "pending_client", label: "Pending (Client)", status: "pending from client" },
  { id: "pending_dept", label: "Pending (Dept)", status: "pending from department" },
  { id: "completed", label: "Completed", status: "completed" },
  { id: "cancelled", label: "Cancelled", status: "cancelled" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
};

function OrderListSkeleton() {
  return (
    <div className="grid min-w-0 gap-3 p-4 sm:gap-4 sm:p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-border bg-primary/40 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-border" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-40 rounded-md bg-border sm:w-48" />
                  <div className="h-5 w-20 rounded-full bg-border" />
                </div>
                <div className="h-3 w-32 rounded-md bg-border" />
                <div className="flex gap-3">
                  <div className="h-3 w-24 rounded-md bg-border" />
                  <div className="h-3 w-28 rounded-md bg-border" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:border-0 sm:pt-0">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded-md bg-border" />
                <div className="h-6 w-24 rounded-md bg-border" />
                <div className="h-3 w-20 rounded-md bg-border" />
              </div>
              <div className="h-10 w-10 rounded-full bg-border" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPageNo(1);
  }, [searchQuery, activeFilter]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeTab = FILTER_TABS.find((tab) => tab.id === activeFilter) || FILTER_TABS[0];
      const payload = {
        page_no: pageNo,
        limit,
        search: searchQuery.trim() || undefined,
        status: activeTab.status || undefined,
      };

      const response = await apiCall("/orders/list", "POST", payload);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setOrders(body.data.orders || []);
        setTotal(body.data.pagination?.total || 0);
      } else {
        throw new Error(body.message || "Failed to load orders");
      }
    } catch (err) {
      setError(err.message || "Failed to load orders.");
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [pageNo, limit, searchQuery, activeFilter, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <motion.div className="mx-auto min-w-0 max-w-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Orders"
          description="Track your service orders, payments, and status updates."
          actions={
            <>
              <div className="relative w-full sm:w-56">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search orders…"
                  className="w-full rounded-md border border-border bg-secondary py-2 pl-9 pr-3 text-sm text-primary-foreground outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary disabled:opacity-60"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                <span className="hidden sm:flex">Refresh</span>
              </motion.button>
            </>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
              activeFilter === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/60 dark:shadow-none"
                : "border border-border bg-secondary text-secondary-foreground hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft sm:rounded-3xl"
      >
        {loading ? (
          <OrderListSkeleton />
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
            <p className="font-medium text-red-500">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="mx-auto mb-3 text-secondary-foreground/50" size={40} />
            <p className="font-medium text-secondary-foreground">No orders found.</p>
            <p className="mt-1 text-sm text-secondary-foreground/80">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3 p-4 sm:gap-4 sm:p-5">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const displayTitle = order.name || order.service_name || "Untitled Order";
              const remaining = Number(order.remaining_amount) || 0;
              const showDue = order.can_pay && remaining > 0;

              return (
                <motion.article
                  key={order.order_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(clientRoute(`/orders/${order.order_id}`))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(clientRoute(`/orders/${order.order_id}`));
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-border bg-primary/50 p-4 transition hover:border-indigo-200 hover:bg-primary hover:shadow-md sm:p-5"
                >
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/15 transition group-hover:bg-indigo-500/15 sm:h-12 sm:w-12">
                        <ClipboardList size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                          <h2 className="min-w-0 truncate text-base font-semibold text-primary-foreground">
                            {displayTitle}
                          </h2>
                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${statusConfig.color} ${statusConfig.ring}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        {order.service_name && order.name && (
                          <p className="mt-0.5 truncate text-sm text-indigo-600 dark:text-indigo-400">
                            {order.service_name}
                          </p>
                        )}
                        <div className="mt-2 flex min-w-0 flex-col gap-1 text-xs text-secondary-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                          <span className="inline-flex shrink-0 items-center gap-1">
                            <Calendar size={12} className="shrink-0" />
                            {formatDate(order.create_date)}
                          </span>
                          {order.firm_name && (
                            <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                              <Building2 size={12} className="shrink-0" />
                              <span className="truncate">{order.firm_name}</span>
                            </span>
                          )}
                          <span className="shrink-0 font-mono text-[11px] opacity-70">{order.order_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-4 sm:shrink-0 sm:justify-end sm:gap-4 sm:border-0 sm:pt-0">
                      <div className="min-w-0 flex-1 text-left sm:flex-none sm:text-right">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
                          Order value
                        </p>
                        <p className="truncate text-lg font-bold tabular-nums text-primary-foreground">
                          {formatCurrency(order.fees)}
                        </p>
                        {order.is_paid ? (
                          <p className="mt-0.5 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Fully paid
                          </p>
                        ) : showDue ? (
                          <p className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <CreditCard size={12} className="shrink-0" />
                            <span className="truncate">Due {formatCurrency(remaining)}</span>
                          </p>
                        ) : order.is_partially_paid ? (
                          <p className="mt-0.5 truncate text-xs text-secondary-foreground">
                            Paid {formatCurrency(order.paid_amount)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition group-hover:border-indigo-200 group-hover:text-indigo-600 dark:group-hover:border-indigo-800 dark:group-hover:text-indigo-400">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </motion.div>

      {total > 0 && (
        <motion.div variants={itemVariants} className="mt-6">
          <Pagination
            currentPage={pageNo}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPageNo}
            onLimitChange={(value) => {
              setLimit(value);
              setPageNo(1);
            }}
            availableLimits={[10, 20, 50, 100]}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
