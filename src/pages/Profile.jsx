import React from 'react';
import { User, Mail, Shield, Key, Bell, CreditCard, ChevronRight } from 'lucide-react';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-secondary-foreground mt-1">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar */}
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

        {/* Right Content */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-primary rounded-2xl shadow-soft border border-border p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white text-3xl font-bold">
                A
              </div>
              <div>
                <h2 className="text-xl font-semibold">Asha</h2>
                <p className="text-secondary-foreground text-sm">Pro User</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-colors">
                Change Avatar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue="Asha"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="asha@example.com"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 000-0000"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-primary-foreground transition-all"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex justify-end space-x-3">
              <button className="px-5 py-2.5 bg-secondary border border-border text-primary-foreground font-medium rounded-xl hover:bg-secondary/80 transition-colors">
                Cancel
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-glow transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
