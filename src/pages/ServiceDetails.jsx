import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Tag,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Info,
  ClipboardList,
} from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { useToast } from "../contexts/ToastContext";
import { DetailSkeleton } from "../components/SkeletonComponent";
import FirmFormModal from "../components/firms/FirmFormModal";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const FIELD_LABELS = {
  mobile: "Mobile Number",
  email: "Email Address",
  pan_no: "PAN Number",
  aadhaar_no: "Aadhaar Number",
};

const formatFieldLabel = (key) =>
  FIELD_LABELS[key] ||
  key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRequiredFields = (fields) => {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return [];

  return Object.entries(fields)
    .filter(([, required]) => Boolean(required))
    .map(([key]) => ({ key, label: formatFieldLabel(key) }));
};

const getServiceDocuments = (service) =>
  service?.documents ?? service?.required_documents ?? [];

function ServiceImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-400 ${className}`}
      >
        <Sparkles size={48} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [firmModalOpen, setFirmModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(`/services/details/${serviceId}`);
      if (response.ok) {
        const body = await response.json();
        if (body.success && body.data) {
          setService(body.data);
        } else {
          throw new Error("Failed to retrieve service details");
        }
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to fetch service details:", err);
      setError(err.message || "Failed to load service details.");
      toast.error("Failed to load service details.");
    } finally {
      setLoading(false);
    }
  }, [serviceId, toast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleOrder = async () => {
    if (!service) return;
    setOrdering(true);

    try {
      const response = await apiCall("/firms/list?page_no=1&limit=1");
      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(body.message || "Failed to check firms");
      }

      const firmCount = body.data?.pagination?.total ?? 0;

      if (firmCount === 0) {
        setFirmModalOpen(true);
        return;
      }

      navigate(`/services/${service.service_id}/order`);
    } catch (err) {
      console.error("Order check failed:", err);
      toast.error(err.message || "Could not start order. Please try again.");
    } finally {
      setOrdering(false);
    }
  };

  const handleFirmCreated = () => {
    setFirmModalOpen(false);
    navigate(`/services/${service.service_id}/order`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-2 py-6 sm:px-4">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-6xl px-2 py-10 sm:px-4 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-primary-foreground">
          Service Not Found
        </h1>
        <p className="mt-2 text-sm text-secondary-foreground">
          {error || "This service could not be loaded."}
        </p>
        <Link
          to="/services"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={16} /> Back to Services
        </Link>
      </div>
    );
  }

  const hasDiscount = service.discount_value > 0;
  const discountLabel =
    service.discount_type === "percentage"
      ? `${service.discount_percentage}% discount`
      : service.discount_type
        ? `${service.discount_type} discount`
        : `${service.discount_percentage}% discount`;
  const requiredFields = getRequiredFields(service.fields);
  const documents = getServiceDocuments(service);

  return (
    <motion.div
      className="mx-auto max-w-6xl px-2 py-4 sm:px-4 sm:py-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-12">
        {/* Image — 16:9 on mobile; stretches to match details column on desktop */}
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft lg:aspect-auto lg:h-full">
          {service.image ? (
            <ServiceImage
              src={service.image}
              alt={service.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-400">
              <Sparkles size={64} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col lg:h-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              {service.type}
            </span>
            {service.delivery_time && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <Clock size={12} className="text-indigo-500" />
                Delivery: {service.delivery_time}
              </span>
            )}
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                <Tag size={12} />
                {service.discount_percentage}% off
              </span>
            )}
          </div>

          <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            {service.name}
          </h1>

          {/* Pricing */}
          <div className="mt-5 flex flex-1 flex-col rounded-2xl border border-border bg-secondary p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-bold text-primary-foreground">
              Pricing Details
            </h2>

            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-indigo-600">
                {formatCurrency(service.fees)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  {formatCurrency(service.total_fees)}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-foreground">Base Price</span>
                <span className="font-semibold text-primary-foreground">
                  {formatCurrency(service.base_price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-foreground">
                  Tax ({service.tax_rate}%)
                </span>
                <span className="font-semibold text-primary-foreground">
                  +{formatCurrency(service.tax_value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-foreground">Subtotal</span>
                <span className="font-semibold text-primary-foreground">
                  {formatCurrency(service.total_fees)}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span className="capitalize">Discount ({discountLabel})</span>
                  <span>-{formatCurrency(service.discount_value)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-indigo-600">
                <span>Total Payable</span>
                <span>{formatCurrency(service.fees)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOrder}
              disabled={ordering}
              className="mt-auto pt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {ordering ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingBag size={18} />
              )}
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 rounded-2xl border border-border bg-secondary p-5 sm:p-8 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Info size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-primary-foreground">
            About this service
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-secondary-foreground sm:text-base">
          {service.description || "No description available for this service."}
        </p>
      </div>

      {/* Required Fields */}
      <div className="mt-6 rounded-2xl border border-border bg-secondary p-5 sm:p-8 shadow-soft">
        <div className="mb-5 flex items-center gap-2">
          <ClipboardList size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-primary-foreground">
            Required Fields
          </h2>
        </div>

        {requiredFields.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {requiredFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center gap-3 rounded-xl border border-border bg-primary p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">
                    {field.label}
                  </p>
                  <p className="text-[11px] text-secondary-foreground">
                    Required for application
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-primary/50 p-4 text-sm text-secondary-foreground">
            <Info size={16} className="text-indigo-500" />
            No additional fields required for this service.
          </div>
        )}
      </div>

      {/* Required Documents */}
      <div className="mt-6 rounded-2xl border border-border bg-secondary p-5 sm:p-8 shadow-soft">
        <div className="mb-5 flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-primary-foreground">
            Required Documents
          </h2>
        </div>

        {documents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.required_id}
                className="rounded-xl border border-border bg-primary p-4 transition hover:border-indigo-200 hover:shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-semibold text-primary-foreground">
                    {doc.name}
                  </span>
                  {doc.is_required ? (
                    <span className="shrink-0 rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
                      Required
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-secondary-foreground">
                      Optional
                    </span>
                  )}
                </div>
                {doc.description && (
                  <p className="mb-2 text-xs leading-relaxed text-secondary-foreground">
                    {doc.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-400">
                  <span>
                    Formats:{" "}
                    <span className="font-semibold text-secondary-foreground">
                      {doc.accept_extensions.join(", ").toUpperCase()}
                    </span>
                  </span>
                  <span>
                    Max size:{" "}
                    <span className="font-semibold text-secondary-foreground">
                      {formatBytes(doc.max_size)}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-primary/50 p-4 text-sm text-secondary-foreground">
            <CheckCircle2 size={16} className="text-emerald-500" />
            No documents required for this service.
          </div>
        )}
      </div>

      <FirmFormModal
        isOpen={firmModalOpen}
        onClose={() => setFirmModalOpen(false)}
        mode="create"
        description="You need at least one firm before placing an order."
        onSuccess={handleFirmCreated}
      />
    </motion.div>
  );
}
