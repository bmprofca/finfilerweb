import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { clientRoute } from "../constants/routes";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  Tag,
  Download,
  StickyNote,
  User,
  Receipt,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  XCircle,
  Calendar,
  History,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { downloadOrderDocument } from "../utils/documentDownload";
import OrderPaymentModal from "../components/orders/OrderPaymentModal";
import AnimatedModal from "../components/common/AnimatedModal";
import { downloadPaymentInvoice } from "../utils/razorpay";
import { useToast } from "../contexts/ToastContext";
import { calculateServicePricing, getOriginalFees } from "../utils/servicePricing";
import { DetailSkeleton } from "../components/SkeletonComponent";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const FIELD_LABELS = {
  mobile: "Mobile Number",
  email: "Email Address",
  pan_no: "PAN Number",
  aadhaar_no: "Aadhaar Number",
};

const formatFieldLabel = (key) =>
  FIELD_LABELS[key] ||
  key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatStatusLabel = (status) =>
  String(status || "Unknown")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const STATUS_COLORS = {
  created: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "in process": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "pending from client":
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "pending from department":
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const getStatusColor = (status) =>
  STATUS_COLORS[status] ||
  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

function SectionCard({ icon: Icon, title, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-secondary p-5 shadow-soft sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
          <Icon size={16} />
        </div>
        <h2 className="text-base font-bold text-primary-foreground sm:text-lg">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function DocumentGrid({ documents, downloadingId, onDownload }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {documents.map((document) => (
        <div
          key={document.document_id}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary p-4 transition hover:border-indigo-200"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary-foreground">
              {document.document_name}
            </p>
            <p className="mt-0.5 text-xs text-secondary-foreground">
              {formatBytes(document.size)}
            </p>
          </div>
          {document.file_url && (
            <button
              type="button"
              onClick={() => onDownload(document)}
              disabled={downloadingId === document.document_id}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-indigo-600 transition hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:opacity-60"
              title="Download document"
            >
              {downloadingId === document.document_id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function PriceLine({ label, value, accent, muted }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span
        className={
          muted
            ? "text-secondary-foreground"
            : "font-medium text-primary-foreground"
        }
      >
        {label}
      </span>
      <span
        className={`shrink-0 whitespace-nowrap tabular-nums ${
          accent
            ? "font-semibold text-emerald-600"
            : muted
              ? "text-secondary-foreground"
              : "font-semibold text-primary-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

const formatPaymentStatus = (status) => {
  if (!status) return "Unpaid";
  return String(status)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const canPayForOrder = (order) => {
  if (order?.can_pay !== undefined) {
    return Boolean(order.can_pay);
  }

  const remaining =
    order?.remaining_amount !== undefined
      ? Number(order.remaining_amount)
      : Math.max(0, Number(order?.fees || 0) - Number(order?.paid_amount || 0));

  return order?.status !== "cancelled" && remaining > 0;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatPaymentDate = formatDateTime;

const downloadInvoiceFile = async (url, filename, toast) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename || "invoice.pdf";
    anchor.rel = "noopener";
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Invoice opened in a new tab.");
  }
};

function PaidPaymentsList({ order, onDownloadInvoice, downloadingPaymentId }) {
  const paidPayments = order.paid_payments ?? [];

  if (!paidPayments.length) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
      <p className="mb-3 text-sm font-semibold text-primary-foreground">
        Payment history
      </p>
      <div className="space-y-3">
        {paidPayments.map((payment) => (
          <div
            key={payment.payment_id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-primary-foreground">
                  {formatCurrency(payment.amount)}
                </p>
                {payment.is_partial && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Partial
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-secondary-foreground">
                {formatPaymentDate(payment.modify_date || payment.create_date)}
              </p>
              {payment.utr && (
                <p className="mt-0.5 truncate text-[11px] text-secondary-foreground/80">
                  Ref: {payment.utr}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDownloadInvoice(payment)}
              disabled={downloadingPaymentId === payment.payment_id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:opacity-60"
            >
              {downloadingPaymentId === payment.payment_id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Invoice
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentSummary({
  order,
  onOpenPayment,
  onDownloadInvoice,
  downloadingPaymentId,
}) {
  const hasDiscount = Number(order.discount_value) > 0;
  const pricing = calculateServicePricing(order);
  const originalFees = getOriginalFees({ ...order, ...pricing });
  const discountLabel =
    order.discount_type === "percentage"
      ? `${order.discount_percentage}%`
      : order.discount_type && order.discount_type !== "not applicable"
        ? order.discount_type
        : `${order.discount_percentage}%`;
  const showPayButton = canPayForOrder(order);
  const latestPayment = order.latest_payment;
  const paymentFailed = latestPayment?.status === "failed";
  const paidAmount = Number(order.paid_amount) || 0;
  const remainingAmount =
    order.remaining_amount !== undefined
      ? Number(order.remaining_amount)
      : Math.max(0, Number(order.fees || 0) - paidAmount);

  return (
    <SectionCard
      icon={Receipt}
      title="Payment Summary"
      className="lg:sticky lg:top-6"
    >
      {order.is_paid && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Fully paid
            </p>
            <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400">
              {formatCurrency(order.fees)} received
              {order.paid_payments?.length > 1
                ? ` across ${order.paid_payments.length} payments`
                : ""}
            </p>
          </div>
        </div>
      )}

      {order.is_partially_paid && !order.is_paid && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Partially paid
          </p>
          <p className="mt-1 text-xs text-amber-600/90">
            Paid {formatCurrency(paidAmount)} · Due{" "}
            {formatCurrency(remainingAmount)}
          </p>
        </div>
      )}

      {paymentFailed && !order.is_paid && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-semibold text-red-600 dark:text-red-300">
            Payment failed
          </p>
          <p className="mt-0.5 text-xs text-red-500/90 dark:text-red-400">
            {latestPayment.failure_reason || "Please try again."}
          </p>
        </div>
      )}

      {!order.is_paid && latestPayment?.status === "created" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Payment pending
          </p>
          <p className="mt-0.5 text-xs text-amber-600/90 dark:text-amber-400">
            Complete checkout to confirm your order.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-primary/60 px-4">
        <PriceLine
          label="Base price"
          value={formatCurrency(order.base_price)}
          muted
        />
        {hasDiscount && (
          <div className="border-t border-dashed border-border">
            <PriceLine
              label={`Discount (${discountLabel})`}
              value={`-${formatCurrency(pricing.discount_value)}`}
              accent
            />
          </div>
        )}
        <div className="border-t border-dashed border-border">
          <PriceLine
            label="Subtotal"
            value={formatCurrency(pricing.total_fees)}
          />
        </div>
        <div className="border-t border-dashed border-border">
          <PriceLine
            label={`GST (${order.tax_rate ?? 0}%)`}
            value={`+${formatCurrency(pricing.tax_value)}`}
            muted
          />
        </div>
        {paidAmount > 0 && (
          <div className="border-t border-dashed border-border">
            <PriceLine
              label="Paid so far"
              value={formatCurrency(paidAmount)}
              accent
            />
          </div>
        )}
        {!order.is_paid && paidAmount > 0 && (
          <div className="border-t border-dashed border-border">
            <PriceLine
              label="Balance due"
              value={formatCurrency(remainingAmount)}
            />
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white shadow-md shadow-indigo-200/40 dark:shadow-none">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">
              {order.is_paid
                ? "Total paid"
                : paidAmount > 0
                  ? "Balance due"
                  : "Total payable"}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
              {formatCurrency(
                order.is_paid
                  ? order.fees
                  : paidAmount > 0
                    ? remainingAmount
                    : order.fees,
              )}
            </p>
          </div>
          {hasDiscount && (
            <div className="text-right">
              <p className="text-[11px] font-medium text-indigo-200">
                Before discount
              </p>
              <p className="text-sm tabular-nums text-indigo-100 line-through">
                {formatCurrency(originalFees)}
              </p>
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Tag size={11} />
            You save {formatCurrency(pricing.discount_value)}
          </span>
        )}
      </div>

      {showPayButton && (
        <button
          type="button"
          onClick={onOpenPayment}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 dark:shadow-none"
        >
          <CreditCard size={18} />
          {paidAmount > 0
            ? `Pay ${formatCurrency(remainingAmount)}`
            : `Pay ${formatCurrency(order.fees)}`}
        </button>
      )}

      {!order.is_paid && !showPayButton && order.status !== "cancelled" && (
        <p className="mt-4 text-center text-xs text-secondary-foreground">
          Payment status: {formatPaymentStatus(order.payment_status)}
        </p>
      )}

      <PaidPaymentsList
        order={order}
        onDownloadInvoice={onDownloadInvoice}
        downloadingPaymentId={downloadingPaymentId}
      />
    </SectionCard>
  );
}

function MetaInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-primary px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-primary-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatusHistoryTable({ logs = [] }) {
  if (!logs.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-primary/50 px-4 py-6 text-center text-sm text-secondary-foreground">
        No status updates recorded yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-primary/60">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
              Date &amp; Time
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground sm:table-cell">
              Remark
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-secondary">
          {[...logs].reverse().map((log, index) => (
            <tr key={log.log_id || `${log.status}-${log.create_date}-${index}`}>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-secondary-foreground">
                {formatDateTime(log.create_date)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(log.status)}`}
                >
                  {formatStatusLabel(log.status)}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-secondary-foreground sm:table-cell">
                {log.remark || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetaLink({ to, icon: Icon, label, value }) {
  if (!value) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-primary px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
            {label}
          </p>
          <p className="truncate text-sm font-semibold text-primary-foreground">
            —
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-primary px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-500/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 transition group-hover:bg-indigo-500/15">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-indigo-600 transition group-hover:text-indigo-700">
          {value}
        </p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-secondary-foreground/40 transition group-hover:text-indigo-400"
      />
    </Link>
  );
}

function CancelOrderModal({ isOpen, onClose, onConfirm, isCancelling }) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop
      closeDisabled={isCancelling}
      maxWidth="max-w-md"
      panelClassName="rounded-2xl border border-border bg-secondary p-6 shadow-soft"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertCircle size={20} />
        </div>
        <h3 className="text-lg font-semibold text-primary-foreground">
          Cancel this order?
        </h3>
      </div>
      <p className="mt-3 text-sm text-secondary-foreground">
        This action cannot be undone. Are you sure you want to cancel this
        order?
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isCancelling}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary disabled:opacity-60"
        >
          Keep Order
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isCancelling}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isCancelling ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <XCircle size={16} />
          )}
          Yes, Cancel Order
        </button>
      </div>
    </AnimatedModal>
  );
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingPaymentId, setDownloadingPaymentId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall("/orders/details", "POST", {
        order_id: orderId,
      });
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setOrder(body.data);
      } else {
        throw new Error(body.message || "Failed to retrieve order details");
      }
    } catch (err) {
      setError(err.message || "Failed to load order details.");
      toast.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-4 sm:py-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-6xl py-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="mb-4 text-red-500">{error || "Order not found."}</p>
        <button
          type="button"
          onClick={fetchDetails}
          className="mr-3 rounded-xl border border-border px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
        <Link
          to={clientRoute("/orders")}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const displayTitle = order.name || order.service_name || "Untitled Order";
  const inputDocuments = (order.documents || []).filter(
    (document) => document.type !== "out",
  );
  const outputDocuments = (order.documents || []).filter(
    (document) => document.type === "out",
  );

  const handleDownload = async (fileDoc) => {
    setDownloadingId(fileDoc.document_id);
    try {
      await downloadOrderDocument(orderId, fileDoc);
    } catch {
      toast.error("Failed to download document.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadInvoice = async (payment) => {
    setDownloadingPaymentId(payment.payment_id);

    try {
      const invoice = await downloadPaymentInvoice(
        order.order_id,
        payment.payment_id,
      );
      await downloadInvoiceFile(invoice.url, invoice.filename, toast);
      toast.success("Invoice downloaded.");
    } catch (err) {
      toast.error(err.message || "Failed to download invoice.");
    } finally {
      setDownloadingPaymentId(null);
    }
  };

  const handlePaymentSuccess = async ({ isFullPayment, remainingAfter }) => {
    if (isFullPayment) {
      toast.success("Payment successful. Your order is now fully paid.");
    } else {
      toast.success(
        `Partial payment received. Remaining balance: ${formatCurrency(remainingAfter)}`,
      );
    }
    await fetchDetails();
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const response = await apiCall("/orders/cancel", "POST", {
        order_id: orderId,
      });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success(body.message || "Order cancelled successfully.");
        setCancelModalOpen(false);
        await fetchDetails();
      } else {
        throw new Error(body.message || "Failed to cancel order");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-6xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <ClipboardList size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}
              >
                {formatStatusLabel(order.status)}
              </span>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-primary-foreground sm:text-2xl">
                {displayTitle}
              </h1>
            </div>
          </div>

          {order.can_cancel && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              <XCircle size={16} />
              Cancel Order
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <MetaLink
            to={clientRoute(`/services/${order.service_id}`)}
            icon={Tag}
            label="Service"
            value={
              order.service_id && order.service_name ? order.service_name : null
            }
          />
          <MetaLink
            to={clientRoute(`/firms/${order.firm_id}`)}
            icon={Building2}
            label="Business"
            value={order.firm_id && order.firm_name ? order.firm_name : null}
          />
          <MetaInfo
            icon={Calendar}
            label="Order Date"
            value={formatDateTime(order.create_date)}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-7">
          {order.fields?.length > 0 && (
            <SectionCard icon={User} title="Submitted Information">
              <div className="grid gap-3 sm:grid-cols-2">
                {order.fields.map((field) => (
                  <div
                    key={`${field.type}-${field.value}`}
                    className="rounded-xl border border-border bg-primary px-4 py-3"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-secondary-foreground">
                      {formatFieldLabel(field.type)}
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-primary-foreground">
                      {field.value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {inputDocuments.length > 0 && (
            <SectionCard icon={FileText} title="Input Documents">
              <DocumentGrid
                documents={inputDocuments}
                downloadingId={downloadingId}
                onDownload={handleDownload}
              />
            </SectionCard>
          )}

          {order.output_documents_locked ? (
            <SectionCard icon={FileText} title="Output Documents">
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Complete payment to access output documents
                  </p>
                  <p className="mt-0.5 text-xs text-amber-600/90 dark:text-amber-400">
                    Your order has been completed. Please clear the remaining
                    balance to download the output documents.
                  </p>
                </div>
              </div>
            </SectionCard>
          ) : (
            outputDocuments.length > 0 && (
              <SectionCard icon={FileText} title="Output Documents">
                <DocumentGrid
                  documents={outputDocuments}
                  downloadingId={downloadingId}
                  onDownload={handleDownload}
                />
              </SectionCard>
            )
          )}

          {order.notes && (
            <SectionCard icon={StickyNote} title="Notes">
              <p className="whitespace-pre-wrap rounded-xl border border-border bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                {order.notes}
              </p>
            </SectionCard>
          )}

          <SectionCard icon={History} title="Status History">
            <StatusHistoryTable logs={order.status_logs || []} />
          </SectionCard>
        </div>

        <div className="lg:col-span-5">
          <PaymentSummary
            order={order}
            onOpenPayment={() => setPaymentModalOpen(true)}
            onDownloadInvoice={handleDownloadInvoice}
            downloadingPaymentId={downloadingPaymentId}
          />
        </div>
      </div>

      <OrderPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={order}
        onSuccess={handlePaymentSuccess}
      />

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        isCancelling={isCancelling}
      />
    </motion.div>
  );
}