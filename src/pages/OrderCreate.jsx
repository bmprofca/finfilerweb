import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { clientRoute } from "../constants/routes";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Upload,
  FileText,
  CheckCircle2,
  X,
  FolderOpen,
} from "lucide-react";
import { apiCall, uploadFile, resolveMediaUrl } from "../utils/apiCall";
import { buildFirmSelectOptions } from "../utils/firmSelect";
import { useToast } from "../contexts/ToastContext";
import SelectField from "../components/common/SelectField";
import FirmFormModal from "../components/firms/FirmFormModal";
import { OrderCreateSkeleton } from "../components/SkeletonComponent";
import OrderPaymentModal from "../components/orders/OrderPaymentModal";
import DocumentLibraryPickerModal from "../components/documents/DocumentLibraryPickerModal";
import PageHeader from "../components/common/PageHeader";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const FIELD_LABELS = {
  mobile: "Mobile Number",
  email: "Email Address",
  pan_no: "PAN Number",
  aadhaar_no: "Aadhaar Number",
};

const FIELD_PLACEHOLDERS = {
  mobile: "9876543210",
  email: "you@example.com",
  pan_no: "ABCDE1234F",
  aadhaar_no: "123456789012",
  gst_no: "22AAAAA0000A1Z5",
  vat_no: "VAT registration number",
  tan_no: "TAN registration number",
};

const formatFieldLabel = (key) =>
  FIELD_LABELS[key] ||
  key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getFieldPlaceholder = (key) =>
  FIELD_PLACEHOLDERS[key] || `Enter ${formatFieldLabel(key).toLowerCase()}`;

const PROFILE_FIELD_KEYS = new Set(["mobile", "email"]);

const buildFieldValues = (fieldKeys, { firm = null, clientProfile = null } = {}) => {
  const values = {};
  fieldKeys.forEach((key) => {
    values[key] = "";
  });

  fieldKeys.forEach((key) => {
    if (PROFILE_FIELD_KEYS.has(key)) {
      const profileValue = clientProfile?.[key];
      if (profileValue != null && String(profileValue).trim()) {
        values[key] = String(profileValue).trim();
      }
      return;
    }

    const firmValue = firm?.[key];
    if (firmValue != null && String(firmValue).trim()) {
      values[key] = normalizeFieldValue(key, String(firmValue).trim());
    }
  });

  return values;
};

const mergeFieldPrefill = (prev, fieldKeys, { firm = null, clientProfile = null } = {}) => {
  const next = { ...prev };

  fieldKeys.forEach((key) => {
    if (PROFILE_FIELD_KEYS.has(key)) {
      const profileValue = clientProfile?.[key];
      if (profileValue != null && String(profileValue).trim()) {
        next[key] = String(profileValue).trim();
      }
      return;
    }

    const firmValue = firm?.[key];
    if (firmValue != null && String(firmValue).trim()) {
      next[key] = normalizeFieldValue(key, String(firmValue).trim());
    }
  });

  return next;
};

const getRequiredFieldKeys = (fields) => {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return [];
  return Object.entries(fields)
    .filter(([, required]) => Boolean(required))
    .map(([key]) => key);
};

const getServiceDocuments = (service) =>
  service?.documents ?? service?.required_documents ?? [];

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const getFileExtension = (fileName = "") => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const truncateFileName = (fileName = "", maxBaseLength = 12) => {
  if (!fileName) return "";

  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) {
    return fileName.length > maxBaseLength + 3
      ? `${fileName.slice(0, maxBaseLength)}...`
      : fileName;
  }

  const base = fileName.slice(0, lastDot);
  const ext = fileName.slice(lastDot + 1);
  const displayLength = maxBaseLength + 3 + ext.length;

  if (fileName.length <= displayLength) return fileName;

  return `${base.slice(0, maxBaseLength)}...${ext}`;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;

const isPanField = (key) => key === "pan_no";

const normalizePanValue = (value) => String(value ?? "").toUpperCase();

