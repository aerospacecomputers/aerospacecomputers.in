"use client";

import { useEffect, useState } from "react";

type Page =
  | "dashboard"
  | "new-request"
  | "requests"
  | "assets"
  | "profile";


type IconName =
  | "home" | "plus" | "requests" | "assets" | "user" | "support" | "logout"
  | "search" | "bell" | "arrow" | "laptop" | "desktop" | "camera" | "printer"
  | "network" | "server" | "wifi" | "power" | "other" | "check" | "clock"
  | "settings" | "edit" | "mail" | "phone" | "location" | "calendar";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    home:<><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></>,
    plus:<><path d="M12 5v14M5 12h14"/></>,
    requests:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    assets:<><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M8 4v16M16 4v16M3.5 9h17M3.5 15h17"/></>,
    user:<><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.6-3.5 3.1-5.5 7-5.5s6.4 2 7 5.5"/></>,
    support:<><circle cx="12" cy="12" r="8.5"/><path d="M8.5 13.5c1.2 1.6 2.4 2.4 3.5 2.4s2.3-.8 3.5-2.4M8.5 9.5h.01M15.5 9.5h.01"/></>,
    logout:<><path d="M10 5H5v14h5"/><path d="M13 8l4 4-4 4M17 12H8"/></>,
    search:<><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></>,
    bell:<><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow:<><path d="M5 12h13M13 7l5 5-5 5"/></>,
    laptop:<><rect x="5" y="4" width="14" height="10" rx="1.5"/><path d="M3 18h18l-2 2H5z"/></>,
    desktop:<><rect x="4" y="4" width="16" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/></>,
    camera:<><path d="M4 8h4l1.5-2h5L16 8h4v10H4z"/><circle cx="12" cy="13" r="3.2"/></>,
    printer:<><path d="M7 8V4h10v4"/><rect x="4" y="8" width="16" height="9" rx="2"/><path d="M7 14h10v6H7zM17 11h.01"/></>,
    network:<><circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M12 7.5V12M12 12 6 15.5M12 12l6 3.5"/></>,
    server:<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h8M16 7h.01M16 12h.01M16 17h.01"/></>,
    wifi:<><path d="M4 9a12 12 0 0 1 16 0M7 12a7.5 7.5 0 0 1 10 0M10 15a3.2 3.2 0 0 1 4 0"/><circle cx="12" cy="18.5" r=".7" fill="currentColor"/></>,
    power:<><path d="M12 3v9"/><path d="M7.2 6.5a8 8 0 1 0 9.6 0"/></>,
    other:<><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/></>,
    check:<path d="m5 12 4 4L19 6"/>,
    clock:<><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1-1.8 3.1-.2-.1a2 2 0 0 0-2.7.7l-.1.2h-3.6l-.1-.2a2 2 0 0 0-2.7-.7l-.2.1-1.8-3.1.1-.1a2 2 0 0 0 0-3l-.1-.1 1.8-3.1.2.1a2 2 0 0 0 2.7-.7l.1-.2h3.6l.1.2a2 2 0 0 0 2.7.7l.2-.1 1.8 3.1-.1.1a2 2 0 0 0 0 3Z"/></>,
    edit:<><path d="m4 20 4.2-1 9.6-9.6a2.1 2.1 0 0 0-3-3L5.2 16z"/><path d="m13.5 7.5 3 3"/></>,
    mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    phone:<path d="M7 3.5 10 6l-1.5 3a14 14 0 0 0 6.5 6.5l3-1.5 2.5 3c-1 2-2.8 3-5 2.5C9 17.5 6.5 15 4.5 9c-.5-2.2.5-4 2.5-5.5Z"/>,
    location:<><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const requests = [
  {
    id: "SR-20261008-001",
    subject: "Laptop not starting",
    service: "Laptop",
    date: "08 Oct 2026",
    status: "Under Review",
  },
  {
    id: "SR-20261007-002",
    subject: "CCTV camera issue",
    service: "CCTV",
    date: "07 Oct 2026",
    status: "In Progress",
  },
  {
    id: "SR-20261005-003",
    subject: "Printer not working",
    service: "Printer",
    date: "05 Oct 2026",
    status: "Quoted",
  },
  {
    id: "SR-20261002-004",
    subject: "Network intermittent",
    service: "Network",
    date: "02 Oct 2026",
    status: "Completed",
  },
  {
    id: "SR-20260928-005",
    subject: "Desktop running slow",
    service: "Desktop",
    date: "28 Sep 2026",
    status: "Completed",
  },
];

const assets: {
  name: string;
  type: string;
  icon: IconName;
  serial: string;
  location: string;
  status: string;
}[] = [
  {
    name: "Dell Latitude 5420",
    type: "Laptop",
    icon: "laptop",
    serial: "DL5420-001",
    location: "Office",
    status: "Active",
  },
  {
    name: "HP ProDesk 400",
    type: "Desktop",
    icon: "desktop",
    serial: "HP400-002",
    location: "Office",
    status: "Active",
  },
  {
    name: "Hikvision IP Camera",
    type: "CCTV Camera",
    icon: "camera",
    serial: "HK-CAM-003",
    location: "Reception",
    status: "Active",
  },
  {
    name: "HP LaserJet Pro",
    type: "Printer",
    icon: "printer",
    serial: "HP-LJ-005",
    location: "Accounts",
    status: "Under Service",
  },
];

const categories: [IconName, string, string][] = [
  ["laptop", "Laptops", "6"],
  ["desktop", "Desktops", "4"],
  ["camera", "CCTV Cameras", "8"],
  ["printer", "Printers", "3"],
  ["network", "Network Devices", "5"],
  ["server", "Servers", "2"],
  ["wifi", "Wi-Fi / AP", "4"],
  ["power", "UPS / Power", "2"],
  ["other", "Other", "3"],
];

