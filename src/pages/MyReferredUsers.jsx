import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Users,
  User,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  Gift,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiCall, resolveMediaUrl } from "../utils/apiCall";
import Pagination from "../components/common/PaginationComponent";
import ManagementTable from "../components/common/ManagementTable";

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

const REFERRAL_STATUS = {
  0: { label: "Pending", color: "amber", icon: Clock },
  1: { label: "Active", color: "emerald", icon: CheckCircle2 },
  2: { label: "Inactive", color: "slate", icon: XCircle },
};

const BONUS_STATUS = {
  0: { label: "Pending", color: "amber" },
  1: { label: "Credited", color: "emerald" },
  2: { label: "Cancelled", color: "red" },
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
          className={`h-9 w-9 rounded-full ring-2 ring-border bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center text-xs font-bold text-white ${imgSrc ? "hidden" : "flex"}`}
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

function SummaryCard({ icon: Icon, label, value, tone = "default" }) {
  const toneClasses = {
    default: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
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
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
        <Inbox size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-primary-foreground">
        No referred users yet
      </h3>
      <p className="mt-1 max-w-xs text-sm text-secondary-foreground">
        Share your referral code and your friends will appear here once they
        sign up.
      </p>
    </div>
  );
}

function BonusChip({ label, bonus }) {
  if (!bonus) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-secondary-foreground">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-primary-foreground">
          {bonus.type === "percentage"
            ? `${bonus.amount}%`
            : formatCurrency(bonus.amount)}
        </span>
        <StatusBadge statusMap={BONUS_STATUS} value={bonus.status} />
      </div>
    </div>
  );
}

const DEFAULT_LIMIT = 20;

const MyReferredUsers = () => {
  const [rows, setRows] = useState([]);
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

  const isFetching = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (pageNo, pageLimit) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(false);
    try {
      const res = await apiCall(
        `/referrals/my-referred-users?page_no=${pageNo}&limit=${pageLimit}`,
        "GET"
      );
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message);
      if (isMounted.current) {
        setRows(body.data?.referred_users ?? []);
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

  useEffect(() => {
    fetchData(page, limit);
  }, [page, limit, fetchData]);

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
        key: "contact",
        label: "Contact",
        className: "hidden md:table-cell",
        render: (row) => (
          <div className="text-xs text-secondary-foreground space-y-0.5">
            <p>{row.referred_user.email}</p>
            <p>{row.referred_user.mobile}</p>
          </div>
        ),
      },
      {
        key: "offer",
        label: "Offer",
        className: "hidden lg:table-cell",
        render: (row) => (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-primary-foreground">
              {row.offer_name_snapshot || "—"}
            </p>
            <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
              <Tag size={9} />
              {row.referral_code_used}
            </span>
          </div>
        ),
      },
      {
        key: "referred_date",
        label: "Referred On",
        className: "hidden sm:table-cell",
        render: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-secondary-foreground">
            <Calendar size={12} />
            {formatDate(row.referred_date || row.referral_create_date)}
          </div>
        ),
      },
      {
        key: "bonuses",
        label: "Bonuses",
        className: "hidden xl:table-cell",
        render: (row) => (
          <div className="flex gap-4">
            <BonusChip label="You Earn" bonus={row.referrer_bonus} />
            <BonusChip label="Friend Gets" bonus={row.referee_bonus} />
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <StatusBadge
            statusMap={REFERRAL_STATUS}
            value={row.referral_status}
          />
        ),
      },
    ],
    [page, limit]
  );

  return (
    <div className="space-y-6">
      {!loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Total Referred"
            value={pagination.total}
            tone="default"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Active"
            value={rows.filter((r) => r.referral_status === 1).length}
            tone="emerald"
          />
          <SummaryCard
            icon={Clock}
            label="Pending"
            value={rows.filter((r) => r.referral_status === 0).length}
            tone="amber"
          />
          <SummaryCard
            icon={Gift}
            label="Bonus Credited"
            value={rows.filter((r) => r.referrer_bonus?.status === 1).length}
            tone="violet"
          />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          <AlertCircle size={18} />
          <span className="flex-1">Failed to load referred users.</span>
          <button
            onClick={() => fetchData(page, limit)}
            className="font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-secondary/60"
            />
          ))}
        </div>
      ) : rows.length === 0 && !error ? (
        <EmptyState />
      ) : !error ? (
        <>
          <ManagementTable
            rows={rows}
            columns={columns}
            rowKey="referral_id"
            accent="indigo"
            emptyState="No referred users found."
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
        </>
      ) : null}
    </div>
  );
};

export default MyReferredUsers;
