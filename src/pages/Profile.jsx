import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Camera,
  Loader2,
  Monitor,
  MapPin,
  Clock,
  Trash2,
  AlertCircle,
  Phone,
} from "lucide-react";
import {
  ProfileFormSkeleton,
  SessionsListSkeleton,
} from "../components/SkeletonComponent";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { uploadFile, apiCall, resolveMediaUrl } from "../utils/apiCall";
import SelectField from "../components/common/SelectField";
import DatePickerField from "../components/common/DatePickerField";
import PageHeader from "../components/common/PageHeader";
import { profileSelectStyles } from "../hooks/reactSelectConfig";
import { INDIAN_STATE_OPTIONS } from "../utils/indianStates";

const GENDER_OPTIONS = [
  { value: "male", label: "Male", icon: "♂" },
  { value: "female", label: "Female", icon: "♀" },
  { value: "other", label: "Other", icon: "⚧" },
];

const PROFESSION_OPTIONS = [
  { value: "Chartered Accountant", label: "Chartered Accountant" },
  { value: "Company Secretary", label: "Company Secretary" },
  { value: "Lawyer / Advocate", label: "Lawyer / Advocate" },
  { value: "Doctor", label: "Doctor" },
  { value: "Engineer", label: "Engineer" },
  { value: "Teacher / Professor", label: "Teacher / Professor" },
  { value: "Business Owner", label: "Business Owner" },
  { value: "Salaried Employee", label: "Salaried Employee" },
  { value: "Self Employed", label: "Self Employed" },
  { value: "Student", label: "Student" },
  { value: "Homemaker", label: "Homemaker" },
  { value: "Retired", label: "Retired" },
  { value: "Other", label: "Other (specify)" },
];

const PROFESSION_PRESETS = PROFESSION_OPTIONS.map((item) => item.value).filter(
  (value) => value !== "Other",
);

const inputClass =
  "w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all";

const formatGenderOption = (option) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 text-sm font-semibold">
      {option.icon}
    </span>
    <span>{option.label}</span>
  </div>
);

// ── Helpers ────────────────────────────────────────────────────────────────

const parseUserAgent = (ua = "") => {
  const browser = ua.includes("Chrome")
    ? "Chrome"
    : ua.includes("Firefox")
      ? "Firefox"
      : ua.includes("Safari")
        ? "Safari"
        : ua.includes("Edge")
          ? "Edge"
          : "Unknown Browser";

  const os = ua.includes("Windows NT")
    ? "Windows"
    : ua.includes("Mac OS")
      ? "macOS"
      : ua.includes("Linux")
        ? "Linux"
        : ua.includes("Android")
          ? "Android"
          : ua.includes("iPhone") || ua.includes("iPad")
            ? "iOS"
            : "Unknown OS";

  return { browser, os };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ── Session Card ───────────────────────────────────────────────────────────

const SessionCard = ({ session, onRevoke }) => {
  const { browser, os } = parseUserAgent(session.user_agent);
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    await onRevoke(session.id);
    setRevoking(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className={`relative flex items-start gap-4 p-4 rounded-xl border transition-colors
        ${
          session.is_current
            ? "bg-indigo-500/10 border-indigo-500/30"
            : "bg-secondary border-border hover:border-border/80"
        }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
        ${session.is_current ? "bg-indigo-500/20 text-indigo-400" : "bg-primary text-secondary-foreground"}`}
      >
        <Monitor size={18} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-primary-foreground text-sm">
            {browser} on {os}
          </span>
          {session.is_current && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Current session
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="opacity-60" />
            {session.last_used_ip || session.create_ip}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} className="opacity-60" />
            Last active: {formatDate(session.last_used_date)}
          </span>
          <span className="flex items-center gap-1 opacity-60">
            Expires: {formatDate(session.expire_date)}
          </span>
        </div>
      </div>

      {/* Revoke */}
      {!session.is_current && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRevoke}
          disabled={revoking}
          title="Revoke session"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
            text-red-400 border border-red-500/20 bg-red-500/5
            hover:bg-red-500/15 hover:border-red-500/40
            disabled:opacity-50 transition-colors"
        >
          {revoking ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
          Revoke
        </motion.button>
      )}
    </motion.div>
  );
};

// ── Security Tab ───────────────────────────────────────────────────────────

