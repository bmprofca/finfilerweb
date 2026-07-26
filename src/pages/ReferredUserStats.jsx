import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  User,
  BarChart3,
  ShoppingBag,
  IndianRupee,
  Gift,
  Tag,
  Calendar,
  ChevronDown,
  AlertCircle,
  Inbox,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiCall, resolveMediaUrl } from "../utils/apiCall";
import Pagination from "../components/common/PaginationComponent";
import ManagementTable from "../components/common/ManagementTable";
import SelectField from "../components/common/SelectField";

// ── Helpers ──────────────────────────────────────────────────────────────

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const REFERRAL_STATUS = {
  0: { label: "Pending", color: "amber", icon: Clock },
  1: { label: "Active", color: "emerald", icon: CheckCircle2 },
  2: { label: "Inactive", color: "slate", icon: XCircle },
};

function StatusBadge({ statusMap, value }) {
  const s = statusMap[value] ?? { label: String(value), color: "slate" };
  const colorMap = {
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${colorMap[s.color] || colorMap.slate}`}
    >
      {Icon && <Icon size={10} />}
      {s.label}
    </span>
  );
}

function UserAvatar({ user }) {
  const initials = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  const imgSrc = resolveMediaUrl(user.image);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={user.full_name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`h-9 w-9 rounded-full ring-2 ring-border bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center text-xs font-bold text-white ${imgSrc ? "hidden" : "flex"}`}
        >
          {initials || <User size={14} />}
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-primary-foreground">
          {user.full_name || `${user.first_name} ${user.last_name}`.trim()}
        </p>
        <p className="truncate text-xs text-secondary-foreground">
          @{user.username}
        </p>
      </div>
    </div>
  );
}

// ── Summary Cards ─────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, tone = "default" }) {
  const toneClasses = {
    default: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 p-4"
    >
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${toneClasses[tone] || toneClasses.default}`}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-secondary-foreground">{label}</p>
        <p className="truncate text-lg font-bold tabular-nums text-primary-foreground">
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-secondary-foreground">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const yearOptions = YEARS.map((y) => ({ value: y, label: y.toString() }));
const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));

