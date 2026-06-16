import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  UserCheck,
  Landmark,
  Briefcase,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import SelectField from '../../components/common/SelectField';
import { apiCall, uploadFile } from '../../utils/apiCall';
import { useToast } from '../../contexts/ToastContext';

const STEPS = [
  { id: 1, label: 'Business', icon: Building2 },
  { id: 2, label: 'Address', icon: MapPin },
  { id: 3, label: 'Signatory', icon: UserCheck },
  { id: 4, label: 'Bank', icon: Landmark },
  { id: 5, label: 'Activity', icon: Briefcase },
  { id: 6, label: 'Documents', icon: FileUp },
];

const CONSTITUTION_OPTIONS = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { value: 'private_limited', label: 'Private Limited Company' },
  { value: 'public_limited', label: 'Public Limited Company' },
  { value: 'huf', label: 'Hindu Undivided Family (HUF)' },
  { value: 'society', label: 'Society / Trust / Club' },
  { value: 'other', label: 'Other' },
];

const STATE_OPTIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
].map((state) => ({ value: state, label: state }));

const NATURE_OF_BUSINESS_OPTIONS = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'trader', label: 'Trader / Wholesaler / Retailer' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'works_contractor', label: 'Works Contractor' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'importer', label: 'Importer' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM = {
  legal_name: '',
  trade_name: '',
  constitution: '',
  pan: '',
  date_of_commencement: '',
  email: '',
  mobile: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  district: '',
  signatory_name: '',
  signatory_designation: '',
  signatory_pan: '',
  signatory_aadhaar: '',
  signatory_mobile: '',
  signatory_email: '',
  bank_account_number: '',
  bank_ifsc: '',
  bank_name: '',
  bank_branch: '',
  nature_of_business: '',
  business_description: '',
  annual_turnover: '',
  documents: {
    pan_card: null,
    aadhaar_card: null,
    address_proof: null,
    bank_proof: null,
    incorporation_certificate: null,
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: (dir) => ({ x: dir > 0 ? -32 : 32, opacity: 0, transition: { duration: 0.18 } }),
};

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-primary-foreground">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function TextInput({ id, name, value, onChange, type = 'text', placeholder, required, maxLength, pattern }) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      pattern={pattern}
      className="w-full rounded-xl border border-border bg-primary px-3.5 py-3 text-sm text-primary-foreground outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-secondary focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
    />
  );
}

function FileInput({ id, label, file, onChange, required }) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-primary px-4 py-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"
      >
        <FileUp size={22} className="mb-2 text-indigo-500" />
        <span className="text-sm font-medium text-primary-foreground">
          {file ? file.name : 'Click to upload or drag & drop'}
        </span>
        <span className="mt-1 text-xs text-secondary-foreground">PDF, JPG, or PNG up to 5MB</span>
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  );
}

