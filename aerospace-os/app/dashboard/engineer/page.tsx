"use client";

import { useCallback, useEffect, useState } from "react";

type Ticket = {
  _id: string;
  ticketNumber: string;
  status: string;
  approvedAmount: number;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  engineerNotes?: string | null;
  updatedAt?: string;
  createdAt?: string;
  completedAt?: string | null;
  serviceRequestId?: { requestNumber?: string; subject?: string; description?: string; serviceType?: string } | null;
  customerId?: { name?: string; email?: string; phone?: string; customerType?: string } | null;
};

const closedStatuses = ["completed", "closed", "cancelled"];
const steps = [
  { value: "accepted_by_engineer", label: "Accept assignment" },
  { value: "travelling", label: "Travelling" },
  { value: "on_site", label: "On site" },
  { value: "working", label: "Work started" },
  { value: "waiting", label: "Waiting / blocked" },
  { value: "completed", label: "Completed" },
];

function dayKey(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shiftDay(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dayKey(d.toISOString());
}
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
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [engineerName, setEngineerName] = useState("Engineer");
  const [selectedTicketId, setSelectedTicketId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/engineer/tickets", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load assigned tickets.");
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      if (data.engineer?.name) setEngineerName(data.engineer.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load assigned tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function updateTicket(ticket: Ticket, status: string) {
    setBusyId(ticket._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/engineer/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket._id, status, engineerNotes: notes[ticket._id] || "" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not update ticket.");
      setNotice(`${ticket.ticketNumber}: ${label(status)}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update ticket.");
    } finally {
      setBusyId("");
    }
  }

  const todayKey = dayKey(new Date().toISOString());
  const overdueTickets = tickets.filter((t) => !closedStatuses.includes(t.status) && dayKey(t.scheduledDate) !== "" && dayKey(t.scheduledDate) < todayKey);
  const todayTickets = tickets.filter((t) => dayKey(t.scheduledDate) === todayKey && !closedStatuses.includes(t.status));
  const recentTickets = [...tickets].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()).slice(0, 4);
  const visibleTickets = tickets.filter((ticket) => {
    const scheduled = dayKey(ticket.scheduledDate);
    const isDone = closedStatuses.includes(ticket.status);
    if (filter === "today" && (scheduled !== todayKey || isDone)) return false;
    if (filter === "yesterday" && scheduled !== shiftDay(-1)) return false;
    if (filter === "pending" && isDone) return false;
    if (filter === "completed" && !isDone) return false;
    const query = search.trim().toLowerCase();
    if (query && ![ticket.ticketNumber, ticket.serviceRequestId?.requestNumber, ticket.serviceRequestId?.subject, ticket.customerId?.name, ticket.customerId?.email].some((v) => (v || "").toLowerCase().includes(query))) return false;
    return true;
  });

  return (
    <main className="engineerShell">
      <aside className="sidebar">
        <div className="sideBrand"><span className="brandMark">A</span><strong>AEROSPACE <b>OS</b></strong></div>
        <nav className="sideNav">
          <span className="navActive"><span className="navIcon">⌂</span> Dashboard</span>
          <button onClick={() => { setFilter("all"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}><span className="navIcon">▤</span> My Tickets</button>
          <button onClick={() => { setFilter("today"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}><span className="navIcon">▦</span> Today’s Schedule</button>
          <button onClick={() => { setFilter("completed"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}><span className="navIcon">☑</span> Completed Tickets</button>
        </nav>
        <div className="sidebarHelp"><span>♧</span><strong>Need Help?</strong><small>Contact Admin if you need any assistance.</small></div>
      </aside>

      <div className="engineerPage">
        <div className="topbar"><div className="topSearch">⌕ <span>Search tickets by number, customer name or issue...</span></div><div className="engineerIdentity"><span className="bell">♧<i>3</i></span><span className="avatar">👨‍🔧</span><span><strong>{engineerName}</strong><small>Engineer</small></span><span>⌄</span></div></div>
        <header className="welcomeBanner"><div><h1>Good Morning, <strong>{engineerName.split(" ")[0]}!</strong></h1><p>Here is your service overview for today.</p></div><div className="welcomeArt" aria-hidden="true">
            <svg viewBox="0 0 360 112" role="img" aria-label="Engineer working beside server equipment" xmlns="http://www.w3.org/2000/svg">
              <g opacity=".42" fill="#9ccdf6"><rect x="10" y="18" width="70" height="70" rx="5"/><rect x="16" y="24" width="58" height="58" rx="3" fill="#d9efff"/><circle cx="46" cy="52" r="18" fill="#b2dafa"/><path d="M30 68q16-20 32 0" fill="#a2cef4"/><circle cx="100" cy="25" r="8"/><circle cx="105" cy="78" r="6"/></g>
              <g stroke="#7ab7e7" strokeWidth="2" fill="#d5eaff"><rect x="228" y="18" width="58" height="27" rx="4"/><rect x="228" y="50" width="58" height="27" rx="4"/><rect x="228" y="82" width="58" height="24" rx="4"/></g>
              <g fill="#397bb1"><rect x="234" y="24" width="46" height="15" rx="3"/><rect x="234" y="56" width="46" height="15" rx="3"/><rect x="234" y="87" width="46" height="14" rx="3"/></g>
              <g fill="#92c7f1"><circle cx="239" cy="31" r="2"/><circle cx="239" cy="63" r="2"/><circle cx="239" cy="94" r="2"/><path d="M245 30h27M245 62h27M245 93h27" stroke="#a8d8fb" strokeWidth="2"/></g>
              <g transform="translate(292 8)" fill="#a6d2f7"><path d="M15 0l5 5 7-1 3 7 6 4-2 7 2 7-6 4-3 7-7-1-5 5-5-5-7 1-3-7-6-4 2-7-2-7 6-4 3-7 7 1z"/><circle cx="15" cy="22" r="8" fill="#e6f4ff"/></g>
              <g transform="translate(91 2)">
                <path d="M38 88L20 110h82L83 88" fill="#245f91"/><path d="M38 63L29 97h58L77 62" fill="#1678b9"/>
                <path d="M36 35q0-26 25-26t25 27l-5 25H42z" fill="#153a5e"/><path d="M41 33q2-24 21-22 18 1 20 25l-7 19H46z" fill="#f0b985"/><path d="M39 28q3-24 25-22 19 0 24 20l-18-7-16 5z" fill="#163e63"/><path d="M39 23q18-12 39-4l12 8-4-15-19-8-21 5z" fill="#174d7c"/><circle cx="57" cy="35" r="2" fill="#15324d"/><path d="M62 45q7 4 12-1" fill="none" stroke="#a65c43" strokeWidth="2" strokeLinecap="round"/>
                <path d="M34 62L18 83 8 77 25 52q5-6 12 0z" fill="#1678b9"/><path d="M78 61l17 17-7 7-21-14z" fill="#1678b9"/><path d="M13 73l15 8-5 9-15-7z" fill="#f0b985"/><path d="M84 76l13 5-4 9-14-6z" fill="#f0b985"/><path d="M43 65h28l9 31H35z" fill="#0879bd"/><path d="M46 67l12 12 10-12" fill="#e8f5ff"/><path d="M55 79h20l14 14H48z" fill="#163d5e"/><rect x="58" y="78" width="35" height="20" rx="2" fill="#123858" transform="rotate(9 58 78)"/><path d="M62 81l24 4" stroke="#7ac7ff" strokeWidth="2"/>
              </g>
            </svg>
          </div><div className="welcomeDate"><strong>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}　☀</strong><span>Have a safe and productive day!</span></div></header>

        <div className="stats">
          <button className={`stat statToday ${filter === "today" ? "selected" : ""}`} onClick={() => setFilter("today")}><span className="statIcon" aria-hidden="true">▦</span><span className="statCopy"><span>Today's tickets</span><strong>{todayTickets.length}</strong><small>Scheduled today</small></span><span className="statArrow">›</span></button>
          <button className={`stat statYesterday ${filter === "yesterday" ? "selected" : ""}`} onClick={() => setFilter("yesterday")}><span className="statIcon" aria-hidden="true">◷</span><span className="statCopy"><span>Yesterday</span><strong>{tickets.filter((t) => dayKey(t.scheduledDate) === shiftDay(-1)).length}</strong><small>Yesterday's schedule</small></span><span className="statArrow">›</span></button>
          <button className={`stat statPending ${filter === "pending" ? "selected" : ""}`} onClick={() => setFilter("pending")}><span className="statIcon" aria-hidden="true">◷</span><span className="statCopy"><span>Pending work</span><strong>{tickets.filter((t) => !closedStatuses.includes(t.status)).length}</strong><small>Needs attention</small></span><span className="statArrow">›</span></button>
          <button className={`stat statCompleted ${filter === "completed" ? "selected" : ""}`} onClick={() => setFilter("completed")}><span className="statIcon" aria-hidden="true">✓</span><span className="statCopy"><span>Completed</span><strong>{tickets.filter((t) => closedStatuses.includes(t.status)).length}</strong><small>Finished / closed</small></span><span className="statArrow">›</span></button>
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}
        {notice && <div className="alert success" role="status">{notice}</div>}

        <div className="workspaceGrid">
          <section className="workColumn" id="ticket-workspace">
            <div className="tablePanel"><div className="tableTitle"><h2>My Tickets</h2><button className="refresh" onClick={() => void load()} disabled={loading}>↻ Refresh</button></div>
              <div className="tableFilters">{[["all","All Tickets"],["today","Today"],["yesterday","Yesterday"],["pending","Pending"],["completed","Completed"]].map(([value,text]) => <button key={value} className={filter===value?"tableFilter activeTableFilter":"tableFilter"} onClick={()=>setFilter(value)}>{text}</button>)}</div>
              <input className="search tableSearch" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search ticket, customer, or issue…" aria-label="Search tickets"/>
              {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success" role="status">{notice}</div>}
              {loading ? <section className="empty">Loading your assigned tickets…</section> : visibleTickets.length===0 ? <section className="empty"><strong>{tickets.length?"No matching tickets":"No tickets assigned yet"}</strong><p>{tickets.length?"Try another filter or search term.":"When an admin assigns a service ticket to your account, it will appear here."}</p></section> : <div className="ticketTableWrap"><table className="ticketTable"><thead><tr><th>Ticket No.</th><th>Customer</th><th>Issue / Service</th><th>Scheduled Date &amp; Time</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleTickets.map(ticket=><tr key={ticket._id}><td><strong>{ticket.ticketNumber}</strong></td><td>{ticket.customerId?.name||"Customer"}<small>{ticket.customerId?.email||""}</small></td><td>{ticket.serviceRequestId?.subject||"Service request"}</td><td>{date(ticket.scheduledDate)}<small>{ticket.scheduledTime||"Time not set"}</small></td><td><span className={`tableStatus ${closedStatuses.includes(ticket.status)?"tableDone":ticket.status==="waiting"?"tableWaiting":"tableActive"}`}>{label(ticket.status)}</span></td><td><button className="viewButton" onClick={()=>setSelectedTicketId(selectedTicketId===ticket._id?"":ticket._id)}>{selectedTicketId===ticket._id?"Hide":"View"}　›</button></td></tr>)}</tbody></table></div>}
            </div>
            {selectedTicketId && (()=>{const ticket=tickets.find(t=>t._id===selectedTicketId);if(!ticket)return null;const options=ticket.status==="assigned"?steps.slice(0,1):closedStatuses.includes(ticket.status)?[]:steps.slice(1);return <article className="ticket detailTicket" key={ticket._id}><div className="ticketHead"><div><p className="eyebrow">TICKET DETAILS</p><h2>{ticket.ticketNumber}</h2><p className="muted">{ticket.serviceRequestId?.requestNumber||"Service request"}</p></div><span className={`status ${ticket.status==="completed"?"done":"active"}`}>{label(ticket.status)}</span></div><div className="issue"><h3>{ticket.serviceRequestId?.subject||"Service request"}</h3><p>{ticket.serviceRequestId?.description||"No description provided."}</p><span>{ticket.serviceRequestId?.serviceType||"IT Support"}</span></div><div className="details"><div><small>Customer</small><strong>{ticket.customerId?.name||"Customer"}</strong><span>{ticket.customerId?.email||""}</span>{ticket.customerId?.phone&&<span>{ticket.customerId.phone}</span>}</div><div><small>Scheduled date</small><strong>{date(ticket.scheduledDate)}</strong><span>{ticket.scheduledTime||"Time not set"}</span></div><div><small>Approved price</small><strong>{money(ticket.approvedAmount)}</strong></div></div>{options.length>0&&<div className="updateBox"><label>Work notes<textarea value={notes[ticket._id]??ticket.engineerNotes??""} onChange={(e)=>setNotes(current=>({...current,[ticket._id]:e.target.value}))} placeholder="Record diagnosis, work done, or anything blocking progress." rows={3} maxLength={3000}/></label><div className="actions">{options.map(option=><button key={option.value} onClick={()=>void updateTicket(ticket,option.value)} disabled={busyId===ticket._id}>{busyId===ticket._id?"Saving…":option.label}</button>)}</div></div>}{ticket.status==="completed"&&<div className="completed">This ticket is marked completed.</div>}</article>})()}
          </section>
          <aside className="supportColumn">
            <section className="sidePanel"><div className="panelHeading"><div><p className="eyebrow">ON THE CALENDAR</p><h2>Today’s schedule</h2></div><span className="panelIcon">◷</span></div>{todayTickets.length ? todayTickets.slice(0, 5).map((ticket) => <div className="scheduleItem" key={ticket._id}><span className="timeTag">{ticket.scheduledTime || "Time TBC"}</span><div><strong>{ticket.ticketNumber}</strong><p>{ticket.serviceRequestId?.subject || "Service visit"}</p><small>{ticket.customerId?.name || "Customer"}</small></div></div>) : <p className="panelEmpty">No tickets scheduled for today.</p>}<button className="textAction" onClick={() => { setFilter("today"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}>View today’s tickets →</button></section>
            <section className={`sidePanel ${overdueTickets.length ? "overduePanel" : ""}`}><div className="panelHeading"><div><p className="eyebrow">NEEDS ATTENTION</p><h2>Overdue ticket alerts</h2></div><span className="alertCount">{overdueTickets.length}</span></div>{overdueTickets.length ? overdueTickets.slice(0, 4).map((ticket) => <div className="miniItem" key={ticket._id}><strong>{ticket.ticketNumber}</strong><span>{ticket.serviceRequestId?.subject || "Service ticket"}</span><small>Scheduled {date(ticket.scheduledDate)}</small></div>) : <p className="panelEmpty">You’re all caught up. No overdue tickets.</p>}</section>
            <section className="sidePanel"><div className="panelHeading"><div><p className="eyebrow">SHORTCUTS</p><h2>Quick actions</h2></div><span className="panelIcon">↗</span></div><button className="quickAction" onClick={() => { setFilter("pending"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}>View pending work <span>→</span></button><button className="quickAction" onClick={() => { setFilter("today"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}>Open today’s tickets <span>→</span></button><button className="quickAction" onClick={() => { setFilter("completed"); document.getElementById("ticket-workspace")?.scrollIntoView({ behavior: "smooth" }); }}>Review completed work <span>→</span></button><button className="quickAction" onClick={() => void load()} disabled={loading}>Refresh dashboard <span>↻</span></button></section>
            <section className="sidePanel"><div className="panelHeading"><div><p className="eyebrow">LATEST ACTIVITY</p><h2>Recent updates</h2></div></div>{recentTickets.length ? recentTickets.map((ticket) => <div className="miniItem" key={ticket._id}><strong>{ticket.ticketNumber}</strong><span>{label(ticket.status)}</span><small>{ticket.updatedAt ? date(ticket.updatedAt) : "Recently assigned"}</small></div>) : <p className="panelEmpty">Updates will appear when tickets are assigned.</p>}</section>
          </aside>
        </div>
      </div>
      <style jsx>{`
        .engineerShell{min-height:100vh;display:grid;grid-template-columns:240px minmax(0,1fr);background:#f4f8fc;color:#173650;font-family:Arial,sans-serif}.sidebar{position:relative;left:auto;top:auto;bottom:auto;width:auto;background:#fff;border-right:1px solid #e1eaf2;padding:26px 16px;display:flex;flex-direction:column;min-height:100vh;box-sizing:border-box}.brandMark{width:42px;height:42px;border-radius:12px;background:#0878bc;color:white;display:grid;place-items:center;font-size:14px;font-weight:900}.brandText{display:grid;gap:4px;margin:12px 0 32px}.brandText strong{font-size:15px}.brandText small,.sidebarFoot small{font-size:10px;color:#8799aa}.sideNav{display:grid;gap:7px}.sideNav button,.sideNav span{width:100%;box-sizing:border-box;text-align:left;padding:12px 10px;border:0;border-radius:9px;background:transparent;color:#667f95;font-size:12px;font-weight:700;cursor:pointer}.sideNav .navActive{background:#eaf5ff;color:#0878bc}.sidebarFoot{margin-top:auto;border-top:1px solid #e9eff4;padding:18px 4px 0;font-size:11px;color:#426078;line-height:2}.onlineDot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#21a366;margin-right:7px}.engineerPage{min-width:0;min-height:100vh;padding:28px;background:#f4f8fc;color:#173650;font-family:Arial,sans-serif}.workspaceGrid{max-width:1360px;margin:auto;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(270px,.85fr);gap:18px;align-items:start}.workColumn,.supportColumn{min-width:0}.sectionHeading,.panelHeading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:4px 0 14px}.sectionHeading h2,.panelHeading h2{margin:0;font-size:17px}.countPill{padding:6px 9px;border-radius:20px;background:#e7f4ff;color:#0878bc;font-size:10px;font-weight:800}.supportColumn{display:grid;gap:14px}.sidePanel{background:#fff;border:1px solid #e0e9f1;border-radius:13px;padding:16px;box-shadow:0 4px 16px #17365006}.panelHeading{margin:0 0 12px}.panelIcon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#eef7ff;color:#0878bc}.scheduleItem{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;padding:12px 0;border-top:1px solid #edf2f6}.timeTag{align-self:start;background:#edf7ff;color:#0878bc;padding:6px 5px;border-radius:6px;text-align:center;font-size:10px;font-weight:800;overflow-wrap:anywhere}.scheduleItem strong,.miniItem strong{font-size:11px}.scheduleItem p{margin:4px 0;font-size:11px;color:#405d76;overflow-wrap:anywhere}.scheduleItem small,.miniItem small{font-size:10px;color:#8799aa}.panelEmpty{font-size:11px;color:#8799aa;line-height:1.6}.textAction{border:0;background:transparent;padding:10px 0 0;color:#0878bc;font-size:11px;font-weight:800;cursor:pointer}.overduePanel{border-color:#f0c9c5}.alertCount{display:grid;place-items:center;min-width:26px;height:26px;border-radius:50%;background:#fff0ef;color:#b42318;font-size:11px;font-weight:900}.miniItem{display:grid;gap:4px;padding:11px 0;border-top:1px solid #edf2f6}.miniItem span{font-size:11px;color:#59738a}.quickAction{width:100%;display:flex;justify-content:space-between;gap:8px;padding:12px 0;border:0;border-top:1px solid #edf2f6;background:#fff;color:#38546e;text-align:left;font-size:11px;font-weight:700;cursor:pointer}.quickAction span{color:#0878bc}.header{max-width:1360px;margin:0 auto 22px;display:flex;align-items:center;justify-content:space-between;gap:18px}.header{max-width:1120px;margin:0 auto 22px;display:flex;align-items:center;justify-content:space-between;gap:18px}.eyebrow{margin:0 0 8px;color:#0878bc;font-size:10px;font-weight:800;letter-spacing:1.6px}.header h1{margin:0;font-size:30px}.muted{color:#71879c;font-size:12px;line-height:1.6}.refresh{border:1px solid #cbdbe8;background:#fff;color:#176da9;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer}.stats{max-width:1120px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.stat{padding:16px 14px;background:white;border:1px solid #dce7f0;border-radius:12px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;color:#173650;min-width:0}.stat.selected{border-color:#1683c5;box-shadow:0 0 0 2px #1683c51a}.statIcon{flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;border-radius:13px;font-size:25px;font-weight:900}.statToday{background:linear-gradient(135deg,#edf7ff,#e4f2ff);border-color:#d8eaff}.statToday .statIcon{background:#d6eaff;color:#0878d1}.statYesterday{background:linear-gradient(135deg,#f5f0ff,#eee9ff);border-color:#e5dcff}.statYesterday .statIcon{background:#e5d9ff;color:#7041c5}.statPending{background:linear-gradient(135deg,#fff8e8,#fff2d8);border-color:#f8e9c7}.statPending .statIcon{background:#ffebbf;color:#bd7b0b}.statCompleted{background:linear-gradient(135deg,#eafaf1,#ddf7e8);border-color:#d1f0de}.statCompleted .statIcon{background:#c8f1dc;color:#0c9c63}.statCopy{display:grid;gap:7px;min-width:0}.statCopy>span,.details small{font-size:11px;color:#506b85}.statCopy strong{font-size:25px;line-height:1}.statCopy small{font-size:10px;color:#71879c}.statArrow{margin-left:auto;width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;border-radius:50%;background:#ffffff90;font-size:23px;color:#176da9}.statToday .statArrow{color:#0878d1}.statYesterday .statArrow{color:#7041c5}.statPending .statArrow{color:#bd7b0b}.statCompleted .statArrow{color:#0c9c63}.toolbar{max-width:1120px;margin:0 auto 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.filters{display:flex;gap:6px;flex-wrap:wrap}.filter{padding:9px 12px;border:1px solid #d6e2ec;border-radius:8px;background:#fff;color:#5e768b;font-size:11px;font-weight:700;cursor:pointer}.activeFilter{background:#0878bc;color:#fff;border-color:#0878bc}.search{width:260px;max-width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d0dce7;border-radius:8px;background:white;font-size:12px}.ticketList{max-width:1120px;margin:auto;display:grid;gap:16px}.ticket,.empty{background:#fff;border:1px solid #dce7f0;border-radius:14px;padding:22px;box-shadow:0 4px 16px #17365008}.ticketHead{display:flex;justify-content:space-between;align-items:start;gap:12px}.ticketHead h2{margin:0;font-size:19px}.status{padding:7px 10px;border-radius:20px;background:#e8f3ff;color:#176da9;font-size:10px;font-weight:800}.status.done{background:#e7f7ed;color:#187343}.issue{margin:18px 0;padding:16px;background:#f7fbff;border-radius:10px}.issue h3{margin:0 0 8px;font-size:15px}.issue p{font-size:12px;color:#607a92;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}.issue>span{font-size:10px;color:#176da9;font-weight:700}.details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.details>div{display:grid;align-content:start;gap:6px;padding:12px;border:1px solid #edf2f6;border-radius:9px;min-width:0}.details strong{font-size:12px}.details span{font-size:11px;color:#71879c;overflow-wrap:anywhere}.updateBox{margin-top:18px;padding-top:18px;border-top:1px solid #edf2f6}.updateBox label{display:grid;gap:8px;font-size:12px;font-weight:700;color:#38546e}.updateBox textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d0dce7;border-radius:8px;font:12px Arial,sans-serif;resize:vertical}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{padding:10px 13px;border:0;border-radius:8px;background:#0878bc;color:white;font-size:11px;font-weight:800;cursor:pointer}.actions button:disabled{opacity:.6}.alert{max-width:1120px;margin:0 auto 14px;padding:12px 14px;border-radius:8px;font-size:12px}.error{background:#fff0f0;color:#b42318}.success,.completed{background:#e9f8ef;color:#187343}.completed{margin-top:16px;padding:12px;border-radius:8px;font-size:12px}.empty{max-width:1076px;margin:auto;text-align:center;padding:45px 22px;color:#35516a}.empty p{color:#71879c;font-size:12px}@media(max-width:1100px){.engineerShell{grid-template-columns:190px minmax(0,1fr)}.engineerPage{padding:22px}.workspaceGrid{grid-template-columns:minmax(0,1fr)}.supportColumn{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.engineerShell{grid-template-columns:1fr}.sidebar{min-height:0;padding:14px 16px;display:grid;grid-template-columns:auto 1fr;align-items:center}.brandText{margin:0 0 0 10px}.sideNav{grid-column:1/-1;display:flex;overflow:auto;margin-top:12px}.sideNav>button,.sideNav>span{white-space:nowrap;width:auto}.sidebarFoot{display:none}.engineerPage{padding:20px 13px}.header{align-items:flex-start}.header h1{font-size:24px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat{padding:12px}.toolbar{align-items:stretch}.search{width:100%}.details{grid-template-columns:1fr}.ticket{padding:16px}.supportColumn{grid-template-columns:1fr}}
.sideBrand{display:flex;align-items:center;gap:10px;margin:0 0 34px;font-size:16px;letter-spacing:.4px;white-space:nowrap}.sideBrand strong{color:#f6fbff}.sideBrand b{color:#63c4ff}.sideBrand .brandMark{width:38px;height:38px;border-radius:10px;font-size:20px}.sidebar{background:linear-gradient(165deg,#0b223c,#102e4d 70%,#0b2038);color:#fff;border-right:0;padding:24px 10px;min-height:100vh}.sideNav{gap:8px}.sideNav>button,.sideNav>span{width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;gap:14px;padding:15px 14px;color:#e0ebf7;font-size:14px;border-radius:10px;white-space:nowrap}.sideNav .navActive{background:linear-gradient(90deg,#0876d1,#075cb1);color:#fff}.sideNav .navIcon{display:inline-grid;place-items:center;flex:0 0 22px;width:22px;padding:0;margin:0;font-size:21px;line-height:1}.sidebarHelp{margin-top:auto;padding:18px 14px;display:grid;gap:7px;border-radius:13px;background:#173b5d;color:#fff}.sidebarHelp>span{font-size:25px;color:#60b9ff}.sidebarHelp strong{font-size:14px}.sidebarHelp small{font-size:11px;line-height:1.6;color:#c0d6eb}.engineerPage{padding:0 22px 28px;background:#f4f8fc}.topbar{height:70px;display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 -22px 12px;padding:0 22px;background:#fff;border-bottom:1px solid #e5edf5}.topSearch{display:flex;align-items:center;gap:12px;width:min(490px,55%);padding:11px 14px;border:1px solid #e0e9f2;border-radius:10px;color:#7d93a8;font-size:24px}.topSearch span{font-size:12px}.engineerIdentity{display:flex;align-items:center;gap:12px;color:#15324f}.engineerIdentity>span:nth-last-child(2){display:grid;gap:4px}.engineerIdentity strong{font-size:13px}.engineerIdentity small{font-size:11px;color:#7b90a4}.bell{position:relative;font-size:23px}.bell i{position:absolute;right:-7px;top:-4px;display:grid;place-items:center;width:16px;height:16px;background:#dc2626;color:white;border-radius:50%;font-size:9px;font-style:normal}.avatar{display:grid;place-items:center;width:42px;height:42px;background:#e2f0ff;border-radius:50%;font-size:24px}.welcomeBanner{display:flex;align-items:center;gap:12px;min-height:106px;padding:20px 24px;margin-bottom:18px;border:1px solid #d9eafa;border-radius:13px;background:linear-gradient(110deg,#e4f2ff,#d9ecff 65%,#edf7ff);overflow:hidden}.welcomeBanner h1{margin:0 0 8px;font-size:30px;color:#112f50}.welcomeBanner h1 strong{color:#0878d1}.welcomeBanner p{margin:0;font-size:14px;color:#234b70}.welcomeArt{margin:auto;flex:0 1 360px;min-width:210px;height:112px;opacity:.95}.welcomeArt svg{display:block;width:100%;height:100%;overflow:visible}.welcomeDate{display:grid;gap:8px;text-align:right;white-space:nowrap;color:#123354}.welcomeDate strong{font-size:14px;color:#0878d1}.welcomeDate span{font-size:12px}.tablePanel{background:#fff;border:1px solid #e0eaf3;border-radius:14px;padding:18px 16px;box-shadow:0 4px 18px #163b5b08}.tableTitle{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.tableTitle h2{font-size:20px;margin:0}.tableFilters{display:flex;flex-wrap:wrap;margin-bottom:12px}.tableFilter{border:1px solid #e0e8f1;background:#fff;color:#5b7590;padding:9px 13px;font-size:12px}.tableFilter:first-child{border-radius:8px 0 0 8px}.tableFilter:last-child{border-radius:0 8px 8px 0}.activeTableFilter{background:#0875d1;color:white;border-color:#0875d1}.tableSearch{margin:0 0 12px;max-width:100%;width:100%}.ticketTableWrap{width:100%;overflow-x:auto;border:1px solid #e3ebf4;border-radius:10px}.ticketTable{width:100%;border-collapse:collapse;font-size:11px;text-align:left;min-width:680px}.ticketTable thead{background:#f4f8fc;color:#617b95}.ticketTable th{padding:12px 10px;font-weight:700;white-space:nowrap}.ticketTable td{padding:13px 10px;border-top:1px solid #e9eff5;vertical-align:middle;color:#193957}.ticketTable td strong{font-size:11px;white-space:nowrap}.ticketTable td small{display:block;margin-top:5px;color:#8296aa;font-size:10px}.ticketTable tbody tr:hover{background:#f8fbff}.tableStatus{display:inline-block;padding:6px 8px;border-radius:8px;font-size:10px;font-weight:800;background:#e0efff;color:#0874cb}.tableDone{background:#dff8eb;color:#07965a}.tableWaiting{background:#fff0d7;color:#b87800}.tableActive{background:#e0efff;color:#0874cb}.viewButton{padding:8px 10px;border:1px solid #8ec5ff;border-radius:7px;background:white;color:#0874cb;font-size:11px;font-weight:800;white-space:nowrap}.detailTicket{margin-top:16px}.workspaceGrid{grid-template-columns:minmax(0,1.65fr) minmax(270px,.75fr);gap:14px}.stats{max-width:none;margin:0 0 18px}.header{display:none}.toolbar{display:none}.ticketList{max-width:none}.supportColumn{gap:14px}.alert{max-width:none}@media(max-width:1100px){.workspaceGrid{grid-template-columns:minmax(0,1fr)}.welcomeArt{display:none}.welcomeDate{white-space:normal}}@media(max-width:700px){.engineerShell{grid-template-columns:1fr}.sidebar{min-height:0;padding:14px 16px}.sideNav{display:flex;overflow:auto}.sideNav button,.sideNav span{white-space:nowrap;width:auto}.sidebarHelp{display:none}.engineerPage{padding:0 13px 20px}.topbar{margin:0 -13px 12px;padding:0 13px}.topSearch{width:55%}.engineerIdentity{gap:6px}.engineerIdentity .avatar{width:32px;height:32px}.welcomeBanner{padding:16px;align-items:flex-start;flex-direction:column}.welcomeBanner h1{font-size:23px}.welcomeDate{text-align:left}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stat{padding:10px;gap:8px}.statIcon{width:35px;height:35px;flex-basis:35px;font-size:19px}.statArrow{display:none}.supportColumn{grid-template-columns:1fr}}`}</style>
    </main>
  );
}
