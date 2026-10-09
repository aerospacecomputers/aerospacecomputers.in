"use client";

import { useCallback, useEffect, useState } from "react";

type Ticket = {
  _id: string; ticketNumber: string; status: string; approvedAmount: number;
  scheduledDate?: string | null; scheduledTime?: string | null; engineerNotes?: string | null;
  serviceRequestId?: { requestNumber?: string; subject?: string; description?: string; serviceType?: string } | null;
  customerId?: { name?: string; email?: string; phone?: string; customerType?: string } | null;
};

const steps = [
  { value: "accepted_by_engineer", label: "Accept assignment" },
  { value: "travelling", label: "Travelling" },
  { value: "on_site", label: "On site" },
  { value: "working", label: "Work started" },
  { value: "waiting", label: "Waiting / blocked" },
  { value: "completed", label: "Completed" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value || 0);
}
function date(value?: string | null) {
  if (!value) return "Not scheduled";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Not scheduled" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (part) => part.toUpperCase());
}

export default function EngineerDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});\n  const [filter, setFilter] = useState("all");\n  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/engineer/tickets", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load assigned tickets.");
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load assigned tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function updateTicket(ticket: Ticket, status: string) {
    setBusyId(ticket._id); setError(""); setNotice("");
    try {
      const response = await fetch("/api/engineer/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket._id, status, engineerNotes: notes[ticket._id] || "" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not update ticket.");
      setNotice(`${ticket.ticketNumber}: ${label(status)}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update ticket.");
    } finally { setBusyId(""); }
  }

  return (
    <main className="engineerPage">
      <header className="header">
        <div><p className="eyebrow">AEROSPACE OS · ENGINEER WORKSPACE</p><h1>My Assigned Tickets</h1><p className="muted">Review your assigned work, update progress, and record service notes.</p></div>
        <button className="refresh" onClick={() => void load()} disabled={loading}>Refresh</button>
      </header>
      <div className="stats">
        <button className={`stat ${filter === "today" ? "selected" : ""}`} onClick={() => setFilter("today")}><span>Today's tickets</span><strong>{tickets.filter((t) => dayKey(t.scheduledDate) === dayKey(new Date().toISOString()) && !closedStatuses.includes(t.status)).length}</strong><small>Scheduled today</small></button>
        <button className={`stat ${filter === "yesterday" ? "selected" : ""}`} onClick={() => setFilter("yesterday")}><span>Yesterday</span><strong>{tickets.filter((t) => dayKey(t.scheduledDate) === shiftDay(-1)).length}</strong><small>Yesterday's schedule</small></button>
        <button className={`stat ${filter === "pending" ? "selected" : ""}`} onClick={() => setFilter("pending")}><span>Pending work</span><strong>{tickets.filter((t) => !closedStatuses.includes(t.status)).length}</strong><small>Needs attention</small></button>
        <button className={`stat ${filter === "completed" ? "selected" : ""}`} onClick={() => setFilter("completed")}><span>Completed</span><strong>{tickets.filter((t) => closedStatuses.includes(t.status)).length}</strong><small>Finished / closed</small></button>
      </div>
      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status">{notice}</div>}
      <section className="toolbar">
        <div className="filters">{[["all","All tickets"],["today","Today"],["yesterday","Yesterday"],["pending","Pending"],["completed","Completed"]].map(([value, text]) => <button key={value} className={filter === value ? "filter activeFilter" : "filter"} onClick={() => setFilter(value)}>{text}</button>)}</div>
        <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket, customer, or issue…" aria-label="Search tickets" />
      </section>
      {loading ? <section className="empty">Loading your assigned tickets…</section> : tickets.length === 0 ? <section className="empty"><strong>No tickets assigned yet</strong><p>When an admin assigns a service ticket to your account, it will appear here.</p></section> :
        <section className="ticketList">{tickets.filter((ticket) => {
          const scheduled = dayKey(ticket.scheduledDate);
          const today = dayKey(new Date().toISOString());
          const yesterday = shiftDay(-1);
          const isDone = closedStatuses.includes(ticket.status);
          if (filter === "today" && (scheduled !== today || isDone)) return false;
          if (filter === "yesterday" && scheduled !== yesterday) return false;
          if (filter === "pending" && isDone) return false;
          if (filter === "completed" && !isDone) return false;
          const query = search.trim().toLowerCase();
          if (query && ![ticket.ticketNumber, ticket.serviceRequestId?.requestNumber, ticket.serviceRequestId?.subject, ticket.customerId?.name, ticket.customerId?.email].some((v) => (v || "").toLowerCase().includes(query))) return false;
          return true;
        }).map((ticket) => {
          const request = ticket.serviceRequestId;
          const customer = ticket.customerId;
          const options = ticket.status === "assigned" ? steps.slice(0, 1) : ticket.status === "completed" || ticket.status === "closed" || ticket.status === "cancelled" ? [] : steps.slice(1);
          return <article className="ticket" key={ticket._id}>
            <div className="ticketHead"><div><p className="eyebrow">SERVICE TICKET</p><h2>{ticket.ticketNumber}</h2><p className="muted">{request?.requestNumber || "Service request"}</p></div><span className={`status ${ticket.status === "completed" ? "done" : "active"}`}>{label(ticket.status)}</span></div>
            <div className="issue"><h3>{request?.subject || "Service request"}</h3><p>{request?.description || "No description provided."}</p><span>{request?.serviceType || "IT Support"}</span></div>
            <div className="details">
              <div><small>Customer</small><strong>{customer?.name || "Customer"}</strong><span>{customer?.email || ""}</span>{customer?.phone && <span>{customer.phone}</span>}</div>
              <div><small>Scheduled date</small><strong>{date(ticket.scheduledDate)}</strong><span>{ticket.scheduledTime || "Time not set"}</span></div>
              <div><small>Approved price</small><strong>{money(ticket.approvedAmount)}</strong></div>
            </div>
            {options.length > 0 && <div className="updateBox"><label>Work notes<textarea value={notes[ticket._id] ?? ticket.engineerNotes ?? ""} onChange={(e) => setNotes((current) => ({ ...current, [ticket._id]: e.target.value }))} placeholder="Record diagnosis, work done, or anything blocking progress." rows={3} maxLength={3000} /></label><div className="actions">{options.map((option) => <button key={option.value} onClick={() => void updateTicket(ticket, option.value)} disabled={busyId === ticket._id}>{busyId === ticket._id ? "Saving…" : option.label}</button>)}</div></div>}
            {ticket.status === "completed" && <div className="completed">This ticket is marked completed.</div>}
          </article>;
        })}</section>}
      <style jsx>{`
        .engineerPage{min-height:100vh;padding:32px;background:#f2f7fb;color:#173650;font-family:Arial,sans-serif}.header{max-width:1120px;margin:0 auto 22px;display:flex;align-items:center;justify-content:space-between;gap:18px}.eyebrow{margin:0 0 8px;color:#0878bc;font-size:10px;font-weight:800;letter-spacing:1.6px}.header h1{margin:0;font-size:30px}.muted{color:#71879c;font-size:12px;line-height:1.6}.refresh{border:1px solid #cbdbe8;background:#fff;color:#176da9;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer}.stats{max-width:1120px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.stat{padding:17px 18px;background:white;border:1px solid #dce7f0;border-radius:12px;display:grid;gap:7px;text-align:left;cursor:pointer;color:#173650}.stat.selected{border-color:#1683c5;box-shadow:0 0 0 2px #1683c51a}.stat span,.details small{font-size:11px;color:#7d91a5}.stat strong{font-size:25px}.stat small{font-size:10px;color:#8a9daf}.toolbar{max-width:1120px;margin:0 auto 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.filters{display:flex;gap:6px;flex-wrap:wrap}.filter{padding:9px 12px;border:1px solid #d6e2ec;border-radius:8px;background:#fff;color:#5e768b;font-size:11px;font-weight:700;cursor:pointer}.activeFilter{background:#0878bc;color:#fff;border-color:#0878bc}.search{width:260px;max-width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d0dce7;border-radius:8px;background:white;font-size:12px}.ticketList{max-width:1120px;margin:auto;display:grid;gap:16px}.ticket,.empty{background:#fff;border:1px solid #dce7f0;border-radius:14px;padding:22px;box-shadow:0 4px 16px #17365008}.ticketHead{display:flex;justify-content:space-between;align-items:start;gap:12px}.ticketHead h2{margin:0;font-size:19px}.status{padding:7px 10px;border-radius:20px;background:#e8f3ff;color:#176da9;font-size:10px;font-weight:800}.status.done{background:#e7f7ed;color:#187343}.issue{margin:18px 0;padding:16px;background:#f7fbff;border-radius:10px}.issue h3{margin:0 0 8px;font-size:15px}.issue p{font-size:12px;color:#607a92;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}.issue>span{font-size:10px;color:#176da9;font-weight:700}.details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.details>div{display:grid;align-content:start;gap:6px;padding:12px;border:1px solid #edf2f6;border-radius:9px;min-width:0}.details strong{font-size:12px}.details span{font-size:11px;color:#71879c;overflow-wrap:anywhere}.updateBox{margin-top:18px;padding-top:18px;border-top:1px solid #edf2f6}.updateBox label{display:grid;gap:8px;font-size:12px;font-weight:700;color:#38546e}.updateBox textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d0dce7;border-radius:8px;font:12px Arial,sans-serif;resize:vertical}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{padding:10px 13px;border:0;border-radius:8px;background:#0878bc;color:white;font-size:11px;font-weight:800;cursor:pointer}.actions button:disabled{opacity:.6}.alert{max-width:1120px;margin:0 auto 14px;padding:12px 14px;border-radius:8px;font-size:12px}.error{background:#fff0f0;color:#b42318}.success,.completed{background:#e9f8ef;color:#187343}.completed{margin-top:16px;padding:12px;border-radius:8px;font-size:12px}.empty{max-width:1076px;margin:auto;text-align:center;padding:45px 22px;color:#35516a}.empty p{color:#71879c;font-size:12px}@media(max-width:700px){.engineerPage{padding:20px 13px}.header{align-items:flex-start}.header h1{font-size:24px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat{padding:12px}.toolbar{align-items:stretch}.search{width:100%}.details{grid-template-columns:1fr}.ticket{padding:16px}}
      `}</style>
    </main>
  );
}