const SecurityTab = () => {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall("/accounts/session/list", "GET");
      const data = await res.json();
      if (data.success) {
        // Sort: current first
        const sorted = [...data.data.sessions].sort(
          (a, b) => b.is_current - a.is_current,
        );
        setSessions(sorted);
      } else {
        setError("Could not load sessions.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    const toastId = toast.loading("Revoking session…");
    try {
      const res = await apiCall("/accounts/session/terminate", "POST", { id });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.update(toastId, "success", "Session terminated.");
      } else {
        toast.update(
          toastId,
          "error",
          data.message || "Could not terminate session.",
        );
      }
    } catch {
      toast.update(toastId, "error", "Something went wrong.");
    }
  };

  const handleRevokeAll = async () => {
    const others = sessions.filter((s) => !s.is_current);
    if (!others.length) return;
    const toastId = toast.loading("Terminating all other sessions…");
    try {
      await Promise.all(
        others.map((s) =>
          apiCall("/accounts/session/terminate", "POST", { id: s.id }),
        ),
      );
      setSessions((prev) => prev.filter((s) => s.is_current));
      toast.update(toastId, "success", "All other sessions terminated.");
    } catch {
      toast.update(toastId, "error", "Something went wrong.");
    }
  };

  const otherCount = sessions.filter((s) => !s.is_current).length;

  return (
    <div className="bg-primary rounded-2xl shadow-soft border border-border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-primary-foreground">
            Active Sessions
          </h3>
          <p className="text-xs text-secondary-foreground mt-0.5">
            Devices currently signed in to your account.
          </p>
        </div>

        {otherCount > 1 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRevokeAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              text-red-400 border border-red-500/20 bg-red-500/5
              hover:bg-red-500/15 hover:border-red-500/40 transition-colors"
          >
            <Trash2 size={12} />
            Revoke all others
          </motion.button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Content */}
      {loading ? (
        <SessionsListSkeleton />
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchSessions}
            className="ml-auto text-xs underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-secondary-foreground text-sm py-8">
          No active sessions found.
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer note */}
      {!loading && !error && sessions.length > 0 && (
        <p className="text-xs text-secondary-foreground/60 pt-1">
          Sessions expire automatically after 7 days of inactivity.
        </p>
      )}
    </div>
  );
};

// ── Main Profile Page ──────────────────────────────────────────────────────

