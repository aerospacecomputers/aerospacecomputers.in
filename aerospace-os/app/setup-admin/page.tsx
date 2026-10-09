"use client";

import { FormEvent, useState } from "react";

export default function SetupAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, setupSecret }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Admin setup failed.");
      } else {
        setMessage("Admin account created. Go to /login and sign in with your new account.");
        setName("");
        setEmail("");
        setPassword("");
        setSetupSecret("");
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#eef5fb", fontFamily: "Arial, sans-serif" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 480, background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 18px 55px rgba(15, 40, 70, .12)" }}>
        <p style={{ color: "#1769aa", fontWeight: 700, letterSpacing: 1.5, fontSize: 12 }}>AEROSPACE OS</p>
        <h1 style={{ color: "#142b49", marginBottom: 8 }}>Create First Admin</h1>
        <p style={{ color: "#53657a", lineHeight: 1.5 }}>One-time setup for the initial administrator. This form will stop working once an admin account exists.</p>
        <label style={labelStyle}>Administrator name</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
        <label style={labelStyle}>Administrator email</label>
        <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
        <label style={labelStyle}>Strong password (at least 12 characters)</label>
        <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={12} autoComplete="new-password" required />
        <label style={labelStyle}>Admin setup secret</label>
        <input style={inputStyle} type="password" value={setupSecret} onChange={e => setSetupSecret(e.target.value)} autoComplete="off" required />
        {error && <p role="alert" style={{ color: "#b42318", background: "#fff0ef", padding: 12, borderRadius: 8 }}>{error}</p>}
        {message && <p role="status" style={{ color: "#176b3a", background: "#edfbf2", padding: 12, borderRadius: 8 }}>{message}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 16, padding: 14, border: 0, borderRadius: 8, background: loading ? "#8194aa" : "#1769aa", color: "#fff", fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>{loading ? "Creating admin..." : "Create Admin Account"}</button>
        <p style={{ marginTop: 18, color: "#6a7888", fontSize: 12, lineHeight: 1.5 }}>Keep your setup secret private. Never share this page with others. After setup, sign in through the normal login page.</p>
      </form>
    </main>
  );
}

const labelStyle = { display: "block", marginTop: 16, marginBottom: 7, color: "#253b54", fontSize: 14, fontWeight: 600 } as const;
const inputStyle = { width: "100%", boxSizing: "border-box" as const, padding: "12px 13px", border: "1px solid #cbd6e2", borderRadius: 8, fontSize: 15, outlineColor: "#1769aa" };
