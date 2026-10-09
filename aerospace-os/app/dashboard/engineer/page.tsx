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
        <header className="welcomeBanner"><div><h1>Good Morning, <strong>{engineerName.split(" ")[0]}!</strong></h1><p>Here is your service overview for today.</p></div><div className="welcomeArt" aria-hidden="true"><img src="/engineer-banner-hd.svg" alt="" /></div><div className="welcomeDate"><strong>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}<span className="sunIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></svg></span></strong><span>Have a safe and productive day!</span></div></header>

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
            <section className="sidePanel"><div className="panelHeading"><div><p className="eyebrow"><span className="bolt">ϟ</span>　QUICK ACTIONS</p><h2>Quick Actions</h2></div></div><div className="quickGrid">
              <button className="quickTile quickBlue" onClick={()=>{setFilter("pending");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>↻</span>Update Ticket Status</button>
              <button className="quickTile quickGreen" onClick={()=>{const t=tickets.find(x=>!closedStatuses.includes(x.status));if(t)setSelectedTicketId(t._id);else setNotice("No open ticket available for work notes.");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>▤</span>Add Work Notes</button>
              <button className="quickTile quickPurple" onClick={()=>{const t=tickets.find(x=>!closedStatuses.includes(x.status));if(t)setSelectedTicketId(t._id);else setNotice("No open ticket available.");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>♙</span>View Customer Details</button>
              <button className="quickTile quickAmber" onClick={()=>{const t=tickets.find(x=>x.status==="working"||x.status==="on_site"||x.status==="waiting"||x.status==="travelling"||x.status==="accepted_by_engineer");if(t)setSelectedTicketId(t._id);else setNotice("No ticket is ready to mark completed.");document.getElementById("ticket-workspace")?.scrollIntoView({behavior:"smooth"});}}><span>✓</span>Mark as Completed</button>
            </div></section>
            <section className="sidePanel"><div className="panelHeading"><div><p className="eyebrow">◷　RECENT UPDATES</p><h2>Recent Updates</h2></div><span className="panelLink">View All</span></div>{recentTickets.length ? recentTickets.map(ticket=><div className="miniItem updateItem" key={ticket._id}><span className="updateDot"/><div><strong>{ticket.ticketNumber}</strong><p>{label(ticket.status)}</p><small>{ticket.updatedAt ? date(ticket.updatedAt) : "Recently assigned"}</small></div></div>) : <p className="panelEmpty">Updates will appear when tickets are assigned.</p>}</section>
          </aside>
        </div>
      </div>
      <style jsx>{`.engineerShell{min-height:100vh;display:grid;grid-template-columns:290px minmax(0,1fr);background:#f3f8fd;color:#173650;font-family:Arial,Helvetica,sans-serif}.sidebar{position:fixed;inset:0 auto 0 0;width:290px;box-sizing:border-box;background:#fff;border-right:1px solid #e3ebf3;padding:24px 18px;z-index:20;display:flex;flex-direction:column;color:#65778a}.brand{display:flex;align-items:center;gap:16px;padding:5px 10px 24px;border-bottom:1px solid #edf1f5}.brandMark{display:flex;align-items:center;justify-content:flex-start;width:82px;height:58px;box-sizing:border-box;flex:0 0 82px;border-right:1px solid #dfe7ef;padding-right:14px;overflow:visible;background:transparent;border-radius:0}.brandMark img{display:block;width:58px;height:58px;max-width:58px;object-fit:contain;object-position:center;flex:0 0 58px}.brandText{min-width:0;flex:1}.brandText strong{display:block;color:#0870bd;font-size:17px;line-height:1.15;letter-spacing:.9px;white-space:nowrap}.brandText span{display:block;color:#687f95;font-size:13px;font-weight:500;margin-top:5px;text-align:center;width:100%}.engineerNav{margin-top:23px}.navTitle{color:#9aa8b7;font-size:9px;font-weight:800;letter-spacing:1.3px;padding:0 10px 8px}.nav{width:100%;box-sizing:border-box;border:0;background:transparent;border-radius:8px;padding:11px 10px;display:flex;align-items:center;gap:12px;color:#65778a;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:3px;text-align:left;text-decoration:none;min-height:43px}.nav:hover{background:#f0f7fd;color:#0870bd}.nav.active{background:#087ed0;color:#fff;box-shadow:0 5px 13px rgba(8,126,208,.18)}.navIcon{display:inline-flex;align-items:center;justify-content:center;width:19px;flex:0 0 19px;color:inherit}.navIcon svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.sidebarBottom{margin-top:auto}.supportStatus{margin-top:15px;background:#f3f8fc;border-radius:9px;padding:11px;display:flex;align-items:flex-start;gap:9px;color:#42617d}.supportStatus i{width:8px;height:8px;flex:0 0 8px;background:#20b56b;border-radius:50%;box-shadow:0 0 0 4px #dcf7e9;margin-top:5px}.supportStatus strong,.supportStatus span,.supportStatus small{display:block}.supportStatus strong{font-size:10px;color:#315a7b}.supportStatus span,.supportStatus small{font-size:9px;color:#738ba0;margin-top:3px}.main,.engineerPage{grid-column:2;min-width:0;min-height:100vh;padding:0 22px 28px;background:#f3f8fd;color:#173650}.logoutNav{margin-top:0}.sidebarFooter{display:none}.sideSectionLabel{display:none}.navIcon svg{vertical-align:middle}@media(max-width:850px){.engineerShell{grid-template-columns:74px minmax(0,1fr)}.sidebar{width:74px;padding:22px 10px}.brand{justify-content:center;padding:0 0 24px}.brandMark{width:42px;height:42px;flex-basis:42px;border:0;padding:0;justify-content:center}.brandMark img{width:40px;height:40px;max-width:40px}.brandText,.navTitle,.nav:not(.active){font-size:0}.engineerNav{margin-top:20px}.nav{justify-content:center;padding:0;min-height:45px;font-size:0}.navIcon{width:20px;flex-basis:20px}.sidebarBottom .nav{font-size:0}.supportStatus{display:none}.main,.engineerPage{padding-left:16px;padding-right:16px}}@media(max-width:760px){.engineerShell{grid-template-columns:1fr}.sidebar{position:relative;width:100%;inset:auto;min-height:0;padding:12px}.brand{justify-content:flex-start;padding:5px 10px 12px}.brandMark{width:42px;flex-basis:42px;border:0}.brandText{display:block}.engineerNav{display:flex;overflow:auto;margin-top:12px}.navTitle{display:none}.nav{width:auto;flex:0 0 auto;padding:10px;font-size:12px;justify-content:flex-start}.navIcon{width:19px;flex-basis:19px}.sidebarBottom{display:flex;align-items:center;gap:8px;margin-top:8px}.sidebarBottom .nav{width:auto}.supportStatus{display:none}.engineerPage{grid-column:1;padding:0 12px 18px}.topbar{margin:0 -12px 12px;padding:0 12px}.topSearch{width:52%;padding:8px}.topSearch span{font-size:10px}.engineerIdentity{gap:5px}.engineerIdentity .avatar{width:32px;height:32px}.welcomeBanner{padding:14px;gap:8px;min-height:90px}.welcomeBanner h1{font-size:22px}.welcomeBanner p{font-size:12px}.welcomeArt{display:none}.welcomeDate{white-space:normal}.welcomeDate strong{font-size:11px}.welcomeDate span{font-size:10px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat{padding:10px;gap:8px}.statIcon{width:35px;height:35px;flex-basis:35px;font-size:19px}.statArrow{display:none}.workspaceGrid{grid-template-columns:minmax(0,1fr)}.supportColumn{grid-template-columns:1fr}.tablePanel,.sidePanel{padding:12px}.tableTitle h2,.panelHeading h2{font-size:16px}.tableFilter{padding:8px;font-size:10px}.scheduleItem{grid-template-columns:14px 55px minmax(0,1fr) 12px;gap:5px}.scheduleEnd{grid-template-columns:14px 55px 1fr;gap:5px}}`}</style>
    </main>
  );
}
