import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Building2 } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import SelectField from "../components/common/SelectField";

const FIRM_TYPES = [
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

const formatTypeLabel = (type) => {
  const match = FIRM_TYPES.find((item) => item.value === type);
  return match?.label || type || "—";
};

export default function FirmForm({ mode = "create" }) {
  const { firmId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      toast.error("Failed to load firm details.");
    } finally {
      setLoading(false);
    }
  }, [firmId, isEdit, toast]);

  useEffect(() => {
    fetchFirm();
  }, [fetchFirm]);

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
        navigate(`/firms/${body.data.firm_id}`);
      } else {
        throw new Error(body.message || "Failed to save firm");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save firm.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-8 px-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/firms" className="text-indigo-600 hover:underline">
          Back to firms
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-3xl py-6 sm:py-8 px-2 sm:px-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        to={isEdit ? `/firms/${firmId}` : "/firms"}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground hover:text-indigo-600 transition"
      >
        <ArrowLeft size={16} />
        {isEdit ? "Back to firm details" : "Back to firms"}
      </Link>

      <div className="mb-8">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
          <Building2 size={24} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">
          {isEdit ? "Edit Firm" : "Create Firm"}
        </h1>
        <p className="mt-1 text-sm text-secondary-foreground">
          {isEdit
            ? `Update details for ${form.name || "this firm"}.`
            : "Add a new business firm to your account."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-secondary p-6 shadow-soft space-y-5"
      >
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
          {form.type && (
            <p className="mt-1 text-xs text-secondary-foreground">
              Selected: {formatTypeLabel(form.type)}
            </p>
          )}
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
              className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 uppercase"
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
              className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 uppercase"
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
              className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 uppercase"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/firms/${firmId}` : "/firms")}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? "Save Changes" : "Create Firm"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
