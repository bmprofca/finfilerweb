import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { clientRoute } from "../constants/routes";
import { motion } from "framer-motion";
import {
  File,
  FileText,
  Image,
  Trash2,
  Download,
  Plus,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { apiCall, resolveMediaUrl } from "../utils/apiCall";
import { downloadLibraryDocument } from "../utils/documentDownload";
import { buildFirmSelectOptions } from "../utils/firmSelect";
import { useToast } from "../contexts/ToastContext";
import SelectField from "../components/common/SelectField";
import Pagination from "../components/common/PaginationComponent";
import FirmFormModal from "../components/firms/FirmFormModal";
import DocumentUploadModal from "../components/documents/DocumentUploadModal";
import ConfirmModal from "../components/common/ConfirmModal";
import PageHeader from "../components/common/PageHeader";

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

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const getFileType = (fileName = "") => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  return "doc";
};

const getFileExtension = (fileName = "") => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return extension || "file";
};

const thumbStyleMap = {
  pdf: {
    icon: FileText,
    iconWrap: "bg-red-100 text-red-600",
    surface: "bg-gradient-to-br from-red-50 to-red-100/60 dark:from-red-950/40 dark:to-secondary",
  },
  image: {
    icon: Image,
    iconWrap: "bg-blue-100 text-blue-600",
    surface: "bg-gradient-to-br from-blue-50 to-indigo-100/60 dark:from-blue-950/40 dark:to-secondary",
  },
  doc: {
    icon: File,
    iconWrap: "bg-emerald-100 text-emerald-600",
    surface: "bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-emerald-950/40 dark:to-secondary",
  },
};

const truncateFileName = (fileName = "", maxBaseLength = 28) => {
  if (!fileName) return "";

  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) {
    return fileName.length > maxBaseLength + 3
      ? `${fileName.slice(0, maxBaseLength)}...`
      : fileName;
  }

  const base = fileName.slice(0, lastDot);
  const ext = fileName.slice(lastDot + 1);
  if (fileName.length <= maxBaseLength + 3 + ext.length) return fileName;
  return `${base.slice(0, maxBaseLength)}...${ext}`;
};

const downloadDocument = async (doc, toast) => {
  try {
    await downloadLibraryDocument(doc);
  } catch {
    toast.error("Failed to download document.");
  }
};

function DocumentThumbnail({ doc }) {
  const fileName = doc.file_name || doc.name || "";
  const fileType = getFileType(fileName);
  const extension = getFileExtension(fileName);
  const style = thumbStyleMap[fileType] || thumbStyleMap.doc;
  const Icon = style.icon;
  const [imageFailed, setImageFailed] = useState(false);

  if (fileType === "image" && doc.file_url && !imageFailed) {
    return (
      <img
        src={resolveMediaUrl(doc.file_url)}
        alt={doc.name}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${style.surface}`}>
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${style.iconWrap}`}>
        <Icon size={28} />
      </div>
      <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
        {extension}
      </span>
    </div>
  );
}

function DocumentCard({
  doc,
  index,
  downloadingId,
  deletingId,
  onDownload,
  onDelete,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft transition hover:border-indigo-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-primary">
        <DocumentThumbnail doc={doc} />
        <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/50 via-transparent to-transparent p-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onDownload(doc)}
            disabled={downloadingId === doc.document_id}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/95 text-indigo-600 shadow-sm transition hover:bg-secondary disabled:opacity-60 dark:text-indigo-400"
            title="Download"
          >
            {downloadingId === doc.document_id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(doc)}
            disabled={deletingId === doc.document_id}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/95 text-red-500 shadow-sm transition hover:bg-secondary disabled:opacity-60"
            title="Delete"
          >
            {deletingId === doc.document_id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="truncate text-sm font-semibold text-primary-foreground" title={doc.name}>
          {truncateFileName(doc.name, 32)}
        </p>
        <p className="mt-1 text-xs text-secondary-foreground">{formatBytes(doc.size)}</p>
        {doc.firm_name && (
          <Link
            to={clientRoute(`/firms/${doc.firm_id}`)}
            className="mt-2 inline-block truncate text-xs font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            title={doc.firm_name}
          >
            {doc.firm_name}
          </Link>
        )}
      </div>
    </motion.article>
  );
}

function DocumentCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-secondary animate-pulse">
      <div className="aspect-[4/3] bg-border" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-border" />
        <div className="h-3 w-1/3 rounded bg-border" />
        <div className="h-3 w-1/2 rounded bg-border" />
      </div>
    </div>
  );
}

