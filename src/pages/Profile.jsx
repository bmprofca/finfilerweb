import React, { useState, useRef } from 'react';
import { User, Shield, Bell, CreditCard, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { uploadFile, apiCall } from '../utils/apiCall';

const Profile = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [middleName, setMiddleName] = useState(user?.middle_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [imageUrl, setImageUrl] = useState(user?.image || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.image || '');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Photo change ──────────────────────────────────────────────────────────
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);

    setUploadingPhoto(true);
    const toastId = toast.loading('Uploading photo…');
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
      setAvatarPreview(url);
      toast.update(toastId, 'success', 'Photo uploaded!');
    } catch (err) {
      toast.update(toastId, 'error', 'Photo upload failed. Please try again.');
      // Revert preview on failure
      setAvatarPreview(user?.image || '');
    } finally {
      setUploadingPhoto(false);
      // Reset input so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving changes…');
    try {
      const response = await apiCall('/accounts/profile/update', 'POST', {
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        image: imageUrl,
      });

      const result = await response.json();

      if (result.success) {
        // Merge updated fields back into auth context
        login({ ...user, first_name: firstName.trim(), middle_name: middleName.trim(), last_name: lastName.trim(), image: imageUrl });
        toast.update(toastId, 'success', 'Profile updated successfully!');
      } else {
        toast.update(toastId, 'error', result.message || 'Update failed.');
      }
    } catch (err) {
      toast.update(toastId, 'error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.first_name || '');
    setMiddleName(user?.middle_name || '');
    setLastName(user?.last_name || '');
    setImageUrl(user?.image || '');
    setAvatarPreview(user?.image || '');
  };

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-foreground">Profile Settings</h1>
        <p className="text-secondary-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Sidebar ── */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-primary rounded-xl shadow-soft font-medium text-primary-foreground border border-indigo-500/20">
            <User className="w-5 h-5 text-indigo-500" />
            <span>General Info</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-secondary rounded-xl transition-colors font-medium text-secondary-foreground">
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-secondary rounded-xl transition-colors font-medium text-secondary-foreground">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-secondary rounded-xl transition-colors font-medium text-secondary-foreground">
            <CreditCard className="w-5 h-5" />
            <span>Billing</span>
          </button>
        </div>

        {/* ── Main content ── */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-primary rounded-2xl shadow-soft border border-border p-6">

            {/* ── Avatar row ── */}
            <div className="flex items-center space-x-4 mb-6">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />

              {/* Avatar with camera overlay */}
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-20 h-20 rounded-2xl shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white text-3xl font-bold uppercase">
                    {firstName ? firstName.charAt(0) : 'U'}
                  </div>
                )}
                {/* Upload overlay */}
                <motion.button
                  whileHover={{ opacity: 1 }}
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingPhoto
                    ? <Loader2 size={20} className="text-white animate-spin" />
                    : <Camera size={20} className="text-white" />
                  }
                </motion.button>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold capitalize text-primary-foreground">
                  {firstName} {lastName}
                </h2>
                <p className="text-secondary-foreground text-sm capitalize">{user?.user_type || 'User'}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {uploadingPhoto ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                ) : (
                  <><Camera size={14} /> Change Photo</>
                )}
              </motion.button>
            </div>

            {/* ── Form fields ── */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-foreground mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-foreground mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Middle name"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-foreground mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-secondary-foreground transition-all cursor-not-allowed opacity-70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={user?.mobile || ''}
                  readOnly
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-secondary-foreground transition-all cursor-not-allowed opacity-70"
                />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="mt-6 pt-6 border-t border-border flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 bg-secondary border border-border text-primary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors disabled:opacity-60"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving || uploadingPhoto}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-glow transition-all disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
