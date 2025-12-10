import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/Header"
import {
    User, Bell, Shield, Palette, Globe, Moon, Sun,
    Monitor, Volume2, VolumeX, Eye, EyeOff, Save,
    Smartphone, Mail, Lock, Trash2, Download, Upload
} from "lucide-react"

export default function Settings() {
    const [activeTab, setActiveTab] = useState("account")

    // Account Settings State
    const [accountSettings, setAccountSettings] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        bio: "Mental health advocate and wellness enthusiast",
        profileVisibility: "public",
        twoFactorEnabled: false
    })

    // Web Settings State
    const [webSettings, setWebSettings] = useState({
        theme: "light",
        language: "english",
        notifications: {
            email: true,
            push: true,
            sound: true,
            community: true,
            aiChat: true,
            reminders: true
        },
        privacy: {
            showOnlineStatus: true,
            allowDirectMessages: true,
            showActivity: false
        },
        accessibility: {
            fontSize: "medium",
            highContrast: false,
            reducedMotion: false
        }
    })

    const tabs = [
        { id: "account", label: "Account Settings", icon: User },
        { id: "web", label: "Web Settings", icon: Globe },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy & Security", icon: Shield }
    ]

    const handleAccountChange = (field, value) => {
        setAccountSettings(prev => ({ ...prev, [field]: value }))
    }

    const handleWebSettingChange = (category, field, value) => {
        setWebSettings(prev => ({
            ...prev,
            [category]: typeof prev[category] === 'object'
                ? { ...prev[category], [field]: value }
                : value
        }))
    }

    const handleSave = () => {
        // Save settings logic here
        alert("Settings saved successfully!")
    }

    return (
        <div className="flex min-h-screen bg-[#f5f0e8]">
            <Sidebar />

            <div className="flex-1 lg:ml-16 p-3 sm:p-4 lg:p-8 pt-28">
                <Header />

                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d] mb-6">Settings</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Settings Navigation */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-28">
                                <nav className="space-y-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === tab.id
                                                        ? 'bg-[#e74c3c] text-white'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{tab.label}</span>
                                            </button>
                                        )
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="lg:col-span-9">
                            <div className="bg-white rounded-2xl p-6 shadow-sm">

                                {/* Account Settings */}
                                {activeTab === "account" && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-[#2d2d2d] mb-4">Account Information</h3>

                                        {/* Profile Picture */}
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-[#e74c3c] rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-2xl">JD</span>
                                            </div>
                                            <div className="space-y-2">
                                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                    <Upload className="w-4 h-4" />
                                                    Upload Photo
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                    Remove Photo
                                                </button>
                                            </div>
                                        </div>

                                        {/* Basic Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={accountSettings.name}
                                                    onChange={(e) => handleAccountChange('name', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={accountSettings.email}
                                                    onChange={(e) => handleAccountChange('email', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={accountSettings.phone}
                                                    onChange={(e) => handleAccountChange('phone', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                                                <select
                                                    value={accountSettings.profileVisibility}
                                                    onChange={(e) => handleAccountChange('profileVisibility', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                                >
                                                    <option value="public">Public</option>
                                                    <option value="private">Private</option>
                                                    <option value="friends">Friends Only</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                            <textarea
                                                value={accountSettings.bio}
                                                onChange={(e) => handleAccountChange('bio', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c] resize-none"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>

                                        {/* Security */}
                                        <div className="border-t pt-6">
                                            <h4 className="text-lg font-semibold text-[#2d2d2d] mb-4">Security</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Lock className="w-5 h-5 text-gray-600" />
                                                        <div>
                                                            <p className="font-medium text-[#2d2d2d]">Two-Factor Authentication</p>
                                                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAccountChange('twoFactorEnabled', !accountSettings.twoFactorEnabled)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${accountSettings.twoFactorEnabled ? 'bg-[#e74c3c]' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accountSettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>
                                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Web Settings */}
                                {activeTab === "web" && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-[#2d2d2d] mb-4">Appearance & Preferences</h3>

                                        {/* Theme */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'light', label: 'Light', icon: Sun },
                                                    { id: 'dark', label: 'Dark', icon: Moon },
                                                    { id: 'system', label: 'System', icon: Monitor }
                                                ].map((theme) => {
                                                    const Icon = theme.icon
                                                    return (
                                                        <button
                                                            key={theme.id}
                                                            onClick={() => handleWebSettingChange('theme', null, theme.id)}
                                                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${webSettings.theme === theme.id
                                                                    ? 'border-[#e74c3c] bg-red-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <Icon className="w-6 h-6" />
                                                            <span className="text-sm font-medium">{theme.label}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Language */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                            <select
                                                value={webSettings.language}
                                                onChange={(e) => handleWebSettingChange('language', null, e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                            >
                                                <option value="english">English</option>
                                                <option value="spanish">Spanish</option>
                                                <option value="french">French</option>
                                                <option value="german">German</option>
                                            </select>
                                        </div>

                                        {/* Accessibility */}
                                        <div className="border-t pt-6">
                                            <h4 className="text-lg font-semibold text-[#2d2d2d] mb-4">Accessibility</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                                    <select
                                                        value={webSettings.accessibility.fontSize}
                                                        onChange={(e) => handleWebSettingChange('accessibility', 'fontSize', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                                    >
                                                        <option value="small">Small</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="large">Large</option>
                                                        <option value="extra-large">Extra Large</option>
                                                    </select>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-[#2d2d2d]">High Contrast</p>
                                                        <p className="text-sm text-gray-500">Improve visibility with higher contrast</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleWebSettingChange('accessibility', 'highContrast', !webSettings.accessibility.highContrast)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webSettings.accessibility.highContrast ? 'bg-[#e74c3c]' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${webSettings.accessibility.highContrast ? 'translate-x-6' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-[#2d2d2d]">Reduced Motion</p>
                                                        <p className="text-sm text-gray-500">Minimize animations and transitions</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleWebSettingChange('accessibility', 'reducedMotion', !webSettings.accessibility.reducedMotion)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webSettings.accessibility.reducedMotion ? 'bg-[#e74c3c]' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${webSettings.accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications */}
                                {activeTab === "notifications" && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-[#2d2d2d] mb-4">Notification Preferences</h3>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                                                { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile notifications', icon: Smartphone },
                                                { key: 'sound', label: 'Sound Notifications', desc: 'Play sounds for notifications', icon: Volume2 },
                                                { key: 'community', label: 'Community Updates', desc: 'New posts and interactions', icon: User },
                                                { key: 'aiChat', label: 'AI Chat Reminders', desc: 'Reminders for AI therapy sessions', icon: Bell },
                                                { key: 'reminders', label: 'Task Reminders', desc: 'Daily task and goal reminders', icon: Bell }
                                            ].map((notification) => {
                                                const Icon = notification.icon
                                                return (
                                                    <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Icon className="w-5 h-5 text-gray-600" />
                                                            <div>
                                                                <p className="font-medium text-[#2d2d2d]">{notification.label}</p>
                                                                <p className="text-sm text-gray-500">{notification.desc}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleWebSettingChange('notifications', notification.key, !webSettings.notifications[notification.key])}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webSettings.notifications[notification.key] ? 'bg-[#e74c3c]' : 'bg-gray-300'
                                                                }`}
                                                        >
                                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${webSettings.notifications[notification.key] ? 'translate-x-6' : 'translate-x-1'
                                                                }`} />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Privacy & Security */}
                                {activeTab === "privacy" && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-[#2d2d2d] mb-4">Privacy & Security</h3>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you\'re online' },
                                                { key: 'allowDirectMessages', label: 'Allow Direct Messages', desc: 'Receive messages from other users' },
                                                { key: 'showActivity', label: 'Show Activity Status', desc: 'Display your recent activity to others' }
                                            ].map((privacy) => (
                                                <div key={privacy.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-[#2d2d2d]">{privacy.label}</p>
                                                        <p className="text-sm text-gray-500">{privacy.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleWebSettingChange('privacy', privacy.key, !webSettings.privacy[privacy.key])}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webSettings.privacy[privacy.key] ? 'bg-[#e74c3c]' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${webSettings.privacy[privacy.key] ? 'translate-x-6' : 'translate-x-1'
                                                            }`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Data Management */}
                                        <div className="border-t pt-6">
                                            <h4 className="text-lg font-semibold text-[#2d2d2d] mb-4">Data Management</h4>
                                            <div className="space-y-3">
                                                <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Download className="w-5 h-5 text-blue-600" />
                                                        <div className="text-left">
                                                            <p className="font-medium text-blue-900">Download Your Data</p>
                                                            <p className="text-sm text-blue-700">Export all your account data</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Trash2 className="w-5 h-5 text-red-600" />
                                                        <div className="text-left">
                                                            <p className="font-medium text-red-900">Delete Account</p>
                                                            <p className="text-sm text-red-700">Permanently delete your account and data</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="border-t pt-6 mt-8">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}