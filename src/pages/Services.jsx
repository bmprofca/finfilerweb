import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  AlertCircle,
  ShoppingBag,
  Eye,
  Loader2,
  Tag,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getApplicationPath = (serviceId, orderId) =>
  `/application/${serviceId}/${orderId}`;

const TABS = [
  { id: "All", label: "All Services" },
  { id: "general", label: "General" },
  { id: "personal", label: "Personal" },
  { id: "business", label: "Business" },
  { id: "protection", label: "Protection" },
  { id: "advisory", label: "Advisory" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-secondary animate-pulse">
      <div className="aspect-[4/3] bg-border" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded bg-border" />
        <div className="h-5 w-3/4 rounded bg-border" />
        <div className="h-4 w-1/2 rounded bg-border" />
        <div className="h-10 rounded-xl bg-border" />
      </div>
    </div>
  );
}

function ServiceImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-400 ${className}`}
      >
        <Sparkles size={40} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function ServiceCard({
  service,
  index,
  onViewDetails,
  onPurchase,
  purchasing,
}) {
  const hasDiscount = service.discount_value > 0;

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-primary">
        {hasDiscount && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
            <Tag size={11} />
            {service.discount_percentage}% off
          </span>
        )}

        {service.image ? (
          <ServiceImage
            src={service.image}
            alt={service.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-400">
            <Sparkles size={40} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-10">
          <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 backdrop-blur-sm">
            {service.type}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-primary-foreground">
          {service.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <span className="text-xl font-bold text-indigo-600">
            {formatCurrency(service.fees)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(service.total_fees)}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-secondary-foreground">
          Inclusive of {service.tax_rate}% tax
          {hasDiscount && (
            <span className="text-emerald-600">
              {" "}
              · Save {formatCurrency(service.discount_value)}
            </span>
          )}
        </p>

        <div className="mt-auto flex gap-2 pt-4">
          <button
            type="button"
            onClick={() => onViewDetails(service.service_id)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Eye size={14} />
            Details
          </button>
          <button
            type="button"
            onClick={() => onPurchase(service)}
            disabled={purchasing}
            className="inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {purchasing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShoppingBag size={14} />
            )}
            Buy Now
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Services() {
  const toast = useToast();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = activeTab === "All" ? "" : activeTab.toLowerCase();
      const endpoint = `/services/list?page_no=1&limit=100&search=${encodeURIComponent(searchQuery)}&type=${encodeURIComponent(typeParam)}`;
      const response = await apiCall(endpoint);

      if (response.ok) {
        const body = await response.json();
        if (body.success && body.data) {
          setServices(body.data.services || []);
        } else {
          throw new Error("Failed to retrieve services data");
        }
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError(err.message || "Server error. Failed to load services.");
      toast.error("Failed to load services. Please check your network.");
    } finally {
      setLoading(false);
    }
  }, [toast, activeTab, searchQuery]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePurchase = async (service) => {
    setPurchasingId(service.service_id);
    const toastId = toast.loading(`Processing ${service.name}…`);

    try {
      const response = await apiCall("/orders/create", "POST", {
        service_id: service.service_id,
      });
      const body = await response.json();

      if (response.ok && body.success && body.data?.order_id) {
        toast.dismiss(toastId);
        toast.success("Order placed! Complete your application.");
        navigate(getApplicationPath(service.service_id, body.data.order_id));
        return;
      }

      throw new Error(body.message || "Failed to create order.");
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.dismiss(toastId);
      toast.error(err.message || "Could not start purchase. Please try again.");
    } finally {
      setPurchasingId(null);
    }
  };

  const handleViewDetails = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <motion.div
      className="mx-auto max-w-7xl py-4 sm:py-6 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="mb-6 sm:mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Marketplace
          </p>
          <h1 className="font-display mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-primary-foreground">
            Our Services
          </h1>
          <p className="mt-1 sm:mt-2 max-w-2xl text-sm sm:text-base text-secondary-foreground">
            Browse and purchase registration and compliance services. Each
            service links to its application form after checkout.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 shadow-sm focus-within:border-indigo-500 transition sm:min-w-[260px]">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-primary-foreground outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "border border-border bg-secondary text-secondary-foreground hover:bg-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-secondary py-16 text-center shadow-soft"
        >
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-primary-foreground">
            Error Loading Services
          </h3>
          <p className="mt-2 max-w-md text-sm text-secondary-foreground">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchServices}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </motion.div>
      ) : services.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-secondary py-16 text-center shadow-soft"
        >
          <ShoppingBag className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-bold text-primary-foreground">
            No Services Found
          </h3>
          <p className="mt-1 text-sm text-secondary-foreground">
            Try a different category or search term.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={service.service_id}
              service={service}
              index={index}
              onViewDetails={handleViewDetails}
              onPurchase={handlePurchase}
              purchasing={purchasingId === service.service_id}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
