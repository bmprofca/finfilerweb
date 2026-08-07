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
import MyReferredUsers from "./MyReferredUsers";
import ReferredUserStats from "./ReferredUserStats";
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
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-primary shadow-sm transition-all hover:border-violet-500/30 hover:shadow-xl"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl transition-all group-hover:bg-violet-500/20" />
      
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />

      <div className="flex flex-1 flex-col p-5 relative z-10">
        {/* Offer header */}
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/20 shadow-inner">
            <Gift
              size={22}
              className="text-violet-600 dark:text-violet-400"
            />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="truncate text-lg font-bold text-primary-foreground leading-tight">
              {offer.offer_name}
            </h3>
            {offer.description && (
              <p className="mt-1.5 text-xs text-secondary-foreground line-clamp-2">
                {offer.description}
              </p>
            )}
          </div>
        </div>

        {/* Bonus details - Big prominent block */}
        <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-4 shadow-sm relative overflow-hidden">
          {/* subtle decoration inside the bonus card */}
          <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-20 transform rotate-12">
             <Trophy size={80} className="text-emerald-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
              <Trophy size={14} />
              You Earn
            </div>
            
            <div className="flex items-end gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-wide mb-0.5">
                  First Year
                </span>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                  {formatBonusValue(
                    offer.referrer_bonus_type,
                    offer.referrer_bonus_value
                  )}
                </span>
              </div>
              
              {offer.onwords_years_bonus_value !== null && offer.onwords_years_bonus_value !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-wide mb-0.5">
                    Onwards
                  </span>
                  <span className="text-2xl font-bold text-emerald-600/80 dark:text-emerald-400/80 tracking-tight leading-none">
                    {formatBonusValue(
                      offer.referrer_bonus_type,
                      offer.onwords_years_bonus_value
                    )}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-3 text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80">
               When your friend signs up and places an order
            </p>
          </div>
        </div>

        {/* Extra info — only shown when there's data */}
        <div className={`${hasExtras ? "mb-5" : "mb-4"} space-y-2.5`}>
          {offer.max_bonus_amount != null && offer.max_bonus_amount > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-secondary-foreground">
              <BonusIcon type="fixed" />
              <span>
                Max bonus:{" "}
                <span className="font-bold text-primary-foreground">
                  ₹{offer.max_bonus_amount}
                </span>
              </span>
            </div>
          )}
          {offer.min_order_amount != null && offer.min_order_amount > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-secondary-foreground">
              <ShoppingCart size={14} className="flex-shrink-0 text-violet-500" />
              <span>
                Min order:{" "}
                <span className="font-bold text-primary-foreground">
                  ₹{offer.min_order_amount}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-secondary-foreground">
            <CalendarDays size={14} className="flex-shrink-0 text-violet-500" />
            <span>
              Valid: <span className="font-semibold text-primary-foreground">{formatDate(offer.effective_from)}</span>
              {offer.effective_to
                ? ` – ${formatDate(offer.effective_to)}`
                : " onwards"}
            </span>
          </div>
        </div>

        {/* Refer button */}
        <div className="mt-auto pt-2 border-t border-border/50">
          <motion.button
            whileHover={{ scale: isCreating ? 1 : 1.02 }}
            whileTap={{ scale: isCreating ? 1 : 0.98 }}
            onClick={() => onRefer(offer.refer_offer_id)}
            disabled={isCreating}
            className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Code…
              </>
            ) : (
              <>
                Refer Now <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
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
    <div className="rounded-2xl border border-border bg-primary overflow-hidden relative">
      <div className="h-1.5 w-full bg-border animate-pulse" />
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-border animate-pulse shrink-0" />
          <div className="h-6 w-3/4 rounded-lg bg-border animate-pulse" />
        </div>
        
        {/* Single big block for bonus */}
        <div className="h-28 rounded-2xl bg-border animate-pulse" />
        
        <div className="space-y-2.5">
          <div className="h-4 w-5/6 rounded bg-border animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-border animate-pulse" />
        </div>
        
        <div className="h-12 rounded-xl bg-border animate-pulse mt-4" />
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
    { id: "referred", label: "My Referrals", icon: Users },
    { id: "stats", label: "Referral Stats", icon: CalendarDays },
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
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3].map((i) => <OfferSkeleton key={i} />)}
              </div>
            ) : offers.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
        ) : activeTab === "earnings" ? (
          <motion.div
            key="earnings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ReferralBonuses />
          </motion.div>
        ) : activeTab === "referred" ? (
          <motion.div
            key="referred-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MyReferredUsers />
          </motion.div>
        ) : (
          <motion.div
            key="stats-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ReferredUserStats />
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
