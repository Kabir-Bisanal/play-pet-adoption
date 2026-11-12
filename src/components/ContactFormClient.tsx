"use client";

import { FormEvent, useState } from "react";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/config/site";

export default function ContactFormClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const compiledWaUrl = buildWhatsAppUrl(
    `Hi ${SITE_CONFIG.brandName} team,\nName: ${name || "Visitor"}\nPhone: ${phone || "N/A"}\nEnquiry: ${message || "Looking to know more about adopting a pet."}`
  );

  return (
    <div className="contact-form-card">
      <h3>Send Us a Message</h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.9rem",
          marginBottom: "22px",
        }}
      >
        Have a question about a specific dog or cat, visiting hours, or what
        your home needs? Drop us a note below.
      </p>

      {submitted ? (
        <div className="form-success">
          <p style={{ marginBottom: "12px" }}>
            Thank you, {name || "friend"}! Your enquiry details are ready. For
            the fastest response right now, send it straight to our care team on
            WhatsApp:
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a
              href={compiledWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-wa"
            >
              <span>💬</span> Send via WhatsApp Now
            </a>
            <button
              type="button"
              className="btn-card-view"
              onClick={() => {
                setSubmitted(false);
                setMessage("");
              }}
            >
              Write Another Note
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="contactName">Your Name *</label>
            <input
              id="contactName"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Rohan Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactPhone">Mobile / WhatsApp Number *</label>
            <input
              id="contactPhone"
              type="tel"
              required
              className="form-input"
              placeholder="+91 98XXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactEmail">Email Address</label>
            <input
              id="contactEmail"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactMessage">How can we help? *</label>
            <textarea
              id="contactMessage"
              required
              rows={4}
              className="form-textarea"
              placeholder="Tell us which pet you're curious about or when you'd like to visit..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Submit Enquiry
          </button>
        </form>
      )}
    </div>
  );
}
