import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import FirmFormModal from "../components/firms/FirmFormModal";

const FIRM_TYPE_LABELS = {
  proprietorship: "Proprietorship",
  partnership: "Partnership",
  llp: "LLP",
  private_limited: "Private Limited",
  public_limited: "Public Limited",
  opc: "One Person Company",
  other: "Other",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatType = (type) => FIRM_TYPE_LABELS[type] || type || "—";

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-primary px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-primary-foreground break-all">
        {value || "—"}
      </p>
    </div>
  );
}

export default function FirmDetails() {
  const { firmId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [firm, setFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(`/firms/details/${firmId}`);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setFirm(body.data);
      } else {
        throw new Error(body.message || "Failed to retrieve firm details");
      }
    } catch (err) {
      setError(err.message || "Failed to load firm details.");
      toast.error("Failed to load firm details.");
    } finally {
      setLoading(false);
    }
  }, [firmId, toast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this firm?")) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting firm…");

    try {
      const response = await apiCall("/firms/delete", "POST", { firm_id: firmId });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Firm deleted successfully.", { id: toastId });
        navigate("/firms");
      } else {
        throw new Error(body.message || "Failed to delete firm");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete firm.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !firm) {
    return (
      <div className="mx-auto py-8 px-4 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <p className="text-red-500 mb-4">{error || "Firm not found."}</p>
        <button
          onClick={fetchDetails}
          className="mr-3 rounded-xl border border-border px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
        <Link to="/firms" className="text-indigo-600 hover:underline text-sm font-medium">
          Back to firms
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto py-4 sm:py-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        to="/firms"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground hover:text-indigo-600 transition"
      >
        <ArrowLeft size={16} />
        Back to firms
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">
              {firm.name}
            </h1>
            <p className="mt-1 text-sm text-secondary-foreground">
              {formatType(firm.type)} · ID: {firm.firm_id}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:border-indigo-500/40 transition"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-60 transition"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary p-6 shadow-soft">
        <div className="mb-5 flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-primary-foreground">Firm Details</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Firm Name" value={firm.name} />
          <DetailRow label="Firm Type" value={formatType(firm.type)} />
          <DetailRow label="PAN Number" value={firm.pan_no} />
          <DetailRow label="GST Number" value={firm.gst_no} />
          <DetailRow label="VAT Number" value={firm.vat_no} />
          <DetailRow label="TAN Number" value={firm.tan_no} />
          <DetailRow label="Created" value={formatDate(firm.create_date)} />
          <DetailRow label="Last Updated" value={formatDate(firm.modify_date)} />
        </div>
      </div>

      <FirmFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        firmId={firmId}
        onSuccess={() => {
          setEditModalOpen(false);
          fetchDetails();
        }}
      />
    </motion.div>
  );
}
