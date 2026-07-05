import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Save, Building2, X } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { useToast } from "../../contexts/ToastContext";
import SelectField from "../common/SelectField";
import AnimatedModal from "../common/AnimatedModal";
import { FormSkeleton } from "../SkeletonComponent";

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
  const [firmTypes, setFirmTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
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
        throw new Error(body.message || "Failed to load business details");
      }
    } catch (err) {
      setError(err.message || "Failed to load business details.");
    } finally {
      setLoading(false);
    }
  }, [firmId, isEdit]);

  const fetchFirmTypes = useCallback(async () => {
    setTypesLoading(true);
    try {
      const response = await apiCall("/firms/types");
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        setFirmTypes(body.data.types || []);
      } else {
        throw new Error(body.message || "Failed to load business types");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load business types.");
      setFirmTypes([]);
    } finally {
      setTypesLoading(false);
    }
  }, [toast]);

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

    fetchFirmTypes();
  }, [isOpen, isEdit, firmId, fetchFirm, fetchFirmTypes, resetForm]);

  const typeOptions = useMemo(() => {
    const options = [...firmTypes];
    if (form.type && !options.some((item) => item.value === form.type)) {
      options.unshift({ value: form.type, label: form.type });
    }
    return options;
  }, [firmTypes, form.type]);

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
      toast.error("Business type is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(isEdit ? "Saving changes…" : "Creating business…");

    try {
      const endpoint = isEdit ? "/firms/update" : "/firms/create";
      const payload = isEdit ? { firm_id: firmId, ...form } : form;
      const response = await apiCall(endpoint, "POST", payload);
      const body = await response.json();

      if (response.ok && body.success && body.data) {
        toast.success(isEdit ? "Business updated successfully." : "Business created successfully.", {
          id: toastId,
        });
        onSuccess?.(body.data);
        onClose();
      } else {
        throw new Error(body.message || "Failed to save business");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save business.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={saving}
      maxWidth="max-w-2xl"
      panelClassName="flex max-h-[90vh] flex-col overflow-hidden rounded-lg border border-border bg-secondary shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">
                {isEdit ? "Edit Business" : "Create Business"}
              </h2>
              <p className="mt-0.5 text-sm text-secondary-foreground">
                {description ||
                  (isEdit
                    ? "Update your business details."
                    : "Add a new business to your account.")}
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

        <div className="modal-scroll overflow-y-auto px-5 py-5 sm:px-6">
          {loading ? (
            <FormSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          ) : (
            <form id="firm-form-modal" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                  Business Name <span className="text-red-500">*</span>
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
                  Business Type <span className="text-red-500">*</span>
                </label>
                <SelectField
                  value={typeOptions.find((item) => item.value === form.type) || null}
                  onChange={handleTypeChange}
                  options={typeOptions}
                  placeholder={typesLoading ? "Loading business types…" : "Select business type"}
                  isDisabled={typesLoading}
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
              {isEdit ? "Save Changes" : "Create Business"}
            </button>
          </div>
        )}
    </AnimatedModal>
  );
}