export default function CustomerDashboard() {
  const [page, setPage] = useState<Page>("dashboard");

  const [subject, setSubject] = useState("");
  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "" });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/customer/dashboard", { cache: "no-store" });
        const data = await response.json();

        if (response.ok && data.success && data.profile) {
          const loadedProfile = {
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            address: [
              data.profile.address,
              data.profile.city,
              data.profile.state,
              data.profile.pincode,
            ]
              .filter(Boolean)
              .join(", "),
          };

          setProfile(loadedProfile);
          setProfileDraft(loadedProfile);
        }
      } catch (error) {
        console.error("Failed to load customer profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  function logout() {
    window.location.href = "/api/auth/logout";
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(false);
    setRequestError("");
    setSubmittingRequest(true);

    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          serviceType: service,
          description,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          deviceIds: [],
          attachmentUrls: [],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setRequestError(data.message || "Failed to submit service request");
        return;
      }

      setSubmitted(true);
      setSubject("");
      setService("");
      setDescription("");
      setPreferredDate("");
      setPreferredTime("");
    } catch (error) {
      console.error("Failed to submit service request:", error);
      setRequestError("Failed to submit service request");
    } finally {
      setSubmittingRequest(false);
    }
  }

  function openProfileEditor() {
    setProfileDraft(profile);
    setProfileMessage("");
    setEditingProfile(true);
  }

  async function saveProfile() {
    try {
      setProfileMessage("");

      const response = await fetch("/api/customer/dashboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileDraft),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setProfileMessage(data.message || "Failed to update profile");
        return;
      }

      setProfile(profileDraft);
      setEditingProfile(false);
      setProfileMessage("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update customer profile:", error);
      setProfileMessage("Failed to update profile");
    }
  }

  function statusClass(status: string) {
    if (status === "Completed") return "green";
    if (status === "In Progress") return "blue";
    if (status === "Quoted") return "purple";
    return "orange";
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <img
            src="https://aerospacecomputers.in/images/logo.svg"
            alt="Aerospace Computers"
          />

          <div>
            <strong>AEROSPACE OS</strong>
            <span>Customer Portal</span>
          </div>
        </div>

        <nav>
          <div className="navTitle">MAIN MENU</div>

          <button
            className={page === "dashboard" ? "nav active" : "nav"}
            onClick={() => setPage("dashboard")}
          >
            <span className="navIcon"><Icon name="home" size={17} /></span>
            Dashboard
          </button>

          <button
            className={page === "new-request" ? "nav active" : "nav"}
            onClick={() => setPage("new-request")}
          >
            <span className="navIcon"><Icon name="plus" size={17} /></span>
            New Service Request
          </button>

          <button
            className={page === "requests" ? "nav active" : "nav"}
            onClick={() => setPage("requests")}
          >
            <span className="navIcon"><Icon name="requests" size={17} /></span>
            Service Requests
            <b>5</b>
          </button>

          <button
            className={page === "assets" ? "nav active" : "nav"}
            onClick={() => setPage("assets")}
          >
            <span className="navIcon"><Icon name="assets" size={17} /></span>
            My Assets
            <b>9</b>
          </button>

          <div className="navTitle accountTitle">ACCOUNT</div>

          <button
            className={page === "profile" ? "nav active" : "nav"}
            onClick={openProfileEditor}
          >
            <span className="navIcon"><Icon name="user" size={17} /></span>
            My Profile
          </button>
        </nav>

        <div className="sidebarBottom">
          <button className="nav">
            <span className="navIcon"><Icon name="support" size={17} /></span>
            Support
          </button>

          <button className="nav" onClick={logout}>
            <span className="navIcon"><Icon name="logout" size={17} /></span>
            Logout
          </button>

          <div className="supportStatus">
            <i />
            <div>
              <strong>Support Online</strong>
              <span>Aerospace Computers</span>
              <small>IT Service Management</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="search">
            <span>⌕</span>
            <input placeholder="Search anything..." />
          </div>

          <div className="topRight">
            <button className="bell" aria-label="Notifications"><Icon name="bell" size={18} /></button>

            <div className="profileMini">
              <div className="avatar">{profile.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>

              <div>
                <strong>{profile.name}</strong>
                <span>Customer Account</span>
              </div>

              <b>⌄</b>
            </div>
          </div>
        </header>

        <div className="content">
          {/* DASHBOARD */}
          {page === "dashboard" && (
            <>
              <section className="hero">
                <div>
                  <small>GOOD MORNING</small>
                  <h1>Welcome back, Jitesh!</h1>
                  <p>
                    Here&apos;s an overview of your IT service activity and
                    assets.
                  </p>
                </div>

                <div className="heroText">
                  <strong>AEROSPACE OS</strong>
                  <span>Smarter IT. Better Support.</span>
                </div>
              </section>

              <div className="dashboardGrid">
                <div className="mainColumn">
                  {/* STATS */}
                  <div className="stats">
                    <Stat icon="assets" title="Total Requests" value="12" type="blue" />
                    <Stat icon="calendar" title="Pending" value="3" type="orange" />
                    <Stat icon="settings" title="In Progress" value="4" type="purple" />
                    <Stat icon="check" title="Completed" value="5" type="green" />
                  </div>

                  {/* REQUESTS */}
                  <section className="card">
                    <div className="cardHeader">
                      <div>
                        <h2>Recent Service Requests</h2>
                        <p>Your latest support requests</p>
                      </div>

                      <button
                        className="viewAll"
                        onClick={() => setPage("requests")}
                      >
                        View All →
                      </button>
                    </div>

                    <div className="requestTable">
                      <div className="tableHead">
                        <span>#</span>
                        <span>Request Number</span>
                        <span>Subject</span>
                        <span>Service Type</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span>Action</span>
                      </div>

                      {requests.map((r, index) => (
                        <div className="tableRow" key={r.id}>
                          <span>{index + 1}</span>
                          <strong>{r.id}</strong>
                          <span>{r.subject}</span>
                          <span>{r.service}</span>
                          <span>{r.date}</span>

                          <em className={`status ${statusClass(r.status)}`}>
                            {r.status}
                          </em>

                          <button
                            className="viewButton"
                            onClick={() => setPage("requests")}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ASSETS */}
                  <section className="card assetsCard">
                    <div className="cardHeader">
                      <div>
                        <h2>My Assets</h2>
                        <p>Your registered IT equipment</p>
                      </div>

                      <button
                        className="viewAll"
                        onClick={() => setPage("assets")}
                      >
                        View All Assets →
                      </button>
                    </div>

                    <div className="categories">
                      {categories.map(([icon, name, count]) => (
                        <button
                          className="category"
                          key={name}
                          onClick={() => setPage("assets")}
                        >
                          <span className="categoryIcon"><Icon name={icon} size={18} /></span>
                          <small>{name}</small>
                          <strong>{count}</strong>
                        </button>
                      ))}
                    </div>

                    <div className="recentAssetTitle">
                      <strong>Recent Assets</strong>
                      <button onClick={() => setPage("assets")}>
                        View All →
                      </button>
                    </div>

                    <div className="assetCards">
                      {assets.map((asset) => (
                        <AssetCard
                          key={asset.serial}
                          asset={asset}
                          onRequest={() => {
                            setSubject(`${asset.name} Service Request`);
                            setService(asset.type);
                            setPage("new-request");
                          }}
                        />
                      ))}
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <aside className="rightColumn">
                  <button
                    className="newRequestButton"
                    onClick={() => setPage("new-request")}
                  >
                    <span className="navIcon"><Icon name="plus" size={17} /></span>
                    New Service Request
                    <b>→</b>
                  </button>

                  <section className="sideCard">
                    <h2>Quick Actions</h2>

                    <QuickAction
                      icon="plus"
                      title="Report an IT Issue"
                      text="Create a new service request"
                      onClick={() => setPage("new-request")}
                    />

                    <QuickAction
                      icon="assets"
                      title="View My Assets"
                      text="See all your registered equipment"
                      onClick={() => setPage("assets")}
                    />

                    <QuickAction
                      icon="requests"
                      title="Track Requests"
                      text="Check status of your tickets"
                      onClick={() => setPage("requests")}
                    />

                    <QuickAction
                      icon="user"
                      title="Update Profile"
                      text="Manage your account information"
                      onClick={() => setPage("profile")}
                    />
                  </section>

                  <section className="sideCard profileCard">
                    <div className="sideCardHeader">
                      <h2>My Profile</h2>
                      <button onClick={() => setPage("profile")}>
                        Edit
                      </button>
                    </div>

                    <div className="bigProfile">
                      <div className="bigAvatar">{profile.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>

                      <div>
                        <strong>{profile.name}</strong>
                        <span>Individual Customer</span>
                      </div>
                    </div>

                    <div className="profileInfo">
                      <p><Icon name="mail" size={12} /> {profile.email}</p>
                      <p><Icon name="phone" size={12} /> {profile.phone}</p>
                      <p><Icon name="location" size={12} /> {profile.address}</p>
                      <p><Icon name="user" size={12} /> Individual Account</p>
                      <p><Icon name="calendar" size={12} /> Member since Oct 2026</p>
                    </div>
                  </section>

                  <section className="helpCard">
                    <div className="helpIcon"><Icon name="support" size={18} /></div>
                    <h2>Need Help?</h2>
                    <p>
                      Contact our support team for immediate assistance.
                    </p>
                    <button>Contact Support →</button>
                  </section>
                </aside>
              </div>
            </>
          )}

          {/* REQUESTS PAGE */}
          {page === "requests" && (
            <PageHeader
              eyebrow="SERVICE MANAGEMENT"
              title="Service Requests"
              text="Track all your IT support requests."
              button="+ New Service Request"
              onClick={() => setPage("new-request")}
            >
              <section className="card fullCard">
                <div className="requestFullList">
                  {requests.map((r) => (
                    <div className="fullRequest" key={r.id}>
                      <div className="requestNumber">{r.id}</div>

                      <div className="requestSubject">
                        <strong>{r.subject}</strong>
                        <span>{r.service} Support</span>
                      </div>

                      <div className="requestDate">{r.date}</div>

                      <em className={`status ${statusClass(r.status)}`}>
                        {r.status}
                      </em>

                      <button className="viewButton">View</button>
                    </div>
                  ))}
                </div>
              </section>
            </PageHeader>
          )}

          {/* ASSETS PAGE */}
          {page === "assets" && (
            <PageHeader
              eyebrow="ASSET MANAGEMENT"
              title="My Assets"
              text="View all IT equipment registered to your account."
            >
              <div className="assetCategoryGrid">
                {categories.map(([icon, name, count]) => (
                  <div className="assetCategory" key={name}>
                    <span className="categoryIcon"><Icon name={icon} size={18} /></span>
                    <div>
                      <strong>{count}</strong>
                      <small>{name}</small>
                    </div>
                  </div>
                ))}
              </div>

              <section className="card fullCard">
                <div className="cardHeader">
                  <div>
                    <h2>Registered Equipment</h2>
                    <p>Recent equipment on your account</p>
                  </div>
                </div>

                <div className="largeAssetGrid">
                  {assets.map((asset) => (
                    <AssetCard
                      key={asset.serial}
                      asset={asset}
                      onRequest={() => {
                        setSubject(`${asset.name} Service Request`);
                        setService(asset.type);
                        setPage("new-request");
                      }}
                    />
                  ))}
                </div>
              </section>
            </PageHeader>
          )}

          {/* NEW REQUEST */}
          {page === "new-request" && (
            <PageHeader
              eyebrow="SUPPORT"
              title="New Service Request"
              text="Tell us what you need help with."
            >
              {submitted && (
                <div className="success">
                  ✓ Your service request has been submitted successfully.
                </div>
              )}

              {requestError && (
                <div className="error">
                  {requestError}
                </div>
              )}

              <section className="card formCard">
                <form onSubmit={submitRequest}>
                  <div className="formGrid">
                    <label>
                      Subject
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Example: Laptop not starting"
                        required
                      />
                    </label>

                    <label>
                      Service Type
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        required
                      >
                        <option value="">Select service</option>
                        <option>Laptop</option>
                        <option>Desktop</option>
                        <option>CCTV</option>
                        <option>Printer</option>
                        <option>Network</option>
                        <option>Server</option>
                        <option>Wi-Fi / Access Point</option>
                        <option>UPS / Power</option>
                        <option>AMC</option>
                        <option>Other</option>
                      </select>
                    </label>

                    <label>
                      Preferred Date
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                      />
                    </label>

                    <label>
                      Preferred Time
                      <input
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                      />
                    </label>

                    <label className="full">
                      Description
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue or service required..."
                        rows={7}
                        required
                      />
                    </label>
                  </div>

                  <div className="formButtons">
                    <button
                      type="button"
                      className="cancelButton"
                      onClick={() => setPage("dashboard")}
                    >
                      Cancel
                    </button>

                    <button
                      className="submitButton"
                      type="submit"
                      disabled={submittingRequest}
                    >
                      {submittingRequest ? "Submitting..." : "Submit Service Request →"}
                    </button>
                  </div>
                </form>
              </section>
            </PageHeader>
          )}

          {/* PROFILE */}
          {page === "profile" && (
            <PageHeader
              eyebrow="ACCOUNT"
              title="My Profile"
              text="Manage your Aerospace OS customer information."
            >
              <section className="card profilePage">
                <div className="profilePageAvatar">{profile.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>

                <div>
                  <h2>{profile.name}</h2>
                  <p>Individual Customer</p>
                </div>

                <button className="profileEditButton" onClick={openProfileEditor}><Icon name="edit" size={13} /> Edit Profile</button><div className="profileDetails">
                  <div>
                    <small>Email</small>
                    <strong>{profile.email}</strong>
                  </div>

                  <div>
                    <small>Phone</small>
                    <strong>{profile.phone}</strong>
                  </div>

                  <div>
                    <small>Customer Type</small>
                    <strong>Individual</strong>
                  </div>

                  <div>
                    <small>Location</small>
                    <strong>{profile.address || "Not provided"}</strong>
                  </div>
                </div>
              </section>
            </PageHeader>
          )}
        </div>
      </main>


      {editingProfile && (
        <div className="modalBackdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingProfile(false); }}>
          <div className="profileModal">
            <div className="modalHeader">
              <div><span>ACCOUNT</span><h2>Edit Profile</h2><p>Update your customer information.</p></div>
              <button className="modalClose" onClick={() => setEditingProfile(false)}>×</button>
            </div>
            <div className="modalBody">
              <div className="profileEditGrid">
                <label>Full Name<input value={profileDraft.name} onChange={(e) => setProfileDraft({...profileDraft,name:e.target.value})} /></label>
                <label>Email<input type="email" value={profileDraft.email} onChange={(e) => setProfileDraft({...profileDraft,email:e.target.value})} /></label>
                <label>Phone<input value={profileDraft.phone} onChange={(e) => setProfileDraft({...profileDraft,phone:e.target.value})} /></label>
                <label>Address<input value={profileDraft.address} onChange={(e) => setProfileDraft({...profileDraft,address:e.target.value})} /></label>
              </div>
              <div className="readonlyField"><span>Customer Type</span><strong>Individual Customer</strong><small>Customer type is managed by Aerospace OS.</small></div>
            </div>
            <div className="modalFooter"><button className="cancelButton" onClick={() => setEditingProfile(false)}>Cancel</button><button className="submitButton" onClick={saveProfile}>Save Changes <Icon name="check" size={13} /></button></div>
          </div>
        </div>
      )}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          background: #f3f8fd;
          color: #142d4b;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* SIDEBAR */

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 238px;
          background: #fff;
          border-right: 1px solid #e3ebf3;
          padding: 20px 15px;
          z-index: 20;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 9px 21px;
          border-bottom: 1px solid #edf1f5;
        }

        .brand img {
          width: 42px;
          height: 42px;
        }

        .brand strong {
          display: block;
          color: #0870bd;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .brand span {
          display: block;
          color: #7f91a4;
          font-size: 10px;
          margin-top: 3px;
        }

        nav {
          margin-top: 23px;
        }

        .navTitle {
          color: #9aa8b7;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
          padding: 0 10px 8px;
        }

        .accountTitle {
          margin-top: 28px;
        }

        .nav {
          width: 100%;
          border: 0;
          background: transparent;
          border-radius: 8px;
          padding: 11px 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #65778a;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 3px;
          text-align: left;
        }

        .nav:hover {
          background: #f0f7fd;
          color: #0870bd;
        }

        .nav.active {
          background: #087ed0;
          color: #fff;
          box-shadow: 0 5px 13px rgba(8, 126, 208, 0.18);
        }

        .nav span {
          width: 19px;
          text-align: center;
          font-size: 17px;
        }

        .nav b {
          margin-left: auto;
          min-width: 20px;
          padding: 2px 5px;
          border-radius: 12px;
          background: #edf5fb;
          color: #0870bd;
          font-size: 9px;
          text-align: center;
        }

        .nav.active b {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .sidebarBottom {
          margin-top: auto;
        }

        .supportStatus {
          margin-top: 15px;
          background: #f3f8fc;
          border-radius: 9px;
          padding: 11px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .supportStatus i {
          width: 8px;
          height: 8px;
          background: #20b56b;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #dcf7e9;
          margin-top: 5px;
        }

        .supportStatus strong,
        .supportStatus span,
        .supportStatus small {
          display: block;
        }

        .supportStatus strong {
          font-size: 10px;
          color: #31516d;
        }

        .supportStatus span {
          font-size: 9px;
          color: #718499;
          margin-top: 3px;
        }

        .supportStatus small {
          font-size: 8px;
          color: #99a7b5;
          margin-top: 2px;
        }

        /* MAIN */

        .main {
          margin-left: 238px;
          min-height: 100vh;
        }

        .topbar {
          height: 62px;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #e3ebf3;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 27px;
        }

        .search {
          width: 345px;
          height: 36px;
          border-radius: 8px;
          background: #f4f8fc;
          border: 1px solid #e7eef5;
          display: flex;
          align-items: center;
          padding: 0 11px;
          gap: 8px;
        }

        .search span {
          color: #8093a8;
          font-size: 20px;
        }

        .search input {
          border: 0;
          outline: 0;
          background: transparent;
          width: 100%;
          color: #52677d;
          font-size: 11px;
        }

        .topRight {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .bell {
          border: 0;
          background: transparent;
          font-size: 18px;
          color: #657b90;
          cursor: pointer;
        }

        .profileMini {
          display: flex;
          align-items: center;
          gap: 9px;
          border-left: 1px solid #e5ebf1;
          padding-left: 18px;
        }

        .avatar,
        .bigAvatar,
        .profilePageAvatar {
          border-radius: 50%;
          background: #0877c8;
          color: white;
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        .avatar {
          width: 34px;
          height: 34px;
          font-size: 10px;
        }

        .profileMini strong {
          display: block;
          font-size: 11px;
          color: #233e59;
        }

        .profileMini span {
          display: block;
          color: #8a9aaa;
          font-size: 9px;
          margin-top: 2px;
        }

        .profileMini > b {
          margin-left: 8px;
          color: #5f758c;
        }

        .content {
          padding: 22px 20px 40px;
          max-width: 1450px;
          margin: auto;
        }

        /* HERO */

        .hero {
          height: 132px;
          border-radius: 13px;
          padding: 25px 34px;
          background:
            radial-gradient(
              circle at 75% 30%,
              rgba(255, 255, 255, 0.95),
              transparent 30%
            ),
            linear-gradient(105deg, #d9efff, #f2f9ff);
          border: 1px solid #d9eaf6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          overflow: hidden;
          position: relative;
        }

        .hero:after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          right: 30px;
          top: -210px;
          border-radius: 50%;
          border: 30px solid rgba(41, 135, 204, 0.06);
        }

        .hero small {
          color: #0876c5;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 800;
        }

        .hero h1 {
          margin: 6px 0 5px;
          color: #082b53;
          font-size: 27px;
          letter-spacing: -0.7px;
        }

        .hero p {
          margin: 0;
          color: #58728c;
          font-size: 12px;
        }

        .heroText {
          text-align: right;
          margin-right: 30px;
          z-index: 2;
        }

        .heroText strong {
          display: block;
          color: #0a6db6;
          font-size: 10px;
          letter-spacing: 1.5px;
        }

        .heroText span {
          color: #688299;
          font-size: 10px;
        }

        /* GRID */

        .dashboardGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 13px;
        }

        .mainColumn {
          min-width: 0;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 11px;
          margin-bottom: 13px;
        }

        .stat {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
          border: 1px solid #e1eaf2;
          border-radius: 13px;
          padding: 12px 10px 13px;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 9px !important;
          min-height: 92px;
          overflow: hidden;
          text-align: center;
          box-shadow: 0 3px 12px rgba(28, 63, 94, 0.05);
        }

        .stat::after {
          content: "";
          position: absolute;
          right: -18px;
          bottom: -22px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          opacity: 0.35;
        }

        .stat.blue::after { background: #d9edff; }
        .stat.orange::after { background: #ffe8c7; }
        .stat.purple::after { background: #e9e1ff; }
        .stat.green::after { background: #d9f5e5; }

        .statIcon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          margin: 0 auto;
          border-radius: 14px;
          display: grid;
          place-items: center;
          box-shadow: 0 5px 12px rgba(28, 63, 94, 0.08);
        }

        .statIcon.blue {
          background: #e4f2ff;
          color: #0875c4;
        }

        .statIcon.orange {
          background: #fff0dd;
          color: #e58a1c;
        }

        .statIcon.purple {
          background: #eee7ff;
          color: #7553d8;
        }

        .statIcon.green {
          background: #def8e9;
          color: #1ca45d;
        }

        .statContent {
          position: relative;
          z-index: 1;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          width: 100%;
          min-width: 0;
          text-align: center;
          white-space: nowrap;
        }

        .statLabel {
          display: inline-block;
          color: #526d86;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .statValue {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          height: 26px;
          padding: 0 8px;
          border-radius: 8px;
          background: #f3f7fb;
          color: #173a5b;
          font-size: 17px;
          line-height: 1;
          font-weight: 800;
          box-shadow: inset 0 0 0 1px #e2eaf1;
        }

        /* CARDS */

        .card,
        .sideCard {
          background: white;
          border: 1px solid #e3ebf2;
          border-radius: 11px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(28, 63, 94, 0.025);
        }

        .cardHeader {
          min-height: 62px;
          padding: 14px 17px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #edf1f5;
        }

        .cardHeader h2,
        .sideCard h2 {
          margin: 0;
          color: #173858;
          font-size: 14px;
        }

        .cardHeader p {
          margin: 4px 0 0;
          color: #8c9baa;
          font-size: 9px;
        }

        .viewAll {
          border: 0;
          background: transparent;
          color: #0876c5;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        /* REQUEST TABLE */

        .tableHead,
        .tableRow {
          display: grid;
          grid-template-columns: 25px 1.4fr 1.6fr 0.8fr 100px 105px 55px;
          gap: 8px;
          align-items: center;
          padding: 10px 17px;
        }

        .tableHead {
          background: #f8fafc;
          color: #8b9bab;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .tableRow {
          border-top: 1px solid #edf1f5;
          min-height: 44px;
          color: #526b83;
          font-size: 9px;
        }

        .tableRow strong {
          color: #096fbd;
          font-size: 9px;
        }

        .tableRow > span:first-child {
          color: #8d9bab;
        }

        .status {
          font-style: normal;
          font-size: 8px;
          font-weight: 700;
          padding: 5px 8px;
          border-radius: 15px;
          width: fit-content;
          white-space: nowrap;
        }

        .status.green {
          color: #20894e;
          background: #dff7e9;
        }

        .status.blue {
          color: #1673bb;
          background: #e1f1ff;
        }

        .status.purple {
          color: #7150c9;
          background: #eee7ff;
        }

        .status.orange {
          color: #b66d13;
          background: #fff0d9;
        }

        .viewButton {
          border: 1px solid #cfe5f5;
          background: #f0f8ff;
          color: #0872bd;
          border-radius: 5px;
          padding: 5px 8px;
          font-size: 8px;
          cursor: pointer;
        }

        /* ASSETS */

        .assetsCard {
          margin-top: 13px;
        }

        .categories {
          padding: 12px 17px 5px;
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 7px;
        }

        .category {
          background: #fbfdff;
          border: 1px solid #e4edf5;
          border-radius: 7px;
          padding: 8px 3px;
          cursor: pointer;
          text-align: center;
        }

        .category:hover {
          border-color: #9dcae9;
          background: #f3f9fe;
        }

        .category span {
          display: block;
          font-size: 17px;
          margin-bottom: 4px;
        }

        .category small {
          display: block;
          color: #687f95;
          font-size: 8px;
          white-space: nowrap;
        }

        .category strong {
          display: block;
          color: #173a5b;
          font-size: 14px;
          margin-top: 3px;
        }

        .recentAssetTitle {
          padding: 12px 17px 5px;
          display: flex;
          justify-content: space-between;
          color: #294862;
          font-size: 11px;
        }

        .recentAssetTitle button {
          border: 0;
          background: transparent;
          color: #0872bd;
          font-size: 9px;
          cursor: pointer;
        }

        .assetCards {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          padding: 12px 17px 18px;
        }

        .assetCard {
          min-width: 0;
          border: 1px solid #e1eaf2;
          border-radius: 11px;
          padding: 12px;
          background: #ffffff;
          box-shadow: 0 3px 10px rgba(28, 63, 94, 0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .assetCard:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(28, 63, 94, 0.08);
        }

        .assetImage {
          height: 52px;
          border-radius: 9px;
          background: linear-gradient(135deg, #edf6fd, #f7fbfe);
          color: #14527d;
          display: grid;
          place-items: center;
          margin-bottom: 10px;
        }

        .assetTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }

        .assetTop .status {
          font-size: 7px;
          padding: 4px 7px;
          white-space: nowrap;
        }

        .assetCard h3 {
          margin: 9px 0 4px;
          color: #173a5b;
          font-size: 12px;
          line-height: 1.35;
          min-height: 32px;
        }

        .assetType {
          color: #5f7890;
          font-size: 9px;
          font-weight: 700;
        }

        .assetDetails {
          margin-top: 7px;
          color: #718499;
          font-size: 9px;
          line-height: 1.6;
          min-height: 42px;
        }

        .assetRequest {
          width: 100%;
          border: 1px solid #0b78c8;
          background: linear-gradient(105deg, #0876c5, #1191dd);
          color: #ffffff;
          border-radius: 7px;
          padding: 8px 9px;
          margin-top: 9px;
          font-size: 9px;
          font-weight: 700;
          line-height: 1.2;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(8, 118, 197, 0.16);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .assetRequest:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(8, 118, 197, 0.22);
        }

        /* RIGHT */

        .rightColumn {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .newRequestButton {
          border: 0;
          border-radius: 9px;
          background: linear-gradient(105deg, #0876c5, #1191dd);
          color: white;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 7px 18px rgba(8, 118, 197, 0.18);
        }

        .newRequestButton span {
          font-size: 20px;
        }

        .newRequestButton b {
          margin-left: auto;
        }

        .sideCard {
          padding: 15px;
        }

        .sideCard h2 {
          margin-bottom: 10px;
        }

        .quick {
          width: 100%;
          min-height: 78px;
          border: 1px solid #d6e3ee;
          background: #ffffff;
          border-radius: 10px;
          padding: 11px 12px;
          display: flex;
          align-items: center;
          gap: 11px;
          text-align: left;
          cursor: pointer;
          box-sizing: border-box;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        .quick + .quick {
          margin-top: 10px;
        }

        .quick:hover {
          border-color: #0b78c8;
          background: #f7fbff;
          box-shadow: 0 4px 12px rgba(11, 120, 200, 0.10);
          transform: translateY(-1px);
        }

        .quickIcon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 9px;
          background: #e8f4fd;
          color: #0876c5;
          display: grid;
          place-items: center;
          font-size: 17px;
          font-weight: 700;
        }

        .quick strong {
          display: block;
          color: #173a5b;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .quick span {
          display: block;
          color: #718499;
          font-size: 10px;
          line-height: 1.35;
          margin-top: 0;
        }

        .quick b {
          margin-left: auto;
          color: #0876c5;
          font-size: 18px;
          font-weight: 700;
        }

        .sideCardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sideCardHeader button {
          border: 0;
          background: transparent;
          color: #0874c0;
          font-size: 9px;
          cursor: pointer;
        }

        .bigProfile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 0;
        }

        .bigAvatar {
          width: 42px;
          height: 42px;
          font-size: 12px;
        }

        .bigProfile strong {
          display: block;
          color: #294762;
          font-size: 11px;
        }

        .bigProfile span {
          display: block;
          color: #8797a8;
          font-size: 8px;
          margin-top: 3px;
        }

        .profileInfo {
          border-top: 1px solid #edf1f5;
          padding-top: 10px;
        }

        .profileInfo p {
          color: #687e93;
          font-size: 9px;
          margin: 8px 0;
        }

        .helpCard {
          background: white;
          border: 1px solid #e3ebf2;
          border-radius: 10px;
          padding: 16px;
        }

        .helpIcon {
          width: 39px;
          height: 39px;
          background: #e8f5ff;
          color: #0874bd;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 19px;
        }

        .helpCard h2 {
          color: #294762;
          font-size: 13px;
          margin: 9px 0 3px;
        }

        .helpCard p {
          color: #8797a7;
          font-size: 9px;
          line-height: 1.5;
          margin: 0 0 10px;
        }

        .helpCard button {
          width: 100%;
          border: 1px solid #cde6f8;
          background: #eaf6ff;
          color: #0872bd;
          border-radius: 6px;
          padding: 8px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        /* OTHER PAGES */

        .pageHeader > .card,
        .pageHeader > .fullCard,
        .pageHeader > .assetCategoryGrid,
        .pageHeader > .success {
          margin-top: 18px;
        }

        .pageHeader {
          margin-bottom: 20px;
        }

        .pageHeader h1 {
          margin: 0;
          color: #102f4e;
          font-size: 26px;
        }

        .pageHeader > p {
          margin: 5px 0;
          color: #7e90a2;
          font-size: 11px;
        }

        .fullCard {
          width: 100%;
        }

        .requestFullList {
          padding: 3px 18px;
        }

        .fullRequest {
          display: grid;
          grid-template-columns: 1.3fr 2fr 120px 110px 55px;
          align-items: center;
          gap: 15px;
          padding: 16px 0;
          border-bottom: 1px solid #edf1f5;
        }

        .fullRequest:last-child {
          border-bottom: 0;
        }

        .requestNumber {
          color: #0871bc;
          font-size: 10px;
          font-weight: 700;
        }

        .requestSubject strong,
        .requestSubject span {
          display: block;
        }

        .requestSubject strong {
          color: #304d67;
          font-size: 11px;
        }

        .requestSubject span,
        .requestDate {
          color: #8a9aaa;
          font-size: 9px;
          margin-top: 3px;
        }

        .assetCategoryGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .assetCategory {
          background: white;
          border: 1px solid #e3ebf2;
          border-radius: 9px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .assetCategory > span {
          font-size: 22px;
        }

        .assetCategory strong,
        .assetCategory small {
          display: block;
        }

        .assetCategory strong {
          color: #183a59;
          font-size: 18px;
        }

        .assetCategory small {
          color: #8a9bab;
          font-size: 9px;
          margin-top: 2px;
        }

        .largeAssetGrid {
          padding: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .formCard {
          padding: 24px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .formGrid label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #405a73;
          font-size: 10px;
          font-weight: 700;
        }

        .formGrid .full {
          grid-column: 1 / -1;
        }

        .formGrid input,
        .formGrid select,
        .formGrid textarea {
          width: 100%;
          border: 1px solid #dbe5ee;
          border-radius: 7px;
          background: #fbfdff;
          outline: none;
          padding: 11px;
          color: #29445e;
          font-family: inherit;
          font-size: 11px;
        }

        .formGrid textarea {
          resize: vertical;
        }

        .formGrid input:focus,
        .formGrid select:focus,
        .formGrid textarea:focus {
          border-color: #4b9bd1;
          box-shadow: 0 0 0 3px rgba(8, 118, 197, 0.08);
        }

        .formButtons {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #edf1f5;
        }

        .cancelButton {
          border: 1px solid #dbe4ec;
          background: white;
          color: #60758a;
          border-radius: 6px;
          padding: 10px 16px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .submitButton {
          border: 0;
          background: #0876c5;
          color: white;
          border-radius: 6px;
          padding: 10px 17px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .success {
          background: #e7f8ee;
          color: #25834d;
          border: 1px solid #ccebd9;
          border-radius: 7px;
          padding: 11px 14px;
          font-size: 10px;
        }

        .profilePage {
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .profilePageAvatar {
          width: 65px;
          height: 65px;
          font-size: 19px;
        }

        .profilePage h2 {
          margin: 0;
          color: #213f5a;
          font-size: 17px;
        }

        .profilePage > div:nth-child(2) p {
          color: #8998a7;
          font-size: 10px;
          margin: 4px 0 0;
        }

        .profileDetails {
          width: 100%;
          margin-left: 20px;
          border-left: 1px solid #edf1f5;
          padding-left: 25px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .profileDetails small,
        .profileDetails strong {
          display: block;
        }

        .profileDetails small {
          color: #96a3b0;
          font-size: 8px;
        }

        .profileDetails strong {
          color: #4a6279;
          font-size: 10px;
          margin-top: 3px;
        }


        .profilePageTop { display:flex; align-items:center; gap:17px; width:100%; }
        .profileEditButton { margin-left:auto; border:1px solid #cfe5f5; background:#f0f8ff; color:#0872bd; border-radius:6px; padding:8px 11px; display:flex; align-items:center; gap:6px; font-size:9px; font-weight:700; cursor:pointer; }
        .modalBackdrop { position:fixed; inset:0; z-index:100; background:rgba(10,38,65,.34); backdrop-filter:blur(3px); display:grid; place-items:center; padding:18px; }
        .profileModal { width:min(560px,100%); background:#fff; border-radius:14px; box-shadow:0 22px 70px rgba(11,48,82,.24); overflow:hidden; }
        .modalHeader { padding:22px 24px 18px; border-bottom:1px solid #edf1f5; display:flex; justify-content:space-between; align-items:flex-start; }
        .modalHeader span { color:#0876c5; font-size:8px; font-weight:800; letter-spacing:1.5px; }
        .modalHeader h2 { margin:5px 0 3px; color:#173858; font-size:18px; }
        .modalHeader p { margin:0; color:#8798a9; font-size:10px; }
        .modalClose { border:0; background:#f2f6fa; color:#65788c; width:30px; height:30px; border-radius:50%; font-size:20px; cursor:pointer; }
        .modalBody { padding:22px 24px; }
        .profileEditGrid { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
        .profileEditGrid label { display:flex; flex-direction:column; gap:7px; color:#405a73; font-size:10px; font-weight:700; }
        .profileEditGrid input { width:100%; border:1px solid #dbe5ee; border-radius:7px; background:#fbfdff; outline:none; padding:11px; color:#29445e; font-family:inherit; font-size:11px; }
        .profileEditGrid input:focus { border-color:#4b9bd1; box-shadow:0 0 0 3px rgba(8,118,197,.08); }
        .readonlyField { margin-top:17px; padding:12px; background:#f7fafc; border:1px solid #e7eef4; border-radius:8px; }
        .readonlyField span,.readonlyField strong,.readonlyField small { display:block; }
        .readonlyField span { color:#96a3b0; font-size:8px; }
        .readonlyField strong { color:#4a6279; font-size:10px; margin-top:4px; }
        .readonlyField small { color:#9aa8b5; font-size:8px; margin-top:3px; }
        .modalFooter { padding:15px 24px; border-top:1px solid #edf1f5; display:flex; justify-content:flex-end; gap:9px; }
\n        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .dashboardGrid {
            grid-template-columns: 1fr;
          }

          .rightColumn {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .newRequestButton {
            min-height: 70px;
          }

          .helpCard {
            grid-column: span 2;
          }

          .categories {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 70px;
            padding: 15px 8px;
          }

          .brand {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
          }

          .brand div {
            display: none;
          }

          .navTitle {
            display: none;
          }

          .nav {
            justify-content: center;
            padding: 12px 4px;
            font-size: 0;
          }

          .nav span {
            font-size: 17px;
          }

          .nav b {
            display: none;
          }

          .supportStatus {
            justify-content: center;
          }

          .supportStatus div {
            display: none;
          }

          .main {
            margin-left: 70px;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .assetCards {
            grid-template-columns: repeat(2, 1fr);
          }

          .largeAssetGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .assetCategoryGrid {
            grid-template-columns: repeat(3, 1fr);
          }

          .tableHead {
            display: none;
          }

          .tableRow {
            grid-template-columns: 25px 1fr 1fr;
            padding: 12px;
          }

          .tableRow > span:nth-child(4),
          .tableRow > span:nth-child(5) {
            display: none;
          }

          .fullRequest {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {\n          .profileEditGrid { grid-template-columns:1fr; }\n          .profilePageTop { flex-wrap:wrap; }\n          .profileEditButton { margin-left:0; }
          .topbar {
            padding: 0 12px;
          }

          .search {
            width: 180px;
          }

          .profileMini > div:nth-child(2),
          .profileMini > b {
            display: none;
          }

          .content {
            padding: 15px 10px;
          }

          .hero {
            height: auto;
            padding: 22px;
          }

          .heroText {
            display: none;
          }

          .hero h1 {
            font-size: 21px;
          }

          .stats {
            gap: 7px;
          }

          .stat {
            padding: 11px;
          }

          .statIcon {
            width: 33px;
            height: 33px;
          }

          .categories {
            grid-template-columns: repeat(3, 1fr);
          }

          .assetCards,
          .largeAssetGrid {
            grid-template-columns: 1fr;
          }

          .rightColumn {
            grid-template-columns: 1fr;
          }

          .helpCard {
            grid-column: auto;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .formGrid .full {
            grid-column: auto;
          }

          .assetCategoryGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .profilePage {
            flex-direction: column;
            align-items: flex-start;
          }

          .profileDetails {
            margin-left: 0;
            border-left: 0;
            border-top: 1px solid #edf1f5;
            padding: 15px 0 0;
          }
        }
      `}</style>
    </div>
  );
}

/* STAT CARD */

function Stat({
  icon,
  title,
  value,
  type,
}: {
  icon: IconName;
  title: string;
  value: string;
  type: string;
}) {
  return (
    <div
      className={`stat ${type}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        className={`statIcon ${type}`}
        style={{ margin: "0 auto", flexShrink: 0 }}
      >
        <Icon name={icon} size={21} />
      </div>

      <div
        className="statContent"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          width: "100%",
          marginTop: "9px",
        }}
      >
        <span className="statLabel">{title}</span>
        <span className="statValue">{value}</span>
      </div>
    </div>
  );
}

/* QUICK ACTION */

function QuickAction({
  icon,
  title,
  text,
  onClick,
}: {
  icon: IconName;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button className="quick" onClick={onClick}>
      <div className="quickIcon"><Icon name={icon} size={16} /></div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <b><Icon name="arrow" size={14} /></b>
    </button>
  );
}

/* ASSET CARD */

function AssetCard({
  asset,
  onRequest,
}: {
  asset: {
    name: string;
    type: string;
    icon: IconName;
    serial: string;
    location: string;
    status: string;
  };
  onRequest: () => void;
}) {
  const status =
    asset.status === "Active"
      ? "green"
      : asset.status === "Under Service"
        ? "orange"
        : "purple";

  return (
    <div className="assetCard">
      <div className="assetImage"><Icon name={asset.icon} size={22} /></div>

      <div className="assetTop">
        <span className="assetType">{asset.type}</span>

        <em className={`status ${status}`}>{asset.status}</em>
      </div>

      <h3>{asset.name}</h3>

      <div className="assetDetails">
        SN: {asset.serial}
        <br />
        Location: {asset.location}
      </div>

      <button className="assetRequest" onClick={onRequest}>
        Request Service →
      </button>
    </div>
  );
}

/* PAGE HEADER */

function PageHeader({
  eyebrow,
  title,
  text,
  button,
  onClick,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  button?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "15px",
        }}
      >
        <div>
          <div
            style={{
              color: "#0876c5",
              fontSize: "9px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              marginBottom: "6px",
            }}
          >
            {eyebrow}
          </div>

          <h1
            style={{
              margin: 0,
              color: "#102f4e",
              fontSize: "26px",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#7e90a2",
              fontSize: "11px",
            }}
          >
            {text}
          </p>
        </div>

        {button && (
          <button
            onClick={onClick}
            style={{
              border: 0,
              background: "#0876c5",
              color: "white",
              borderRadius: "7px",
              padding: "11px 15px",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {button}
          </button>
        )}
      </div>

      {children}
    </>
  );
}