function DocumentGridSkeleton() {
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <DocumentCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function Documents() {
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [firmFilter, setFirmFilter] = useState(null);
  const [uploadFirmId, setUploadFirmId] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [firmModalOpen, setFirmModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const firmOptions = buildFirmSelectOptions(firms);

  const filterFirmOptions = [{ value: "all", label: "All Businesses" }, ...firmOptions];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPageNo(1);
  }, [debouncedSearch, firmFilter]);

  const fetchFirms = useCallback(async () => {
    try {
      const response = await apiCall("/firms/list?page_no=1&limit=100");
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        const firmList = body.data.firms || [];
        setFirms(firmList);

        if (firmList.length === 1) {
          setUploadFirmId(firmList[0].firm_id);
        }
      }
    } catch {
      toast.error("Failed to load businesses.");
    }
  }, [toast]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page_no: String(pageNo),
        limit: String(limit),
        search: debouncedSearch,
      });

      if (firmFilter && firmFilter !== "all") {
        params.set("firm_id", firmFilter);
      }

      const response = await apiCall(`/documents/list?${params.toString()}`);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setDocuments(body.data.documents || []);
        setTotal(body.data.pagination?.total || 0);
      } else {
        throw new Error(body.message || "Failed to load documents");
      }
    } catch (err) {
      setError(err.message || "Failed to load documents.");
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [pageNo, limit, debouncedSearch, firmFilter, toast]);

  useEffect(() => {
    fetchFirms();
  }, [fetchFirms]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const requestDelete = (doc) => {
    setDeleteTarget({
      document_id: doc.document_id,
      name: doc.name || "this document",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const documentId = deleteTarget.document_id;
    setDeletingId(documentId);
    const toastId = toast.loading("Deleting document…");

    try {
      const response = await apiCall("/documents/delete", "DELETE", {
        document_id: documentId,
      });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Document deleted successfully.", { id: toastId });
        setDeleteTarget(null);
        fetchDocuments();
      } else {
        throw new Error(body.message || "Failed to delete document");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete document.", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (doc) => {
    setDownloadingId(doc.document_id);
    await downloadDocument(doc, toast);
    setDownloadingId(null);
  };

  const handleFirmCreated = (firm) => {
    setFirms((prev) => [firm, ...prev]);
    setUploadFirmId(firm.firm_id);
    setFirmModalOpen(false);
    setUploadModalOpen(true);
    toast.success("Business created. You can now upload documents.");
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const openUploadModal = () => {
    if (firms.length === 0) {
      setFirmModalOpen(true);
      return;
    }
    setUploadModalOpen(true);
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
          title="My Documents"
          description="Manage and upload your documents securely."
          actions={
            <>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchDocuments}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary disabled:opacity-60"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                <span className="hidden sm:flex">Refresh</span>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openUploadModal}
                className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} />
                Upload
              </motion.button>
            </>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5">
          <Search size={16} className="text-secondary-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-secondary-foreground"
          />
        </div>
        <div className="w-full sm:w-64">
          <SelectField
            value={
              filterFirmOptions.find((item) => item.value === (firmFilter || "all")) || filterFirmOptions[0]
            }
            onChange={(option) => setFirmFilter(option?.value === "all" ? null : option?.value || null)}
            options={filterFirmOptions}
            placeholder="Filter by business"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {loading && documents.length === 0 ? (
          <DocumentGridSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-border bg-secondary py-16 text-center shadow-soft sm:rounded-3xl">
            <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
            <p className="font-medium text-red-500">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-border bg-secondary py-16 text-center shadow-soft sm:rounded-3xl">
            <AlertCircle className="mx-auto mb-3 text-secondary-foreground/50" size={40} />
            <p className="mb-4 font-medium text-secondary-foreground">No documents found.</p>
            <button
              type="button"
              onClick={openUploadModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {documents.map((doc, index) => (
              <DocumentCard
                key={doc.document_id}
                doc={doc}
                index={index}
                downloadingId={downloadingId}
                deletingId={deletingId}
                onDownload={handleDownload}
                onDelete={requestDelete}
              />
            ))}
          </div>
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

      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        firms={firms}
        initialFirmId={uploadFirmId}
        onSuccess={handleUploadSuccess}
        onRequestCreateFirm={() => {
          setUploadModalOpen(false);
          setFirmModalOpen(true);
        }}
      />

      <FirmFormModal
        isOpen={firmModalOpen}
        onClose={() => setFirmModalOpen(false)}
        mode="create"
        description="You need at least one business before uploading documents."
        onSuccess={handleFirmCreated}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deletingId && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete document?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Keep document"
        loading={Boolean(deletingId)}
      />
    </motion.div>
  );
}
