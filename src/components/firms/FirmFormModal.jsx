import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, Building2, X } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { useToast } from "../../contexts/ToastContext";
import SelectField from "../common/SelectField";

export const FIRM_TYPES = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "opc", label: "One Person Company" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM = {
  name: "",
  type: "",
  pan_no: "",
  gst_no: "",
  vat_no: "",
  tan_no: "",
};

export default function FirmFormModal({
  isOpen,
  onClose,
  mode = "create",
  firmId = null,
  onSuccess,
  description,
}) {
  const toast = useToast();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setError(null);
    setLoading(false);
    setSaving(false);
  }, []);

  const fetchFirm = useCallback(async () => {
    if (!isEdit || !firmId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(`/firms/details/${firmId}`);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        const firm = body.data;
        setForm({
          name: firm.name || "",
          type: firm.type || "",
          pan_no: firm.pan_no || "",
          gst_no: firm.gst_no || "",
          vat_no: firm.vat_no || "",
          tan_no: firm.tan_no || "",
        });
      } else {
        throw new Error(body.message || "Failed to load firm details");
      }
    } catch (err) {
      setError(err.message || "Failed to load firm details.");
    } finally {
      setLoading(false);
    }
  }, [firmId, isEdit]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (isEdit && firmId) {
      fetchFirm();
    } else {
      resetForm();
    }
  }, [isOpen, isEdit, firmId, fetchFirm, resetForm]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleTypeChange = (option) => {
    setForm((prev) => ({ ...prev, type: option?.value || "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.type) {
      toast.error("Firm type is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Saving changes…" : "Creating firm…");

    try {
      const endpoint = isEdit ? "/firms/update" : "/firms/create";
      const payload = isEdit ? { firm_id: firmId, ...form } : form;
      const response = await apiCall(endpoint, "POST", payload);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        toast.success(isEdit ? "Firm updated successfully." : "Firm created successfully.", {
          id: toastId,
        });
        onSuccess?.(body.data);
        onClose();
      } else {
        throw new Error(body.message || "Failed to save firm");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save firm.", { id: toastId });
    } finally {
      setSaving(false);
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

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-secondary shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">
                {isEdit ? "Edit Firm" : "Create Firm"}
              </h2>
              <p className="mt-0.5 text-sm text-secondary-foreground">
                {description ||
                  (isEdit
                    ? "Update your firm details."
                    : "Add a new business firm to your account.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          ) : (
            <form id="firm-form-modal" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                  Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                  placeholder="e.g. Acme Pvt Ltd"
                  className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                  Firm Type <span className="text-red-500">*</span>
                </label>
                <SelectField
                  value={FIRM_TYPES.find((item) => item.value === form.type) || null}
                  onChange={handleTypeChange}
                  options={FIRM_TYPES}
                  placeholder="Select firm type"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.pan_no}
                    onChange={handleChange("pan_no")}
                    required
                    placeholder="ABCDE1234F"
                    className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={form.gst_no}
                    onChange={handleChange("gst_no")}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={form.vat_no}
                    onChange={handleChange("vat_no")}
                    placeholder="VAT registration number"
                    className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                    TAN Number
                  </label>
                  <input
                    type="text"
                    value={form.tan_no}
                    onChange={handleChange("tan_no")}
                    placeholder="TAN registration number"
                    className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {!loading && !error && (
          <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="firm-form-modal"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEdit ? "Save Changes" : "Create Firm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