function FilterBar({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
      {/* Filter Type */}
      <div className="flex gap-2 items-center">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-secondary-foreground">
          Period
        </label>
        <div className="flex gap-1">
          {["monthly", "yearly"].map((t) => (
            <button
              key={t}
              onClick={() =>
                onChange({ ...filters, filter_type: t })
              }
              className={`rounded-lg px-3 py-2.5 text-xs font-semibold capitalize transition-all ${
                filters.filter_type === t
                  ? "bg-violet-600 text-white shadow shadow-violet-500/20"
                  : "border border-border bg-secondary text-secondary-foreground hover:bg-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div className="flex gap-2 items-center">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-secondary-foreground">
          Year
        </label>
        <div className="min-w-[120px]">
          <SelectField
            options={yearOptions}
            value={yearOptions.find((opt) => opt.value === filters.year)}
            onChange={(option) => onChange({ ...filters, year: option.value })}
            placeholder="Year"
          />
        </div>
      </div>

      {/* Month (only when monthly) */}
      <AnimatePresence>
        {filters.filter_type === "monthly" && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex gap-2 items-center overflow-hidden"
          >
            <label className="text-[11px] font-semibold uppercase tracking-wider text-secondary-foreground">
              Month
            </label>
            <div className="min-w-[140px]">
              <SelectField
                options={monthOptions}
                value={monthOptions.find((opt) => opt.value === filters.month)}
                onChange={(option) => onChange({ ...filters, month: option.value })}
                placeholder="Month"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Empty / Error ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-500/10">
        <BarChart3 size={28} className="text-violet-400" />
      </div>
      <h3 className="text-base font-semibold text-primary-foreground">
        No stats for this period
      </h3>
      <p className="mt-1 max-w-xs text-sm text-secondary-foreground">
        Try selecting a different time period to see referral stats.
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 20;
const now = new Date();

const ReferredUserStats = () => {
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page_no: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 1,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [filters, setFilters] = useState({
    filter_type: "monthly",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const isFetching = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (f, pageNo, pageLimit) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(false);
    try {
      let qs = `filter_type=${f.filter_type}&year=${f.year}&page_no=${pageNo}&limit=${pageLimit}`;
      if (f.filter_type === "monthly") qs += `&month=${f.month}`;
      const res = await apiCall(`/referrals/referred-user-stats?${qs}`, "GET");
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message);
      if (isMounted.current) {
        setStats(body.data?.stats ?? []);
        setSummary(body.data?.summary ?? null);
        setPagination(
          body.data?.pagination ?? {
            page_no: pageNo,
            limit: pageLimit,
            total: 0,
            total_pages: 1,
          }
        );
      }
    } catch {
      if (isMounted.current) setError(true);
    } finally {
      isFetching.current = false;
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // Refetch whenever filters/page/limit change
  useEffect(() => {
    fetchData(filters, page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "#",
        headerClassName: "w-10 text-center",
        className: "w-10 text-center text-secondary-foreground tabular-nums",
        render: (_row, idx) => (page - 1) * limit + idx + 1,
      },
      {
        key: "user",
        label: "Referred User",
        render: (row) => <UserAvatar user={row.referred_user} />,
      },
      {
        key: "offer",
        label: "Offer / Code",
        className: "hidden lg:table-cell",
        render: (row) => (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-primary-foreground">
              {row.referral_info?.offer_name_snapshot || "—"}
            </p>
            <span className="inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-400">
              <Tag size={9} />
              {row.referral_info?.referral_code_used}
            </span>
          </div>
        ),
      },
      {
        key: "orders",
        label: "Orders",
        className: "hidden sm:table-cell",
        render: (row) => (
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-primary-foreground">
              <ShoppingBag size={12} />
              {row.order_stats?.total_completed_orders ?? 0} completed
            </div>
            <div className="flex items-center gap-1.5 text-secondary-foreground">
              <Layers size={12} />
              {row.order_stats?.distinct_services_ordered ?? 0} services
            </div>
          </div>
        ),
      },
      {
        key: "order_value",
        label: "Order Value",
        className: "hidden md:table-cell",
        render: (row) => (
          <span className="font-bold tabular-nums text-primary-foreground">
            {formatCurrency(row.order_stats?.total_completed_order_value)}
          </span>
        ),
      },
      {
        key: "bonus_earned",
        label: "Bonus Earned",
        render: (row) => (
          <div className="space-y-0.5">
            <p className="font-bold tabular-nums text-emerald-500">
              {formatCurrency(row.bonus_earned?.total_bonus_earned)}
            </p>
            <p className="text-[11px] text-secondary-foreground">
              {row.bonus_earned?.bonus_transactions ?? 0} transactions
            </p>
          </div>
        ),
      },
      {
        key: "ref_bonus",
        label: "Referrer Bonus",
        className: "hidden xl:table-cell",
        render: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-foreground">
              {row.referral_info?.referrer_bonus_type === "percentage"
                ? `${row.referral_info?.referrer_bonus_amount}%`
                : formatCurrency(row.referral_info?.referrer_bonus_amount)}
            </span>
            <StatusBadge
              statusMap={{
                0: { label: "Pending", color: "amber", icon: Clock },
                1: { label: "Credited", color: "emerald", icon: CheckCircle2 },
                2: { label: "Cancelled", color: "red", icon: XCircle },
              }}
              value={row.referral_info?.referrer_bonus_status}
            />
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <StatusBadge
            statusMap={REFERRAL_STATUS}
            value={row.referral_info?.referral_status}
          />
        ),
      },
    ],
    [page, limit]
  );

  const periodLabel =
    filters.filter_type === "monthly"
      ? `${MONTHS[filters.month - 1]} ${filters.year}`
      : `Year ${filters.year}`;

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <FilterBar filters={filters} onChange={handleFilterChange} />

      {/* Summary strip */}
      <AnimatePresence mode="wait">
        {!loading && !error && summary && (
          <motion.div
            key={`summary-${filters.filter_type}-${filters.year}-${filters.month}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <SummaryCard
              icon={Users}
              label="Total Referred Users"
              value={summary.total_referred_users}
              sub={periodLabel}
              tone="default"
            />
            <SummaryCard
              icon={ShoppingBag}
              label="Completed Orders"
              value={summary.total_completed_orders}
              tone="indigo"
            />
            <SummaryCard
              icon={IndianRupee}
              label="Total Order Value"
              value={formatCurrency(summary.total_completed_order_value)}
              tone="amber"
            />
            <SummaryCard
              icon={Gift}
              label="Total Bonus Earned"
              value={formatCurrency(summary.total_bonus_earned)}
              tone="emerald"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={18} />
          <span className="flex-1">Failed to load referral stats.</span>
          <button
            onClick={() => fetchData(filters, page, limit)}
            className="font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-secondary/60"
              />
            ))}
          </motion.div>
        ) : stats.length === 0 && !error ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <EmptyState />
          </motion.div>
        ) : !error ? (
          <motion.div
            key={`table-${filters.filter_type}-${filters.year}-${filters.month}-${page}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <ManagementTable
              rows={stats}
              columns={columns}
              rowKey={(row) => row.referral_info?.referral_id}
              accent="violet"
              emptyState="No stats found."
            />
            <Pagination
              currentPage={pagination.page_no}
              totalItems={pagination.total}
              itemsPerPage={limit}
              onPageChange={setPage}
              onLimitChange={(v) => {
                setLimit(v);
                setPage(1);
              }}
              availableLimits={[10, 20, 50]}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ReferredUserStats;
