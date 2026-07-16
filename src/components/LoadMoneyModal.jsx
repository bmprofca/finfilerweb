import React, { useState, useEffect } from "react";
import { Wallet, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AnimatedModal from "./common/AnimatedModal";
import { apiCall } from "../utils/apiCall";

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

const LoadMoneyModal = ({ isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // reset state after close animation
            const t = setTimeout(() => {
                setAmount("");
                setError("");
                setSuccess(false);
                setLoading(false);
            }, 200);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === "" || /^\d{0,7}$/.test(val)) {
            setAmount(val);
            setError("");
        }
    };

    const handleSubmit = async () => {
        const numericAmount = Number(amount);

        if (!amount || numericAmount <= 0) {
            setError("Enter a valid amount");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await apiCall("/transactions/load", "POST", {
                amount: numericAmount,
            });
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to load money");
            }

            const newBalance = data?.data?.balance;
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.(newBalance);
                onClose();
            }, 900);
        } catch (err) {
            console.error("load money error:", err);
            setError(err?.message || "Failed to load money. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedModal
            isOpen={isOpen}
            onClose={handleClose}
            closeDisabled={loading}
            maxWidth="max-w-sm"
            backdropClassName="bg-black/50 backdrop-blur-sm"
            panelClassName="bg-primary border border-border rounded-lg shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Wallet size={18} className="text-emerald-400" />
                    </span>
                    <h3 className="text-base font-semibold text-primary-foreground">
                        Load Wallet
                    </h3>
                </div>
                <button
                    onClick={handleClose}
                    disabled={loading}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-secondary-foreground hover:text-primary-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                >
                    <X size={15} />
                </button>
            </div>

            {success ? (
                <div className="px-5 pb-8 pt-2 flex flex-col items-center gap-3 text-center">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15">
                        <CheckCircle2 size={26} className="text-emerald-400" />
                    </span>
                    <p className="text-sm font-medium text-primary-foreground">
                        Wallet loaded successfully
                    </p>
                </div>
            ) : (
                <>
                    {/* Body */}
                    <div className="px-5 pb-4 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-secondary-foreground mb-1.5 block">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary-foreground">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    disabled={loading}
                                    placeholder="0"
                                    autoFocus
                                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-secondary text-primary-foreground text-sm font-semibold placeholder:text-secondary-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
                                />
                            </div>
                            {error && (
                                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                                    <AlertCircle size={12} /> {error}
                                </p>
                            )}
                        </div>

                        {/* Quick amounts */}
                        <div className="grid grid-cols-4 gap-2">
                            {QUICK_AMOUNTS.map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        setAmount(String(val));
                                        setError("");
                                    }}
                                    className={`py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50
                    ${Number(amount) === val
                                            ? "bg-indigo-600 border-indigo-500 text-white"
                                            : "bg-secondary border-border text-secondary-foreground hover:text-primary-foreground hover:border-secondary-foreground/40"
                                        }`}
                                >
                                    ₹{val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 px-5 py-4 border-t border-border bg-secondary/40">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-primary hover:bg-secondary text-primary-foreground transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !amount}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-60 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Processing…
                                </>
                            ) : (
                                "Add Money"
                            )}
                        </button>
                    </div>
                </>
            )}
        </AnimatedModal>
    );
};

export default LoadMoneyModal;