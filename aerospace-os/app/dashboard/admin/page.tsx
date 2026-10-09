"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceRequest = {
  _id: string;
  requestNumber: string;
  subject: string;
  description?: string;
  serviceType?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  status: string;
  createdAt?: string;
};

type RequestApiResponse = {
  success?: boolean;
  message?: string;
  requests?: ServiceRequest[];
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "New Request",
  under_review: "Under Review",
  quote_sent: "Offer Sent",
  customer_action_required: "Customer Action",
  accepted: "Accepted",
  rejected: "Rejected",
  ticket_created: "Ticket Created",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  cancelled: "Cancelled",
};

function statusTone(status: string) {
  if (["completed", "closed"].includes(status)) return "green";
  if (["accepted", "ticket_created", "assigned", "in_progress"].includes(status)) return "blue";
  if (["quote_sent", "customer_action_required"].includes(status)) return "purple";
  if (["rejected", "cancelled"].includes(status)) return "red";
  if (status === "under_review") return "amber";
  return "slate";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Icon({ name }: { name: "grid" | "requests" | "ticket" | "users" | "settings" | "search" | "bell" | "arrow" | "calendar" | "clock" | "check" | "logout" }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    requests: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    ticket: <><path d="M4 8a2 2 0 0 0 0 4v5h16v-5a2 2 0 0 1 0-4V3H4z" /><path d="M12 6v2M12 11v2M12 16v1" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.5-3.4 2.3-5 5.5-5s5 1.6 5.5 5" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.1.4 3.2 2 3.5 4.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19 13.5 1.2 1-.0 2-2 2-2-1.2-2 .8-.5 2.2h-3l-.5-2.2-2-.8-2 1.2-2-2v-2l1.2-1-.1-2-1.1-1v-2l2-2 2 1.2 2-.8.5-2.2h3l.5 2.2 2 .8 2-1.2 2 2v2l-1.2 1z" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h13M13 7l5 5-5 5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M18 12H8" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      try {
        const response = await fetch("/api/service-requests", { cache: "no-store" });
        const data: RequestApiResponse = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load service requests.");
        }
        if (active) setRequests(Array.isArray(data.requests) ? data.requests : []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load service requests.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRequests();
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => ({
    total: requests.length,
    new: requests.filter((request) => request.status === "submitted").length,
    review: requests.filter((request) => ["under_review", "quote_sent", "customer_action_required"].includes(request.status)).length,
    accepted: requests.filter((request) => request.status === "accepted").length,
    tickets: requests.filter((request) => ["ticket_created", "assigned", "in_progress"].includes(request.status)).length,
  }), [requests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesSearch = !query || [request.requestNumber, request.subject, request.serviceType]
        .some((value) => (value || "").toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  return (
    <div className="adminApp">
      <aside className="sidebar">
        <a className="brand" href="/dashboard/admin" aria-label="Aerospace OS Admin home">
          <span className="brandMark">A</span>
          <span><strong>AEROSPACE</strong><small>OPERATIONS SYSTEM</small></span>
        </a>

        <div className="navLabel">WORKSPACE</div>
        <nav className="navigation" aria-label="Admin navigation">
          <a className="navItem active" href="/dashboard/admin"><Icon name="grid" />Dashboard</a>
          <a className="navItem" href="#service-requests"><Icon name="requests" />Service Requests <span className="navCount">{counts.new}</span></a>
          <a className="navItem" href="#tickets"><Icon name="ticket" />Tickets</a>
          <a className="navItem" href="/dashboard/admin/engineers"><Icon name="users" />Engineer Accounts</a>
          <a className="navItem" href="#customers"><Icon name="users" />Customers</a>
        </nav>

        <div className="sidebarBottom">
          <div className="workflowCard">
            <span className="workflowDot" />
            <strong>Service workflow</strong>
            <p>Review request → Send offer → Customer accepts → Create ticket</p>
          </div>
          <a className="navItem" href="#settings"><Icon name="settings" />Settings</a>
          <a className="logout" href="/api/auth/logout"><Icon name="logout" />Sign out</a>
          <div className="sidebarFooter">AEROSPACE OS <span>•</span> ADMIN</div>
        </div>
      </aside>

      <main className="mainContent">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Dashboard</strong></div>
          <div className="topbarRight">
            <span className="systemStatus"><i /> System online</span>
            <button className="iconButton" aria-label="Notifications" type="button"><Icon name="bell" /></button>
            <div className="adminIdentity"><div className="avatar">AC</div><span><strong>Administrator</strong><small>Aerospace Computers</small></span></div>
          </div>
        </header>

        <section className="welcomeRow">
          <div>
            <div className="eyebrow">SERVICE OPERATIONS OVERVIEW</div>
            <h1>Admin Dashboard</h1>
            <p>Manage customer requests, offers and service delivery from one place.</p>
          </div>
          <a className="primaryButton" href="#service-requests"><span>+</span> Review service requests</a>
        </section>

        <section className="statGrid" aria-label="Service request summary">
          <article className="statCard">
            <div className="statTop"><span>Total requests</span><span className="statIcon blue"><Icon name="requests" /></span></div>
            <div className="statNumber">{loading ? "—" : counts.total}</div>
            <div className="statFoot"><span className="miniDot blueDot" /> All service requests</div>
          </article>
          <article className="statCard">
            <div className="statTop"><span>Needs review</span><span className="statIcon orange"><Icon name="clock" /></span></div>
            <div className="statNumber">{loading ? "—" : counts.new}</div>
            <div className="statFoot"><span className="miniDot orangeDot" /> Awaiting admin review</div>
          </article>
          <article className="statCard">
            <div className="statTop"><span>Offers / customer action</span><span className="statIcon purple"><Icon name="calendar" /></span></div>
            <div className="statNumber">{loading ? "—" : counts.review}</div>
            <div className="statFoot"><span className="miniDot purpleDot" /> Offer workflow in progress</div>
          </article>
          <article className="statCard">
            <div className="statTop"><span>Active tickets</span><span className="statIcon green"><Icon name="check" /></span></div>
            <div className="statNumber">{loading ? "—" : counts.tickets}</div>
            <div className="statFoot"><span className="miniDot greenDot" /> Created by admin</div>
          </article>
        </section>

        <section className="workflowBanner">
          <div className="workflowBannerIcon"><Icon name="ticket" /></div>
          <div className="workflowBannerCopy"><strong>Keep the service process in control</strong><span>Customer acceptance does not create a ticket. Create the ticket manually after reviewing the accepted offer.</span></div>
          <span className="workflowPill">ADMIN CONTROLLED</span>
        </section>

        <section className="requestPanel" id="service-requests">
          <div className="panelHeader">
            <div><div className="eyebrow">CUSTOMER SUPPORT</div><h2>Service Requests</h2><p>Review incoming requests and track each request's current stage.</p></div>
            <span className="requestTotal">{loading ? "Loading…" : `${filteredRequests.length} requests`}</span>
          </div>

          <div className="tableTools">
            <label className="searchBox"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search request number or subject" aria-label="Search service requests" /></label>
            <label className="filterBox"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter requests by status">
              <option value="all">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
          </div>

          {error ? <div className="messageState errorState"><strong>Could not load requests</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Retry</button></div> : loading ? <div className="messageState"><span className="loader" />Loading service requests…</div> : filteredRequests.length === 0 ? <div className="messageState"><strong>No service requests found</strong><span>Try changing the status filter or search terms.</span></div> : (
            <div className="tableScroll">
              <table>
                <thead><tr><th>REQUEST</th><th>SERVICE</th><th>DATE RECEIVED</th><th>STATUS</th><th /></tr></thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id}>
                      <td><div className="requestNumber">{request.requestNumber || "Request"}</div><div className="requestSubject">{request.subject}</div></td>
                      <td><span className="serviceType">{request.serviceType || "General support"}</span></td>
                      <td><span className="dateCell">{formatDate(request.createdAt)}</span></td>
                      <td><span className={`statusBadge ${statusTone(request.status)}`}><i />{statusLabels[request.status] || request.status.replace(/_/g, " ")}</span></td>
                      <td><a className="reviewButton" href={`/dashboard/admin/requests/${request._id}`}>Review <Icon name="arrow" /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="panelFooter"><span>Showing current service request records</span><span><b>{counts.accepted}</b> accepted offers awaiting admin ticket handling</span></div>
        </section>

        <footer className="pageFooter"><span>© {new Date().getFullYear()} Aerospace Computers</span><span>Aerospace OS <b>·</b> Service Operations</span></footer>
      </main>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        .adminApp { min-height:100vh; background:#f4f7fb; color:#132c46; font-family:Arial,Helvetica,sans-serif; }
        .sidebar { position:fixed; inset:0 auto 0 0; z-index:5; display:flex; flex-direction:column; width:258px; padding:26px 17px 18px; background:#071a31; color:#eaf3fc; }
        .brand { display:flex; align-items:center; gap:11px; padding:1px 7px 30px; color:inherit; text-decoration:none; }
        .brandMark { display:grid; place-items:center; width:39px; height:39px; border-radius:11px; background:linear-gradient(145deg,#21b6f3,#0875cf); box-shadow:0 7px 18px #047ecb38; color:#fff; font-size:24px; font-weight:800; }
        .brand strong { display:block; font-size:13px; letter-spacing:1.5px; }
        .brand small { display:block; margin-top:4px; color:#8fa9c5; font-size:9px; letter-spacing:1.6px; }
        .navLabel { margin:0 10px 12px; color:#6f89a8; font-size:10px; font-weight:800; letter-spacing:1.8px; }
        .navigation { display:flex; flex-direction:column; gap:5px; }
        .navItem,.logout { display:flex; align-items:center; gap:12px; min-height:45px; padding:0 12px; border-radius:9px; color:#b8c9dd; font-size:13px; text-decoration:none; transition:background .15s,color .15s; }
        .navItem :global(svg),.logout :global(svg) { width:18px; height:18px; flex-shrink:0; }
        .navItem:hover,.logout:hover { background:#102b49; color:#fff; }
        .navItem.active { background:linear-gradient(90deg,#0c76bf,#105a9b); color:white; box-shadow:0 8px 18px #00172a55; font-weight:700; }
        .navCount { margin-left:auto; display:grid; place-items:center; min-width:22px; height:22px; padding:0 5px; border-radius:7px; background:#ffffff20; font-size:11px; }
        .sidebarBottom { margin-top:auto; }
        .workflowCard { margin:0 2px 20px; padding:14px 13px; border:1px solid #1c3857; border-radius:11px; background:#0a223e; }
        .workflowDot { display:inline-block; width:7px; height:7px; margin-right:7px; border-radius:50%; background:#28c78b; box-shadow:0 0 0 4px #28c78b1f; }
        .workflowCard strong { font-size:11px; }
        .workflowCard p { margin:10px 0 0; color:#9fb4cc; font-size:10px; line-height:1.7; }
        .logout { margin-top:8px; }
        .sidebarFooter { padding:18px 10px 0; color:#5e7897; font-size:9px; letter-spacing:1.2px; }
        .sidebarFooter span { padding:0 5px; color:#2e85be; }
        .mainContent { min-height:100vh; margin-left:258px; padding:0 32px 24px; }
        .topbar { display:flex; justify-content:space-between; align-items:center; min-height:76px; border-bottom:1px solid #e0e8f1; gap:18px; }
        .breadcrumbs { display:flex; gap:10px; align-items:center; font-size:12px; color:#8293a7; }
        .breadcrumbs b { color:#c3ceda; font-weight:400; }
        .breadcrumbs strong { color:#2e4967; }
        .topbarRight { display:flex; align-items:center; gap:18px; }
        .systemStatus { display:flex; align-items:center; gap:7px; color:#53718e; font-size:11px; white-space:nowrap; }
        .systemStatus i { width:7px; height:7px; border-radius:50%; background:#20b67b; box-shadow:0 0 0 4px #20b67b19; }
        .iconButton { display:grid; place-items:center; width:35px; height:35px; border:1px solid #dfe7f0; border-radius:10px; background:#fff; color:#5a7592; }
        .iconButton :global(svg) { width:17px; height:17px; }
        .adminIdentity { display:flex; align-items:center; gap:10px; padding-left:17px; border-left:1px solid #dfe7f0; }
        .avatar { display:grid; place-items:center; width:36px; height:36px; border-radius:11px; background:#e0f1ff; color:#0877c6; font-weight:800; font-size:12px; }
        .adminIdentity strong { display:block; color:#213d5a; font-size:11px; }
        .adminIdentity small { display:block; margin-top:4px; color:#8192a5; font-size:10px; }
        .welcomeRow { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:31px 0 24px; }
        .eyebrow { color:#0e83c9; font-size:9px; letter-spacing:1.8px; font-weight:800; }
        h1 { margin:9px 0 8px; color:#0c2542; font-size:27px; letter-spacing:-.7px; }
        .welcomeRow p { margin:0; color:#76899f; font-size:12px; line-height:1.6; }
        .primaryButton { display:flex; align-items:center; justify-content:center; gap:9px; padding:12px 16px; border-radius:9px; background:#087bc6; box-shadow:0 6px 15px #087bc626; color:white; text-decoration:none; font-size:11px; font-weight:700; white-space:nowrap; }
        .primaryButton:hover { background:#0669ab; }
        .primaryButton span { font-size:17px; line-height:12px; }
        .statGrid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .statCard { min-width:0; padding:17px 18px 16px; border:1px solid #e0e8f0; border-radius:13px; background:#fff; box-shadow:0 4px 14px #163b5b06; }
        .statTop { display:flex; align-items:center; justify-content:space-between; gap:8px; color:#657e97; font-size:11px; font-weight:600; }
        .statIcon { display:grid; place-items:center; width:34px; height:34px; border-radius:10px; flex-shrink:0; }
        .statIcon :global(svg) { width:17px; height:17px; }
        .statIcon.blue { background:#e8f4ff; color:#1885d0; }.statIcon.orange { background:#fff2df; color:#d98920; }.statIcon.purple { background:#f1eaff; color:#8d68cf; }.statIcon.green { background:#e2f8ef; color:#1aab78; }
        .statNumber { margin:12px 0 10px; color:#102b48; font-size:30px; font-weight:800; letter-spacing:-.8px; }
        .statFoot { display:flex; align-items:center; gap:7px; color:#8091a4; font-size:10px; }
        .miniDot { width:6px; height:6px; border-radius:50%; }.blueDot { background:#1786d0; }.orangeDot { background:#e4a03a; }.purpleDot { background:#9672d4; }.greenDot { background:#20b783; }
        .workflowBanner { display:flex; align-items:center; gap:13px; margin:18px 0 23px; padding:15px 17px; border:1px solid #d5e9f8; border-radius:12px; background:linear-gradient(100deg,#edf8ff,#f8fcff); }
        .workflowBannerIcon { display:grid; place-items:center; width:39px; height:39px; flex-shrink:0; border-radius:11px; background:#d9efff; color:#0d7ec3; }
        .workflowBannerIcon :global(svg) { width:19px; height:19px; }
        .workflowBannerCopy { display:flex; flex-direction:column; gap:5px; min-width:0; }
        .workflowBannerCopy strong { color:#194566; font-size:12px; }
        .workflowBannerCopy span { color:#64819a; font-size:10px; line-height:1.5; }
        .workflowPill { margin-left:auto; padding:7px 9px; border:1px solid #c6e4f8; border-radius:6px; background:#fff; color:#087bc6; font-size:8px; font-weight:800; letter-spacing:1px; white-space:nowrap; }
        .requestPanel { overflow:hidden; border:1px solid #e0e8f0; border-radius:14px; background:#fff; box-shadow:0 4px 14px #163b5b06; }
        .panelHeader { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:21px 22px 18px; }
        .panelHeader h2 { margin:7px 0 6px; color:#102b48; font-size:17px; letter-spacing:-.2px; }
        .panelHeader p { margin:0; color:#8091a4; font-size:11px; line-height:1.5; }
        .requestTotal { padding:8px 10px; border-radius:7px; background:#f0f6fb; color:#5c7894; font-size:10px; white-space:nowrap; }
        .tableTools { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:0 22px 16px; }
        .searchBox { display:flex; align-items:center; gap:9px; width:min(350px,60%); height:38px; margin:0; padding:0 11px; border:1px solid #dfe7ef; border-radius:8px; color:#8295a8; }
        .searchBox :global(svg) { width:16px; height:16px; flex-shrink:0; }
        .searchBox input { width:100%; min-width:0; height:100%; padding:0; border:0; outline:0; box-shadow:none; background:transparent; color:#173550; font-size:11px; }
        .searchBox input::placeholder { color:#a4b0bd; }
        .filterBox { display:flex; align-items:center; gap:9px; margin:0; color:#7f91a4; font-size:10px; white-space:nowrap; }
        .filterBox select { min-width:135px; height:38px; padding:0 10px; border:1px solid #dfe7ef; border-radius:8px; background:#fff; color:#38546f; font-size:10px; }
        .tableScroll { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; text-align:left; }
        thead { background:#f7f9fc; }
        th { padding:12px 18px; color:#8a9aab; font-size:9px; font-weight:800; letter-spacing:1.1px; white-space:nowrap; }
        th:first-child,td:first-child { padding-left:22px; }
        th:last-child,td:last-child { padding-right:22px; }
        td { padding:15px 18px; border-top:1px solid #edf1f5; vertical-align:middle; }
        .requestNumber { color:#0b7dc3; font-size:10px; font-weight:800; letter-spacing:.2px; }
        .requestSubject { max-width:300px; margin-top:5px; overflow:hidden; color:#29425e; font-size:11px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
        .serviceType { color:#617b94; font-size:10px; white-space:nowrap; }
        .dateCell { color:#617b94; font-size:10px; white-space:nowrap; }
        .statusBadge { display:inline-flex; align-items:center; gap:6px; padding:7px 8px; border-radius:6px; font-size:9px; font-weight:700; white-space:nowrap; }
        .statusBadge i { width:5px; height:5px; border-radius:50%; background:currentColor; }
        .statusBadge.slate { background:#eef2f6; color:#66788a; }.statusBadge.amber { background:#fff3dc; color:#ac741c; }.statusBadge.purple { background:#f0eaff; color:#8060c1; }.statusBadge.blue { background:#e5f2ff; color:#176eae; }.statusBadge.green { background:#e3f8ee; color:#16865c; }.statusBadge.red { background:#ffeaea; color:#c34f4f; }
        .reviewButton { display:inline-flex; align-items:center; gap:7px; padding:8px 9px; border:1px solid #cfe4f5; border-radius:7px; color:#0876bc; background:#f7fbff; text-decoration:none; font-size:10px; font-weight:700; white-space:nowrap; }
        .reviewButton:hover { border-color:#8dc3e9; background:#edf8ff; }
        .reviewButton :global(svg) { width:13px; height:13px; }
        .messageState { display:flex; min-height:150px; flex-direction:column; align-items:center; justify-content:center; gap:9px; color:#7b8ea3; font-size:12px; }
        .messageState strong { color:#294560; font-size:13px; }.messageState span { font-size:11px; }
        .errorState button { margin-top:5px; padding:8px 12px; border:0; border-radius:7px; background:#087bc6; color:#fff; font-size:11px; font-weight:700; }
        .loader { width:21px; height:21px; border:2px solid #d8e8f4; border-top-color:#0a83ca; border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .panelFooter { display:flex; justify-content:space-between; gap:15px; padding:13px 22px; border-top:1px solid #edf1f5; background:#fbfcfe; color:#8797a8; font-size:9px; }
        .panelFooter b { color:#2a4968; }
        .pageFooter { display:flex; justify-content:space-between; gap:15px; padding:22px 2px 0; color:#9aa8b6; font-size:9px; }
        .pageFooter b { padding:0 4px; color:#6d9cbd; }
        @media (max-width:1200px) { .mainContent { padding-left:23px; padding-right:23px; }.statGrid { grid-template-columns:repeat(2,minmax(0,1fr)); }.topbarRight { gap:12px; } }
        @media (max-width:850px) { .sidebar { width:74px; padding:22px 10px; }.brand { justify-content:center; padding:0 0 30px; }.brand > span:last-child,.navLabel,.navItem:not(.active) span,.navItem:not(.active),.workflowCard,.sidebarFooter,.logout { font-size:0; }.navigation .navItem { justify-content:center; padding:0; font-size:0; }.navItem :global(svg) { width:19px; height:19px; }.navCount { display:none; }.mainContent { margin-left:74px; }.sidebarBottom .navItem { justify-content:center; padding:0; font-size:0; }.sidebarBottom .navItem :global(svg) { width:19px; height:19px; }.logout { justify-content:center; padding:0; }.logout :global(svg) { width:19px; height:19px; }.brandMark { flex-shrink:0; } }
        @media (max-width:600px) { .mainContent { padding:0 14px 20px; }.topbar { min-height:66px; }.systemStatus,.adminIdentity span { display:none; }.adminIdentity { padding-left:0; border:0; }.welcomeRow { align-items:flex-start; flex-direction:column; padding:24px 0 19px; }.welcomeRow h1 { font-size:24px; }.statGrid { gap:10px; }.statCard { padding:13px; }.statTop { align-items:flex-start; font-size:10px; }.statIcon { width:29px; height:29px; }.statNumber { font-size:26px; }.workflowBanner { align-items:flex-start; flex-wrap:wrap; }.workflowBannerCopy { flex:1; }.workflowPill { margin-left:52px; }.panelHeader { align-items:flex-start; flex-direction:column; padding:18px 15px; }.tableTools { align-items:stretch; flex-direction:column; padding:0 15px 14px; }.searchBox { width:100%; }.filterBox { justify-content:space-between; }.filterBox select { flex:1; }.panelFooter,.pageFooter { flex-direction:column; }.panelFooter { padding:12px 15px; }.pageFooter { line-height:1.5; } th,td { padding-left:12px; padding-right:12px; } th:first-child,td:first-child { padding-left:15px; } th:last-child,td:last-child { padding-right:15px; } }
      `}</style>
    </div>
  );
}
