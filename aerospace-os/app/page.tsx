"use client";

import { useState } from "react";

type Status =
  | "Submitted"
  | "Under Review"
  | "Quote Sent"
  | "Customer Action Required"
  | "Accepted"
  | "Ticket Created"
  | "Assigned"
  | "Rejected";

type Request = {
  id: string;
  customer: string;
  site: string;
  service: string;
  date: string;
  time: string;
  description: string;
  qty: number;
  status: Status;

  labour: number;
  material: number;
  travel: number;
  other: number;
  gst: number;

  available: boolean;
  proposedDate: string;
  proposedTime: string;
  notes: string;

  ticket?: string;
};

const initialRequests: Request[] = [
  {
    id: "SR-2026-90361",
    customer: "ABC Industries Pvt. Ltd.",
    site: "Gurugram Office",
    service: "CCTV Installation",
    date: "2026-09-25",
    time: "1:00 PM – 2:00 PM",
    description:
      "Install 1 new IP camera at reception and configure with existing NVR.",
    qty: 1,
    status: "Submitted",

    labour: 0,
    material: 0,
    travel: 0,
    other: 0,
    gst: 0,

    available: true,
    proposedDate: "2026-09-25",
    proposedTime: "1:00 PM – 2:00 PM",
    notes: "",
  },

  {
    id: "SR-2026-00125",
    customer: "ABC Industries Pvt. Ltd.",
    site: "Gurugram Office",
    service: "CCTV Installation",
    date: "2026-09-25",
    time: "1:00 PM – 2:00 PM",
    description:
      "Install 1 new IP camera at reception and configure with existing NVR.",
    qty: 1,
    status: "Quote Sent",

    labour: 1800,
    material: 3200,
    travel: 500,
    other: 0,
    gst: 990,

    available: true,
    proposedDate: "2026-09-25",
    proposedTime: "1:00 PM – 2:00 PM",
    notes: "Camera supplied by Aerospace Computers.",
  },

  {
    id: "SR-2026-00124",
    customer: "Northstar Finance",
    site: "Delhi HQ",
    service: "Network Support",
    date: "2026-09-26",
    time: "11:00 AM – 1:00 PM",
    description:
      "Network troubleshooting and configuration.",
    qty: 1,
    status: "Under Review",

    labour: 0,
    material: 0,
    travel: 0,
    other: 0,
    gst: 0,

    available: true,
    proposedDate: "2026-09-26",
    proposedTime: "11:00 AM – 1:00 PM",
    notes: "",
  },
];

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function total(request: Request) {
  return (
    request.labour +
    request.material +
    request.travel +
    request.other +
    request.gst
  );
}

function statusClass(status: Status) {
  if (
    status === "Quote Sent" ||
    status === "Customer Action Required"
  ) {
    return "statusBlue";
  }

  if (status === "Under Review") {
    return "statusYellow";
  }

  if (
    status === "Accepted" ||
    status === "Ticket Created" ||
    status === "Assigned"
  ) {
    return "statusGreen";
  }

  if (status === "Rejected") {
    return "statusRed";
  }

  return "statusGrey";
}

