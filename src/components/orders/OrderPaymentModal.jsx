import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  X,
  Wallet,
  AlertCircle,
  ChevronRight,
  Landmark,
  ArrowLeft,
} from "lucide-react";
import { payForOrderWithWallet } from "../../utils/razorpay";
import AnimatedModal from "../common/AnimatedModal";
import { apiCall } from "../../utils/apiCall";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
};

const isPartialPaymentAllowed = (order) =>
  order?.partial_payment_allowed === true ||
  order?.partial_payment_allowed === 1 ||
  order?.partial_payment_allowed === "1";

const GST_NUMBER_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const isValidGstNo = (value) => GST_NUMBER_REGEX.test(value);

// Step identifiers
const STEP_OPTIONS = "options";
const STEP_FORM    = "form";

export default function OrderPaymentModal({
  isOpen,
  onClose,
  order,
  onSuccess,
  showOrderCreatedSuccess = false,
}) {
  // ── step ────────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP_OPTIONS);

  // ── payment type ─────────────────────────────────────────────────────────────
  const [paymentType, setPaymentType] = useState("full");

  // ── amounts ───────────────────────────────────────────────────────────────────
  const [partialAmount, setPartialAmount] = useState("");
  const [walletAmt, setWalletAmt] = useState("");

  // ── gst ───────────────────────────────────────────────────────────────────────
  const [gstNo, setGstNo] = useState("");

  // ── ui state ──────────────────────────────────────────────────────────────────
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // ── wallet ────────────────────────────────────────────────────────────────────
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [useWallet, setUseWallet] = useState(false);

  // ── derived ───────────────────────────────────────────────────────────────────
  const totalFees = Number(order?.fees) || 0;
  const paidAmount = Number(order?.paid_amount) || 0;
  const remainingAmount =
    order?.remaining_amount !== undefined
      ? Number(order.remaining_amount)
      : Math.max(0, totalFees - paidAmount);

  const fullAmount = remainingAmount;
  const partialPaymentAllowed = isPartialPaymentAllowed(order);

  // Total amount the user wants to pay this session
  const sessionTotal =
    partialPaymentAllowed && paymentType === "partial"
      ? parseAmount(partialAmount)
      : fullAmount;

  // Effective wallet portion (capped to balance and session total)
  const effectiveWalletAmt = useWallet
    ? Math.min(parseAmount(walletAmt), walletBalance ?? 0, sessionTotal)
    : 0;

  // Portion going to Razorpay (UPI / bank / card)
  const razorpayAmt = Math.max(0, sessionTotal - effectiveWalletAmt);

  // ── fetch wallet balance ──────────────────────────────────────────────────────
  const fetchWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const res  = await apiCall("/transactions/balance", "GET");
      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setWalletBalance(Number(body.data.balance) || 0);
      } else {
        throw new Error(body.message || "Could not fetch wallet balance.");
      }
    } catch (err) {
      setWalletError(err.message || "Could not fetch wallet balance.");
      setWalletBalance(0);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ── reset on open / close ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setStep(STEP_OPTIONS);
      setPaymentType("full");
      setPartialAmount("");
      setWalletAmt("");
      setGstNo("");
      setPaying(false);
      setError("");
      setUseWallet(false);
      setWalletBalance(null);
      setWalletError("");
      return;
    }

    setGstNo(order?.firm_gst_no || "");

    if (!isPartialPaymentAllowed(order)) {
      setPaymentType("full");
    }

    fetchWalletBalance();
  }, [isOpen, order, fetchWalletBalance]);

  // ── pre-fill wallet amount when toggle turns on ──────────────────────────────
  // Wallet can only be a partial contribution — at least ₹1 must go to bank/UPI.
  useEffect(() => {
    if (useWallet && walletBalance !== null && walletAmt === "") {
      const cap = (sessionTotal > 0 ? sessionTotal : remainingAmount) - 1;
      const suggested = Math.min(walletBalance, Math.max(0, cap));
      setWalletAmt(suggested > 0 ? String(suggested) : "");
    }
    if (!useWallet) {
      setWalletAmt("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWallet]);

  // ── validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    if (remainingAmount <= 0) return "This order has no remaining balance.";
    if (sessionTotal <= 0)    return "Enter a valid payment amount.";
    if (sessionTotal < 1)     return "Minimum payment amount is ₹1.";
    if (sessionTotal > remainingAmount)
      return `Amount cannot exceed ${formatCurrency(remainingAmount)}.`;

    if (useWallet) {
      if (parseAmount(walletAmt) <= 0) return "Enter a valid wallet amount.";
      if (parseAmount(walletAmt) > (walletBalance ?? 0))
        return `Wallet amount cannot exceed your balance of ${formatCurrency(walletBalance)}.`;
      if (effectiveWalletAmt >= sessionTotal)
        return "Wallet cannot cover the full amount. At least ₹1 must be paid via UPI / Bank.";
      if (razorpayAmt < 1)
        return "At least ₹1 must be paid via UPI / Bank when using wallet.";
    }

    const trimmedGst = gstNo.trim().toUpperCase();
    if (trimmedGst && !isValidGstNo(trimmedGst))
      return "Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5).";

    return "";
  };

  // ── pay handler ───────────────────────────────────────────────────────────────
  const handlePay = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPaying(true);
    setError("");

    try {
      await payForOrderWithWallet(order.order_id, {
        amount:        sessionTotal,
        walletAmount:  effectiveWalletAmt,
        razorpayAmount: razorpayAmt,
        gstNo:         gstNo.trim().toUpperCase(),
        onDismiss: () => setPaying(false),
      });

      onSuccess?.({
        amount:         sessionTotal,
        isFullPayment:  sessionTotal >= remainingAmount,
        remainingAfter: Math.max(0, remainingAmount - sessionTotal),
      });
      onClose();
    } catch (err) {
      const message = err.message || "Payment could not be completed.";
      if (message !== "Payment cancelled") {
        setError(message);
      }
    } finally {
      setPaying(false);
    }
  };

  const handleSelectOption = (type) => {
    setPaymentType(type);
    setPartialAmount("");
    setWalletAmt("");
    setUseWallet(false);
    setError("");
    setStep(STEP_FORM);
  };

  const handleBack = () => {
    setStep(STEP_OPTIONS);
    setError("");
  };

  const walletUsable = walletBalance !== null && walletBalance > 0;

  return (
    <AnimatedModal
      isOpen={isOpen && Boolean(order)}
      onClose={onClose}
      closeDisabled={paying}
      maxWidth="max-w-lg"
      panelClassName="overflow-hidden rounded-2xl border border-border bg-secondary shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          {step === STEP_FORM && (
            <button
              type="button"
              onClick={handleBack}
              disabled={paying}
              className="mr-1 rounded-lg p-1 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h3 className="text-lg font-bold text-primary-foreground">
              {step === STEP_OPTIONS ? "Choose payment type" : "Make payment"}
            </h3>
            <p className="mt-0.5 text-xs text-secondary-foreground">
              {step === STEP_OPTIONS
                ? "Select how you'd like to pay"
                : paymentType === "partial"
                ? "Partial payment — split as you like"
                : "Full payment — clear outstanding balance"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={paying}
          className="rounded-lg p-1 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="modal-scroll max-h-[calc(90vh-10rem)] overflow-y-auto px-5 py-5 space-y-5">

        {/* Order created success banner */}
        {showOrderCreatedSuccess && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Order placed successfully
              </p>
              <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400">
                Your order has been created. Complete payment below to confirm it.
              </p>
            </div>
          </div>
        )}

        {/* Summary pill — always visible */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-primary/60 p-3 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-secondary-foreground">Total</p>
            <p className="mt-1 text-sm font-bold text-primary-foreground">{formatCurrency(totalFees)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-secondary-foreground">Paid</p>
            <p className="mt-1 text-sm font-bold text-emerald-600">{formatCurrency(paidAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-secondary-foreground">Due</p>
            <p className="mt-1 text-sm font-bold text-indigo-600">{formatCurrency(remainingAmount)}</p>
          </div>
        </div>

        {/* ═══ STEP: OPTIONS ═══ */}
        {step === STEP_OPTIONS && (
          <div className="space-y-3">
            {/* Full payment card */}
            <button
              type="button"
              onClick={() => handleSelectOption("full")}
              className="group w-full rounded-xl border border-border bg-primary px-4 py-4 text-left transition hover:border-indigo-400 hover:bg-indigo-500/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">Full payment</p>
                    <p className="mt-0.5 text-xs text-secondary-foreground">
                      Clear entire balance of {formatCurrency(remainingAmount)}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-secondary-foreground/40 transition group-hover:text-indigo-400" />
              </div>
            </button>

            {/* Partial payment card */}
            {partialPaymentAllowed ? (
              <button
                type="button"
                onClick={() => handleSelectOption("partial")}
                className="group w-full rounded-xl border border-border bg-primary px-4 py-4 text-left transition hover:border-amber-400 hover:bg-amber-500/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                      <Landmark size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">Partial payment</p>
                      <p className="mt-0.5 text-xs text-secondary-foreground">
                        Pay a custom amount now, rest later
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-secondary-foreground/40 transition group-hover:text-amber-400" />
                </div>
              </button>
            ) : (
              <p className="rounded-xl border border-border bg-primary/50 px-4 py-3 text-center text-xs text-secondary-foreground">
                Partial payment is not available for this order.
              </p>
            )}
          </div>
        )}

        {/* ═══ STEP: FORM ═══ */}
        {step === STEP_FORM && (
          <div className="space-y-5">

            {/* Partial amount input */}
            {partialPaymentAllowed && paymentType === "partial" && (
              <div>
                <label
                  htmlFor="partial-amount"
                  className="mb-1.5 block text-sm font-medium text-primary-foreground"
                >
                  Total amount to pay
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary-foreground">
                    ₹
                  </span>
                  <input
                    id="partial-amount"
                    type="number"
                    min="1"
                    max={remainingAmount}
                    step="1"
                    value={partialAmount}
                    onChange={(e) => {
                      setPartialAmount(e.target.value);
                      setError("");
                      if (useWallet) setWalletAmt("");
                    }}
                    disabled={paying}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-border bg-primary py-3 pl-8 pr-4 text-sm text-primary-foreground outline-none transition focus:border-indigo-500"
                  />
                </div>
                <p className="mt-1.5 text-xs text-secondary-foreground">
                  Maximum {formatCurrency(remainingAmount)}
                </p>
              </div>
            )}

            {/* Wallet section */}
            <div className="rounded-xl border border-border bg-primary/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">Use wallet balance</p>
                    {walletLoading ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-secondary-foreground">
                        <Loader2 size={11} className="animate-spin" /> Fetching balance…
                      </p>
                    ) : walletError ? (
                      <p className="mt-0.5 text-xs text-red-500">{walletError}</p>
                    ) : (
                      <p className="mt-0.5 text-xs text-secondary-foreground">
                        Available:{" "}
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(walletBalance ?? 0)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => {
                    setUseWallet((v) => !v);
                    setError("");
                  }}
                  disabled={
                    paying ||
                    walletLoading ||
                    !walletUsable ||
                    (partialPaymentAllowed && paymentType === "partial" && sessionTotal <= 0)
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    useWallet ? "bg-emerald-500" : "bg-border"
                  }`}
                  aria-label={useWallet ? "Disable wallet" : "Enable wallet"}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      useWallet ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Wallet amount input + split breakdown */}
              {useWallet && walletUsable && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label
                      htmlFor="wallet-amount"
                      className="mb-1.5 block text-sm font-medium text-primary-foreground"
                    >
                      Amount from wallet
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-secondary-foreground">
                        ₹
                      </span>
                      <input
                        id="wallet-amount"
                        type="number"
                        min="1"
                        max={Math.min(
                          walletBalance ?? 0,
                          Math.max(0, (sessionTotal > 0 ? sessionTotal : remainingAmount) - 1),
                        )}
                        step="1"
                        value={walletAmt}
                        onChange={(e) => {
                          setWalletAmt(e.target.value);
                          setError("");
                        }}
                        disabled={paying}
                        placeholder="Enter wallet amount"
                        className="w-full rounded-xl border border-border bg-primary py-2.5 pl-8 pr-4 text-sm text-primary-foreground outline-none transition focus:border-emerald-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-secondary-foreground">
                      Max usable:{" "}
                      {formatCurrency(
                        Math.min(
                          walletBalance ?? 0,
                          Math.max(0, (sessionTotal > 0 ? sessionTotal : remainingAmount) - 1),
                        )
                      )}
                      <span className="ml-1 text-secondary-foreground/60">(₹1 min via UPI/Bank)</span>
                    </p>
                  </div>

                  {/* Split breakdown */}
                  {effectiveWalletAmt > 0 && (
                    <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800 dark:bg-emerald-950/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-secondary-foreground">
                          <Wallet size={11} /> From wallet
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(effectiveWalletAmt)}
                        </span>
                      </div>
                      {razorpayAmt > 0 ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-secondary-foreground">
                            <CreditCard size={11} /> Via UPI / Bank / Card
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {formatCurrency(razorpayAmt)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] font-medium text-emerald-600">
                          ✓ Fully covered by wallet — no online payment needed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {useWallet && !walletUsable && !walletLoading && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle size={12} />
                  Your wallet has no balance to use.
                </div>
              )}
            </div>

            {/* GST number */}
            <div>
              <label
                htmlFor="payment-gst-no"
                className="mb-1.5 block text-sm font-medium text-primary-foreground"
              >
                GST Number{" "}
                <span className="text-secondary-foreground">(optional)</span>
              </label>
              <input
                id="payment-gst-no"
                type="text"
                value={gstNo}
                onChange={(e) => {
                  setGstNo(e.target.value.toUpperCase());
                  setError("");
                }}
                disabled={paying}
                maxLength={15}
                placeholder="e.g. 22AAAAA0000A1Z5"
                className="w-full rounded-xl border border-border bg-primary px-4 py-3 text-sm uppercase tracking-wide text-primary-foreground outline-none transition focus:border-indigo-500"
              />
              <p className="mt-1.5 text-xs text-secondary-foreground">
                Used for the payment invoice. Saved to your business profile for next time.
              </p>
            </div>

            {/* Live payment summary bar */}
            {sessionTotal > 0 && (
              <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-200">
                      {razorpayAmt === 0
                        ? "Paying via wallet"
                        : useWallet && effectiveWalletAmt > 0
                        ? "Paying via UPI / Bank"
                        : "Amount to pay"}
                    </p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums">
                      {formatCurrency(razorpayAmt > 0 ? razorpayAmt : effectiveWalletAmt > 0 ? effectiveWalletAmt : sessionTotal)}
                    </p>
                  </div>
                  {useWallet && effectiveWalletAmt > 0 && razorpayAmt > 0 && (
                    <div className="text-right">
                      <p className="text-[11px] text-indigo-200">+ from wallet</p>
                      <p className="text-sm font-semibold tabular-nums text-indigo-100">
                        {formatCurrency(effectiveWalletAmt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 border-t border-border px-5 py-4">
        <button
          type="button"
          onClick={step === STEP_FORM ? handleBack : onClose}
          disabled={paying}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
        >
          {step === STEP_FORM ? "Back" : "Cancel"}
        </button>

        {step === STEP_FORM && (
          <button
            type="button"
            onClick={handlePay}
            disabled={paying || walletLoading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying ? (
              <Loader2 size={16} className="animate-spin" />
            ) : razorpayAmt === 0 && effectiveWalletAmt > 0 ? (
              <Wallet size={16} />
            ) : (
              <CreditCard size={16} />
            )}
            {paying
              ? "Processing…"
              : razorpayAmt === 0 && effectiveWalletAmt > 0
              ? `Pay ${formatCurrency(effectiveWalletAmt)} from Wallet`
              : `Pay ${formatCurrency(razorpayAmt > 0 ? razorpayAmt : sessionTotal)}`}
          </button>
        )}
      </div>
    </AnimatedModal>
  );
}

