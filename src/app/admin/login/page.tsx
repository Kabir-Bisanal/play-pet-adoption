import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";
import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: `Admin Login — ${SITE_CONFIG.brandName}`,
  description: "Sign in to Haven Paws Rescue Administration Portal.",
};

export default function AdminLoginPage() {
  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <AdminLoginForm />
      </div>
    </div>
  );
}
