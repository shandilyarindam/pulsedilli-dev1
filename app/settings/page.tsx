"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Shield, Bell, Globe } from "lucide-react";
export default function SettingsPage() {
 return (
 <div className="p-4 md:p-6 lg:p-8">
 <div className="flex justify-between items-start gap-4 mb-4 md:mb-6">
 <div>
 <h1 className="mb-1 text-xl font-bold text-[var(--brand)] md:text-2xl">Settings</h1>
 <p className="text-xs text-[var(--text-secondary)] md:text-sm">
 System configuration and preferences
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
 <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
 <CardHeader className="border-b border-[var(--border-subtle)] pb-3">
 <div className="flex items-center gap-2">
 <SettingsIcon className="h-4 w-4 text-[var(--brand)]" />
 <CardTitle className="text-sm font-semibold text-[var(--brand)] ">
 General
 </CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-4 p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Auto-refresh interval
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Dashboard data refresh frequency
 </p>
 </div>
 <Badge variant="outline" className="text-xs">
 30 seconds
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Default view
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Landing page after login
 </p>
 </div>
 <Badge variant="outline" className="text-xs">
 Dashboard
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Timezone
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Display timestamps in
 </p>
 </div>
 <Badge variant="outline" className="text-xs">
 IST (UTC+5:30)
 </Badge>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
 <CardHeader className="border-b border-[var(--border-subtle)] pb-3">
 <div className="flex items-center gap-2">
 <Bell className="h-4 w-4 text-[var(--brand)]" />
 <CardTitle className="text-sm font-semibold text-[var(--brand)] ">
 Notifications
 </CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-4 p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 WhatsApp alerts
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Officer assignment notifications
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Enabled
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Email digests
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Daily summary via SendGrid
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Enabled
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Escalation alerts
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Critical complaint notifications
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Enabled
 </Badge>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
 <CardHeader className="border-b border-[var(--border-subtle)] pb-3">
 <div className="flex items-center gap-2">
 <Shield className="h-4 w-4 text-[var(--brand)]" />
 <CardTitle className="text-sm font-semibold text-[var(--brand)] ">
 Security
 </CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-4 p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 API Access
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Supabase RLS policies active
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Protected
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Data residency
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Complaint data storage region
 </p>
 </div>
 <Badge variant="outline" className="text-xs">
 India (Mumbai)
 </Badge>
 </div>
 </CardContent>
 </Card>

 <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
 <CardHeader className="border-b border-[var(--border-subtle)] pb-3">
 <div className="flex items-center gap-2">
 <Globe className="h-4 w-4 text-[var(--brand)]" />
 <CardTitle className="text-sm font-semibold text-[var(--brand)] ">
 Integration
 </CardTitle>
 </div>
 </CardHeader>
 <CardContent className="space-y-4 p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Supabase
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Database backend
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Connected
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 Gemini 2.5 Flash-Lite
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 AI classification engine
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Active
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-[var(--text-primary)]">
 WhatsApp Business API
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Citizen messaging platform
 </p>
 </div>
 <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700">
 Live
 </Badge>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