export default function GSTRegistration() {
  const { orderId } = useParams();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({
      ...prev,
      documents: { ...prev.documents, [field]: file },
    }));
  };

  const handleSelectChange = (field) => (option) => {
    setForm((prev) => ({ ...prev, [field]: option?.value || '' }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!form.legal_name.trim()) return 'Legal name is required.';
        if (!form.constitution) return 'Business constitution is required.';
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase())) return 'Enter a valid PAN (e.g. ABCDE1234F).';
        if (!form.date_of_commencement) return 'Date of commencement is required.';
        if (!/^[6-9]\d{9}$/.test(form.mobile)) return 'Enter a valid 10-digit mobile number.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
        break;
      case 2:
        if (!form.address_line1.trim()) return 'Address line 1 is required.';
        if (!form.city.trim()) return 'City is required.';
        if (!form.state) return 'State is required.';
        if (!/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit PIN code.';
        break;
      case 3:
        if (!form.signatory_name.trim()) return 'Signatory name is required.';
        if (!form.signatory_designation.trim()) return 'Designation is required.';
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.signatory_pan.toUpperCase())) return 'Enter a valid signatory PAN.';
        if (!/^\d{12}$/.test(form.signatory_aadhaar)) return 'Enter a valid 12-digit Aadhaar number.';
        if (!/^[6-9]\d{9}$/.test(form.signatory_mobile)) return 'Enter a valid signatory mobile number.';
        break;
      case 4:
        if (!/^\d{9,18}$/.test(form.bank_account_number)) return 'Enter a valid bank account number.';
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bank_ifsc.toUpperCase())) return 'Enter a valid IFSC code.';
        if (!form.bank_name.trim()) return 'Bank name is required.';
        break;
      case 5:
        if (!form.nature_of_business) return 'Nature of business is required.';
        if (!form.business_description.trim()) return 'Business description is required.';
        break;
      case 6:
        if (!form.documents.pan_card) return 'PAN card document is required.';
        if (!form.documents.aadhaar_card) return 'Aadhaar card document is required.';
        if (!form.documents.address_proof) return 'Address proof is required.';
        if (!form.documents.bank_proof) return 'Bank proof is required.';
        break;
      default:
        break;
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const uploadDocuments = async () => {
    const entries = Object.entries(form.documents).filter(([, file]) => file);
    const uploaded = {};

    for (const [key, file] of entries) {
      uploaded[key] = await uploadFile(file);
    }

    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting GST registration application…');

    try {
      const documentUrls = await uploadDocuments();

      const payload = {
        order_id: orderId,
        legal_name: form.legal_name.trim(),
        trade_name: form.trade_name.trim(),
        constitution: form.constitution,
        pan: form.pan.toUpperCase(),
        date_of_commencement: form.date_of_commencement,
        email: form.email.trim(),
        mobile: form.mobile,
        address: {
          line1: form.address_line1.trim(),
          line2: form.address_line2.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          state: form.state,
          pincode: form.pincode,
        },
        authorized_signatory: {
          name: form.signatory_name.trim(),
          designation: form.signatory_designation.trim(),
          pan: form.signatory_pan.toUpperCase(),
          aadhaar: form.signatory_aadhaar,
          mobile: form.signatory_mobile,
          email: form.signatory_email.trim(),
        },
        bank_details: {
          account_number: form.bank_account_number,
          ifsc: form.bank_ifsc.toUpperCase(),
          bank_name: form.bank_name.trim(),
          branch: form.bank_branch.trim(),
        },
        business_activity: {
          nature: form.nature_of_business,
          description: form.business_description.trim(),
          annual_turnover: form.annual_turnover,
        },
        documents: documentUrls,
      };

      const response = await apiCall(`/applications/gst-registration/${orderId}`, 'POST', payload);
      const data = await response.json();

      if (response.ok && data.success) {
        toast.dismiss(toastId);
        toast.success('GST registration application submitted successfully.');
        setSubmitted(true);
      } else {
        throw new Error(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="mx-auto max-w-2xl py-10 px-4 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">Application Submitted</h1>
        <p className="mt-3 text-secondary-foreground">
          Your GST registration application for order <span className="font-semibold text-primary-foreground">{orderId}</span> has been received. Our team will review your details and contact you shortly.
        </p>
        <Link
          to="/orders"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-4xl py-4 sm:py-8 px-2 sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
        <Link
          to="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-foreground transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-primary-foreground">
          GST Registration
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-secondary-foreground">
          Complete the application form for order <span className="font-semibold text-primary-foreground">{orderId}</span>.
        </p>
      </motion.div>

      {/* Step indicator */}
      <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {STEPS.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                step === id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : step > id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-secondary border border-border text-secondary-foreground'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{id}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </motion.div>

      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="rounded-2xl sm:rounded-3xl border border-border bg-secondary p-5 sm:p-8 shadow-soft"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-5"
          >
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-primary-foreground">Business Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="legal_name" required>Legal Name of Business</FieldLabel>
                    <TextInput id="legal_name" name="legal_name" value={form.legal_name} onChange={handleChange} placeholder="As per PAN / incorporation certificate" required />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="trade_name">Trade Name (if different)</FieldLabel>
                    <TextInput id="trade_name" name="trade_name" value={form.trade_name} onChange={handleChange} placeholder="Brand or trade name" />
                  </div>
                  <div>
                    <FieldLabel required>Constitution of Business</FieldLabel>
                    <SelectField
                      options={CONSTITUTION_OPTIONS}
                      value={CONSTITUTION_OPTIONS.find((o) => o.value === form.constitution) || null}
                      onChange={handleSelectChange('constitution')}
                      placeholder="Select constitution"
                      isClearable
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pan" required>PAN</FieldLabel>
                    <TextInput id="pan" name="pan" value={form.pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="date_of_commencement" required>Date of Commencement</FieldLabel>
                    <TextInput id="date_of_commencement" name="date_of_commencement" type="date" value={form.date_of_commencement} onChange={handleChange} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="mobile" required>Mobile Number</FieldLabel>
                    <TextInput id="mobile" name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="email" required>Email Address</FieldLabel>
                    <TextInput id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="business@example.com" required />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-primary-foreground">Principal Place of Business</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="address_line1" required>Address Line 1</FieldLabel>
                    <TextInput id="address_line1" name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="Building, street, area" required />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="address_line2">Address Line 2</FieldLabel>
                    <TextInput id="address_line2" name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Landmark (optional)" />
                  </div>
                  <div>
                    <FieldLabel htmlFor="city" required>City</FieldLabel>
                    <TextInput id="city" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="district">District</FieldLabel>
                    <TextInput id="district" name="district" value={form.district} onChange={handleChange} placeholder="District" />
                  </div>
                  <div>
                    <FieldLabel required>State</FieldLabel>
                    <SelectField
                      options={STATE_OPTIONS}
                      value={STATE_OPTIONS.find((o) => o.value === form.state) || null}
                      onChange={handleSelectChange('state')}
                      placeholder="Select state"
                      isClearable
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="pincode" required>PIN Code</FieldLabel>
                    <TextInput id="pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit PIN" maxLength={6} required />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-lg font-bold text-primary-foreground">Authorized Signatory</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="signatory_name" required>Full Name</FieldLabel>
                    <TextInput id="signatory_name" name="signatory_name" value={form.signatory_name} onChange={handleChange} placeholder="As per PAN / Aadhaar" required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="signatory_designation" required>Designation</FieldLabel>
                    <TextInput id="signatory_designation" name="signatory_designation" value={form.signatory_designation} onChange={handleChange} placeholder="Proprietor, Director, Partner, etc." required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="signatory_pan" required>PAN</FieldLabel>
                    <TextInput id="signatory_pan" name="signatory_pan" value={form.signatory_pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="signatory_aadhaar" required>Aadhaar Number</FieldLabel>
                    <TextInput id="signatory_aadhaar" name="signatory_aadhaar" value={form.signatory_aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="signatory_mobile" required>Mobile Number</FieldLabel>
                    <TextInput id="signatory_mobile" name="signatory_mobile" value={form.signatory_mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="signatory_email">Email Address</FieldLabel>
                    <TextInput id="signatory_email" name="signatory_email" type="email" value={form.signatory_email} onChange={handleChange} placeholder="signatory@example.com" />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-lg font-bold text-primary-foreground">Bank Account Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="bank_account_number" required>Account Number</FieldLabel>
                    <TextInput id="bank_account_number" name="bank_account_number" value={form.bank_account_number} onChange={handleChange} placeholder="Bank account number" required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="bank_ifsc" required>IFSC Code</FieldLabel>
                    <TextInput id="bank_ifsc" name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} placeholder="SBIN0001234" maxLength={11} required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="bank_name" required>Bank Name</FieldLabel>
                    <TextInput id="bank_name" name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="Name of bank" required />
                  </div>
                  <div>
                    <FieldLabel htmlFor="bank_branch">Branch</FieldLabel>
                    <TextInput id="bank_branch" name="bank_branch" value={form.bank_branch} onChange={handleChange} placeholder="Branch name" />
                  </div>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="text-lg font-bold text-primary-foreground">Business Activity</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Nature of Business</FieldLabel>
                    <SelectField
                      options={NATURE_OF_BUSINESS_OPTIONS}
                      value={NATURE_OF_BUSINESS_OPTIONS.find((o) => o.value === form.nature_of_business) || null}
                      onChange={handleSelectChange('nature_of_business')}
                      placeholder="Select nature"
                      isClearable
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="annual_turnover">Expected Annual Turnover</FieldLabel>
                    <TextInput id="annual_turnover" name="annual_turnover" value={form.annual_turnover} onChange={handleChange} placeholder="e.g. ₹40 Lakhs" />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="business_description" required>Business Description</FieldLabel>
                    <textarea
                      id="business_description"
                      name="business_description"
                      value={form.business_description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe goods/services, HSN/SAC codes if known, and primary business activities"
                      required
                      className="w-full resize-none rounded-xl border border-border bg-primary px-3.5 py-3 text-sm text-primary-foreground outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-secondary focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 6 && (
              <>
                <h2 className="text-lg font-bold text-primary-foreground">Supporting Documents</h2>
                <p className="text-sm text-secondary-foreground">
                  Upload clear copies of the required documents. All files must be in PDF, JPG, or PNG format.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileInput id="pan_card" label="PAN Card" file={form.documents.pan_card} onChange={handleFileChange('pan_card')} required />
                  <FileInput id="aadhaar_card" label="Aadhaar Card" file={form.documents.aadhaar_card} onChange={handleFileChange('aadhaar_card')} required />
                  <FileInput id="address_proof" label="Address Proof" file={form.documents.address_proof} onChange={handleFileChange('address_proof')} required />
                  <FileInput id="bank_proof" label="Bank Proof (Cancelled Cheque / Statement)" file={form.documents.bank_proof} onChange={handleFileChange('bank_proof')} required />
                  <FileInput id="incorporation_certificate" label="Incorporation Certificate (if applicable)" file={form.documents.incorporation_certificate} onChange={handleFileChange('incorporation_certificate')} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={goNext}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit Application'}
            </button>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
}
