"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Engineer = { _id: string; name: string; email: string; phone?: string; active: boolean; createdAt?: string };

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminEngineersPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loadEngineers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/engineers", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load engineers.");
      setEngineers(Array.isArray(data.engineers) ? data.engineers : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load engineers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEngineers(); }, [loadEngineers]);

  async function createEngineer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/engineers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to create engineer.");
      setNotice(`Engineer account created for ${data.engineer.name} (${data.engineer.email}). Save the temporary password securely; it will not be shown again.`);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setShowPassword(false);
      await loadEngineers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create engineer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="engineerAdminPage">
      <header className="pageHeader">
        <a href="/dashboard/admin">← Admin Dashboard</a>
        <p className="eyebrow">TEAM MANAGEMENT</p>
        <h1>Engineer Accounts</h1>
        <p>Create engineer logins so you can assign accepted service tickets to the right person.</p>
      </header>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status">{notice}</div>}

      <div className="engineerAdminGrid">
        <section className="panel">
          <p className="eyebrow">NEW TEAM MEMBER</p>
          <h2>Create Engineer Account</h2>
          <p className="muted">The engineer will sign in using the same login page as admins and customers.</p>
          <form onSubmit={createEngineer}>
            <label>Engineer full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
            <label>Work email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
            <label>Phone number (optional)<input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
            <label>Temporary password (minimum 12 characters)
              <div className="passwordField"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} autoComplete="new-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>
            </label>
            <button className="primaryButton" type="submit" disabled={saving}>{saving ? "Creating account…" : "Create Engineer Account"}</button>
          </form>
          <p className="securityNote">Use a unique temporary password and share it privately. Never send passwords in a public message.</p>
        </section>

        <section className="panel">
          <div className="listHeader"><div><p className="eyebrow">TEAM DIRECTORY</p><h2>Engineer Accounts</h2></div><span className="count">{engineers.length}</span></div>
          {loading ? <p className="muted">Loading engineer accounts…</p> : engineers.length === 0 ? <div className="emptyState"><strong>No engineers created yet</strong><p>Create the first engineer account using the form.</p></div> : <div className="engineerList">
            {engineers.map((engineer) => <article className="engineerRow" key={engineer._id}>
              <div className="avatar">{engineer.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div className="engineerDetails"><strong>{engineer.name}</strong><span>{engineer.email}</span>{engineer.phone && <span>{engineer.phone}</span>}<small>Created {formatDate(engineer.createdAt)}</small></div>
              <span className={`status ${engineer.active ? "active" : "inactive"}`}>{engineer.active ? "Active" : "Inactive"}</span>
            </article>)}
          </div>}
        </section>
      </div>

      <style jsx>{`
        .engineerAdminPage{min-height:100vh;padding:34px;background:#f2f7fb;color:#173650;font-family:Arial,sans-serif}
        .pageHeader{max-width:1180px;margin:0 auto 24px}.pageHeader>a{display:inline-block;margin-bottom:24px;color:#0878bc;text-decoration:none;font-size:12px;font-weight:700}.eyebrow{margin:0 0 8px;color:#0878bc;font-size:10px;font-weight:800;letter-spacing:1.8px}.pageHeader h1{margin:0;font-size:30px}.pageHeader>p:last-child{color:#6f8498;font-size:13px}
        .engineerAdminGrid{max-width:1180px;margin:auto;display:grid;grid-template-columns:minmax(300px,.85fr) minmax(380px,1.15fr);gap:20px;align-items:start}.panel{padding:24px;background:#fff;border:1px solid #dce7f0;border-radius:14px;box-shadow:0 5px 18px #17365008}.panel h2{margin:0 0 10px;font-size:19px}.muted{color:#7c90a4;font-size:12px;line-height:1.6}.panel form{display:grid;gap:15px;margin-top:22px}.panel label{display:grid;gap:7px;color:#38546e;font-size:12px;font-weight:700}.panel input{width:100%;min-width:0;box-sizing:border-box;padding:12px;border:1px solid #d0dce7;border-radius:8px;font-size:13px;color:#173650;background:#fff}.passwordField{display:flex;gap:8px}.passwordField button{padding:0 13px;border:1px solid #d0dce7;border-radius:8px;background:#f5f9fc;color:#176da9;font-weight:700}.primaryButton{margin-top:5px;padding:13px;border:0;border-radius:8px;background:#0878bc;color:white;font-weight:800;cursor:pointer}.primaryButton:disabled{opacity:.6;cursor:wait}.securityNote{margin:16px 0 0;color:#8193a5;font-size:10px;line-height:1.6}.alert{max-width:1180px;margin:0 auto 16px;padding:13px 15px;border-radius:8px;font-size:12px}.error{background:#fff0f0;color:#b42318}.success{background:#e9f8ef;color:#187343}.listHeader{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.listHeader h2{margin:0}.count{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#e8f4fc;color:#0878bc;font-weight:800}.engineerList{display:grid}.engineerRow{display:flex;align-items:center;gap:12px;padding:15px 0;border-bottom:1px solid #edf2f6}.engineerRow:last-child{border-bottom:0}.avatar{flex:0 0 40px;width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:#e4f1fb;color:#176da9;font-weight:800;font-size:12px}.engineerDetails{flex:1;min-width:0;display:grid;gap:5px}.engineerDetails strong{font-size:13px}.engineerDetails span,.engineerDetails small{overflow-wrap:anywhere;color:#72889c;font-size:11px}.status{padding:5px 8px;border-radius:20px;font-size:10px;font-weight:800}.active{background:#e7f7ed;color:#187343}.inactive{background:#ffeded;color:#b42318}.emptyState{padding:30px 10px;text-align:center;color:#35516a}.emptyState p{color:#7c90a4;font-size:12px}
        @media(max-width:850px){.engineerAdminGrid{grid-template-columns:1fr}.engineerAdminPage{padding:20px 14px}.pageHeader h1{font-size:25px}}
      `}</style>
    </main>
  );
}
