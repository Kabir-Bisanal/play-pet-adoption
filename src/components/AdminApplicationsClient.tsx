"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { ApplicationStatus } from "@/lib/supabase/types";
import {
  AdoptionApplicationRecord,
  SAMPLE_APPLICATIONS,
} from "@/data/sample-applications";
import {
  updateApplicationStatus,
  saveApplicationNotes,
  ActivityLogEntry,
} from "@/app/actions/applications";

interface AdminApplicationsClientProps {
  initialApplications: AdoptionApplicationRecord[];
  initialMetrics: {
    total: number;
    newCount: number;
    underReviewCount: number;
    interviewCount: number;
    meetAndGreetCount: number;
    approvedCount: number;
    rejectedCount: number;
    completedCount: number;
  };
  initialActivityLogs?: ActivityLogEntry[];
}

type TabFilter = ApplicationStatus | "all";

export default function AdminApplicationsClient({
  initialApplications,
  initialMetrics,
  initialActivityLogs = [],
}: AdminApplicationsClientProps) {
  const [applications, setApplications] = useState<AdoptionApplicationRecord[]>(
    initialApplications.length > 0 ? initialApplications : SAMPLE_APPLICATIONS
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(initialActivityLogs);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AdoptionApplicationRecord | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Show floating toast notification with automatic dismissal
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter applications by active tab and search query
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Tab filter
      if (activeTab !== "all" && app.status !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = app.applicant_name.toLowerCase().includes(q);
        const matchesEmail = app.applicant_email.toLowerCase().includes(q);
        const matchesPhone = app.applicant_phone.toLowerCase().includes(q);
        const matchesPet = app.pet_name.toLowerCase().includes(q);
        const matchesCode = app.pet_code.toLowerCase().includes(q);
        const matchesCity = app.city.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesEmail ||
          matchesPhone ||
          matchesPet ||
          matchesCode ||
          matchesCity
        );
      }
      return true;
    });
  }, [applications, activeTab, searchQuery]);

  // Compute live counts
  const counts = useMemo(() => {
    return {
      all: applications.length,
      new: applications.filter((a) => a.status === "new").length,
      under_review: applications.filter((a) => a.status === "under_review").length,
      interview: applications.filter((a) => a.status === "interview").length,
      meet_and_greet: applications.filter((a) => a.status === "meet_and_greet").length,
      approved: applications.filter((a) => a.status === "approved").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      completed: applications.filter((a) => a.status === "completed").length,
    };
  }, [applications]);

  // Handle status update
  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    startTransition(async () => {
      const res = await updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === appId
              ? { ...a, status: newStatus, updated_at: new Date().toISOString() }
              : a
          )
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(
          `Application for ${selectedApp?.applicant_name || "applicant"} moved to ${newStatus.replace(
            /_/g,
            " "
          )}!`
        );
      } else {
        showToast(res.error || "Failed to update status.");
      }
    });
  };

  // Handle saving internal shelter notes
  const handleSaveNotes = () => {
    if (!selectedApp || !newNoteText.trim()) return;

    const timestamp = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    const appendedNote = selectedApp.internal_notes
      ? `${selectedApp.internal_notes}\n\n[${timestamp}]: ${newNoteText.trim()}`
      : `[${timestamp}]: ${newNoteText.trim()}`;

    startTransition(async () => {
      const res = await saveApplicationNotes(selectedApp.id, appendedNote);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === selectedApp.id
              ? { ...a, internal_notes: appendedNote, updated_at: new Date().toISOString() }
              : a
          )
        );
        setSelectedApp((prev) =>
          prev ? { ...prev, internal_notes: appendedNote } : null
        );
        setNewNoteText("");
        showToast("Internal screening note saved successfully.");
      } else {
        showToast(res.error || "Failed to save note.");
      }
    });
  };

  // Clean phone number for direct WhatsApp deep-links
  const getCleanPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  // Pre-filled WhatsApp message
  const getWhatsAppUrl = (app: AdoptionApplicationRecord) => {
    const cleanPhone = getCleanPhone(app.applicant_phone);
    const msg = encodeURIComponent(
      `Hi ${app.applicant_name}, this is Haven Paws regarding your adoption application for ${app.pet_name} (${app.pet_code}). We would love to talk about the next steps!`
    );
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  // Helper for human-readable dates
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Helper for relative time (e.g. "2 hours ago")
  const getRelativeTime = (isoString: string) => {
    try {
      const ms = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(ms / (1000 * 60));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="admin-applications-manager">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-banner" role="status" aria-live="polite">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Directory Welcome Bar */}
      <div className="admin-welcome-bar">
        <div>
          <span className="admin-welcome-eyebrow">Adoption CRM &amp; Pipeline</span>
          <h1 className="admin-welcome-title">Adoption Inquiries &amp; Review</h1>
          <p className="admin-welcome-desc">
            Screen incoming prospective adopters, verify living arrangements, schedule meet-and-greets, and record internal notes.
          </p>
        </div>

        <div className="admin-quick-actions">
          <button
            type="button"
            className="btn-admin-action secondary"
            onClick={() => setShowActivityDrawer(true)}
            aria-label="View Activity Logs"
          >
            <span>📜</span> Activity Feed ({activityLogs.length})
          </button>
          <Link href="/admin/pets" className="btn-admin-action primary">
            <span>🐾</span> Manage Pets
          </Link>
        </div>
      </div>

      {/* 4 Pipeline Metric Summary Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" aria-hidden="true">
            📬
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Inquiries</span>
            <span className="kpi-value">{counts.all}</span>
            <span className="kpi-meta">All-time submissions</span>
          </div>
        </div>

        <div className="admin-kpi-card highlight-coral">
          <div className="kpi-icon-wrap" aria-hidden="true">
            🔔
          </div>
          <div className="kpi-content">
            <span className="kpi-label">New &amp; Unreviewed</span>
            <span className="kpi-value">{counts.new}</span>
            <span className="kpi-meta text-coral">
              {counts.new > 0 ? "Needs volunteer review" : "All caught up"}
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" aria-hidden="true">
            🤝
          </div>
          <div className="kpi-content">
            <span className="kpi-label">In Screening Pipeline</span>
            <span className="kpi-value">
              {counts.under_review + counts.interview + counts.meet_and_greet}
            </span>
            <span className="kpi-meta">Interviews &amp; visits</span>
          </div>
        </div>

        <div className="admin-kpi-card highlight-green">
          <div className="kpi-icon-wrap" aria-hidden="true">
            🎉
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Approved &amp; Placed</span>
            <span className="kpi-value">{counts.approved + counts.completed}</span>
            <span className="kpi-meta text-forest">Forever homes found</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Navigation */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by applicant name, phone, email, companion (#D01), or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search applications"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* 1-Tap Status Tabs */}
        <div className="admin-status-tabs" role="tablist">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Inquiries <span className="tab-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            New Inquiries <span className="tab-count coral">{counts.new}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "under_review" ? "active" : ""}`}
            onClick={() => setActiveTab("under_review")}
          >
            Under Review <span className="tab-count">{counts.under_review}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "interview" ? "active" : ""}`}
            onClick={() => setActiveTab("interview")}
          >
            Interview <span className="tab-count">{counts.interview}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "meet_and_greet" ? "active" : ""}`}
            onClick={() => setActiveTab("meet_and_greet")}
          >
            Meet &amp; Greet <span className="tab-count">{counts.meet_and_greet}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved <span className="tab-count green">{counts.approved}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "rejected" ? "active" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Declined <span className="tab-count">{counts.rejected}</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed 🏆 <span className="tab-count">{counts.completed}</span>
          </button>
        </div>
      </div>

      {/* Applications List View */}
      {filteredApplications.length === 0 ? (
        <div className="admin-empty-box">
          <span className="admin-empty-icon">📭</span>
          <h3 className="empty-state-title">No applications found</h3>
          <p className="admin-empty-text">
            {searchQuery
              ? `No inquiries match "${searchQuery}". Try clearing your search keyword.`
              : `There are currently no applications under the "${activeTab.replace(
                  /_/g,
                  " "
                )}" stage.`}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="btn-empty-reset"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-applications-grid">
          {filteredApplications.map((app) => (
            <div key={app.id} className="admin-app-card">
              {/* Card Header */}
              <div className="app-card-top">
                <div className="app-companion-badge">
                  <span className="app-pet-code">{app.pet_code}</span>
                  <strong className="app-pet-name">{app.pet_name}</strong>
                </div>
                <span className={`status-pill status-${app.status}`}>
                  {app.status === "meet_and_greet"
                    ? "Meet & Greet"
                    : app.status === "under_review"
                    ? "Under Review"
                    : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>

              {/* Applicant Name & Location */}
              <div className="app-card-main">
                <h3 className="app-applicant-name">{app.applicant_name}</h3>
                <div className="app-meta-row">
                  <span>📍 {app.city}</span>
                  <span>•</span>
                  <span>Submitted {getRelativeTime(app.created_at)}</span>
                </div>
              </div>

              {/* Highlights Summary */}
              <div className="app-card-highlights">
                <div className="app-highlight-item">
                  <span className="highlight-label">Home:</span>
                  <span className="highlight-val">{app.residence_type}</span>
                </div>
                <div className="app-highlight-item">
                  <span className="highlight-label">Alone Time:</span>
                  <span className="highlight-val">{app.hours_alone}</span>
                </div>
                <div className="app-highlight-item">
                  <span className="highlight-label">Experience:</span>
                  <span className="highlight-val">
                    {app.past_pet_experience.length > 55
                      ? `${app.past_pet_experience.slice(0, 55)}...`
                      : app.past_pet_experience}
                  </span>
                </div>
              </div>

              {/* Internal Notes Preview */}
              {app.internal_notes && (
                <div className="app-notes-snippet">
                  <span className="notes-icon">📝</span>
                  <span className="notes-text">
                    {app.internal_notes.split("\n\n").pop()}
                  </span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="app-card-actions">
                <div className="app-contact-shortcuts">
                  <a
                    href={getWhatsAppUrl(app)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shortcut wa"
                    title="Message applicant on WhatsApp"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${app.applicant_phone}`}
                    className="btn-shortcut tel"
                    title="Call applicant directly"
                  >
                    📞 Call
                  </a>
                  <a
                    href={`mailto:${app.applicant_email}?subject=Haven%20Paws%20Adoption%20Application%20for%20${encodeURIComponent(
                      app.pet_name
                    )}`}
                    className="btn-shortcut email"
                    title="Email applicant"
                  >
                    ✉️ Email
                  </a>
                </div>

                <button
                  type="button"
                  className="btn-review-details"
                  onClick={() => {
                    setSelectedApp(app);
                    setNewNoteText("");
                  }}
                >
                  📋 Full Screening Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Screening Review Modal */}
      {selectedApp && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="screening-modal-title"
        >
          <div className="admin-modal-card screening-modal-card">
            {/* Modal Header */}
            <div className="screening-modal-header">
              <div>
                <div className="screening-eyebrow">
                  <span>Application Reference #{selectedApp.id.slice(-6).toUpperCase()}</span>
                  <span>•</span>
                  <span>Submitted {formatDate(selectedApp.created_at)}</span>
                </div>
                <h2 id="screening-modal-title" className="screening-title">
                  {selectedApp.applicant_name}
                </h2>
                <div className="screening-companion-tag">
                  Applied for: <strong>{selectedApp.pet_name}</strong> ({selectedApp.pet_code})
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedApp(null)}
                aria-label="Close screening review"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - 5 Conversational Screening Sections */}
            <div className="adopt-modal-body screening-modal-body">
              {/* Status Pipeline Transition Selector */}
              <div className="screening-section status-section">
                <h4 className="section-heading">Update Application Pipeline Status</h4>
                <div className="status-button-group">
                  <button
                    type="button"
                    className={`btn-pipeline ${selectedApp.status === "new" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "new")}
                    disabled={isPending}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    className={`btn-pipeline ${selectedApp.status === "under_review" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "under_review")}
                    disabled={isPending}
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    className={`btn-pipeline ${selectedApp.status === "interview" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "interview")}
                    disabled={isPending}
                  >
                    Interview Scheduled
                  </button>
                  <button
                    type="button"
                    className={`btn-pipeline ${selectedApp.status === "meet_and_greet" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "meet_and_greet")}
                    disabled={isPending}
                  >
                    Meet &amp; Greet
                  </button>
                  <button
                    type="button"
                    className={`btn-pipeline approved ${selectedApp.status === "approved" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "approved")}
                    disabled={isPending}
                  >
                    ✅ Approved
                  </button>
                  <button
                    type="button"
                    className={`btn-pipeline rejected ${selectedApp.status === "rejected" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "rejected")}
                    disabled={isPending}
                  >
                    ❌ Declined
                  </button>
                  <button
                    type="button"
                    className={`btn-pipeline completed ${selectedApp.status === "completed" ? "active" : ""}`}
                    onClick={() => handleStatusChange(selectedApp.id, "completed")}
                    disabled={isPending}
                  >
                    🏆 Adoption Finalized
                  </button>
                </div>
              </div>

              {/* Direct Quick Contact Links */}
              <div className="screening-section contact-section">
                <h4 className="section-heading">Contact Prospective Adopter</h4>
                <div className="screening-contact-grid">
                  <div className="contact-box">
                    <span className="contact-label">Phone &amp; WhatsApp:</span>
                    <strong className="contact-val">{selectedApp.applicant_phone}</strong>
                    <div className="contact-actions">
                      <a
                        href={getWhatsAppUrl(selectedApp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-contact-action wa"
                      >
                        💬 Chat on WhatsApp
                      </a>
                      <a
                        href={`tel:${selectedApp.applicant_phone}`}
                        className="btn-contact-action tel"
                      >
                        📞 Call
                      </a>
                    </div>
                  </div>

                  <div className="contact-box">
                    <span className="contact-label">Email Address:</span>
                    <strong className="contact-val">{selectedApp.applicant_email}</strong>
                    <div className="contact-actions">
                      <a
                        href={`mailto:${selectedApp.applicant_email}`}
                        className="btn-contact-action email"
                      >
                        ✉️ Send Email
                      </a>
                    </div>
                  </div>

                  <div className="contact-box">
                    <span className="contact-label">City / Locality:</span>
                    <strong className="contact-val">{selectedApp.city}</strong>
                  </div>
                </div>
              </div>

              {/* Housing & Household Agreement */}
              <div className="screening-section">
                <h4 className="section-heading">🏡 Housing &amp; Living Arrangement</h4>
                <div className="screening-qa-grid">
                  <div className="qa-item">
                    <span className="qa-q">Type of Residence &amp; Compound Setup:</span>
                    <span className="qa-a">{selectedApp.residence_type}</span>
                  </div>
                  <div className="qa-item">
                    <span className="qa-q">All Household Members in Full Agreement?</span>
                    <span className="qa-a">
                      {selectedApp.family_agreement ? "✅ Yes, unanimous family agreement" : "⚠️ Needs clarification"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pet Experience & Current Pets */}
              <div className="screening-section">
                <h4 className="section-heading">🐾 Pet Experience &amp; Current Animals</h4>
                <div className="screening-qa-grid">
                  <div className="qa-item">
                    <span className="qa-q">Current Pets in Home:</span>
                    <span className="qa-a">{selectedApp.has_pets_currently}</span>
                  </div>
                  <div className="qa-item">
                    <span className="qa-q">Past Pet Ownership &amp; Medical Experience:</span>
                    <span className="qa-a">{selectedApp.past_pet_experience}</span>
                  </div>
                </div>
              </div>

              {/* Daily Schedule & Work Routine */}
              <div className="screening-section">
                <h4 className="section-heading">⏱️ Daily Schedule &amp; Time Alone</h4>
                <div className="screening-qa-grid">
                  <div className="qa-item">
                    <span className="qa-q">Average Hours Pet Will Be Left Alone Daily:</span>
                    <span className="qa-a">{selectedApp.hours_alone}</span>
                  </div>
                </div>
              </div>

              {/* Applicant Message & Motivation */}
              {selectedApp.message && (
                <div className="screening-section">
                  <h4 className="section-heading">💌 Applicant&apos;s Personal Note</h4>
                  <div className="applicant-quote-box">
                    <p className="applicant-quote-text">&ldquo;{selectedApp.message}&rdquo;</p>
                  </div>
                </div>
              )}

              {/* Internal Shelter Notes & Screening Logs */}
              <div className="screening-section notes-section">
                <h4 className="section-heading">📝 Shelter Staff Notes &amp; Audit Trail</h4>
                {selectedApp.internal_notes ? (
                  <div className="existing-notes-card">
                    {selectedApp.internal_notes.split("\n\n").map((note, idx) => (
                      <p key={idx} className="note-paragraph">
                        {note}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="no-notes-text">No notes recorded yet for this applicant.</p>
                )}

                <div className="add-note-box">
                  <label htmlFor="staff-note-input" className="add-note-label">
                    Add Volunteer Note / Screening Impression:
                  </label>
                  <textarea
                    id="staff-note-input"
                    className="admin-textarea"
                    rows={3}
                    placeholder="e.g. Conducted phone check on Nov 13. Very responsible family, compound wall is 6ft, scheduled meet-and-greet..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                  />
                  <div className="note-actions">
                    <button
                      type="button"
                      className="btn-save-note"
                      onClick={handleSaveNotes}
                      disabled={isPending || !newNoteText.trim()}
                    >
                      {isPending ? "Saving Note..." : "💾 Append Staff Note"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-actions screening-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setSelectedApp(null)}
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Drawer */}
      {showActivityDrawer && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-drawer-title"
        >
          <div className="admin-modal-card activity-drawer-card">
            <div className="screening-modal-header">
              <div>
                <span className="screening-eyebrow">Audit Trail &amp; Shelter History</span>
                <h2 id="activity-drawer-title" className="screening-title">
                  Activity Feed
                </h2>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowActivityDrawer(false)}
                aria-label="Close activity feed"
              >
                ✕
              </button>
            </div>

            <div className="adopt-modal-body activity-drawer-body">
              {activityLogs.length === 0 ? (
                <p className="no-notes-text">No organizational activity logged yet.</p>
              ) : (
                <div className="activity-feed-list">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="activity-feed-item">
                      <div className="activity-bullet" aria-hidden="true">
                        📌
                      </div>
                      <div className="activity-content">
                        <div className="activity-action-text">
                          {log.action === "update_application_status" && (
                            <span>
                              Updated application for{" "}
                              <strong>{log.details?.applicantName || "Applicant"}</strong> (
                              {log.details?.petName || "Pet"}) to{" "}
                              <span className="activity-status-tag">
                                {log.details?.newStatus?.replace(/_/g, " ")}
                              </span>
                            </span>
                          )}
                          {log.action === "mark_adopted" && (
                            <span>
                              Celebrated forever home for <strong>{log.details?.petName}</strong> with{" "}
                              <strong>{log.details?.adopter}</strong>! 🎉
                            </span>
                          )}
                          {log.action === "create_pet" && (
                            <span>
                              Added new rescue companion <strong>{log.details?.petName}</strong> (
                              {log.details?.adoptionCode}).
                            </span>
                          )}
                          {log.action === "update_application_notes" && (
                            <span>Updated screening notes for application.</span>
                          )}
                        </div>
                        <div className="activity-meta">
                          <span>{log.admin_email}</span>
                          <span>•</span>
                          <span>{getRelativeTime(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowActivityDrawer(false)}
              >
                Close Activity Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
