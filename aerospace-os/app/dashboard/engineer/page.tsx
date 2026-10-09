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
        <div className="brand">
          <span className="brandMark" aria-label="Aerospace OS logo"><img src="/logo%20Dashboard.png" alt="Aerospace OS" /></span>
          <div className="brandText"><strong>AEROSPACE OS</strong><span>Engineer Portal</span></div>
        </div>
        <nav className="engineerNav" aria-label="Engineer navigation">
          <div className="navTitle">MAIN MENU</div>
          <button className="nav active" onClick={() => { setFilter("all"); window.scrollTo({top:0,behavior:"smooth"}); }}><span className="navIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>Dashboard</button>
          <button className="nav" onClick={() => { setFilter("all"); document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"}); }}><span className="navIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>My Tickets</button>
          <button className="nav" onClick={() => { setFilter("today"); document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"}); }}><span className="navIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M7 17h3"/></svg></span>Today’s Schedule</button>
          <button className="nav" onClick={() => { setFilter("completed"); document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"}); }}><span className="navIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></svg></span>Completed Tickets</button>
        </nav>
        <div className="sidebarBottom">
          <button className="nav" onClick={() => { setNotice("Contact your administrator if you need assistance."); }}><span className="navIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 10a3.5 3.5 0 0 1 7 0c0 2-3.5 2-3.5 5M12 18h.01"/></svg></span>Support</button>
          <a className="nav logoutNav" href="/api/auth/logout"><span className="navIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5"/><path d="M13 8l4 4-4 4M17 12H8"/></svg></span>Logout</a>
          <div className="supportStatus"><i/><div><strong>Support Online</strong><span>Aerospace Computers</span><small>IT Service Management</small></div></div>
        </div>
      </aside>

      <div className="engineerPage">
        <div className="topbar"><button className="menuButton" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><div className="topSearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.5 4.5"/></svg><span>Search tickets by number, customer name or issue...</span></div><div className="engineerIdentity"><span className="bell" aria-label="Notifications"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i>3</i></span><span className="avatar"><img src="/engineer-avatar.svg" alt="Engineer avatar" /></span><span className="identityText"><strong>{engineerName}</strong><small>Engineer</small></span><span className="profileChevron">⌄</span></div></div>
        <header className="welcomeBanner"><div><h1>Good Morning, <strong>{engineerName.split(" ")[0]}!</strong></h1><p>Here is your service overview for today.</p></div><div className="welcomeArt" aria-hidden="true"><img src="/Friendly%20Technician%20with%20Laptop%20and%20Servers.png" alt="" /></div><div className="welcomeDate"><strong>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}<span className="sunIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></svg></span></strong><span>Have a safe and productive day!</span></div></header>

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
            <section className="sidePanel schedulePanel"><div className="panelHeading"><div><p className="eyebrow">▦　TODAY'S SCHEDULE</p><h2>Today's Schedule</h2></div><button className="panelLink" onClick={() => { setFilter("today"); document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"}); }}>View All</button></div>
              <div className="scheduleTimeline">{todayTickets.length ? todayTickets.slice(0,4).map((ticket)=><div className="scheduleItem" key={ticket._id}><span className="timelineDot"/><span className="timeTag">{ticket.scheduledTime||"Time TBC"}</span><div><strong>{ticket.ticketNumber}</strong><p>{ticket.customerId?.name||"Customer"}</p><small>{ticket.serviceRequestId?.subject||"Service visit"}</small></div><button className="rowArrow" aria-label={`View ${ticket.ticketNumber}`} onClick={()=>setSelectedTicketId(ticket._id)}>›</button></div>) : <p className="panelEmpty">No tickets scheduled for today.</p>}</div>
              <div className="scheduleEnd"><span className="timelineDot mutedDot"/><span>05:00 PM</span><p>{todayTickets.length ? "Schedule continues as work progresses." : "No more tickets scheduled for today."}</p></div>
            </section>
            <section className={`sidePanel overduePanel ${overdueTickets.length ? "hasOverdue" : ""}`}><div className="panelHeading"><div><p className="eyebrow">NEEDS ATTENTION</p><h2>Overdue ticket alerts</h2></div><span className="alertCount">{overdueTickets.length}</span></div>{overdueTickets.length ? overdueTickets.slice(0,4).map(ticket=><div className="miniItem" key={ticket._id}><strong>{ticket.ticketNumber}</strong><span>{ticket.serviceRequestId?.subject||"Service ticket"}</span><small>Scheduled {date(ticket.scheduledDate)}</small></div>) : <p className="panelEmpty">You're all caught up. No overdue tickets.</p>}</section>
            <section className="sidePanel quickActionsPanel"><div className="quickActionsHeading"><span className="quickBolt" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13.2 2 4.8 13.1h5.8L9.8 22l9.4-12h-6.1z"/></svg></span><h2>Quick Actions</h2></div><div className="quickGrid">
              <button className="quickTile quickBlue" onClick={()=>{setFilter("pending");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>↻</span>Update Ticket Status</button>
              <button className="quickTile quickGreen" onClick={()=>{const t=tickets.find(x=>!closedStatuses.includes(x.status));if(t)setSelectedTicketId(t._id);else setNotice("No open ticket available for work notes.");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>▤</span>Add Work Notes</button>
              <button className="quickTile quickPurple" onClick={()=>{const t=tickets.find(x=>!closedStatuses.includes(x.status));if(t)setSelectedTicketId(t._id);else setNotice("No open ticket available.");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>♙</span>View Customer Details</button>
              <button className="quickTile quickAmber" onClick={()=>{const t=tickets.find(x=>x.status==="working"||x.status==="on_site"||x.status==="waiting"||x.status==="travelling"||x.status==="accepted_by_engineer");if(t)setSelectedTicketId(t._id);else setNotice("No ticket is ready to mark completed.");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>✓</span>Mark as Completed</button>
            </div></section>
            <section className="sidePanel"><div className="panelHeading"><div><p className="eyebrow">◷　RECENT UPDATES</p><h2>Recent Updates</h2></div><span className="panelLink">View All</span></div>{recentTickets.length ? recentTickets.map(ticket=><div className="miniItem updateItem" key={ticket._id}><span className="updateDot"/><div><strong>{ticket.ticketNumber}</strong><p>{label(ticket.status)}</p><small>{ticket.updatedAt ? date(ticket.updatedAt) : "Recently assigned"}</small></div></div>) : <p className="panelEmpty">Updates will appear when tickets are assigned.</p>}</section>
          </aside>
        </div>
      </div>
      <style jsx>{`
*{box-sizing:border-box}.engineerShell{min-height:100vh;display:grid;grid-template-columns:290px minmax(0,1fr);background:#f3f8fd;color:#102b46;font-family:Arial,Helvetica,sans-serif}.sidebar{position:fixed;inset:0 auto 0 0;width:290px;background:#fff;border-right:1px solid #e0e9f2;padding:24px 18px;z-index:20;display:flex;flex-direction:column;color:#61778d}.brand{display:flex;align-items:center;gap:16px;padding:5px 10px 24px;border-bottom:1px solid #edf1f5}.brandMark{width:82px;height:58px;flex:0 0 82px;display:flex;align-items:center;justify-content:flex-start;border-right:1px solid #dfe7ef;padding-right:14px}.brandMark img{display:block;width:58px;height:58px;max-width:58px;object-fit:contain}.brandText{min-width:0;flex:1}.brandText strong{display:block;color:#0870bd;font-size:17px;line-height:1.15;letter-spacing:.7px;white-space:nowrap}.brandText span{display:block;color:#687f95;font-size:13px;margin-top:5px;text-align:center}.engineerNav{margin-top:23px}.navTitle{color:#9aa8b7;font-size:9px;font-weight:800;letter-spacing:1.3px;padding:0 10px 8px}.nav{width:100%;min-height:43px;box-sizing:border-box;border:0;background:transparent;border-radius:8px;padding:11px 10px;display:flex;align-items:center;gap:12px;color:#65778a;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:3px;text-align:left;text-decoration:none}.nav:hover{background:#f0f7fd;color:#0870bd}.nav.active{background:#087ed0;color:#fff;box-shadow:0 5px 13px #087ed02e}.navIcon{display:inline-flex;align-items:center;justify-content:center;width:19px;flex:0 0 19px;color:inherit}.navIcon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.sidebarBottom{margin-top:auto}.supportStatus{margin-top:15px;background:#f3f8fc;border-radius:9px;padding:11px;display:flex;align-items:flex-start;gap:9px;color:#42617d}.supportStatus i{width:8px;height:8px;flex:0 0 8px;background:#20b56b;border-radius:50%;box-shadow:0 0 0 4px #dcf7e9;margin-top:5px}.supportStatus strong,.supportStatus span,.supportStatus small{display:block}.supportStatus strong{font-size:10px;color:#315a7b}.supportStatus span,.supportStatus small{font-size:9px;color:#738ba0;margin-top:3px}.engineerPage{grid-column:2;min-width:0;min-height:100vh;padding:22px 24px 30px;background:#f3f8fd;color:#102b46}.topbar{max-width:1500px;margin:0 auto 16px;min-height:48px;display:flex;align-items:center;gap:18px}.menuButton{width:38px;height:38px;border:0;background:transparent;color:#173650;display:grid;place-items:center;cursor:pointer}.menuButton svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.topSearch{height:44px;width:min(490px,55%);display:flex;align-items:center;gap:12px;padding:0 15px;background:#f8fbff;border:1px solid #d5e3f1;border-radius:10px;color:#72869a;font-size:12px}.topSearch svg{width:18px;height:18px;fill:none;stroke:#64819b;stroke-width:2}.engineerIdentity{margin-left:auto;display:flex;align-items:center;gap:10px}.bell{position:relative;display:grid;place-items:center;width:32px;height:36px;margin-right:5px}.bell svg{width:23px;height:23px;fill:none;stroke:#173650;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.bell i{position:absolute;right:-1px;top:-1px;display:grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#e52e3a;color:#fff;font-size:10px;font-style:normal;font-weight:800}.avatar{width:42px;height:42px;border-radius:50%;overflow:hidden;background:#e3f1ff;display:block;flex:0 0 42px}.avatar img{width:100%;height:100%;display:block;object-fit:contain}.identityText strong,.identityText small{display:block}.identityText strong{font-size:13px;color:#122e49}.identityText small{font-size:11px;color:#71869a;margin-top:3px}.profileChevron{color:#61778d;margin-left:4px}.welcomeBanner{max-width:1500px;min-height:106px;margin:0 auto 18px;padding:18px 24px;display:grid;grid-template-columns:minmax(260px,1fr) minmax(220px,390px) minmax(190px,auto);align-items:center;gap:18px;border:1px solid #d6e9fb;border-radius:14px;background:linear-gradient(105deg,#e0f0ff,#edf7ff);overflow:hidden}.welcomeBanner h1{margin:0;color:#102b46;font-size:30px;line-height:1.2;font-weight:750;letter-spacing:-.5px}.welcomeBanner h1 strong{color:#0879d1}.welcomeBanner p{margin:8px 0 0;color:#294c6b;font-size:14px}.welcomeArt{width:100%;height:88px;min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden}.welcomeArt img{display:block!important;width:100%!important;height:100%!important;max-width:390px!important;max-height:104px!important;object-fit:contain!important;object-position:center!important;border:0!important;border-radius:0!important;box-shadow:none!important}.welcomeDate{display:grid;justify-items:end;gap:7px;text-align:right;white-space:nowrap}.welcomeDate strong{display:flex;align-items:center;gap:10px;color:#0873cb;font-size:14px}.welcomeDate>span{color:#294c6b;font-size:12px}.sunIcon{display:inline-flex;width:22px;height:22px;color:#ffb516}.sunIcon svg{width:100%;height:100%;fill:#ffb516;stroke:#ffb516;stroke-width:1.5;stroke-linecap:round}.stats{max-width:1500px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.stat{min-width:0;padding:15px 16px;display:flex;align-items:center;gap:13px;text-align:left;border:1px solid #dce8f2;border-radius:13px;cursor:pointer;color:#102b46}.statToday{background:#e8f4ff;border-color:#d5e9fc}.statYesterday{background:#f0ebff;border-color:#e3d9ff}.statPending{background:#fff5df;border-color:#ffebc2}.statCompleted{background:#e1f8ed;border-color:#c9f0dd}.statIcon{width:48px;height:48px;flex:0 0 48px;display:grid;place-items:center;border-radius:14px;background:#d5eaff;color:#0878cf;font-size:27px;font-weight:700}.statYesterday .statIcon{background:#e3d7ff;color:#6a39c5}.statPending .statIcon{background:#ffebc1;color:#a96800}.statCompleted .statIcon{background:#c8f1df;color:#009e65}.statCopy{min-width:0;display:grid;gap:4px}.statCopy>span{font-size:11px;color:#526f8a}.statCopy strong{font-size:27px;line-height:1.1}.statCopy small{font-size:10px;color:#718aa0}.statArrow{margin-left:auto;width:30px;height:30px;flex:0 0 30px;display:grid;place-items:center;background:#ffffffa8;border-radius:50%;font-size:24px;color:#0878cf}.statYesterday .statArrow{color:#6a39c5}.statPending .statArrow{color:#a96800}.statCompleted .statArrow{color:#009e65}.stat.selected{outline:2px solid #1683c5;outline-offset:1px}.workspaceGrid{max-width:1500px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.9fr);gap:14px;align-items:start}.workColumn,.supportColumn{min-width:0}.tablePanel,.sidePanel{background:#fff;border:1px solid #e0e9f1;border-radius:14px;padding:16px;box-shadow:0 4px 18px #17365008}.tableTitle,.panelHeading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px}.tableTitle h2,.panelHeading h2{margin:0;font-size:18px;color:#102b46}.refresh{border:1px solid #cbdbe8;background:#fff;color:#176da9;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}.refresh:disabled{opacity:.6}.tableFilters{display:flex;gap:0;flex-wrap:wrap;margin-bottom:12px}.tableFilter{padding:9px 12px;border:1px solid #d6e2ec;border-right:0;background:#fff;color:#5e768b;font-size:11px;cursor:pointer}.tableFilter:first-child{border-radius:8px 0 0 8px}.tableFilter:last-child{border-right:1px solid #d6e2ec;border-radius:0 8px 8px 0}.activeTableFilter{background:#0878bc;color:#fff;border-color:#0878bc}.search{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d0dce7;border-radius:8px;background:white;font-size:12px}.tableSearch{margin-bottom:12px}.ticketTableWrap{width:100%;overflow-x:auto;border:1px solid #e4edf5;border-radius:10px}.ticketTable{width:100%;border-collapse:collapse;font-size:11px;text-align:left}.ticketTable th{padding:12px 10px;background:#f4f8fc;color:#607891;font-weight:700;white-space:nowrap;border-bottom:1px solid #e3ebf3}.ticketTable td{padding:12px 10px;color:#173650;border-bottom:1px solid #edf2f7;vertical-align:middle}.ticketTable tr:last-child td{border-bottom:0}.ticketTable td strong{font-size:10px;white-space:nowrap}.ticketTable td small{display:block;margin-top:5px;font-size:9px;color:#7d91a5;overflow-wrap:anywhere}.tableStatus{display:inline-block;padding:6px 8px;border-radius:8px;background:#e0f0ff;color:#0878bc;font-size:10px;font-weight:800}.tableDone{background:#dff7e9;color:#17824f}.tableWaiting{background:#fff0d8;color:#ad6500}.viewButton{padding:8px 10px;border:1px solid #85bfff;border-radius:8px;background:#fff;color:#0878cf;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}.supportColumn{display:grid;gap:13px}.panelHeading{margin-bottom:12px}.eyebrow{margin:0 0 7px;color:#0878bc;font-size:10px;font-weight:800;letter-spacing:1.5px}.panelHeading h2{font-size:16px}.panelLink{border:0;background:transparent;color:#0878cf;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}.scheduleTimeline{border-top:1px solid #edf2f6}.scheduleItem{display:grid;grid-template-columns:64px minmax(0,1fr) 18px;gap:10px;align-items:start;padding:12px 0;border-bottom:1px solid #edf2f6}.timeTag{align-self:start;background:#edf7ff;color:#0878bc;padding:7px 5px;border-radius:6px;text-align:center;font-size:10px;font-weight:800;overflow-wrap:anywhere}.scheduleItem strong,.miniItem strong{font-size:11px;color:#173650}.scheduleItem p{margin:5px 0;font-size:11px;color:#405d76;overflow-wrap:anywhere}.scheduleItem small,.miniItem small{font-size:10px;color:#8799aa;line-height:1.5}.rowArrow{border:0;background:transparent;color:#5882a8;font-size:22px;cursor:pointer}.scheduleEnd{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;padding:12px 0 0;color:#7b8fa3;font-size:11px}.scheduleEnd p{margin:0;line-height:1.5}.timelineDot{display:none}.panelEmpty{font-size:11px;color:#8799aa;line-height:1.6;margin:8px 0}.overduePanel{border-color:#e0e9f1}.alertCount{display:grid;place-items:center;min-width:26px;height:26px;border-radius:50%;background:#fff0ef;color:#b42318;font-size:11px;font-weight:900}.miniItem{display:grid;gap:4px;padding:10px 0;border-top:1px solid #edf2f6}.miniItem span{font-size:11px;color:#59738a}.quickActionsPanel{padding:12px 12px 13px;border-radius:10px;box-shadow:0 2px 8px #17365008}.quickActionsHeading{display:flex;align-items:center;gap:7px;margin:0 0 10px;color:#0878cf}.quickActionsHeading h2{margin:0;color:#102b46;font-size:14px;font-weight:800}.quickBolt{display:inline-flex;align-items:center;justify-content:center;width:16px;height:20px;line-height:1;color:#0878cf}.quickBolt svg{display:block;width:16px;height:20px;fill:currentColor;stroke:none}.quickActionsPanel .quickGrid{gap:8px}.quickActionsPanel .quickTile{min-height:58px;padding:8px 6px;gap:5px;border-radius:9px;font-size:10px;font-weight:700;line-height:1.25;transition:transform .16s ease,box-shadow .16s ease,filter .16s ease;cursor:pointer}.quickActionsPanel .quickTile>span{font-size:20px;line-height:1.1}.quickActionsPanel .quickTile:hover{transform:translateY(-2px);box-shadow:0 5px 12px #1736501c;filter:saturate(1.08)}.quickActionsPanel .quickTile:active{transform:translateY(0) scale(.98)}.quickActionsPanel .quickTile:focus-visible{outline:2px solid #0878cf;outline-offset:2px}.quickActionsPanel .quickBlue{background:#e7f3ff;color:#0878cf}.quickActionsPanel .quickGreen{background:#e4f8ee;color:#009e65}.quickActionsPanel .quickPurple{background:#f0eaff;color:#6c3dc6}.quickActionsPanel .quickAmber{background:#fff4dc;color:#a96800}.quickGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.quickTile{min-height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:10px 6px;border:0;border-radius:10px;font-size:10px;font-weight:700;cursor:pointer}.quickTile>span{font-size:23px;font-weight:800}.quickBlue{background:#e7f3ff;color:#0878cf}.quickGreen{background:#e4f8ee;color:#009e65}.quickPurple{background:#f0eaff;color:#6c3dc6}.quickAmber{background:#fff4dc;color:#a96800}.bolt{font-size:17px}.updateItem{display:flex;gap:10px;align-items:flex-start}.updateItem p{margin:4px 0;font-size:11px;color:#526f8a}.updateItem>div{display:grid;gap:4px}.ticket{margin-top:14px;background:#fff;border:1px solid #dce7f0;border-radius:14px;padding:20px;box-shadow:0 4px 16px #17365008}.ticketHead{display:flex;justify-content:space-between;align-items:start;gap:12px}.ticketHead h2{margin:0;font-size:19px}.muted{color:#71879c;font-size:12px;line-height:1.6}.status{padding:7px 10px;border-radius:20px;background:#e8f3ff;color:#176da9;font-size:10px;font-weight:800}.status.done{background:#e7f7ed;color:#187343}.issue{margin:18px 0;padding:16px;background:#f7fbff;border-radius:10px}.issue h3{margin:0 0 8px;font-size:15px}.issue p{font-size:12px;color:#607a92;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}.issue>span{font-size:10px;color:#176da9;font-weight:700}.details{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.details>div{display:grid;align-content:start;gap:6px;padding:12px;border:1px solid #edf2f6;border-radius:9px;min-width:0}.details small{font-size:11px;color:#7d91a5}.details strong{font-size:12px}.details span{font-size:11px;color:#71879c;overflow-wrap:anywhere}.updateBox{margin-top:18px;padding-top:18px;border-top:1px solid #edf2f6}.updateBox label{display:grid;gap:8px;font-size:12px;font-weight:700;color:#38546e}.updateBox textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid #d0dce7;border-radius:8px;font:12px Arial,sans-serif;resize:vertical}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.actions button{padding:10px 13px;border:0;border-radius:8px;background:#0878bc;color:white;font-size:11px;font-weight:800;cursor:pointer}.alert{margin:0 auto 14px;padding:12px 14px;border-radius:8px;font-size:12px}.error{background:#fff0f0;color:#b42318}.success,.completed{background:#e9f8ef;color:#187343}.completed{margin-top:16px;padding:12px;border-radius:8px;font-size:12px}.empty{margin:auto;text-align:center;padding:45px 22px;color:#35516a;background:#fff;border:1px solid #dce7f0;border-radius:14px}.empty p{color:#71879c;font-size:12px}.sidebarFooter,.sideSectionLabel{display:none}
@media(max-width:1100px){.engineerShell{grid-template-columns:240px minmax(0,1fr)}.sidebar{width:240px}.workspaceGrid{grid-template-columns:minmax(0,1fr)}.supportColumn{grid-template-columns:repeat(2,minmax(0,1fr))}.welcomeBanner{grid-template-columns:minmax(0,1fr) 260px minmax(170px,auto)}.welcomeBanner h1{font-size:25px}}
@media(max-width:850px){.engineerShell{grid-template-columns:74px minmax(0,1fr)}.sidebar{width:74px;padding:22px 10px}.brand{justify-content:center;padding:0 0 24px}.brandMark{width:42px;height:42px;flex-basis:42px;border:0;padding:0;justify-content:center}.brandMark img{width:40px;height:40px;max-width:40px}.brandText,.navTitle{display:none}.engineerNav{margin-top:20px}.nav{justify-content:center;padding:0;min-height:45px;font-size:0}.navIcon{width:20px;flex-basis:20px}.sidebarBottom .nav{font-size:0}.supportStatus{display:none}.welcomeBanner{grid-template-columns:minmax(0,1fr) 200px;gap:10px}.welcomeDate{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center}.welcomeArt{height:70px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.engineerPage{padding:16px}.topbar{gap:8px}.topSearch{width:45%}}
@media(max-width:760px){.engineerShell{grid-template-columns:1fr}.sidebar{position:relative;width:100%;inset:auto;min-height:0;padding:12px}.brand{justify-content:flex-start;padding:5px 10px 12px}.brandMark{width:42px;flex-basis:42px;border:0}.brandText{display:block}.engineerNav{display:flex;overflow:auto;margin-top:12px}.navTitle{display:none}.nav{width:auto;flex:0 0 auto;padding:10px;font-size:12px;justify-content:flex-start}.navIcon{width:19px;flex-basis:19px}.sidebarBottom{display:flex;align-items:center;gap:8px;margin-top:8px}.sidebarBottom .nav{width:auto}.supportStatus{display:none}.engineerPage{grid-column:1;padding:0 12px 18px}.topbar{margin:0 -12px 12px;padding:0 12px}.topSearch{width:52%;padding:8px}.topSearch span{font-size:10px}.engineerIdentity{gap:5px}.engineerIdentity .avatar{width:32px;height:32px;flex-basis:32px}.welcomeBanner{padding:14px;gap:8px;min-height:90px;grid-template-columns:minmax(0,1fr) 110px}.welcomeBanner h1{font-size:22px}.welcomeBanner p{font-size:12px}.welcomeArt{height:60px}.welcomeDate{grid-column:1/-1;white-space:normal}.welcomeDate strong{font-size:11px}.welcomeDate>span{font-size:10px}.stats{gap:8px}.stat{padding:10px;gap:8px}.statIcon{width:35px;height:35px;flex-basis:35px;font-size:19px}.statArrow{display:none}.supportColumn{grid-template-columns:1fr}.tablePanel,.sidePanel{padding:12px}.tableTitle h2,.panelHeading h2{font-size:16px}.tableFilter{padding:8px;font-size:10px}.scheduleItem{grid-template-columns:55px minmax(0,1fr) 14px;gap:5px}.scheduleEnd{grid-template-columns:55px 1fr;gap:5px}.details{grid-template-columns:1fr}.ticket{padding:14px}.topSearch span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
`}</style>
    </main>
  );
}