const normalizeFieldValue = (key, value) =>
  isPanField(key) ? normalizePanValue(value) : value;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const AADHAAR_REGEX = /^\d{12}$/;

const validateFieldValue = (key, value) => {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return `${formatFieldLabel(key)} is required.`;
  }

  switch (key) {
    case "email":
      if (!EMAIL_REGEX.test(trimmed)) {
        return "Enter a valid email address.";
      }
      break;
    case "mobile":
      if (!MOBILE_REGEX.test(trimmed)) {
        return "Enter a valid 10-digit mobile number.";
      }
      break;
    case "pan_no":
      if (!PAN_REGEX.test(trimmed)) {
        return "Enter a valid PAN (e.g. ABCDE1234F).";
      }
      break;
    case "aadhaar_no":
      if (!AADHAAR_REGEX.test(trimmed)) {
        return "Enter a valid 12-digit Aadhaar number.";
      }
      break;
    default:
      break;
  }

  return null;
};

const EMPTY_VALIDATION_ERRORS = {
  firm: "",
  name: "",
  fields: {},
  documents: {},
};

const buildDefaultOrderName = (serviceName, firmName) => {
  const normalizedService = String(serviceName ?? "").trim();
  const normalizedFirm = String(firmName ?? "").trim();

  if (!normalizedService || !normalizedFirm) {
    return "";
  }

  return `${normalizedService} for ${normalizedFirm}`;
};

const inputBaseClass =
  "w-full rounded-xl border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none transition";

const getInputClass = (hasError) =>
  `${inputBaseClass} ${
    hasError
      ? "border-red-500 bg-red-500/5 ring-2 ring-red-500/20"
      : "border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
  }`;

