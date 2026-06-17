import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  Tag,
  Download,
  StickyNote,
  User,
} from "lucide-react";
import { apiCall, resolveMediaUrl } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";

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
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

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
  "pending from client": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "pending from department": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const getStatusColor = (status) =>
  STATUS_COLORS[status] || "bg-slate-100 text-slate-700";

const downloadDocument = async (fileDoc, toast) => {
  try {
    const response = await fetch(resolveMediaUrl(fileDoc.file_url));
    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileDoc.file_name || "document";
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    toast.error("Failed to download document.");
  }
};

function DetailRow({ label, value, children }) {
  return (
    <div className="rounded-xl border border-border bg-primary px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-foreground">
        {label}
      </p>
      {children || (
        <p className="mt-1 break-all text-sm font-semibold text-primary-foreground">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall("/orders/details", "POST", { order_id: orderId });
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
      <div className="mx-auto flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="mb-4 text-red-500">{error || "Order not found."}</p>
        <button
          type="button"
          onClick={fetchDetails}
          className="mr-3 rounded-xl border border-border px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
        <Link to="/orders" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const displayTitle = order.name || order.service_name || "Untitled Order";

  const handleDownload = async (fileDoc) => {
    setDownloadingId(fileDoc.document_id);
    await downloadDocument(fileDoc, toast);
    setDownloadingId(null);
  };

  return (
    <motion.div
      className="mx-auto py-4 sm:py-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
            <ClipboardList size={28} />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                {formatStatusLabel(order.status)}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
              {displayTitle}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-5 py-4 text-right shadow-soft dark:from-indigo-950/40 dark:to-secondary">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary-foreground">
            Order Fees
          </p>
          <p className="text-2xl font-bold text-indigo-700">{formatCurrency(order.fees)}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailRow label="Created On" value={formatDate(order.create_date)} />
        <DetailRow label="Last Updated" value={formatDate(order.modify_date)} />
        <DetailRow label="Account" value={order.username} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-secondary p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <Tag size={18} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-primary-foreground">Service</h2>
          </div>
          <div className="grid gap-4">
            <DetailRow label="Service Name">
              {order.service_id && order.service_name ? (
                <Link
                  to={`/services/${order.service_id}`}
                  className="mt-1 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  {order.service_name}
                </Link>
              ) : (
                <p className="mt-1 text-sm font-semibold text-primary-foreground">—</p>
              )}
            </DetailRow>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-primary-foreground">Firm</h2>
          </div>
          <div className="grid gap-4">
            <DetailRow label="Firm Name">
              {order.firm_id && order.firm_name ? (
                <Link
                  to={`/firms/${order.firm_id}`}
                  className="mt-1 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  {order.firm_name}
                </Link>
              ) : (
                <p className="mt-1 text-sm font-semibold text-primary-foreground">—</p>
              )}
            </DetailRow>
          </div>
        </div>
      </div>

      {order.fields?.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-secondary p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-primary-foreground">Submitted Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {order.fields.map((field) => (
              <DetailRow
                key={`${field.type}-${field.value}`}
                label={formatFieldLabel(field.type)}
                value={field.value}
              />
            ))}
          </div>
        </div>
      )}

      {order.documents?.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-secondary p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-primary-foreground">Documents</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {order.documents.map((document) => (
              <div
                key={document.document_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-primary p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary-foreground">
                    {document.document_name}
                  </p>
                  <p className="text-xs text-secondary-foreground">
                    {document.file_name} · {formatBytes(document.size)}
                  </p>
                </div>
                {document.file_url && (
                  <button
                    type="button"
                    onClick={() => handleDownload(document)}
                    disabled={downloadingId === document.document_id}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-indigo-600 transition hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:opacity-60"
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
        </div>
      )}

      {order.notes && (
        <div className="rounded-2xl border border-border bg-secondary p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <StickyNote size={18} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-primary-foreground">Notes</h2>
          </div>
          <p className="whitespace-pre-wrap rounded-xl border border-border bg-primary px-4 py-3 text-sm text-primary-foreground">
            {order.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
