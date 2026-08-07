import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    Gift,
    Award,
    Loader2,
    AlertCircle,
    RefreshCw,
    Hash,
    Tag,
    Calendar,
    IndianRupee,
    Briefcase
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { motion } from "framer-motion";
import Pagination from "../components/common/PaginationComponent";
import ManagementTable from "../components/common/ManagementTable";
import AdminSkeleton from "../components/SkeletonComponent";

// ── Helpers ──────────────────────────────────────────────────────────────

const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(val ?? 0);

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return dateStr;
    return {
        date: d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
        time: d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };
};

const DEFAULT_LIMIT = 20;

// ── Summary Card ─────────────────────────────────────────────────────────

const SummaryCard = ({ icon: Icon, label, value, tone }) => {
    const toneClasses = {
        default: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        credit: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    };

    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-secondary/60">
            <span
                className={`flex items-center justify-center w-10 h-10 rounded-xl border flex-shrink-0 ${toneClasses[tone] || toneClasses.default}`}
            >
                <Icon size={18} />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-secondary-foreground">{label}</p>
                <p className="text-lg font-bold text-primary-foreground tabular-nums truncate">
                    {value}
                </p>
            </div>
        </div>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────

const ReferralBonuses = () => {
    const [data, setData] = useState({
        bonuses: [],
        pagination: { page_no: 1, limit: DEFAULT_LIMIT, total: 0, total_pages: 1 },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const isFetching = useRef(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchBonuses = useCallback(async (pageNo, pageLimit) => {
        if (isFetching.current) return;
        isFetching.current = true;

        setLoading(true);
        setError(false);
        try {
            const response = await apiCall(
                `/referrals/bonuses?page=${pageNo}&limit=${pageLimit}`,
                "GET"
            );
            const resData = await response.json();

            if (!response.ok || !resData?.success) {
                throw new Error(resData?.message || "Failed to fetch bonuses");
            }

            if (isMounted.current) {
                setData({
                    bonuses: resData?.data?.bonuses ?? [],
                    pagination: resData?.data?.pagination ?? {
                        page_no: pageNo,
                        limit: pageLimit,
                        total: 0,
                        total_pages: 1,
                    },
                });
            }
        } catch (err) {
            console.error("fetchBonuses error:", err);
            if (isMounted.current) setError(true);
        } finally {
            isFetching.current = false;
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBonuses(page, limit);
    }, [page, limit, fetchBonuses]);

    const { bonuses, pagination } = data;

    const columns = useMemo(
        () => [
            {
                key: "serial",
                label: "#",
                headerClassName: "w-12 text-center",
                className: "w-12 text-center text-secondary-foreground tabular-nums",
                render: (_row, index) => (page - 1) * limit + index + 1,
            },
            {
                key: "details",
                label: "Details",
                render: (row) => (
                    <div>
                        <p className="font-semibold text-primary-foreground capitalize flex items-center gap-2">
                            {row.purpose || "Referral Bonus"}
                            {row.type === 'referrer' ? (
                                <span className="bg-indigo-500/10 text-indigo-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Referrer</span>
                            ) : (
                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Referee</span>
                            )}
                        </p>
                        <p className="text-xs text-secondary-foreground flex items-center gap-1 mt-0.5">
                            <Tag size={12}/> {row.remark || "—"}
                        </p>
                    </div>
                ),
            },
            {
                key: "order",
                label: "Order Info",
                render: (row) => (
                    row.order_id ? (
                        <div className="flex items-center gap-1.5 text-secondary-foreground text-sm">
                            <Briefcase size={14}/>
                            <span className="font-medium text-primary-foreground max-w-[120px] truncate" title={row.order_id}>
                                {row.order_id}
                            </span>
                        </div>
                    ) : (
                         <span className="text-secondary-foreground text-sm">—</span>
                    )
                ),
            },
            {
                key: "date",
                label: "Date",
                className: "text-secondary-foreground",
                render: (row) => {
                    const created = formatDate(row.create_date);
                    return typeof created === "object"
                        ? `${created.date} · ${created.time}`
                        : created;
                },
            },
            {
                key: "amount",
                label: "Amount",
                className: "font-bold text-emerald-400 tabular-nums",
                render: (row) => `+${formatCurrency(row.amount)}`,
            }
        ],
        [page, limit]
    );

    const totalEarned = bonuses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    return (
        <div className="mx-auto space-y-6">

            {/* Summary */}
            {!error && !loading && bonuses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <SummaryCard
                        icon={Award}
                        label="Total Earned (This Page)"
                        value={formatCurrency(totalEarned)}
                        tone="credit"
                    />
                    <SummaryCard
                        icon={Gift}
                        label="Total Bonuses (All Time)"
                        value={pagination.total}
                        tone="default"
                    />
                </div>
            )}

            {error && !loading && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
                    <AlertCircle size={18} />
                    <span className="flex-1">Couldn't load your bonuses.</span>
                    <button onClick={() => fetchBonuses(page, limit)} className="font-semibold hover:underline">
                        Retry
                    </button>
                </div>
            )}

            <div>
                {loading ? (
                    <AdminSkeleton />
                ) : bonuses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary py-16 px-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                            <Award size={28} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary-foreground">No earnings yet</h3>
                        <p className="mt-2 max-w-sm text-sm text-secondary-foreground">
                            Start referring friends to earn exciting rewards!
                        </p>
                    </div>
                ) : (
                    <>
                        <ManagementTable
                            rows={bonuses}
                            columns={columns}
                            rowKey="transaction_id"
                            accent="emerald"
                            emptyState="No bonuses found."
                        />
                        <div className="mt-6">
                            <Pagination
                                currentPage={pagination.page_no}
                                totalItems={pagination.total}
                                itemsPerPage={limit}
                                onPageChange={setPage}
                                onLimitChange={(value) => {
                                    setLimit(value);
                                    setPage(1);
                                }}
                                availableLimits={[10, 20, 50, 100]}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReferralBonuses;
