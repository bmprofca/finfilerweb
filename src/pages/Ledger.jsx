import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Receipt,
    ArrowDownLeft,
    ArrowUpRight,
    Wallet,
    TrendingUp,
    TrendingDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    X,
    Hash,
    Tag,
    Calendar,
    User,
    RefreshCw,
} from "lucide-react";
import AnimatedModal from "../components/common/AnimatedModal";
import { apiCall } from "../utils/apiCall";
import { motion } from "framer-motion";

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

const PURPOSE_LABELS = {
    wallet: "Wallet",
    order: "Order",
    refund: "Refund",
};

// ── Transaction Detail Modal ────────────────────────────────────────────

const TransactionDetailModal = ({ transactionId, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!transactionId) return;
        let cancelled = false;

        const fetchDetail = async () => {
            setLoading(true);
            setError(false);
            try {
                const response = await apiCall(
                    `/transactions/details/${transactionId}`,
                    "GET"
                );
                const data = await response.json();
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || "Failed to fetch details");
                }
                if (!cancelled) setDetail(data.data);
            } catch (err) {
                console.error("transaction detail error:", err);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchDetail();
        return () => {
            cancelled = true;
        };
    }, [transactionId]);

    const isCredit = detail?.type === "cr";
    const created = formatDate(detail?.create_date);

    return (
        <AnimatedModal
            isOpen={!!transactionId}
            onClose={onClose}
            maxWidth="max-w-sm"
            backdropClassName="bg-black/50 backdrop-blur-sm"
            panelClassName="bg-primary border border-border rounded-lg shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex items-center justify-center w-9 h-9 rounded-xl border ${isCredit
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-red-500/10 border-red-500/20"
                            }`}
                    >
                        <Receipt
                            size={18}
                            className={isCredit ? "text-emerald-400" : "text-red-400"}
                        />
                    </span>
                    <h3 className="text-base font-semibold text-primary-foreground">
                        Transaction details
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-secondary-foreground hover:text-primary-foreground hover:bg-secondary transition-colors"
                >
                    <X size={15} />
                </button>
            </div>

            <div className="px-5 pb-5">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 size={20} className="animate-spin text-secondary-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                        <AlertCircle size={22} className="text-red-400" />
                        <p className="text-sm text-secondary-foreground">
                            Couldn't load transaction details.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Amount */}
                        <div className="flex flex-col items-center gap-1 py-3 border-b border-border">
                            <span
                                className={`text-2xl font-bold tabular-nums ${isCredit ? "text-emerald-400" : "text-red-400"
                                    }`}
                            >
                                {isCredit ? "+" : "−"}
                                {formatCurrency(detail?.amount)}
                            </span>
                            <span className="text-xs font-medium text-secondary-foreground capitalize">
                                {PURPOSE_LABELS[detail?.purpose] || detail?.purpose}
                            </span>
                        </div>

                        {/* Meta rows */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-xs text-secondary-foreground">
                                    <Hash size={13} /> Transaction ID
                                </span>
                                <span className="text-xs font-medium text-primary-foreground text-right break-all max-w-[60%]">
                                    {detail?.transaction_id}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-xs text-secondary-foreground">
                                    <Tag size={13} /> Remark
                                </span>
                                <span className="text-xs font-medium text-primary-foreground text-right">
                                    {detail?.remark || "—"}
                                </span>
                            </div>

                            {detail?.order_id && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="flex items-center gap-2 text-xs text-secondary-foreground">
                                        <Receipt size={13} /> Order ID
                                    </span>
                                    <span className="text-xs font-medium text-primary-foreground text-right break-all max-w-[60%]">
                                        {detail.order_id}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-xs text-secondary-foreground">
                                    <User size={13} /> Username
                                </span>
                                <span className="text-xs font-medium text-primary-foreground">
                                    {detail?.username || "—"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-xs text-secondary-foreground">
                                    <Calendar size={13} /> Date
                                </span>
                                <span className="text-xs font-medium text-primary-foreground text-right">
                                    {typeof created === "object"
                                        ? `${created.date} · ${created.time}`
                                        : created}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedModal>
    );
};

// ── Summary Card ─────────────────────────────────────────────────────────

const SummaryCard = ({ icon: Icon, label, value, tone }) => {
    const toneClasses = {
        default: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        credit: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        debit: "bg-red-500/10 border-red-500/20 text-red-400",
    };

    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-secondary/60">
            <span
                className={`flex items-center justify-center w-10 h-10 rounded-xl border flex-shrink-0 ${toneClasses[tone]}`}
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

// ── Row / Card for a single transaction ─────────────────────────────────

const TransactionRow = ({ tx, onClick }) => {
    const isCredit = tx.type === "cr";
    const created = formatDate(tx.create_date);

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 md:gap-4 px-4 py-3.5 md:py-3 hover:bg-secondary/60 transition-colors text-left border-b border-border last:border-b-0"
        >
            <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${isCredit
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
            >
                {isCredit ? (
                    <ArrowDownLeft size={16} />
                ) : (
                    <ArrowUpRight size={16} />
                )}
            </span>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary-foreground truncate">
                    {tx.remark || PURPOSE_LABELS[tx.purpose] || tx.purpose}
                </p>
                <p className="text-xs text-secondary-foreground">
                    {typeof created === "object"
                        ? `${created.date} · ${created.time}`
                        : created}
                </p>
            </div>

            <div className="text-right flex-shrink-0">
                <p
                    className={`text-sm font-semibold tabular-nums ${isCredit ? "text-emerald-400" : "text-red-400"
                        }`}
                >
                    {isCredit ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-secondary-foreground tabular-nums">
                    Bal {formatCurrency(tx.new_balance)}
                </p>
            </div>
        </button>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────

const LIMIT = 20;

const TransactionLedgerPage = () => {
    const [ledger, setLedger] = useState({
        closing_balance: 0,
        total_credit: 0,
        total_debit: 0,
        transactions: [],
        pagination: { page_no: 1, limit: LIMIT, total: 0, total_pages: 1 },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedTxId, setSelectedTxId] = useState(null);

    const isFetching = useRef(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchLedger = useCallback(async (pageNo) => {
        if (isFetching.current) return;
        isFetching.current = true;

        setLoading(true);
        setError(false);
        try {
            const response = await apiCall(
                `/transactions/ledger?page=${pageNo}&limit=${LIMIT}`,
                "GET"
            );
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch ledger");
            }

            if (isMounted.current) {
                setLedger({
                    closing_balance: data?.data?.closing_balance ?? 0,
                    total_credit: data?.data?.total_credit ?? 0,
                    total_debit: data?.data?.total_debit ?? 0,
                    transactions: data?.data?.transactions ?? [],
                    pagination: data?.data?.pagination ?? {
                        page_no: pageNo,
                        limit: LIMIT,
                        total: 0,
                        total_pages: 1,
                    },
                });
            }
        } catch (err) {
            console.error("fetchLedger error:", err);
            if (isMounted.current) setError(true);
        } finally {
            isFetching.current = false;
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLedger(page);
    }, [page, fetchLedger]);

    const { transactions, pagination } = ledger;
    const hasPrev = pagination.page_no > 1;
    const hasNext = pagination.page_no < pagination.total_pages;

    return (
        <div className="mx-auto max-w-7xl space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">
                        Transactions
                    </h1>
                    <p className="text-sm text-secondary-foreground mt-0.5">
                        Your wallet activity and balance history
                    </p>
                </div>
                <motion.button
                    onClick={() => fetchLedger(page)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary disabled:opacity-60"
                >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    <span className="hidden sm:flex">Refresh</span>
                </motion.button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <SummaryCard
                    icon={Wallet}
                    label="Closing balance"
                    value={formatCurrency(ledger.closing_balance)}
                    tone="default"
                />
                <SummaryCard
                    icon={TrendingUp}
                    label="Total credited"
                    value={formatCurrency(ledger.total_credit)}
                    tone="credit"
                />
                <SummaryCard
                    icon={TrendingDown}
                    label="Total debited"
                    value={formatCurrency(ledger.total_debit)}
                    tone="debit"
                />
            </div>

            {/* Transactions list */}
            <div className="rounded-2xl border border-border bg-secondary/40 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                        <Loader2 size={22} className="animate-spin text-secondary-foreground" />
                        <p className="text-sm text-secondary-foreground">Loading transactions…</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
                        <AlertCircle size={22} className="text-red-400" />
                        <p className="text-sm text-secondary-foreground">
                            Couldn't load your transactions.
                        </p>
                        <button
                            onClick={() => fetchLedger(page)}
                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 text-center">
                        <Receipt size={22} className="text-secondary-foreground" />
                        <p className="text-sm font-medium text-primary-foreground">
                            No transactions yet
                        </p>
                        <p className="text-xs text-secondary-foreground">
                            Load money into your wallet to see activity here.
                        </p>
                    </div>
                ) : (
                    <div>
                        {transactions.map((tx) => (
                            <TransactionRow
                                key={tx.transaction_id}
                                tx={tx}
                                onClick={() => setSelectedTxId(tx.transaction_id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && !error && transactions.length > 0 && (
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-secondary-foreground">
                        Page {pagination.page_no} of {pagination.total_pages} ·{" "}
                        {pagination.total} total
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!hasPrev}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary hover:bg-secondary/70 text-secondary-foreground hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:hover:bg-secondary"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <button
                            onClick={() =>
                                setPage((p) => Math.min(pagination.total_pages, p + 1))
                            }
                            disabled={!hasNext}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary hover:bg-secondary/70 text-secondary-foreground hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:hover:bg-secondary"
                            aria-label="Next page"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail modal */}
            {selectedTxId && (
                <TransactionDetailModal
                    transactionId={selectedTxId}
                    onClose={() => setSelectedTxId(null)}
                />
            )}
        </div>
    );
};

export default TransactionLedgerPage;