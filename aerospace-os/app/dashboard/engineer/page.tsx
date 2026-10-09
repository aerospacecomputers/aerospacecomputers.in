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
        <div className="topbar"><button className="menuButton" aria-label="Open navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><div className="topSearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.5 4.5"/></svg><span>Search tickets by number, customer name or issue...</span></div><div className="engineerIdentity"><span className="bell" aria-label="Notifications"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i>3</i></span><span className="avatar"><svg viewBox="0 0 48 48" aria-label="Engineer avatar"><circle cx="24" cy="24" r="23" fill="#d8edff"/><path d="M9 44q2-14 15-14t15 14" fill="#1678b9"/><path d="M15 20q0-13 9-13t9 13l-3 10H18z" fill="#f0bd8b"/><path d="M13 17q1-12 11-12t12 12l-4-3H17z" fill="#f4bb2b" stroke="#164b77" strokeWidth="2"/><path d="M16 15h16v4H16z" fill="#f4bb2b"/><circle cx="20" cy="21" r="1.5" fill="#173b5b"/><circle cx="28" cy="21" r="1.5" fill="#173b5b"/><path d="M20 26q4 3 8 0" fill="none" stroke="#9d5841" strokeWidth="1.5"/></svg></span><span className="identityText"><strong>{engineerName}</strong><small>Engineer</small></span><span className="profileChevron">⌄</span></div></div>
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
      <style jsx>{`.engineerShell{min-height:100vh;display:grid;grid-template-columns:240px minmax(0,1fr);background:#f2f7fc;color:#102c4b;font-family:Arial,Helvetica,sans-serif}.sidebar{position:relative;background:linear-gradient(180deg,#102b48,#0c2947);color:#fff;padding:20px 9px;display:flex;flex-direction:column;min-height:100vh;box-sizing:border-box}.sideBrand{display:flex;align-items:center;gap:10px;margin:0 0 32px;font-size:16px;letter-spacing:.2px;white-space:nowrap;padding:0 2px}.sideBrand strong{color:#f6fbff}.sideBrand b{color:#63c4ff}.brandMark{width:38px;height:38px;border-radius:10px;background:#0878bc;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:900}.sideNav{display:grid;gap:7px}.sideNav>button,.sideNav>span{width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:flex-start;gap:13px;padding:14px 13px;color:#e0ebf7;font-size:14px;border:0;border-radius:10px;background:transparent;text-align:left;white-space:nowrap;font-weight:700;cursor:pointer}.sideNav .navActive{background:linear-gradient(90deg,#0876d1,#075cb1);color:#fff}.sideNav .navIcon{display:inline-grid;place-items:center;flex:0 0 22px;width:22px;font-size:21px;line-height:1;color:inherit}.sidebarHelp{margin-top:auto;padding:17px 13px;display:grid;gap:7px;border-radius:13px;background:#173b5d;color:#fff}.sidebarHelp>span{font-size:25px;color:#60b9ff}.sidebarHelp strong{font-size:14px}.sidebarHelp small{font-size:11px;line-height:1.6;color:#c0d6eb}.engineerPage{min-width:0;min-height:100vh;padding:0 22px 28px;background:#f3f8fd;color:#173650}.topbar{height:70px;display:flex;align-items:center;gap:26px;margin:0 -22px 12px;padding:0 26px;background:#fff;border-bottom:1px solid #e5edf5}.menuButton{width:32px;height:38px;padding:4px;border:0;background:transparent;color:#102c4b;flex:0 0 32px}.menuButton svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.topSearch{display:flex;align-items:center;gap:14px;width:min(490px,55%);padding:10px 14px;border:1px solid #d7e5f5;border-radius:10px;color:#6f88a2;background:#f8fbff}.topSearch svg{width:20px;height:20px;flex:0 0 20px;fill:none;stroke:#617b95;stroke-width:2;stroke-linecap:round}.topSearch span{font-size:12px}.engineerIdentity{display:flex;align-items:center;gap:12px;color:#15324f;margin-left:auto}.identityText{display:grid;gap:4px}.engineerIdentity strong{font-size:13px}.engineerIdentity small{font-size:11px;color:#7b90a4}.bell{position:relative;display:grid;place-items:center;width:32px;height:36px;color:#102c4b}.bell svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.bell i{position:absolute;right:-2px;top:-1px;display:grid;place-items:center;width:17px;height:17px;background:#dc2626;color:#fff;border-radius:50%;font-size:10px;font-style:normal}.avatar{display:grid;place-items:center;width:44px;height:44px;background:#e2f0ff;border-radius:50%;overflow:hidden}.avatar svg{width:100%;height:100%;display:block}.profileChevron{font-size:20px;margin-left:4px}.sunIcon{display:inline-grid;place-items:center;width:25px;height:25px;color:#f8b91f}.sunIcon svg{width:24px;height:24px;fill:#f8b91f;stroke:#f8b91f;stroke-width:1.8;stroke-linecap:round}.welcomeBanner{display:flex;align-items:center;gap:12px;min-height:106px;padding:15px 24px;margin-bottom:18px;border:1px solid #d9eafa;border-radius:13px;background:linear-gradient(110deg,#e4f2ff,#d9ecff 65%,#edf7ff);overflow:hidden}.welcomeBanner h1{margin:0 0 8px;font-size:30px;color:#112f50}.welcomeBanner h1 strong{color:#0878d1}.welcomeBanner p{margin:0;font-size:14px;color:#234b70}.welcomeArt{margin:auto;flex:0 1 405px;min-width:260px;height:112px;opacity:1}.welcomeArt img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;image-rendering:auto}.welcomeDate{display:grid;gap:8px;text-align:right;white-space:nowrap;color:#123354}.welcomeDate strong{font-size:14px;color:#0878d1;display:flex;align-items:center;justify-content:flex-end;gap:8px}.sunIcon{font-size:22px;color:#f7b928;line-height:1;text-shadow:0 1px 1px #e7a51b}.welcomeDate span{font-size:12px}.stats{margin:0 0 18px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.stat{padding:16px 14px;background:#fff;border:1px solid #dce7f0;border-radius:12px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;color:#173650;min-width:0}.stat.selected{border-color:#1683c5;box-shadow:0 0 0 2px #1683c51a}.statIcon{flex:0 0 48px;width:48px;height:48px;display:grid;place-items:center;border-radius:13px;font-size:25px;font-weight:900}.statToday{background:linear-gradient(135deg,#edf7ff,#e4f2ff);border-color:#d8eaff}.statToday .statIcon{background:#d6eaff;color:#0878d1}.statYesterday{background:linear-gradient(135deg,#f5f0ff,#eee9ff);border-color:#e5dcff}.statYesterday .statIcon{background:#e5d9ff;color:#7041c5}.statPending{background:linear-gradient(135deg,#fff8e8,#fff2d8);border-color:#f8e9c7}.statPending .statIcon{background:#ffebbf;color:#bd7b0b}.statCompleted{background:linear-gradient(135deg,#eafaf1,#ddf7e8);border-color:#d1f0de}.statCompleted .statIcon{background:#c8f1dc;color:#0c9c63}.statCopy{display:grid;gap:7px;min-width:0}.statCopy>span{font-size:11px;color:#506b85}.statCopy strong{font-size:25px;line-height:1}.statCopy small{font-size:10px;color:#71879c}.statArrow{margin-left:auto;width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;border-radius:50%;background:#ffffff90;font-size:23px;color:#176da9}.statToday .statArrow{color:#0878d1}.statYesterday .statArrow{color:#7041c5}.statPending .statArrow{color:#bd7b0b}.statCompleted .statArrow{color:#0c9c63}.workspaceGrid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.75fr);gap:14px;align-items:start}.workColumn,.supportColumn{min-width:0}.supportColumn{display:grid;gap:14px}.tablePanel,.sidePanel{background:#fff;border:1px solid #e0eaf3;border-radius:14px;padding:16px;box-shadow:0 4px 18px #163b5b08}.tableTitle,.panelHeading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 12px}.tableTitle h2,.panelHeading h2{font-size:19px;margin:0}.eyebrow{margin:0 0 7px;color:#0878bc;font-size:10px;font-weight:800;letter-spacing:1.5px}.refresh{border:1px solid #cbdbe8;background:#fff;color:#176da9;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}.tableFilters{display:flex;flex-wrap:wrap;margin-bottom:12px}.tableFilter{border:1px solid #e0e8f1;background:#fff;color:#5b7590;padding:9px 13px;font-size:12px}.tableFilter:first-child{border-radius:8px 0 0 8px}.tableFilter:last-child{border-radius:0 8px 8px 0}.activeTableFilter{background:#0875d1;color:#fff;border-color:#0875d1}.search{box-sizing:border-box;padding:10px 12px;border:1px solid #d0dce7;border-radius:8px;background:#fff;font-size:12px}.tableSearch{margin:0 0 12px;width:100%;max-width:100%}.ticketTableWrap{width:100%;overflow-x:auto;border:1px solid #e3ebf4;border-radius:10px}.ticketTable{width:100%;border-collapse:collapse;font-size:11px;text-align:left;min-width:680px}.ticketTable thead{background:#f4f8fc;color:#617b95}.ticketTable th{padding:12px 10px;font-weight:700;white-space:nowrap}.ticketTable td{padding:13px 10px;border-top:1px solid #e9eff5;vertical-align:middle;color:#193957}.ticketTable td strong{font-size:11px;white-space:nowrap}.ticketTable td small{display:block;margin-top:5px;color:#8296aa;font-size:10px}.ticketTable tbody tr:hover{background:#f8fbff}.tableStatus{display:inline-block;padding:6px 8px;border-radius:8px;font-size:10px;font-weight:800;background:#e0efff;color:#0874cb}.tableDone{background:#dff8eb;color:#07965a}.tableWaiting{background:#fff0d7;color:#b87800}.tableActive{background:#e0efff;color:#0874cb}.viewButton{padding:8px 10px;border:1px solid #8ec5ff;border-radius:7px;background:#fff;color:#0874cb;font-size:11px;font-weight:800;white-space:nowrap}.detailTicket{margin-top:16px}.panelLink{border:0;background:transparent;color:#0878d1;font-size:12px;font-weight:700;cursor:pointer}.panelIcon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#eef7ff;color:#0878bc}.scheduleTimeline{position:relative}.scheduleTimeline:before{content:"";position:absolute;left:8px;top:10px;bottom:10px;border-left:2px solid #dce9f5}.scheduleItem{position:relative;display:grid;grid-template-columns:16px 64px minmax(0,1fr) 16px;gap:8px;align-items:start;padding:8px 0}.timelineDot{z-index:1;width:12px;height:12px;margin-top:3px;border-radius:50%;background:#3298ec;border:2px solid #d7ebff;box-sizing:border-box}.timeTag{background:#edf7ff;color:#0878bc;padding:6px 4px;border-radius:6px;text-align:center;font-size:10px;font-weight:800;overflow-wrap:anywhere}.scheduleItem strong,.miniItem strong{font-size:11px}.scheduleItem p{margin:4px 0;font-size:11px;color:#405d76;overflow-wrap:anywhere}.scheduleItem small,.miniItem small{font-size:10px;color:#8799aa}.rowArrow{border:0;background:transparent;color:#6b8cac;font-size:22px;cursor:pointer}.scheduleEnd{display:grid;grid-template-columns:16px 64px 1fr;gap:8px;align-items:start;padding:8px 0 0;border-top:1px solid #edf2f6;font-size:11px;color:#617b95}.scheduleEnd p{margin:0;line-height:1.5}.mutedDot{background:#bdcbd8;border-color:#e5edf4}.panelEmpty{font-size:11px;color:#8799aa;line-height:1.6}.overduePanel.hasOverdue{border-color:#f0c9c5}.alertCount{display:grid;place-items:center;min-width:26px;height:26px;border-radius:50%;background:#fff0ef;color:#b42318;font-size:11px;font-weight:900}.miniItem{display:grid;gap:4px;padding:10px 0;border-top:1px solid #edf2f6}.miniItem span{font-size:11px;color:#59738a}.quickGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.quickTile{min-height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:10px 5px;border:0;border-radius:12px;font-size:11px;font-weight:700;cursor:pointer}.quickTile>span{font-size:23px;font-weight:900}.quickBlue{background:linear-gradient(135deg,#e8f4ff,#dceeff);color:#0878d1}.quickGreen{background:linear-gradient(135deg,#e9faf1,#def7ea);color:#0b9c62}.quickPurple{background:linear-gradient(135deg,#f3edff,#eae2ff);color:#7041c5}.quickAmber{background:linear-gradient(135deg,#fff7e6,#fff0d3);color:#b87800}.updateItem{display:grid;grid-template-columns:16px minmax(0,1fr);gap:10px;align-items:start}.updateItem p{margin:4px 0;font-size:11px;color:#59738a}.updateDot{width:12px;height:12px;border-radius:50%;background:#10b981;margin-top:3px;box-shadow:0 0 0 4px #e4f8ef}.bolt{font-size:20px;color:#0878d1}.alert{margin:0 0 12px;padding:12px 14px;border-radius:8px;font-size:12px}.error{background:#fff0f0;color:#b42318}.success,.completed{background:#e9f8ef;color:#187343}.completed{margin-top:16px;padding:12px;border-radius:8px;font-size:12px}.empty{margin:auto;text-align:center;padding:35px 18px;color:#35516a;background:#fff;border:1px solid #dce7f0;border-radius:14px}.empty p{color:#71879c;font-size:12px}@media(max-width:1150px){.engineerShell{grid-template-columns:210px minmax(0,1fr)}.engineerPage{padding-left:16px;padding-right:16px}.topbar{margin-left:-16px;margin-right:-16px;padding:0 16px}.workspaceGrid{grid-template-columns:minmax(0,1fr)}.supportColumn{grid-template-columns:repeat(2,minmax(0,1fr))}.welcomeArt{flex-basis:260px}}@media(max-width:760px){.engineerShell{grid-template-columns:1fr}.sidebar{min-height:0;padding:12px}.sideBrand{margin-bottom:12px}.sideNav{display:flex;overflow:auto}.sideNav>button,.sideNav>span{white-space:nowrap;width:auto}.sidebarHelp{display:none}.engineerPage{padding:0 12px 18px}.topbar{margin:0 -12px 12px;padding:0 12px}.topSearch{width:52%;padding:8px}.topSearch span{font-size:10px}.engineerIdentity{gap:5px}.engineerIdentity .avatar{width:32px;height:32px;font-size:19px}.welcomeBanner{padding:14px;gap:8px;min-height:90px}.welcomeBanner h1{font-size:22px}.welcomeBanner p{font-size:12px}.welcomeArt{display:none}.welcomeDate{white-space:normal;font-size:10px}.welcomeDate strong{font-size:11px}.welcomeDate span{font-size:10px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat{padding:10px;gap:8px}.statIcon{width:35px;height:35px;flex-basis:35px;font-size:19px}.statArrow{display:none}.workspaceGrid{grid-template-columns:minmax(0,1fr)}.supportColumn{grid-template-columns:1fr}.tablePanel,.sidePanel{padding:12px}.tableTitle h2,.panelHeading h2{font-size:16px}.tableFilter{padding:8px;font-size:10px}.scheduleItem{grid-template-columns:14px 55px minmax(0,1fr) 12px;gap:5px}.scheduleEnd{grid-template-columns:14px 55px 1fr;gap:5px}}`}</style>
    </main>
  );
}