export default function AerospaceOS() {
  const [active, setActive] = useState("dashboard");

  const [requests, setRequests] =
    useState<Request[]>(initialRequests);

  const [selectedId, setSelectedId] =
    useState("SR-2026-90361");

  const [message, setMessage] = useState("");

  const selectedRequest =
    requests.find((r) => r.id === selectedId) ||
    requests[0];

  function updateSelected(
    field: keyof Request,
    value: any
  ) {
    setRequests((current) =>
      current.map((request) =>
        request.id === selectedId
          ? {
              ...request,
              [field]: value,
            }
          : request
      )
    );
  }

  function saveDraft() {
    setRequests((current) =>
      current.map((request) =>
        request.id === selectedId
          ? {
              ...request,
              status: "Under Review",
            }
          : request
      )
    );

    setMessage("✓ Draft saved successfully.");
  }

  function sendOffer() {
    const request = requests.find(
      (r) => r.id === selectedId
    );

    if (!request) {
      setMessage("Request not found.");
      return;
    }

    if (!request.available) {
      setMessage(
        "Please mark the requested service as available before sending the offer."
      );
      return;
    }

    if (!request.proposedDate) {
      setMessage("Please enter a proposed date.");
      return;
    }

    if (!request.proposedTime) {
      setMessage("Please enter a proposed time.");
      return;
    }

    setRequests((current) =>
      current.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              status: "Customer Action Required",
            }
          : r
      )
    );

    setMessage(
      "✓ Offer sent to customer for approval."
    );
  }

  function acceptRequest() {
    const request = requests.find(
      (r) => r.id === selectedId
    );

    if (!request) {
      setMessage("Request not found.");
      return;
    }

    if (
      request.status !==
      "Customer Action Required"
    ) {
      setMessage(
        "This request is not currently awaiting customer approval."
      );
      return;
    }

    setRequests((current) =>
      current.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              status: "Accepted",
            }
          : r
      )
    );

    setMessage(
      "✓ Customer accepted the proposed schedule and price."
    );
  }

  function rejectRequest() {
    setRequests((current) =>
      current.map((request) =>
        request.id === selectedId
          ? {
              ...request,
              status: "Rejected",
            }
          : request
      )
    );

    setMessage("Request rejected.");
  }

  function createTicket() {
    const request = requests.find(
      (r) => r.id === selectedId
    );

    if (!request) {
      setMessage("Request not found.");
      return;
    }

    if (request.status !== "Accepted") {
      setMessage(
        "Customer must accept the quotation before creating a ticket."
      );
      return;
    }

    if (request.ticket) {
      setMessage(
        `Ticket ${request.ticket} already exists.`
      );
      return;
    }

    const ticketNumber = `TK-${request.id.replace(
      "SR-",
      ""
    )}`;

    setRequests((current) =>
      current.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              status: "Ticket Created",
              ticket: ticketNumber,
            }
          : r
      )
    );

    setMessage(
      `✓ Ticket ${ticketNumber} created successfully.`
    );
  }

  function assignEngineer(requestId: string) {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId &&
        request.status === "Ticket Created"
          ? {
              ...request,
              status: "Assigned",
            }
          : request
      )
    );

    setMessage(
      "✓ Ticket assigned to engineer."
    );
  }

  function renderDashboard() {
    const openRequests = requests.filter(
      (r) =>
        r.status !== "Rejected" &&
        r.status !== "Ticket Created" &&
        r.status !== "Assigned"
    ).length;

    const awaitingCustomer =
      requests.filter(
        (r) =>
          r.status ===
          "Customer Action Required"
      ).length;

    const tickets = requests.filter(
      (r) =>
        r.status === "Ticket Created" ||
        r.status === "Assigned"
    ).length;

    const quotedValue = requests
      .filter(
        (r) =>
          r.status === "Quote Sent" ||
          r.status ===
            "Customer Action Required"
      )
      .reduce(
        (sum, r) => sum + total(r),
        0
      );

    return (
      <>
        <h1>Service Operations</h1>

        <div className="kpis">
          <div className="card">
            <span>Open requests</span>
            <strong>{openRequests}</strong>
          </div>

          <div className="card">
            <span>Awaiting customer</span>
            <strong>
              {awaitingCustomer}
            </strong>
          </div>

          <div className="card">
            <span>Tickets created</span>
            <strong>{tickets}</strong>
          </div>

          <div className="card">
            <span>Quoted value</span>
            <strong>
              {money(quotedValue)}
            </strong>
          </div>
        </div>

        <div className="dashboardGrid">
          <div className="panel">
            <h2>Latest Service Requests</h2>

            {requests.map((request) => (
              <div
                key={request.id}
                className="requestRow"
                onClick={() => {
                  setSelectedId(request.id);
                  setActive("requests");
                }}
              >
                <div>
                  <strong>
                    {request.id} ·{" "}
                    {request.service}
                  </strong>

                  <small>
                    {request.customer} ·{" "}
                    {request.site}
                  </small>
                </div>

                <span
                  className={statusClass(
                    request.status
                  )}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>

          <CustomerRequestForm />
        </div>
      </>
    );
  }

  function CustomerRequestForm() {
    const [service, setService] =
      useState("CCTV Installation");

    const [description, setDescription] =
      useState("");

    function submitRequest() {
      const newId =
        "SR-2026-" +
        Math.floor(
          10000 + Math.random() * 89999
        );

      const newRequest: Request = {
        id: newId,
        customer: "Demo Customer",
        site: "Main Office",
        service,
        date: "2026-09-25",
        time: "1:00 PM – 2:00 PM",
        description:
          description ||
          "Customer requested IT service.",
        qty: 1,
        status: "Submitted",

        labour: 0,
        material: 0,
        travel: 0,
        other: 0,
        gst: 0,

        available: true,
        proposedDate: "2026-09-25",
        proposedTime:
          "1:00 PM – 2:00 PM",
        notes: "",
      };

      setRequests((current) => [
        newRequest,
        ...current,
      ]);

      setSelectedId(newId);
      setMessage(
        "✓ Service request submitted."
      );
    }

    return (
      <div className="customerForm">
        <div className="formHeader">
          <small>
            AEROSPACE COMPUTERS
          </small>

          <h2>Request IT Service</h2>

          <p>
            Tell us what you need. We will
            confirm availability and charges.
          </p>
        </div>

        <div className="formBody">
          <label>Service</label>

          <select
            value={service}
            onChange={(e) =>
              setService(e.target.value)
            }
          >
            <option>
              CCTV Installation
            </option>

            <option>Networking</option>
            <option>Server</option>
            <option>IT Support</option>
            <option>Hardware</option>
            <option>Cybersecurity</option>
            <option>AMC</option>
          </select>

          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Describe the work required..."
          />

          <button
            type="button"
            className="primaryButton"
            onClick={submitRequest}
          >
            Submit Service Request
          </button>
        </div>
      </div>
    );
  }

  function renderRequests() {
    return (
      <>
        <h1>Service Requests</h1>

        <div className="requestLayout">
          <div className="requestList">
            {requests.map((request) => (
              <div
                key={request.id}
                className={
                  request.id === selectedId
                    ? "requestItem selected"
                    : "requestItem"
                }
                onClick={() =>
                  setSelectedId(request.id)
                }
              >
                <div>
                  <strong>
                    {request.id}
                  </strong>

                  <small>
                    {request.customer} ·{" "}
                    {request.service}
                  </small>

                  <small>
                    Requested:{" "}
                    {request.date} ·{" "}
                    {request.time}
                  </small>
                </div>

                <span
                  className={statusClass(
                    request.status
                  )}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>

          <div className="editor">
            <div className="editorTop">
              <small>
                SERVICE REQUEST
              </small>

              <h2>
                {selectedRequest.id}
              </h2>

              <span
                className={statusClass(
                  selectedRequest.status
                )}
              >
                {selectedRequest.status}
              </span>
            </div>

            <div className="customerInfo">
              <strong>
                {selectedRequest.customer}
              </strong>

              <span>
                {selectedRequest.site}
              </span>

              <span>
                Customer requested:{" "}
                {selectedRequest.date} ·{" "}
                {selectedRequest.time}
              </span>

              <span>
                Requirement:{" "}
                {selectedRequest.description}
              </span>
            </div>

            <label>
              Availability
            </label>

            <select
              value={
                selectedRequest.available
                  ? "Available"
                  : "Not Available"
              }
              onChange={(e) =>
                updateSelected(
                  "available",
                  e.target.value ===
                    "Available"
                )
              }
            >
              <option>
                Available
              </option>

              <option>
                Not Available
              </option>
            </select>

            <div className="twoColumns">
              <div>
                <label>
                  Proposed date
                </label>

                <input
                  type="date"
                  value={
                    selectedRequest.proposedDate
                  }
                  onChange={(e) =>
                    updateSelected(
                      "proposedDate",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>
                  Proposed time
                </label>

                <input
                  type="text"
                  value={
                    selectedRequest.proposedTime
                  }
                  placeholder="1:00 PM – 2:00 PM"
                  onChange={(e) =>
                    updateSelected(
                      "proposedTime",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <label>
              Labour
            </label>

            <input
              type="number"
              value={
                selectedRequest.labour
              }
              onChange={(e) =>
                updateSelected(
                  "labour",
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <label>
              Installation Material
            </label>

            <input
              type="number"
              value={
                selectedRequest.material
              }
              onChange={(e) =>
                updateSelected(
                  "material",
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <div className="twoColumns">
              <div>
                <label>
                  Travel
                </label>

                <input
                  type="number"
                  value={
                    selectedRequest.travel
                  }
                  onChange={(e) =>
                    updateSelected(
                      "travel",
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </div>

              <div>
                <label>
                  Other
                </label>

                <input
                  type="number"
                  value={
                    selectedRequest.other
                  }
                  onChange={(e) =>
                    updateSelected(
                      "other",
                      Number(
                        e.target.value
                      )
                    )
                  }
                />
              </div>
            </div>

            <label>
              GST
            </label>

            <input
              type="number"
              value={
                selectedRequest.gst
              }
              onChange={(e) =>
                updateSelected(
                  "gst",
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <label>
              Notes to customer
            </label>

            <textarea
              value={
                selectedRequest.notes
              }
              onChange={(e) =>
                updateSelected(
                  "notes",
                  e.target.value
                )
              }
            />

            <div className="totalBox">
              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {money(
                    selectedRequest.labour +
                      selectedRequest.material +
                      selectedRequest.travel +
                      selectedRequest.other
                  )}
                </strong>
              </div>

              <div>
                <span>GST</span>

                <strong>
                  {money(
                    selectedRequest.gst
                  )}
                </strong>
              </div>

              <div className="grandTotal">
                <span>Total</span>

                <strong>
                  {money(
                    total(
                      selectedRequest
                    )
                  )}
                </strong>
              </div>
            </div>

            <div className="actions">
              {(selectedRequest.status ===
                "Submitted" ||
                selectedRequest.status ===
                  "Under Review") && (
                <>
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={saveDraft}
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    className="primaryButton"
                    onClick={sendOffer}
                  >
                    Send Offer to Customer
                  </button>
                </>
              )}

              {selectedRequest.status ===
                "Quote Sent" && (
                <button
                  type="button"
                  className="primaryButton"
                  onClick={sendOffer}
                >
                  Send Offer to Customer
                </button>
              )}

              {selectedRequest.status ===
                "Customer Action Required" && (
                <div className="successMessage">
                  Waiting for customer to review
                  and accept the proposed price
                  and schedule.
                </div>
              )}

              {selectedRequest.status ===
                "Accepted" && (
                <button
                  type="button"
                  className="primaryButton"
                  onClick={createTicket}
                >
                  Create Ticket
                </button>
              )}

              {selectedRequest.status ===
                "Ticket Created" && (
                <div className="successMessage">
                  ✓ Ticket{" "}
                  {selectedRequest.ticket}{" "}
                  created. Ready for engineer
                  assignment.
                </div>
              )}

              {selectedRequest.status ===
                "Assigned" && (
                <div className="successMessage">
                  ✓ Engineer assigned to this
                  ticket.
                </div>
              )}
            </div>

            {message && (
              <div className="successMessage">
                {message}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  function renderPortal() {
    const offer = requests.find(
      (r) =>
        r.status ===
        "Customer Action Required"
    );

    return (
      <>
        <h1>Customer Portal</h1>

        {!offer ? (
          <div className="emptyState">
            No quotation is currently
            awaiting customer action.
          </div>
        ) : (
          <div className="quoteCard">
            <small>
              SERVICE OFFER
            </small>

            <h2>{offer.id}</h2>

            <p>
              <strong>
                Service:
              </strong>{" "}
              {offer.service}
            </p>

            <p>
              <strong>
                Requirement:
              </strong>{" "}
              {offer.description}
            </p>

            <hr />

            <p>
              <strong>
                Your requested schedule:
              </strong>
              <br />
              {offer.date} ·{" "}
              {offer.time}
            </p>

            <p>
              <strong>
                Aerospace proposed schedule:
              </strong>
              <br />
              {offer.proposedDate} ·{" "}
              {offer.proposedTime}
            </p>

            <hr />

            <div>
              Labour:{" "}
              {money(offer.labour)}
            </div>

            <div>
              Installation Material:{" "}
              {money(offer.material)}
            </div>

            <div>
              Travel:{" "}
              {money(offer.travel)}
            </div>

            <div>
              Other:{" "}
              {money(offer.other)}
            </div>

            <div>
              GST:{" "}
              {money(offer.gst)}
            </div>

            <h2>
              Total:{" "}
              {money(total(offer))}
            </h2>

            <div className="actions">
              <button
                type="button"
                className="secondaryButton"
                onClick={rejectRequest}
              >
                Reject
              </button>

              <button
                type="button"
                className="primaryButton"
                onClick={acceptRequest}
              >
                Accept & Confirm
              </button>
            </div>

            {message && (
              <div className="successMessage">
                {message}
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  function renderTickets() {
    const tickets = requests.filter(
      (r) => r.ticket
    );

    return (
      <>
        <h1>Tickets</h1>

        <div className="panel">
          {tickets.length === 0 ? (
            <div className="emptyState">
              No tickets created yet.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                className="requestRow"
                key={ticket.ticket}
              >
                <div>
                  <strong>
                    {ticket.ticket}
                  </strong>

                  <small>
                    {ticket.customer} ·{" "}
                    {ticket.service}
                  </small>

                  <small>
                    Approved schedule:{" "}
                    {ticket.proposedDate} ·{" "}
                    {ticket.proposedTime}
                  </small>

                  <small>
                    Approved amount:{" "}
                    {money(
                      total(ticket)
                    )}
                  </small>
                </div>

                {ticket.status ===
                "Ticket Created" ? (
                  <button
                    type="button"
                    className="primaryButton"
                    onClick={() =>
                      assignEngineer(
                        ticket.id
                      )
                    }
                  >
                    Assign Engineer
                  </button>
                ) : (
                  <span className="statusGreen">
                    Engineer Assigned
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  function renderSimplePage(
    title: string
  ) {
    return (
      <>
        <h1>{title}</h1>

        <div className="panel">
          <h2>{title}</h2>

          <p>
            This module is part of the
            Aerospace OS and will be connected
            to the central customer, ticket and
            engineer system.
          </p>
        </div>
      </>
    );
  }

  function renderContent() {
    if (active === "dashboard") {
      return renderDashboard();
    }

    if (active === "requests") {
      return renderRequests();
    }

    if (active === "portal") {
      return renderPortal();
    }

    if (active === "tickets") {
      return renderTickets();
    }

    if (active === "consultation") {
      return renderSimplePage(
        "Website Consultation"
      );
    }

    if (active === "customers") {
      return renderSimplePage(
        "Customers"
      );
    }

    if (active === "engineers") {
      return renderSimplePage(
        "Engineers"
      );
    }

    return renderSimplePage(
      "AMC & Assets"
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          ✦ Aerospace OS
        </div>

        <div className="subtitle">
          Service Operations
        </div>

        <nav>
          <button
            type="button"
            onClick={() =>
              setActive("dashboard")
            }
            className={
              active === "dashboard"
                ? "navActive"
                : ""
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("requests")
            }
            className={
              active === "requests"
                ? "navActive"
                : ""
            }
          >
            Service Requests
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("portal")
            }
            className={
              active === "portal"
                ? "navActive"
                : ""
            }
          >
            Customer Portal
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("consultation")
            }
            className={
              active === "consultation"
                ? "navActive"
                : ""
            }
          >
            Website Consultation
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("tickets")
            }
            className={
              active === "tickets"
                ? "navActive"
                : ""
            }
          >
            Tickets
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("customers")
            }
            className={
              active === "customers"
                ? "navActive"
                : ""
            }
          >
            Customers
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("engineers")
            }
            className={
              active === "engineers"
                ? "navActive"
                : ""
            }
          >
            Engineers
          </button>

          <button
            type="button"
            onClick={() =>
              setActive("assets")
            }
            className={
              active === "assets"
                ? "navActive"
                : ""
            }
          >
            AMC & Assets
          </button>
        </nav>

        <div className="workflow">
          MVP workflow:
          <br />
          Request → Quote →
          <br />
          Customer Approval →
          <br />
          Ticket → Assignment
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <small>
              AEROSPACE COMPUTERS
            </small>
          </div>

          <div className="online">
            System Online
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}