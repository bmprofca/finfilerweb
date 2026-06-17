import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
import { useToast } from "../contexts/ToastContext";
import SelectField from "../components/common/SelectField";
import Pagination from "../components/common/PaginationComponent";
import FirmFormModal from "../components/firms/FirmFormModal";
import DocumentUploadModal from "../components/documents/DocumentUploadModal";

const fileIconMap = {
  pdf: { icon: FileText, color: "text-red-500 bg-red-50 dark:bg-red-950/40" },
  image: { icon: Image, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
  doc: { icon: File, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
};

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
    const response = await fetch(resolveMediaUrl(doc.file_url));
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = doc.file_name || doc.name || "document";
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    toast.error("Failed to download document.");
  }
};

function DocumentListSkeleton() {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="flex animate-pulse items-center gap-4 px-4 py-4 sm:px-5">
          <div className="h-11 w-11 rounded-xl bg-border" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-border" />
            <div className="h-3 w-32 rounded bg-border" />
          </div>
        </li>
      ))}
    </ul>
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

  const firmOptions = firms.map((firm) => ({
    value: firm.firm_id,
    label: firm.name,
  }));

  const filterFirmOptions = [{ value: "all", label: "All Firms" }, ...firmOptions];

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
      toast.error("Failed to load firms.");
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

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    setDeletingId(documentId);
    const toastId = toast.loading("Deleting document…");

    try {
      const response = await apiCall("/documents/delete", "DELETE", {
        document_id: documentId,
      });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Document deleted successfully.", { id: toastId });
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
    toast.success("Firm created. You can now upload documents.");
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
      className="mx-auto max-w-8xl py-6 sm:py-8 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end"
      >
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            My Documents
          </h1>
          <p className="mt-1 text-sm text-secondary-foreground sm:mt-2 sm:text-lg">
            Manage and upload your documents securely.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={openUploadModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={18} />
            Upload Document
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="w-full sm:w-64">
          <SelectField
            value={
              filterFirmOptions.find((item) => item.value === (firmFilter || "all")) || filterFirmOptions[0]
            }
            onChange={(option) => setFirmFilter(option?.value === "all" ? null : option?.value || null)}
            options={filterFirmOptions}
            placeholder="Filter by firm"
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft sm:rounded-3xl"
      >
        {loading && documents.length === 0 ? (
          <DocumentListSkeleton />
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
            <p className="font-medium text-red-500">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 text-slate-300" size={40} />
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
          <ul className="divide-y divide-border">
            {documents.map((doc, index) => {
              const fileType = getFileType(doc.file_name || doc.name);
              const { icon: FileIcon, color } = fileIconMap[fileType] || fileIconMap.doc;

              return (
                <motion.li
                  key={doc.document_id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ backgroundColor: "rgba(248,250,252,0.6)" }}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors sm:gap-4 sm:px-5 sm:py-4"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${color}`}
                  >
                    <FileIcon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-semibold text-primary-foreground"
                      title={doc.name}
                    >
                      {truncateFileName(doc.name, 40)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(doc.size)}
                      {doc.firm_name && (
                        <>
                          {" · "}
                          <Link
                            to={`/firms/${doc.firm_id}`}
                            className="text-indigo-600 transition hover:text-indigo-700"
                          >
                            {doc.firm_name}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.document_id}
                      className="rounded-lg p-2 text-indigo-500 transition hover:bg-indigo-50 disabled:opacity-60"
                      title="Download"
                    >
                      {downloadingId === doc.document_id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.document_id)}
                      disabled={deletingId === doc.document_id}
                      className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 disabled:opacity-60"
                      title="Delete"
                    >
                      {deletingId === doc.document_id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
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
        description="You need at least one firm before uploading documents."
        onSuccess={handleFirmCreated}
      />
    </motion.div>
  );
}
