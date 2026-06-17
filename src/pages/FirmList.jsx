import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  AlertCircle,
  Building2,
  Eye,
  Pencil,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import ManagementTable from "../components/common/ManagementTable";
import Pagination from "../components/common/PaginationComponent";
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

const formatType = (type) => FIRM_TYPE_LABELS[type] || type || "—";

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

export default function FirmList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [firmModal, setFirmModal] = useState({ open: false, mode: "create", firmId: null });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPageNo(1);
  }, [debouncedSearch]);

  const fetchFirms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `/firms/list?page_no=${pageNo}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`;
      const response = await apiCall(endpoint);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setFirms(body.data.firms || []);
        setTotal(body.data.pagination?.total || 0);
      } else {
        throw new Error(body.message || "Failed to retrieve firms");
      }
    } catch (err) {
      setError(err.message || "Failed to load firms.");
      toast.error("Failed to load firms.");
    } finally {
      setLoading(false);
    }
  }, [pageNo, limit, debouncedSearch, toast]);

  useEffect(() => {
    fetchFirms();
  }, [fetchFirms]);

  const handleDelete = async (firmId) => {
    if (!window.confirm("Are you sure you want to delete this firm?")) return;

    setDeletingId(firmId);
    const toastId = toast.loading("Deleting firm…");

    try {
      const response = await apiCall("/firms/delete", "POST", { firm_id: firmId });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Firm deleted successfully.", { id: toastId });
        fetchFirms();
      } else {
        throw new Error(body.message || "Failed to delete firm");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete firm.", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Firm Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-primary-foreground">{row.name}</p>
          <p className="text-xs text-secondary-foreground">{row.firm_id}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row) => formatType(row.type),
    },
    {
      key: "pan_no",
      label: "PAN",
      render: (row) => row.pan_no || "—",
    },
    {
      key: "gst_no",
      label: "GST",
      render: (row) => row.gst_no || "—",
    },
  ];

  const openCreateModal = () => {
    setFirmModal({ open: true, mode: "create", firmId: null });
  };

  const openEditModal = (firmId) => {
    setFirmModal({ open: true, mode: "edit", firmId });
  };

  const closeFirmModal = () => {
    setFirmModal({ open: false, mode: "create", firmId: null });
  };

  const handleFirmSaved = () => {
    closeFirmModal();
    fetchFirms();
  };

  const getActions = (row) => [
    {
      label: "View Details",
      icon: <Eye size={14} />,
      onClick: () => navigate(`/firms/${row.firm_id}`),
    },
    {
      label: "Edit",
      icon: <Pencil size={14} />,
      onClick: () => openEditModal(row.firm_id),
    },
    {
      label: deletingId === row.firm_id ? "Deleting…" : "Delete",
      icon: deletingId === row.firm_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />,
      className: "text-red-500 hover:text-red-600",
      disabled: deletingId === row.firm_id,
      onClick: () => handleDelete(row.firm_id),
    },
  ];

  return (
    <motion.div
      className="mx-auto max-w-8xl py-6 sm:py-8 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-primary-foreground">
            Firms
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-secondary-foreground">
            Manage your registered business firms and tax identifiers.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={fetchFirms}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:border-indigo-500/40 disabled:opacity-60 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
          >
            <Plus size={18} />
            Add Firm
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search firms by name, PAN, GST…"
            className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </motion.div>

      {error && !loading && (
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500"
        >
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={fetchFirms} className="font-semibold hover:underline">
            Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-secondary py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : firms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary px-6 py-16 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-secondary-foreground" />
            <h3 className="text-lg font-semibold text-primary-foreground">No firms yet</h3>
            <p className="mt-2 text-sm text-secondary-foreground">
              {debouncedSearch
                ? "No firms match your search."
                : "Create your first firm to get started."}
            </p>
            {!debouncedSearch && (
              <button
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Plus size={16} />
                Add Firm
              </button>
            )}
          </div>
        ) : (
          <>
            <ManagementTable
              rows={firms}
              columns={columns}
              rowKey="firm_id"
              getActions={getActions}
              accent="indigo"
              onRowClick={(row) => navigate(`/firms/${row.firm_id}`)}
              emptyState="No firms found."
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

      <FirmFormModal
        isOpen={firmModal.open}
        onClose={closeFirmModal}
        mode={firmModal.mode}
        firmId={firmModal.firmId}
        onSuccess={handleFirmSaved}
      />
    </motion.div>
  );
}
