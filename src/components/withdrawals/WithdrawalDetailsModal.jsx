import { Building2, Smartphone, Eye } from "lucide-react";
import Modal from "../common/Modal";

const STATUS_STYLES = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  cancelled: "border-red-500/20 bg-red-500/10 text-red-500",
};

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";

const formatAmount = (amount) =>
  typeof amount === "number" ? `₹${amount.toLocaleString("en-IN")}` : amount ? `₹${amount}` : "—";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-secondary-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-primary-foreground break-all">
        {value || "—"}
      </p>
    </div>
  );
}

export default function WithdrawalDetailsModal({ isOpen, onClose, withdrawal }) {
  if (!withdrawal) return null;

  const isBank = withdrawal.payment_method === "bank";

  const modalTitle = (
    <div className="flex items-center gap-2">
      <Eye size={18} className="text-indigo-500" />
      <span>Withdrawal Details</span>
    </div>
  );

  const detailsFooter = (
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-primary-foreground transition hover:border-indigo-500/40"
      >
        Close
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg" footer={detailsFooter}>
            <div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-xs text-secondary-foreground">Amount</p>
                <p className="text-xl font-semibold text-primary-foreground">
                  {formatAmount(withdrawal.amount)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                  STATUS_STYLES[withdrawal.status] ||
                  "border-border bg-secondary text-secondary-foreground"
                }`}
              >
                {formatStatus(withdrawal.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Withdrawal ID" value={withdrawal.withdrawal_id} />
              <Field label="Transaction ID" value={withdrawal.transaction_id} />
              <Field label="Requested On" value={formatDate(withdrawal.create_date)} />
              <Field label="Processed On" value={formatDate(withdrawal.processed_date)} />
            </div>

            <div className="my-5 border-t border-border" />

            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-foreground">
              {isBank ? <Building2 size={15} /> : <Smartphone size={15} />}
              {isBank ? "Bank Details" : "UPI Details"}
            </div>

            {isBank ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Account Holder" value={withdrawal.account_holder_name} />
                <Field label="Bank Name" value={withdrawal.bank_name} />
                <Field label="Account Number" value={withdrawal.account_number} />
                <Field label="IFSC Code" value={withdrawal.ifsc_code} />
              </div>
            ) : (
              <Field label="UPI ID" value={withdrawal.upi_id} />
            )}

            {(withdrawal.remark || withdrawal.processed_by) && (
              <>
                <div className="my-5 border-t border-border" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Processed By" value={withdrawal.processed_by} />
                  <Field label="Remark" value={withdrawal.remark} />
                </div>
              </>
            )}

    </Modal>
  );
}
