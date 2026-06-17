import { useState, useEffect, useRef } from "react";
import { UploadCloud, X, Loader2, Building2, FileText } from "lucide-react";
import { apiCall, uploadFile } from "../../utils/apiCall";
import { useToast } from "../../contexts/ToastContext";
import SelectField from "../common/SelectField";

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

export default function DocumentUploadModal({
  isOpen,
  onClose,
  firms = [],
  initialFirmId = null,
  onSuccess,
  onRequestCreateFirm,
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [firmId, setFirmId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const firmOptions = firms.map((firm) => ({
    value: firm.firm_id,
    label: firm.name,
  }));

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setDocumentName("");
      setUploading(false);
      setDragOver(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (initialFirmId) {
      setFirmId(initialFirmId);
    } else if (firms.length === 1) {
      setFirmId(firms[0].firm_id);
    } else {
      setFirmId(null);
    }
  }, [isOpen, initialFirmId, firms]);

  const handleFileSelect = (file) => {
    if (!file || uploading) return;

    setSelectedFile(file);
    setDocumentName(file.name.replace(/\.[^/.]+$/, "").slice(0, 100) || file.name.slice(0, 100));
  };

  const handleFileChange = (event) => {
    handleFileSelect(event.target.files?.[0] || null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!uploading) setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    if (uploading) return;

    handleFileSelect(event.dataTransfer.files?.[0] || null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!firmId) {
      toast.error("Please select a firm.");
      return;
    }

    if (!selectedFile) {
      toast.error("Please choose a file to upload.");
      return;
    }

    const name = documentName.trim() || selectedFile.name.slice(0, 100);
    if (!name) {
      toast.error("Please enter a document name.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading document…");

    try {
      const url = await uploadFile(selectedFile);

      const response = await apiCall("/documents/create", "POST", {
        firm_id: firmId,
        name,
        url,
      });
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Document uploaded successfully.", { id: toastId });
        onSuccess?.(body.data);
        onClose();
      } else {
        throw new Error(body.message || "Failed to save document");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload document.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-secondary shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <UploadCloud size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">Upload Document</h2>
              <p className="mt-0.5 text-sm text-secondary-foreground">
                Add a document to your firm library.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-2 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                Firm <span className="text-red-500">*</span>
              </label>
              {firms.length === 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
                  <p className="mb-3">You need at least one firm to upload documents.</p>
                  <button
                    type="button"
                    onClick={onRequestCreateFirm}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    <Building2 size={14} />
                    Create Firm
                  </button>
                </div>
              ) : (
                <SelectField
                  value={firmOptions.find((item) => item.value === firmId) || null}
                  onChange={(option) => setFirmId(option?.value || null)}
                  options={firmOptions}
                  placeholder="Select a firm"
                  isDisabled={uploading}
                />
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(event) => setDocumentName(event.target.value)}
                disabled={uploading}
                placeholder="e.g. PAN Card"
                className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                File <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                    : "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/20"
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <FileText size={22} />
                    </div>
                    <p className="text-sm font-semibold text-primary-foreground" title={selectedFile.name}>
                      {truncateFileName(selectedFile.name, 32)}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-60"
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <UploadCloud size={22} />
                    </div>
                    <p className="text-sm font-semibold text-primary-foreground">
                      {dragOver ? "Drop file here" : "Drag & drop or choose file"}
                    </p>
                    <p className="mt-1 text-xs text-secondary-foreground">
                      Supports PDF, JPG, PNG, XLSX and more
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || firms.length === 0}
                      className="mt-4 rounded-xl border border-indigo-200 bg-secondary px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:shadow-sm disabled:opacity-60"
                    >
                      Browse Files
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  disabled={uploading || firms.length === 0}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || firms.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
