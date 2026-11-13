"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAdmin, AuthState } from "@/app/actions/auth";

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signInAdmin,
    { success: false }
  );

  return (
    <div className="admin-login-card">
      <div className="admin-login-header">
        <div className="admin-lock-icon" aria-hidden="true">
          🔐
        </div>
        <span className="admin-badge-tag">Rescue Operations</span>
        <h1 className="admin-login-title">Admin Portal</h1>
        <p className="admin-login-subtitle">
          Sign in to manage adoptable pet profiles, review incoming applications,
          and oversee adoption records.
        </p>
      </div>

      {state.error && (
        <div className="admin-error-banner" role="alert">
          <span aria-hidden="true">⚠️</span> {state.error}
        </div>
      )}

      <form action={formAction} className="admin-login-form" noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Admin Email Address <span className="req-star">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={state.email || ""}
            placeholder="e.g. admin@havenpaws.org"
            className="form-input"
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Admin Password <span className="req-star">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••••••"
            className="form-input"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-admin-submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="spinner-dot" aria-hidden="true" />
              Verifying Credentials...
            </>
          ) : (
            <>
              <span>🐾</span> Sign In to Admin Portal
            </>
          )}
        </button>
      </form>

      <div className="admin-login-footer">
        <p className="admin-auth-note">
          🔒 Authenticated securely via Supabase Auth (Single-Admin Organization).
        </p>
        <Link href="/" className="admin-back-link">
          ← Return to Public Website
        </Link>
      </div>
    </div>
  );
}
