import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Copy,
  Check,
  Loader2,
  Users,
  IndianRupee,
  Percent,
  X,
  Share2,
  Sparkles,
  ArrowRight,
  CalendarDays,
  ShoppingCart,
  Trophy,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import ReferralBonuses from "./ReferralBonuses";
import ManagementHub from "../components/common/ManagementHub";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.15 } },
};

function formatBonusValue(type, value) {
  if (type === "percentage") return `${value}%`;
  return `₹${value}`;
}

function BonusIcon({ type }) {
  if (type === "percentage")
    return <Percent size={14} className="flex-shrink-0" />;
  return <IndianRupee size={14} className="flex-shrink-0" />;
}

function formatDate(dateStr) {
  if (!dateStr) return "No end date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Referral Code Modal ────────────────────────────────────────────── */
function ReferralCodeModal({ isOpen, onClose, referralCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback */
      const el = document.createElement("textarea");
      el.value = referralCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "FinFiler Referral",
      text: `Use my referral code ${referralCode} to sign up on FinFiler and earn exciting rewards!`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-border bg-primary p-6 shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-secondary-foreground transition hover:bg-secondary hover:text-primary-foreground"
            >
              <X size={18} />
            </button>

            {/* Success indicator */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                <Check
                  size={32}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </motion.div>
            </div>

            <h3 className="text-center text-lg font-bold text-primary-foreground">
              Referral Created!
            </h3>
            <p className="mt-1 text-center text-sm text-secondary-foreground">
              Share this code with your friends
            </p>

            {/* Code display */}
            <div className="mt-5 rounded-xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 p-4">
              <p className="text-center text-2xl font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                {referralCode}
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:border-indigo-500/30"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Code
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
              >
                <Share2 size={16} />
                Share
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Offer Card ─────────────────────────────────────────────────────── */
function OfferCard({ offer, onRefer, isCreating }) {
  const hasExtras =
    (offer.max_bonus_amount != null && offer.max_bonus_amount > 0) ||
    (offer.min_order_amount != null && offer.min_order_amount > 0);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-primary shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-lg"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      <div className="flex flex-1 flex-col p-5">
        {/* Offer header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                <Gift
                  size={16}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <h3 className="truncate text-base font-bold text-primary-foreground">
                {offer.offer_name}
              </h3>
            </div>
            {offer.description && (
              <p className="mt-1 text-sm text-secondary-foreground line-clamp-2">
                {offer.description}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {offer.offer_code}
          </span>
        </div>

        {/* Bonus details */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {/* You earn */}
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/15 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Trophy size={12} />
              You Earn
            </div>
            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatBonusValue(
                offer.referrer_bonus_type,
                offer.referrer_bonus_value
              )}
            </p>
            <p className="text-[11px] text-secondary-foreground">
              on each order by referral
            </p>
          </div>

          {/* Friend gets */}
          <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/15 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
              <Users size={12} />
              Friend Gets
            </div>
            <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatBonusValue(
                offer.referee_bonus_type,
                offer.referee_bonus_value
              )}
            </p>
            <p className="text-[11px] text-secondary-foreground">
              bonus on sign up
            </p>
          </div>
        </div>

        {/* Extra info — only shown when there's data */}
        <div className={`${hasExtras ? "mb-4" : "mb-2"} space-y-2`}>
          {offer.max_bonus_amount != null && offer.max_bonus_amount > 0 && (
            <div className="flex items-center gap-2 text-xs text-secondary-foreground">
              <BonusIcon type="fixed" />
              <span>
                Max bonus:{" "}
                <span className="font-semibold text-primary-foreground">
                  ₹{offer.max_bonus_amount}
                </span>
              </span>
            </div>
          )}
          {offer.min_order_amount != null && offer.min_order_amount > 0 && (
            <div className="flex items-center gap-2 text-xs text-secondary-foreground">
              <ShoppingCart size={14} className="flex-shrink-0" />
              <span>
                Min order:{" "}
                <span className="font-semibold text-primary-foreground">
                  ₹{offer.min_order_amount}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-secondary-foreground">
            <CalendarDays size={14} className="flex-shrink-0" />
            <span>
              Valid: {formatDate(offer.effective_from)}
              {offer.effective_to
                ? ` – ${formatDate(offer.effective_to)}`
                : " onwards"}
            </span>
          </div>
        </div>

        {/* Refer button */}
        <div className="mt-auto pt-1">
          <motion.button
            whileHover={{ scale: isCreating ? 1 : 1.02 }}
            whileTap={{ scale: isCreating ? 1 : 0.98 }}
            onClick={() => onRefer(offer.refer_offer_id)}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </>
            ) : (
              <>
                Refer Now <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Empty State ────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 py-16 px-6 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
        <Gift size={28} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-primary-foreground">
        No Offers Available
      </h3>
      <p className="mt-1 max-w-sm text-sm text-secondary-foreground">
        There are no referral offers available right now. Check back later for
        exciting rewards!
      </p>
    </motion.div>
  );
}

/* ── Loading Skeleton ───────────────────────────────────────────────── */
function OfferSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-primary overflow-hidden">
      <div className="h-1.5 w-full bg-border animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-border animate-pulse" />
          <div className="h-5 w-32 rounded-lg bg-border animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-xl bg-border animate-pulse" />
          <div className="h-20 rounded-xl bg-border animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-border animate-pulse" />
          <div className="h-3 w-36 rounded bg-border animate-pulse" />
        </div>
        <div className="h-10 rounded-xl bg-border animate-pulse" />
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function ReferAndEarn() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("offers"); // "offers" or "earnings"

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const fetchedRef = useRef(false);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiCall("/refer-offers/list", "GET");
      const body = await res.json();
      if (body.success && Array.isArray(body.data)) {
        setOffers(body.data);
      } else {
        setOffers([]);
      }
    } catch {
      toast.error("Failed to load referral offers.");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchOffers();
  }, [fetchOffers]);

  const handleRefer = async (referOfferId) => {
    setCreatingId(referOfferId);
    try {
      const res = await apiCall("/referrals/create", "POST", {
        refer_offer_id: referOfferId,
      });
      const body = await res.json();
      if (body.success && body.data?.referral_code) {
        setReferralCode(body.data.referral_code);
        setModalOpen(true);
      } else {
        toast.error(body.message || "Failed to create referral.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setCreatingId(null);
    }
  };

  const TABS = [
    { id: "offers", label: "Referral Offers", icon: Gift },
    { id: "earnings", label: "My Earnings", icon: Trophy },
  ];

  return (
    <>
      <ManagementHub
        eyebrow="Rewards"
        title="Refer & Earn"
        description="Invite your friends to FinFiler and earn exciting rewards when they sign up and place orders."
        accent="indigo"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        widthClassName=""
      >
        {activeTab === "offers" ? (
          <motion.div
            key="offers-tab"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* How it works */}
            <motion.div
              variants={itemVariants}
              className="mb-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-primary-foreground">How it works</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: "1", title: "Choose an offer", desc: "Pick an offer & get your referral code" },
                  { step: "2", title: "Share your code", desc: "Friends sign up using your code" },
                  { step: "3", title: "Earn on every order", desc: "Get bonus each time they place an order" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">{s.title}</p>
                      <p className="text-xs text-secondary-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Offers grid */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <OfferSkeleton key={i} />)}
              </div>
            ) : offers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <OfferCard
                    key={offer.refer_offer_id}
                    offer={offer}
                    onRefer={handleRefer}
                    isCreating={creatingId === offer.refer_offer_id}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="earnings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ReferralBonuses />
          </motion.div>
        )}
      </ManagementHub>

      {/* Referral code modal */}
      <ReferralCodeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        referralCode={referralCode}
      />
    </>
  );
}
