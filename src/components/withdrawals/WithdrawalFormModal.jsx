import { useState, useEffect } from "react";
import { Loader2, Building2, Smartphone, Wallet, Check, PlusCircle } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { useToast } from "../../contexts/ToastContext";
import Modal from "../common/Modal";

const EMPTY_DETAILS = {
  payment_method: "bank",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
};

const maskAccountNumber = (value) =>
  value && value.length > 4 ? `••••••${value.slice(-4)}` : value || "";

const maskUpiId = (value) => {
  if (!value || !value.includes("@")) return value || "";
  const [name, handle] = value.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(name.length - 2, 2))}@${handle}`;
};

export default function WithdrawalFormModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();

  // "saved" -> use the previously used payout details as-is
  // "new"   -> fill out a fresh bank/UPI form
  const [mode, setMode] = useState("new");
  const [savedDetails, setSavedDetails] = useState(null);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  const [amount, setAmount] = useState("");
  const [form, setForm] = useState(EMPTY_DETAILS);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    setAmount("");
    setForm(EMPTY_DETAILS);
    setErrors({});
    setSavedDetails(null);
    setMode("new");
    setLoadingPrevious(true);

    (async () => {
      try {
        const response = await apiCall("/withdrawals/previous-details");
        const body = await response.json();

        if (response.ok && body.success && body.data?.details) {
          setSavedDetails(body.data.details);
          setMode("saved");
        }
      } catch {
        // No previous details available — the form starts blank.
      } finally {
        setLoadingPrevious(false);
      }
    })();
  }, [isOpen]);

  const handleUseNew = () => {
    setMode("new");
    setForm(EMPTY_DETAILS);
    setErrors({});
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setPaymentMethod = (method) => {
    setForm((prev) => ({ ...prev, payment_method: method }));
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    const amountNum = Number(amount);

    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      nextErrors.amount = "Enter a valid amount.";
    }

    if (mode === "new") {
      if (form.payment_method === "bank") {
        if (!form.account_holder_name.trim()) nextErrors.account_holder_name = "Required.";
        if (!form.bank_name.trim()) nextErrors.bank_name = "Required.";
        if (!form.account_number.trim()) nextErrors.account_number = "Required.";
        if (!form.ifsc_code.trim()) nextErrors.ifsc_code = "Required.";
      } else {
        if (!form.upi_id.trim()) nextErrors.upi_id = "Required.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const source = mode === "saved" ? savedDetails : form;

    if (source.payment_method === "bank") {
      return {
        amount: Number(amount),
        payment_method: "bank",
        account_holder_name: source.account_holder_name.trim
          ? source.account_holder_name.trim()
          : source.account_holder_name,
        bank_name: source.bank_name,
        account_number: source.account_number,
        ifsc_code: source.ifsc_code,
      };
    }

    return {
      amount: Number(amount),
      payment_method: "upi",
      upi_id: source.upi_id,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const toastId = toast.loading("Submitting withdrawal request…");

    try {
      const response = await apiCall("/withdrawals/request", "POST", buildPayload());
      const body = await response.json();

      if (response.ok && body.success) {
        toast.success("Withdrawal request submitted.", { id: toastId });
        onSuccess?.();
      } else {
        throw new Error(body.message || "Failed to submit withdrawal request");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit withdrawal request.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <Wallet size={18} className="text-indigo-500" />
      <span>Request Withdrawal</span>
    </div>
  );

  const formFooter = !loadingPrevious ? (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-primary-foreground transition hover:border-indigo-500/40"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="withdrawal-form"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting && <Loader2 size={15} className="animate-spin" />}
        Submit Request
      </button>
    </div>
  ) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg" footer={formFooter}>
      {loadingPrevious ? (
        <div className="flex items-center justify-center py-10 text-secondary-foreground">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <form id="withdrawal-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                    Amount
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onKeyDown={(event) => {
                      const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "."];
                      if (!allowed.includes(event.key) && !/^\d$/.test(event.key)) {
                        event.preventDefault();
                      }
                      // Allow only one decimal point
                      if (event.key === "." && amount.includes(".")) {
                        event.preventDefault();
                      }
                    }}
                    onChange={(event) => {
                      const val = event.target.value.replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d*).*$/, "$1");
                      setAmount(val);
                      setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary-foreground dark:text-slate-300 dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                    Payout Details
                  </label>

                  <div className="space-y-2">
                    {savedDetails && (
                      <button
                        type="button"
                        onClick={() => setMode("saved")}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                          mode === "saved"
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-border bg-background hover:border-indigo-500/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                            mode === "saved"
                              ? "border-indigo-500 bg-indigo-500"
                              : "border-secondary-foreground"
                          }`}
                        >
                          {mode === "saved" && <Check size={11} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground">
                            {savedDetails.payment_method === "upi" ? (
                              <Smartphone size={14} className="text-secondary-foreground" />
                            ) : (
                              <Building2 size={14} className="text-secondary-foreground" />
                            )}
                            Use previous details
                          </div>
                          {savedDetails.payment_method === "upi" ? (
                            <p className="mt-1 text-xs text-secondary-foreground">
                              UPI • {maskUpiId(savedDetails.upi_id)}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-secondary-foreground">
                              {savedDetails.bank_name} • {savedDetails.account_holder_name} •{" "}
                              {maskAccountNumber(savedDetails.account_number)}
                            </p>
                          )}
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleUseNew}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        mode === "new"
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-border bg-background hover:border-indigo-500/40"
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                          mode === "new"
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-secondary-foreground"
                        }`}
                      >
                        {mode === "new" && <Check size={11} className="text-white" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground">
                        <PlusCircle size={14} className="text-secondary-foreground" />
                        {savedDetails ? "Use new bank / UPI details" : "Enter bank / UPI details"}
                      </div>
                    </button>
                  </div>
                </div>

                {mode === "new" && (
                  <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          form.payment_method === "bank"
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                            : "border-border bg-background text-secondary-foreground hover:text-primary-foreground"
                        }`}
                      >
                        <Building2 size={15} />
                        Bank Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          form.payment_method === "upi"
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                            : "border-border bg-background text-secondary-foreground hover:text-primary-foreground"
                        }`}
                      >
                        <Smartphone size={15} />
                        UPI
                      </button>
                    </div>

                    {form.payment_method === "bank" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            value={form.account_holder_name}
                            onChange={handleChange("account_holder_name")}
                            placeholder="e.g. Hello World"
                            className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-300 dark:bg-slate-900"
                          />
                          {errors.account_holder_name && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.account_holder_name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={form.bank_name}
                            onChange={handleChange("bank_name")}
                            placeholder="e.g. HDFC Bank"
                            className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-300 dark:bg-slate-900"
                          />
                          {errors.bank_name && (
                            <p className="mt-1 text-xs text-red-500">{errors.bank_name}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                              Account Number
                            </label>
                            <input
                              type="text"
                              value={form.account_number}
                              onChange={handleChange("account_number")}
                              placeholder="Account number"
                              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-300 dark:bg-slate-900"
                            />
                            {errors.account_number && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.account_number}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                              IFSC Code
                            </label>
                            <input
                              type="text"
                              value={form.ifsc_code}
                              onChange={handleChange("ifsc_code")}
                              placeholder="e.g. HDFC0001234"
                              className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-300 dark:bg-slate-900"
                            />
                            {errors.ifsc_code && (
                              <p className="mt-1 text-xs text-red-500">{errors.ifsc_code}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          value={form.upi_id}
                          onChange={handleChange("upi_id")}
                          placeholder="e.g. johndoe@upi"
                          className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-300 dark:bg-slate-900"
                        />
                        {errors.upi_id && (
                          <p className="mt-1 text-xs text-red-500">{errors.upi_id}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </form>
      )}
    </Modal>
  );
}