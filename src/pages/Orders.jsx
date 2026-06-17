import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import Pagination from "../components/common/PaginationComponent";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

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
    dot: "bg-slate-400",
  },
  "in process": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  "pending from client": {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  "pending from department": {
    label: "Pending Review",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    dot: "bg-red-400",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  };

const FILTER_TABS = [
  { id: "all", label: "All", status: "" },
  { id: "in_process", label: "In Progress", status: "in process" },
  { id: "completed", label: "Completed", status: "completed" },
  { id: "pending", label: "Pending Review", status: "pending" },
];

const SUMMARY_CARDS = [
  {
    key: "total",
    label: "Total Orders",
    icon: ClipboardList,
    iconWrap: "bg-indigo-100 text-indigo-600",
    valueClass: "text-indigo-700",
    cardClass: "border-indigo-100 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-secondary",
  },
  {
    key: "in_process",
    label: "In Progress",
    icon: Clock,
    iconWrap: "bg-blue-100 text-blue-600",
    valueClass: "text-blue-700",
    cardClass: "border-blue-100 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-secondary",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    iconWrap: "bg-emerald-100 text-emerald-600",
    valueClass: "text-emerald-700",
    cardClass: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-secondary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function OrderListSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="flex animate-pulse flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-4">
            <div className="mt-2 h-2.5 w-2.5 rounded-full bg-border" />
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-border" />
              <div className="h-3 w-64 rounded bg-border" />
            </div>
          </div>
          <div className="flex items-center gap-4 pl-5 sm:pl-0">
            <div className="h-6 w-24 rounded-full bg-border" />
            <div className="h-5 w-16 rounded bg-border" />
          </div>
        </li>
      ))}
    </ul>
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ total: 0, in_process: 0, completed: 0, pending: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPageNo(1);
  }, [debouncedSearch, activeFilter]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeTab = FILTER_TABS.find((tab) => tab.id === activeFilter) || FILTER_TABS[0];
      const payload = {
        page_no: pageNo,
        limit,
        search: debouncedSearch || undefined,
        status: activeTab.status || undefined,
      };

      const response = await apiCall("/orders/list", "POST", payload);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setOrders(body.data.orders || []);
        setTotal(body.data.pagination?.total || 0);
        setSummary(body.data.summary || { total: 0, in_process: 0, completed: 0, pending: 0 });
      } else {
        throw new Error(body.message || "Failed to load orders");
      }
    } catch (err) {
      setError(err.message || "Failed to load orders.");
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [pageNo, limit, debouncedSearch, activeFilter, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <motion.div
      className="mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end"
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-secondary-foreground sm:mt-2 sm:text-lg">
            Track all your service orders and their status.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search orders…"
              className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-9 pr-4 text-sm text-primary-foreground outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 grid grid-cols-3 gap-3 sm:mb-8 sm:gap-5">
        {SUMMARY_CARDS.map(({ key, label, icon: Icon, iconWrap, valueClass, cardClass }) => (
          <div
            key={key}
            className={`rounded-2xl border p-3 text-center shadow-soft sm:p-5 ${cardClass}`}
          >
            <div
              className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconWrap}`}
            >
              <Icon size={18} />
            </div>
            <p className={`text-xl font-bold sm:text-3xl ${valueClass}`}>
              {loading && orders.length === 0 ? "—" : summary[key] ?? 0}
            </p>
            <p className="mt-0.5 text-xs text-secondary-foreground">{label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeFilter === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "border border-border bg-secondary text-secondary-foreground hover:bg-primary"
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
        {loading && orders.length === 0 ? (
          <OrderListSkeleton />
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
            <p className="font-medium text-red-500">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="font-medium text-secondary-foreground">No orders found for this filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const displayTitle = order.name || order.service_name || "Untitled Order";
              const metaParts = [
                order.order_id,
                formatDate(order.create_date),
                order.firm_name ? `Firm: ${order.firm_name}` : null,
                `Staff: ${order.assigned_staff || "Unassigned"}`,
              ].filter(Boolean);

              return (
                <motion.li
                  key={order.order_id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ backgroundColor: "rgba(248,250,252,0.6)" }}
                  onClick={() => navigate(`/orders/${order.order_id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/orders/${order.order_id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="flex cursor-pointer flex-col justify-between gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <div className="mt-0.5 sm:mt-0">
                      <span className={`mt-1.5 inline-block h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary-foreground sm:text-base">
                        {displayTitle}
                      </p>
                      {order.service_name && order.name && (
                        <p className="truncate text-xs text-indigo-600">{order.service_name}</p>
                      )}
                      <p className="text-xs text-slate-400">{metaParts.join(" · ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-5 sm:justify-end sm:pl-0">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className="min-w-[72px] text-right text-base font-bold text-primary-foreground">
                      {formatCurrency(order.fees)}
                    </span>
                    <ChevronRight size={18} className="ml-2 flex-shrink-0 text-slate-300" />
                  </div>
                </motion.li>
              );
            })}
          </ul>
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
