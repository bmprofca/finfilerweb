import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, Loader2, X } from "lucide-react";
import { payForOrder } from "../../utils/razorpay";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
};

const isPartialPaymentAllowed = (order) =>
  order?.partial_payment_allowed === true ||
  order?.partial_payment_allowed === 1 ||
  order?.partial_payment_allowed === "1";

export default function OrderPaymentModal({
  isOpen,
  onClose,
  order,
  onSuccess,
  showOrderCreatedSuccess = false,
}) {
  const [paymentType, setPaymentType] = useState("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const totalFees = Number(order?.fees) || 0;
  const paidAmount = Number(order?.paid_amount) || 0;
  const remainingAmount =
    order?.remaining_amount !== undefined
      ? Number(order.remaining_amount)
      : Math.max(0, totalFees - paidAmount);

  const fullAmount = remainingAmount;
  const partialPaymentAllowed = isPartialPaymentAllowed(order);
  const selectedAmount =
    partialPaymentAllowed && paymentType === "partial"
      ? parseAmount(partialAmount)
      : fullAmount;

  useEffect(() => {
    if (!isOpen) {
      setPaymentType("full");
      setPartialAmount("");
      setPaying(false);
      setError("");
      return;
    }

    if (!isPartialPaymentAllowed(order)) {
      setPaymentType("full");
      setPartialAmount("");
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const validateAmount = () => {
    if (remainingAmount <= 0) {
      return "This order has no remaining balance.";
    }

    if (selectedAmount <= 0) {
      return "Enter a valid payment amount.";
    }

    if (selectedAmount < 1) {
      return "Minimum payment amount is ₹1.";
    }

    if (selectedAmount > remainingAmount) {
      return `Amount cannot exceed ${formatCurrency(remainingAmount)}.`;
    }

    return "";
  };

  const handlePay = async () => {
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPaying(true);
    setError("");

    try {
      await payForOrder(order.order_id, {
        amount: selectedAmount,
        onDismiss: () => {
          setPaying(false);
        },
      });

      onSuccess?.({
        amount: selectedAmount,
        isFullPayment: selectedAmount >= remainingAmount,
        remainingAfter: Math.max(0, remainingAmount - selectedAmount),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close payment modal"
        className="absolute inset-0 bg-black/50"
        onClick={paying ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-secondary shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-primary-foreground">Make payment</h3>
            <p className="mt-0.5 text-xs text-secondary-foreground">
              Pay the remaining balance via Razorpay
            </p>
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

        <div className="space-y-5 px-5 py-5">
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

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-primary/60 p-3 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-secondary-foreground">Total</p>
              <p className="mt-1 text-sm font-bold text-primary-foreground">
                {formatCurrency(totalFees)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-secondary-foreground">Paid</p>
              <p className="mt-1 text-sm font-bold text-emerald-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-secondary-foreground">Due</p>
              <p className="mt-1 text-sm font-bold text-indigo-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>

          {partialPaymentAllowed ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentType("full");
                  setError("");
                }}
                disabled={paying}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  paymentType === "full"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-border bg-primary hover:border-indigo-200"
                }`}
              >
                <p className="text-sm font-semibold text-primary-foreground">Full payment</p>
                <p className="mt-1 text-xs text-secondary-foreground">
                  Pay {formatCurrency(fullAmount)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentType("partial");
                  setError("");
                }}
                disabled={paying}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  paymentType === "partial"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-border bg-primary hover:border-indigo-200"
                }`}
              >
                <p className="text-sm font-semibold text-primary-foreground">Partial payment</p>
                <p className="mt-1 text-xs text-secondary-foreground">Pay a custom amount</p>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-200 bg-indigo-500/5 px-4 py-3">
              <p className="text-sm font-semibold text-primary-foreground">Full payment required</p>
              <p className="mt-1 text-xs text-secondary-foreground">
                This order must be paid in full. Pay {formatCurrency(fullAmount)} to continue.
              </p>
            </div>
          )}

          {partialPaymentAllowed && paymentType === "partial" && (
            <div>
              <label
                htmlFor="partial-amount"
                className="mb-2 block text-sm font-medium text-primary-foreground"
              >
                Amount to pay
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
                  onChange={(event) => {
                    setPartialAmount(event.target.value);
                    setError("");
                  }}
                  disabled={paying}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-border bg-primary py-3 pl-8 pr-4 text-sm text-primary-foreground outline-none transition focus:border-indigo-500"
                />
              </div>
              <p className="mt-2 text-xs text-secondary-foreground">
                Maximum {formatCurrency(remainingAmount)}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={paying}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={paying}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CreditCard size={16} />
            )}
            {paying ? "Processing…" : `Pay ${formatCurrency(selectedAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
