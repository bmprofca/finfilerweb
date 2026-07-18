import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  AlertCircle,
  AlertTriangle,
  Wallet,
  Eye,
  XCircle,
  Loader2,
  Plus,
  RefreshCw,
  Building2,
  Smartphone,
  X,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import AdminSkeleton from "../components/SkeletonComponent";
import ManagementTable from "../components/common/ManagementTable";
import Pagination from "../components/common/PaginationComponent";
import PageHeader from "../components/common/PageHeader";
import SelectField from "../components/common/SelectField";
import DatePickerField from "../components/common/DatePickerField";
import Modal from "../components/common/Modal";
import WithdrawalFormModal from "../components/withdrawals/WithdrawalFormModal";
import WithdrawalDetailsModal from "../components/withdrawals/WithdrawalDetailsModal";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "bank", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
];

const STATUS_STYLES = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  cancelled: "border-red-500/20 bg-red-500/10 text-red-500",
};

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";

const formatAmount = (amount) =>
  typeof amount === "number"
    ? `₹${amount.toLocaleString("en-IN")}`
    : amount
    ? `₹${amount}`
    : "—";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function WithdrawalList() {
  const toast = useToast();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPageNo(1);
  }, [debouncedSearch, status, paymentMethod, date]);

  const hasActiveFilters =
    !!debouncedSearch || !!status || !!paymentMethod || !!date;

  const clearFilters = () => {
    setSearchQuery("");
    setStatus("");
    setPaymentMethod("");
    setDate("");
  };

  const isFetching = useRef(false);

  const fetchWithdrawals = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page_no: String(pageNo),
        limit: String(limit),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status) params.set("status", status);
      if (paymentMethod) params.set("payment_method", paymentMethod);
      if (date) {
        params.set("from_date", date);
        params.set("to_date", date);
      }

      const response = await apiCall(`/withdrawals/list?${params.toString()}`);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setWithdrawals(body.data.withdrawals || []);
        setTotal(body.data.pagination?.total || 0);
      } else {
        throw new Error(body.message || "Failed to retrieve withdrawals");
      }
    } catch (err) {
      setError(err.message || "Failed to load withdrawals.");
      toast.error("Failed to load withdrawals.");
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  }, [pageNo, limit, debouncedSearch, status, paymentMethod, date, toast]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleCancel = async () => {
    const withdrawalId = confirmCancelId;
    if (!withdrawalId) return;
    setConfirmCancelId(null);

    setCancellingId(withdrawalId);
    const toastId = toast.loading("Cancelling withdrawal…");

    try {
      const response = await apiCall("/withdrawals/cancel", "POST", {
        withdrawal_id: withdrawalId,
      });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Withdrawal cancelled successfully.", { id: toastId });
        fetchWithdrawals();
      } else {
        throw new Error(body.message || "Failed to cancel withdrawal");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel withdrawal.", { id: toastId });
    } finally {
      setCancellingId(null);
    }
  };

  const openRequestModal = () => setRequestModalOpen(true);
  const closeRequestModal = () => setRequestModalOpen(false);

  const handleRequestSuccess = () => {
    closeRequestModal();
    fetchWithdrawals();
  };

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "#",
        headerClassName: "w-12 text-center",
        className: "w-12 text-center text-secondary-foreground tabular-nums",
        render: (_row, index) => (pageNo - 1) * limit + index + 1,
      },
      {
        key: "withdrawal",
        label: "Withdrawal",
        render: (row) => (
          <div>
            <p className="font-semibold text-primary-foreground">{row.withdrawal_id}</p>
            <p className="text-xs text-secondary-foreground">{row.transaction_id || "—"}</p>
          </div>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        className: "font-semibold text-primary-foreground",
        render: (row) => formatAmount(row.amount),
      },
      {
        key: "method",
        label: "Method",
        render: (row) => (
          <div className="flex items-center gap-2">
            {row.payment_method === "upi" ? (
              <Smartphone size={14} className="text-secondary-foreground" />
            ) : (
              <Building2 size={14} className="text-secondary-foreground" />
            )}
            <div>
              <p className="text-primary-foreground capitalize">{row.payment_method}</p>
              <p className="text-xs text-secondary-foreground">
                {row.payment_method === "upi" ? row.upi_id : row.bank_name || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
              STATUS_STYLES[row.status] || "border-border bg-secondary text-secondary-foreground"
            }`}
          >
            {formatStatus(row.status)}
          </span>
        ),
      },
      {
        key: "create_date",
        label: "Requested",
        className: "text-secondary-foreground",
        render: (row) => formatDate(row.create_date),
      },
      {
        key: "processed_date",
        label: "Processed",
        className: "text-secondary-foreground",
        render: (row) => formatDate(row.processed_date),
      },
    ],
    [pageNo, limit]
  );

  const getActions = (row) => {
    const actions = [
      {
        label: "View Details",
        icon: <Eye size={14} />,
        onClick: () => setDetailsRow(row),
      },
    ];

    if (row.status === "pending") {
      actions.push({
        label: cancellingId === row.withdrawal_id ? "Cancelling…" : "Cancel Request",
        icon:
          cancellingId === row.withdrawal_id ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          ),
        className: "text-red-500 hover:text-red-600",
        disabled: cancellingId === row.withdrawal_id,
        onClick: () => setConfirmCancelId(row.withdrawal_id),
      });
    }

    return actions;
  };

  return (
    <motion.div
      className="mx-auto max-w-8xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Withdrawals"
          description="Track and manage your withdrawal requests."
          actions={
            <>
              <button
                onClick={fetchWithdrawals}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:border-indigo-500/40 disabled:opacity-60"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={openRequestModal}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} />
                Request Withdrawal
              </button>
            </>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative h-10 w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by withdrawal or transaction ID…"
            className="h-10 w-full rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="w-44">
          <SelectField
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0]}
            onChange={(selected) => setStatus(selected ? selected.value : "")}
          />
        </div>

        <div className="w-44">
          <SelectField
            options={PAYMENT_METHOD_OPTIONS}
            value={PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === paymentMethod) || PAYMENT_METHOD_OPTIONS[0]}
            onChange={(selected) => setPaymentMethod(selected ? selected.value : "")}
          />
        </div>

        <DatePickerField
          value={date}
          onChange={setDate}
          placeholder="Filter by date"
          variant="navigator"
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground transition hover:text-primary-foreground"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </motion.div>

      {error && !loading && (
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500"
        >
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={fetchWithdrawals} className="font-semibold hover:underline">
            Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        {loading ? (
          <AdminSkeleton />
        ) : withdrawals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary px-6 py-16 text-center">
            <Wallet className="mx-auto mb-4 h-12 w-12 text-secondary-foreground" />
            <h3 className="text-lg font-semibold text-primary-foreground">No withdrawals yet</h3>
            <p className="mt-2 text-sm text-secondary-foreground">
              {hasActiveFilters
                ? "No withdrawals match your filters."
                : "Request your first withdrawal to get started."}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={openRequestModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Plus size={16} />
                Request Withdrawal
              </button>
            )}
          </div>
        ) : (
          <>
            <ManagementTable
              rows={withdrawals}
              columns={columns}
              rowKey="withdrawal_id"
              getActions={getActions}
              accent="indigo"
              onRowClick={(row) => setDetailsRow(row)}
              emptyState="No withdrawals found."
            />

            <div className="mt-6">
              <Pagination
                currentPage={pageNo}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={setPageNo}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPageNo(1);
                }}
              />
            </div>
          </>
        )}
      </motion.div>

      <WithdrawalFormModal
        isOpen={requestModalOpen}
        onClose={closeRequestModal}
        onSuccess={handleRequestSuccess}
      />

      <WithdrawalDetailsModal
        isOpen={!!detailsRow}
        onClose={() => setDetailsRow(null)}
        withdrawal={detailsRow}
      />

      <Modal
        isOpen={!!confirmCancelId}
        onClose={() => setConfirmCancelId(null)}
        title={
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={18} />
            <span>Cancel Withdrawal</span>
          </div>
        }
        size="sm"
        onConfirm={handleCancel}
        confirmText="Yes, Cancel Request"
        confirmVariant="danger"
      >
        <p className="text-sm text-secondary-foreground">
          Are you sure you want to cancel this withdrawal request? This action cannot be undone.
        </p>
      </Modal>
    </motion.div>
  );
}