export default function OrderCreate() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [service, setService] = useState(null);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [firmModalOpen, setFirmModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [clientProfile, setClientProfile] = useState(null);
  const [orderName, setOrderName] = useState("");
  const [notes, setNotes] = useState("");
  const [firmId, setFirmId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [documentUploads, setDocumentUploads] = useState({});
  const [dragOverDocumentName, setDragOverDocumentName] = useState(null);
  const [validationErrors, setValidationErrors] = useState(
    EMPTY_VALIDATION_ERRORS,
  );
  const [showValidation, setShowValidation] = useState(false);
  const [libraryPickerTarget, setLibraryPickerTarget] = useState(null);

  const requiredFieldKeys = useMemo(
    () => getRequiredFieldKeys(service?.fields),
    [service?.fields],
  );

  const serviceDocuments = useMemo(
    () => getServiceDocuments(service),
    [service],
  );

  const firmOptions = useMemo(() => buildFirmSelectOptions(firms), [firms]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [serviceResponse, firmsResponse, profileResponse] = await Promise.all([
        apiCall(`/services/details/${serviceId}`),
        apiCall("/firms/list?page_no=1&limit=100"),
        apiCall("/accounts", "GET"),
      ]);

      const serviceBody = await serviceResponse.json();
      const firmsBody = await firmsResponse.json();
      const profileBody = await profileResponse.json();

      if (!serviceResponse.ok || !serviceBody.success || !serviceBody.data) {
        throw new Error(
          serviceBody.message || "Failed to load service details",
        );
      }

      if (!firmsResponse.ok || !firmsBody.success) {
        throw new Error(firmsBody.message || "Failed to load businesses");
      }

      const clientProfileData =
        profileResponse.ok && profileBody.success ? profileBody.data : null;

      const firmList = firmsBody.data?.firms || [];
      const fieldKeys = getRequiredFieldKeys(serviceBody.data.fields);
      const prefillOptions = { clientProfile: clientProfileData };

      setService(serviceBody.data);
      setFirms(firmList);
      setClientProfile(clientProfileData);

      if (firmList.length === 0) {
        setFirmModalOpen(true);
        setFirmId(null);
        setFieldValues(buildFieldValues(fieldKeys, prefillOptions));
      } else if (firmList.length === 1) {
        const soleFirm = firmList[0];
        setFirmId(soleFirm.firm_id);
        setFieldValues(buildFieldValues(fieldKeys, { ...prefillOptions, firm: soleFirm }));
      } else {
        setFirmId(null);
        setFieldValues(buildFieldValues(fieldKeys, prefillOptions));
      }
    } catch (err) {
      setError(err.message || "Failed to load order form.");
      toast.error("Failed to load order form.");
    } finally {
      setLoading(false);
    }
  }, [serviceId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!service?.name || !firmId) {
      return;
    }

    const selectedFirm = firms.find((firm) => firm.firm_id === firmId);
    if (!selectedFirm?.name) {
      return;
    }

    setOrderName(buildDefaultOrderName(service.name, selectedFirm.name));
  }, [service?.name, firmId, firms]);

  const handleFieldChange = (key) => (event) => {
    const value = normalizeFieldValue(key, event.target.value);
    setFieldValues((prev) => ({ ...prev, [key]: value }));

    if (showValidation) {
      const message = validateFieldValue(key, value);
      setValidationErrors((prev) => {
        const nextFields = { ...prev.fields };
        if (message) nextFields[key] = message;
        else delete nextFields[key];
        return { ...prev, fields: nextFields };
      });
    }
  };

  const handleFirmChange = (option) => {
    const selectedFirmId = option?.value || null;
    setFirmId(selectedFirmId);

    if (showValidation) {
      setValidationErrors((prev) => ({
        ...prev,
        firm: selectedFirmId ? "" : "Please select a business.",
      }));
    }

    if (!selectedFirmId) return;

    const selectedFirm = firms.find((firm) => firm.firm_id === selectedFirmId);
    if (!selectedFirm) return;

    setFieldValues((prev) =>
      mergeFieldPrefill(prev, requiredFieldKeys, {
        firm: selectedFirm,
        clientProfile,
      }),
    );
  };

  const handleClearDocument = (documentName) => {
    setDocumentUploads((prev) => {
      const next = { ...prev };
      delete next[documentName];
      return next;
    });

    if (showValidation) {
      setValidationErrors((prev) => {
        const nextDocuments = { ...prev.documents };
        delete nextDocuments[documentName];
        return { ...prev, documents: nextDocuments };
      });
    }
  };

  const isDocumentUploading = useMemo(
    () => Object.values(documentUploads).some((item) => item?.uploading),
    [documentUploads],
  );

  const validateSelectedFile = (file, document) => {
    if (document.max_size > 0 && file.size > document.max_size) {
      return `${document.name} exceeds maximum size of ${formatBytes(document.max_size)}.`;
    }

    const extension = getFileExtension(file.name);
    const allowed = (document.accept_extensions || []).map((item) =>
      item.toLowerCase().replace(/^\./, ""),
    );

    if (allowed.length > 0 && !allowed.includes(extension)) {
      return `${document.name} must be one of: ${allowed.join(", ").toUpperCase()}`;
    }

    return null;
  };

  const validateLibraryDocument = (libraryDoc, document) => {
    const fileName = libraryDoc.file_name || libraryDoc.name || "";
    const size = Number(libraryDoc.size) || 0;

    if (document.max_size > 0 && size > document.max_size) {
      return `${document.name} exceeds maximum size of ${formatBytes(document.max_size)}.`;
    }

    const extension = getFileExtension(fileName);
    const allowed = (document.accept_extensions || []).map((item) =>
      item.toLowerCase().replace(/^\./, ""),
    );

    if (allowed.length > 0 && !allowed.includes(extension)) {
      return `${document.name} must be one of: ${allowed.join(", ").toUpperCase()}`;
    }

    return null;
  };

  const applyDocumentSelection = useCallback(
    (document, { fileName, url, size, fromLibrary = false }) => {
      const documentName = document.name;

      setDocumentUploads((prev) => ({
        ...prev,
        [documentName]: {
          fileName,
          url,
          size,
          uploading: false,
          error: null,
          fromLibrary,
        },
      }));

      if (showValidation) {
        setValidationErrors((prev) => {
          const nextDocuments = { ...prev.documents };
          delete nextDocuments[documentName];
          return { ...prev, documents: nextDocuments };
        });
      }
    },
    [showValidation],
  );

  const openLibraryPicker = (document) => {
    if (!firmId) {
      toast.error("Please select a business first.");
      return;
    }

    setLibraryPickerTarget(document);
  };

  const handleLibraryDocumentSelect = (libraryDoc) => {
    if (!libraryPickerTarget) return;

    const validationError = validateLibraryDocument(
      libraryDoc,
      libraryPickerTarget,
    );

    if (validationError) {
      toast.error(validationError);
      setDocumentUploads((prev) => ({
        ...prev,
        [libraryPickerTarget.name]: {
          fileName: libraryDoc.file_name || libraryDoc.name,
          url: null,
          size: libraryDoc.size,
          uploading: false,
          error: validationError,
        },
      }));

      if (showValidation) {
        setValidationErrors((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [libraryPickerTarget.name]: validationError,
          },
        }));
      }

      setLibraryPickerTarget(null);
      return;
    }

    const publicUrl =
      libraryDoc.public_url || resolveMediaUrl(libraryDoc.file_url);

    applyDocumentSelection(libraryPickerTarget, {
      fileName: libraryDoc.name || libraryDoc.file_name,
      url: publicUrl,
      size: libraryDoc.size,
      fromLibrary: true,
    });

    toast.success(`${libraryPickerTarget.name} imported from your library.`);
    setLibraryPickerTarget(null);
  };

  const processDocumentFile = useCallback(
    async (document, file) => {
      if (!file) return;

      const documentName = document.name;

      const validationError = validateSelectedFile(file, document);
      if (validationError) {
        toast.error(validationError);
        setDocumentUploads((prev) => ({
          ...prev,
          [documentName]: {
            fileName: file.name,
            url: null,
            size: file.size,
            uploading: false,
            error: validationError,
          },
        }));
        if (showValidation) {
          setValidationErrors((prev) => ({
            ...prev,
            documents: { ...prev.documents, [documentName]: validationError },
          }));
        }
        return;
      }

      if (showValidation) {
        setValidationErrors((prev) => {
          const nextDocuments = { ...prev.documents };
          delete nextDocuments[documentName];
          return { ...prev, documents: nextDocuments };
        });
      }

      setDocumentUploads((prev) => ({
        ...prev,
        [documentName]: {
          fileName: file.name,
          url: null,
          size: file.size,
          uploading: true,
          error: null,
        },
      }));

      try {
        const url = await uploadFile(file);
        applyDocumentSelection(document, {
          fileName: file.name,
          url,
          size: file.size,
          fromLibrary: false,
        });
        toast.success(`${documentName} uploaded successfully.`);
      } catch (err) {
        const message = err.message || `Failed to upload ${documentName}.`;
        setDocumentUploads((prev) => ({
          ...prev,
          [documentName]: {
            fileName: file.name,
            url: null,
            size: file.size,
            uploading: false,
            error: message,
          },
        }));
        toast.error(message);
        if (showValidation) {
          setValidationErrors((prev) => ({
            ...prev,
            documents: { ...prev.documents, [documentName]: message },
          }));
        }
      }
    },
    [showValidation, toast, applyDocumentSelection],
  );

  const handleDocumentChange = (document) => async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    await processDocumentFile(document, file);
  };

  const handleDocumentDragEnter = (documentName, isUploading) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isUploading) {
      setDragOverDocumentName(documentName);
    }
  };

  const handleDocumentDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDocumentDragLeave = (documentName) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragOverDocumentName((current) =>
        current === documentName ? null : current,
      );
    }
  };

  const handleDocumentDrop = (document, isUploading) => async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverDocumentName(null);

    if (isUploading) return;

    const file = event.dataTransfer.files?.[0] || null;
    await processDocumentFile(document, file);
  };

  const collectValidationErrors = () => {
    const errors = {
      firm: "",
      name: "",
      fields: {},
      documents: {},
    };

    if (!firmId) {
      errors.firm = "Please select a business.";
    }

    if (!orderName.trim()) {
      errors.name = "Order name is required.";
    }

    requiredFieldKeys.forEach((key) => {
      const message = validateFieldValue(key, fieldValues[key]);
      if (message) {
        errors.fields[key] = message;
      }
    });

    serviceDocuments.forEach((document) => {
      if (!document.is_required) return;

      const upload = documentUploads[document.name];

      if (!upload?.url) {
        if (upload?.uploading) {
          errors.documents[document.name] =
            `${document.name} is still uploading.`;
        } else if (upload?.error) {
          errors.documents[document.name] = upload.error;
        } else {
          errors.documents[document.name] = `${document.name} is required.`;
        }
      }
    });

    const hasFieldErrors = Object.keys(errors.fields).length > 0;
    const hasDocumentErrors = Object.keys(errors.documents).length > 0;
    const isValid = !errors.firm && !errors.name && !hasFieldErrors && !hasDocumentErrors;

    return { isValid, errors };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!service) return;

    if (isDocumentUploading) {
      toast.error("Please wait for all document uploads to finish.");
      return;
    }

    const { isValid, errors } = collectValidationErrors();

    if (!isValid) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.error("Please fix the highlighted required fields.");
      return;
    }

    setShowValidation(false);
    setValidationErrors(EMPTY_VALIDATION_ERRORS);

    setSubmitting(true);
    const toastId = toast.loading("Placing your order…");

    try {
      const documents = serviceDocuments
        .map((document) => {
          const upload = documentUploads[document.name];
          if (!upload?.url) return null;

          return {
            name: document.name,
            url: upload.url,
          };
        })
        .filter(Boolean);

      const payload = {
        service_id: service.service_id,
        firm_id: firmId,
        name: orderName.trim(),
        fields: Object.fromEntries(
          Object.entries(fieldValues).map(([key, value]) => [
            key,
            normalizeFieldValue(key, value),
          ]),
        ),
        documents,
        notes: notes.trim() || undefined,
      };

      const response = await apiCall("/orders/create", "POST", payload);
      const body = await response.json();

      if (response.ok && body.success && body.data?.order_id) {
        const orderFees = Number(body.data.fees) || 0;
        const orderId = body.data.order_id;

        if (orderFees > 0) {
          toast.dismiss(toastId);
          const selectedFirm = firms.find((firm) => firm.firm_id === firmId);
          setCreatedOrder({
            order_id: orderId,
            fees: orderFees,
            paid_amount: 0,
            remaining_amount: orderFees,
            partial_payment_allowed: Boolean(body.data.partial_payment_allowed),
            firm_gst_no: selectedFirm?.gst_no || null,
          });
          setPaymentModalOpen(true);
        } else {
          toast.success("Order placed successfully.", { id: toastId });
          navigate(clientRoute(`/orders/${orderId}`));
        }
        return;
      }

      throw new Error(body.message || "Failed to create order.");
    } catch (err) {
      toast.error(err.message || "Could not place order. Please try again.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentModalClose = () => {
    const orderId = createdOrder?.order_id;
    setPaymentModalOpen(false);
    setCreatedOrder(null);
    navigate(
      orderId ? clientRoute(`/orders/${orderId}`) : clientRoute("/orders"),
    );
  };

  const handlePaymentSuccess = ({ isFullPayment, remainingAfter }) => {
    const orderId = createdOrder?.order_id;

    if (isFullPayment) {
      toast.success("Payment successful. Your order is now fully paid.");
    } else {
      toast.success(
        `Partial payment received. Remaining balance: ${formatCurrency(remainingAfter)}`,
      );
    }

    setPaymentModalOpen(false);
    setCreatedOrder(null);
    navigate(
      orderId ? clientRoute(`/orders/${orderId}`) : clientRoute("/orders"),
    );
  };

  const handleFirmCreated = (firm) => {
    setFirms((prev) => [firm, ...prev]);
    setFirmId(firm.firm_id);
    setFieldValues((prev) =>
      mergeFieldPrefill(prev, requiredFieldKeys, {
        firm,
        clientProfile,
      }),
    );
    setFirmModalOpen(false);
    toast.success("Business created. You can now place your order.");
  };

  if (loading) {
    return <OrderCreateSkeleton />;
  }

  if (error || !service) {
    return (
      <div className="mx-auto py-10 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-red-500">{error || "Service not found."}</p>
        <Link
          to={clientRoute(`/services/${serviceId}`)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to service
        </Link>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader
          className="mb-5"
          eyebrow="Place Order"
          title={service.name}
          description="Fill in the details below to place your order."
        />

        {firms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary px-6 py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
            <h2 className="text-lg font-semibold text-primary-foreground">
              Business required
            </h2>
            <p className="mt-2 text-sm text-secondary-foreground">
              You need at least one business before placing an order.
            </p>
            <button
              type="button"
              onClick={() => setFirmModalOpen(true)}
              className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Business
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 rounded-2xl border border-border bg-secondary p-6 shadow-soft"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                  Business <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-xl transition ${
                    showValidation && validationErrors.firm
                      ? "bg-red-500/5 ring-2 ring-red-500/30"
                      : ""
                  }`}
                >
                  <SelectField
                    value={
                      firmOptions.find((item) => item.value === firmId) || null
                    }
                    onChange={handleFirmChange}
                    options={firmOptions}
                    placeholder="Select a business"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                  Order Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderName}
                  onChange={(event) => {
                    setOrderName(event.target.value);
                    if (showValidation) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        name: event.target.value.trim()
                          ? ""
                          : "Order name is required.",
                      }));
                    }
                  }}
                  placeholder="e.g. GST Registration for ABC Pvt Ltd"
                  className={getInputClass(
                    Boolean(showValidation && validationErrors.name),
                  )}
                />
                {showValidation && validationErrors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{validationErrors.name}</p>
                )}
              </div>
            </div>

            {requiredFieldKeys.length > 0 && (
              <div className="space-y-4 border-t border-border pt-5">
                <h2 className="text-sm font-bold text-primary-foreground">
                  Required Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {requiredFieldKeys.map((key) => {
                    const fieldError = showValidation
                      ? validationErrors.fields[key]
                      : "";

                    return (
                      <div key={key}>
                        <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                          {formatFieldLabel(key)}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={
                            key === "email"
                              ? "email"
                              : key === "mobile"
                                ? "tel"
                                : "text"
                          }
                          value={fieldValues[key] || ""}
                          onChange={handleFieldChange(key)}
                          placeholder={getFieldPlaceholder(key)}
                          className={getInputClass(Boolean(fieldError))}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {serviceDocuments.length > 0 && (
              <div className="space-y-4 border-t border-border pt-5">
                <h2 className="text-sm font-bold text-primary-foreground">
                  Documents
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {serviceDocuments.map((document) => {
                    const upload = documentUploads[document.name];
                    const documentError = showValidation
                      ? validationErrors.documents[document.name] ||
                        upload?.error
                      : upload?.error;
                    const hasDocumentError = Boolean(documentError);
                    const isUploading = Boolean(upload?.uploading);
                    const isDragOver = dragOverDocumentName === document.name;

                    return (
                      <div
                        key={document.required_id || document.name}
                        className={`flex h-full flex-col rounded-xl border p-4 transition ${
                          hasDocumentError
                            ? "border-red-500 bg-red-500/5"
                            : "border-border bg-primary"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText
                              size={16}
                              className="shrink-0 text-indigo-600"
                            />
                            <span className="truncate text-sm font-semibold text-primary-foreground">
                              {document.name}
                            </span>
                          </div>
                          {document.is_required ? (
                            <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                              Required
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="mb-3 text-xs text-secondary-foreground">
                          Allowed:{" "}
                          {(document.accept_extensions || [])
                            .join(", ")
                            .toUpperCase() || "Any"}
                          {document.max_size > 0 &&
                            ` · Max ${formatBytes(document.max_size)}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <label
                            onDragEnter={handleDocumentDragEnter(
                              document.name,
                              isUploading,
                            )}
                            onDragOver={handleDocumentDragOver}
                            onDragLeave={handleDocumentDragLeave(document.name)}
                            onDrop={handleDocumentDrop(document, isUploading)}
                            className={`flex flex-1 items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm transition ${
                              isUploading
                                ? "cursor-not-allowed opacity-70"
                                : "cursor-pointer"
                            } ${
                              hasDocumentError
                                ? "border-red-500/60 bg-red-500/5"
                                : isDragOver
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : upload?.url
                                    ? "border-emerald-500/40 bg-emerald-500/5"
                                    : "border-border hover:border-indigo-500/40 hover:bg-indigo-500/5"
                            }`}
                          >
                            {upload?.uploading ? (
                              <Loader2
                                size={16}
                                className="animate-spin text-indigo-600"
                              />
                            ) : upload?.url ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600"
                              />
                            ) : (
                              <Upload size={16} className="text-indigo-600" />
                            )}
                            <span
                              className="min-w-0 flex-1 truncate text-secondary-foreground"
                              title={upload?.fileName || undefined}
                            >
                              {upload?.uploading
                                ? `Uploading ${truncateFileName(upload.fileName)}…`
                                : upload?.url
                                  ? truncateFileName(upload.fileName)
                                  : upload?.fileName
                                    ? truncateFileName(upload.fileName)
                                    : isDragOver
                                      ? "Drop file here"
                                      : "Drag & drop or choose file"}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              disabled={isUploading}
                              accept={(document.accept_extensions || [])
                                .map((ext) => `.${ext.replace(/^\./, "")}`)
                                .join(",")}
                              onChange={handleDocumentChange(document)}
                            />
                          </label>
                          {(upload?.url || upload?.fileName || upload?.error) &&
                            !upload?.uploading && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleClearDocument(document.name)
                                }
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-secondary-foreground transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-500"
                                title="Remove file"
                              >
                                <X size={16} />
                              </button>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openLibraryPicker(document)}
                          disabled={isUploading || !firmId}
                          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:border-indigo-500/40 hover:bg-indigo-500/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FolderOpen size={14} className="text-indigo-600" />
                          Import from uploaded documents
                        </button>
                        {upload?.url && !documentError && (
                          <p className="mt-2 truncate text-xs text-emerald-600">
                            {upload.fromLibrary
                              ? "Imported from library and ready for submission."
                              : "Uploaded and ready for order submission."}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-5">
              <label className="mb-1.5 block text-sm font-medium text-primary-foreground">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Add any additional details for this order (optional)"
                className="w-full resize-y rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-primary-foreground outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isDocumentUploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingBag size={18} />
              )}
              Place Order
            </button>
          </form>
        )}
      </motion.div>

      <FirmFormModal
        isOpen={firmModalOpen}
        onClose={() => setFirmModalOpen(false)}
        mode="create"
        description="You need at least one business before placing an order."
        onSuccess={handleFirmCreated}
      />

      <OrderPaymentModal
        isOpen={paymentModalOpen}
        onClose={handlePaymentModalClose}
        order={createdOrder}
        onSuccess={handlePaymentSuccess}
        showOrderCreatedSuccess
      />

      <DocumentLibraryPickerModal
        isOpen={Boolean(libraryPickerTarget)}
        onClose={() => setLibraryPickerTarget(null)}
        firmId={firmId}
        onSelect={handleLibraryDocumentSelect}
      />
    </>
  );
}