const TABS = [
  { id: "general", label: "General Info", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const Profile = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("general");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [professionChoice, setProfessionChoice] = useState("");
  const [customProfession, setCustomProfession] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyProfile = (data) => {
    const professionValue = data?.profession || "";

    setProfile(data);
    setFirstName(data?.first_name || "");
    setMiddleName(data?.middle_name || "");
    setLastName(data?.last_name || "");
    setEmail(data?.email || "");
    setGender(data?.gender || "");

    if (professionValue && !PROFESSION_PRESETS.includes(professionValue)) {
      setProfessionChoice("Other");
      setCustomProfession(professionValue);
    } else {
      setProfessionChoice(professionValue);
      setCustomProfession("");
    }

    setDateOfBirth(data?.date_of_birth || "");
    setAddressLine1(data?.address_line_1 || "");
    setAddressLine2(data?.address_line_2 || "");
    setDistrict(data?.district || "");
    setState(data?.state || "");
    setPincode(data?.pincode || "");
    setImageUrl(data?.image || "");
    setAvatarPreview(data?.image ? resolveMediaUrl(data.image) : "");
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await apiCall("/accounts", "GET");
      const result = await response.json();
      if (result.success && result.data) {
        applyProfile(result.data);
      } else {
        toast.error(result.message || "Could not load profile.");
      }
    } catch {
      toast.error("Something went wrong while loading profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading photo…");
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
      setAvatarPreview(url);
      toast.update(
        toastId,
        "success",
        "Photo uploaded! Save changes to apply.",
      );
    } catch {
      toast.update(toastId, "error", "Photo upload failed. Please try again.");
      setAvatarPreview(profile?.image ? resolveMediaUrl(profile.image) : "");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (professionChoice === "Other" && !customProfession.trim()) {
      toast.error("Please enter your profession.");
      return;
    }

    const resolvedProfession =
      professionChoice === "Other" ? customProfession.trim() : professionChoice;

    setSaving(true);
    const toastId = toast.loading("Saving changes…");
    try {
      const payload = {
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        gender,
        profession: resolvedProfession,
        date_of_birth: dateOfBirth,
        address_line_1: addressLine1.trim(),
        address_line_2: addressLine2.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };

      if (imageUrl) {
        payload.image = imageUrl;
      }

      const response = await apiCall(
        "/accounts/profile/update",
        "POST",
        payload,
      );
      const result = await response.json();
      if (result.success) {
        applyProfile(result.data);
        login({ ...user, ...result.data });
        toast.update(toastId, "success", "Profile updated successfully!");
      } else {
        toast.update(toastId, "error", result.message || "Update failed.");
      }
    } catch {
      toast.update(toastId, "error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) applyProfile(profile);
  };

  const displayProfile = profile || user;
  const selectedGender =
    GENDER_OPTIONS.find((option) => option.value === gender) || null;
  const selectedProfession =
    PROFESSION_OPTIONS.find((option) => option.value === professionChoice) ||
    null;
  const stateOptions =
    state && !INDIAN_STATE_OPTIONS.some((option) => option.value === state)
      ? [{ value: state, label: state }, ...INDIAN_STATE_OPTIONS]
      : INDIAN_STATE_OPTIONS;
  const selectedState =
    stateOptions.find((option) => option.value === state) || null;

  return (
    <div className="mx-auto min-w-0 max-w-full space-y-4">
      <PageHeader
        title="Profile Settings"
        description="Manage your account and preferences."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* ── Sidebar / mobile tab strip ── */}
        <div className="col-span-1">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:flex-col md:space-y-2 md:overflow-visible md:pb-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors md:w-full md:gap-3
                    ${
                      active
                        ? "border border-indigo-500/20 bg-primary text-primary-foreground shadow-soft"
                        : "text-secondary-foreground hover:bg-secondary"
                    }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${active ? "text-indigo-500 dark:text-indigo-400" : ""}`}
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="col-span-1 min-w-0 space-y-4 md:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-primary p-4 shadow-soft sm:p-6">
                  {loadingProfile ? (
                    <ProfileFormSkeleton />
                  ) : (
                    <>
                      {/* Profile hero */}
                      <div className="relative mb-6 overflow-hidden rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 via-secondary to-primary">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />

                        <div className="relative flex flex-col items-center px-4 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5 sm:text-left">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />

                          <div className="relative shrink-0">
                            <div className="group relative">
                              {avatarPreview ? (
                                <img
                                  src={avatarPreview}
                                  alt="Profile"
                                  className="h-32 w-32 rounded-2xl object-cover shadow-lg ring-4 ring-indigo-500/20 sm:h-24 sm:w-24"
                                />
                              ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-bold uppercase text-white shadow-lg ring-4 ring-indigo-500/20 sm:h-24 sm:w-24 sm:text-3xl">
                                  {firstName ? firstName.charAt(0) : "U"}
                                </div>
                              )}

                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.96 }}
                                onClick={handlePhotoClick}
                                disabled={uploadingPhoto}
                                aria-label="Change profile photo"
                                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 opacity-100 transition-opacity sm:bg-black/50 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                {uploadingPhoto ? (
                                  <Loader2
                                    size={24}
                                    className="animate-spin text-white"
                                  />
                                ) : (
                                  <Camera size={24} className="text-white" />
                                )}
                              </motion.button>
                            </div>
                          </div>

                          <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                            <h2 className="text-xl font-semibold capitalize text-primary-foreground sm:text-2xl">
                              {[firstName, middleName, lastName]
                                .filter(Boolean)
                                .join(" ") || "Your profile"}
                            </h2>
                            {displayProfile?.mobile ? (
                              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-secondary-foreground sm:justify-start">
                                <Phone
                                  size={14}
                                  className="shrink-0 text-indigo-500 dark:text-indigo-400"
                                />
                                <span>{displayProfile.mobile}</span>
                              </p>
                            ) : (
                              <p className="mt-1.5 text-sm text-secondary-foreground/60">
                                No mobile number
                              </p>
                            )}
                            {email && (
                              <p className="mt-1 truncate text-sm text-secondary-foreground">
                                {email}
                              </p>
                            )}
                          </div>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handlePhotoClick}
                            disabled={uploadingPhoto || loadingProfile}
                            className="mt-5 hidden shrink-0 items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary disabled:opacity-60 sm:mt-0 sm:flex"
                          >
                            {uploadingPhoto ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Uploading…
                              </>
                            ) : (
                              <>
                                <Camera size={14} />
                                Change Photo
                              </>
                            )}
                          </motion.button>
                        </div>

                        <div className="border-t border-border/70 px-4 py-3 sm:hidden">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePhotoClick}
                            disabled={uploadingPhoto || loadingProfile}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary disabled:opacity-60"
                          >
                            {uploadingPhoto ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Uploading photo…
                              </>
                            ) : (
                              <>
                                <Camera
                                  size={14}
                                  className="text-indigo-500 dark:text-indigo-400"
                                />
                                Change profile photo
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>

                      {/* Form fields */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            {
                              label: "First Name *",
                              value: firstName,
                              setter: setFirstName,
                              placeholder: "First name",
                            },
                            {
                              label: "Middle Name",
                              value: middleName,
                              setter: setMiddleName,
                              placeholder: "Middle name",
                            },
                            {
                              label: "Last Name",
                              value: lastName,
                              setter: setLastName,
                              placeholder: "Last name",
                            },
                          ].map(({ label, value, setter, placeholder }) => (
                            <div key={label}>
                              <label className="block text-sm font-medium text-secondary-foreground mb-1">
                                {label}
                              </label>
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                placeholder={placeholder}
                                className={inputClass}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-secondary-foreground mb-1">
                              Gender
                            </label>
                            <SelectField
                              value={selectedGender}
                              onChange={(option) =>
                                setGender(option?.value || "")
                              }
                              options={GENDER_OPTIONS}
                              placeholder="Select gender"
                              isClearable
                              styles={profileSelectStyles}
                              formatOptionLabel={formatGenderOption}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-foreground mb-1">
                              Profession
                            </label>
                            <SelectField
                              value={selectedProfession}
                              onChange={(option) => {
                                const nextValue = option?.value || "";
                                setProfessionChoice(nextValue);
                                if (nextValue !== "Other")
                                  setCustomProfession("");
                              }}
                              options={PROFESSION_OPTIONS}
                              placeholder="Select profession"
                              isClearable
                              styles={profileSelectStyles}
                            />
                            <AnimatePresence>
                              {professionChoice === "Other" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <input
                                    type="text"
                                    value={customProfession}
                                    onChange={(e) =>
                                      setCustomProfession(e.target.value)
                                    }
                                    placeholder="Enter your profession"
                                    className={`${inputClass} mt-3`}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <DatePickerField
                          label="Date of Birth"
                          value={dateOfBirth}
                          onChange={setDateOfBirth}
                          placeholder="Select your date of birth"
                        />

                        <div>
                          <label className="block text-sm font-medium text-secondary-foreground mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className={inputClass}
                          />
                        </div>

                        <div className="pt-2 border-t border-border">
                          <h3 className="text-sm font-semibold text-primary-foreground mb-3">
                            Address
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-secondary-foreground mb-1">
                                Address Line 1
                              </label>
                              <input
                                type="text"
                                value={addressLine1}
                                onChange={(e) =>
                                  setAddressLine1(e.target.value)
                                }
                                placeholder="House no., street, area"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-foreground mb-1">
                                Address Line 2
                              </label>
                              <input
                                type="text"
                                value={addressLine2}
                                onChange={(e) =>
                                  setAddressLine2(e.target.value)
                                }
                                placeholder="Landmark, locality (optional)"
                                className={inputClass}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-secondary-foreground mb-1">
                                  District
                                </label>
                                <input
                                  type="text"
                                  value={district}
                                  onChange={(e) => setDistrict(e.target.value)}
                                  placeholder="District"
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-secondary-foreground mb-1">
                                  State
                                </label>
                                <SelectField
                                  value={selectedState}
                                  onChange={(option) =>
                                    setState(option?.value || "")
                                  }
                                  options={stateOptions}
                                  placeholder="Select state"
                                  isClearable
                                  isSearchable
                                  styles={profileSelectStyles}
                                  classNamePrefix="react-select"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-secondary-foreground mb-1">
                                  Pincode
                                </label>
                                <input
                                  type="text"
                                  value={pincode}
                                  onChange={(e) =>
                                    setPincode(
                                      e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6),
                                    )
                                  }
                                  placeholder="6-digit pincode"
                                  inputMode="numeric"
                                  className={inputClass}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end sm:space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleCancel}
                          disabled={saving || loadingProfile}
                          className="w-full px-5 py-2.5 font-medium rounded-xl border border-border bg-secondary text-primary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-60 sm:w-auto"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSave}
                          disabled={saving || uploadingPhoto || loadingProfile}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-glow transition-all hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
                        >
                          {saving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />{" "}
                              Saving…
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SecurityTab />
              </motion.div>
            )}

            {(activeTab === "notifications" || activeTab === "billing") && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-primary rounded-2xl shadow-soft border border-border p-6 flex flex-col items-center justify-center py-16 text-secondary-foreground gap-2">
                  <span className="text-4xl">🚧</span>
                  <p className="font-medium text-primary-foreground capitalize">
                    {activeTab} settings
                  </p>
                  <p className="text-sm">Coming soon.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
