"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type RequestRecord = {
  _id: string;
  requestNumber: string;
  subject: string;
  description: string;
  serviceType?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  status: string;
  createdAt?: string;
  adminNotes?: string | null;
};
type Customer = { name?: string; email?: string; phone?: string; customerType?: string; companyId?: string | null } | null;
type Offer = { proposedDate: string; proposedTime: string; labourCharges: number; installationMaterial: number; travelCharges: number; otherCharges: number; subtotal: number; gstPercentage: number; gstAmount: number; totalAmount: number; status: string; notes?: string } | null;

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);
const dateText = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function AdminRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [record, setRecord] = useState<RequestRecord | null>(null);
  const [customer, setCustomer] = useState<Customer>(null);
  const [offer, setOffer] = useState<Offer>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateDraft, setDateDraft] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeDraft, setTimeDraft] = useState("09:00");
  const [labourCharges, setLabourCharges] = useState("0");
  const [installationMaterial, setInstallationMaterial] = useState("0");
  const [travelCharges, setTravelCharges] = useState("0");
  const [otherCharges, setOtherCharges] = useState("0");
  const [gstPercentage, setGstPercentage] = useState("18");
  const [notes, setNotes] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/service-requests/${id}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load request.");
      setRecord(data.request);
      setCustomer(data.customer || null);
      setOffer(data.offer || null);
      if (data.offer) {
        const d = new Date(data.offer.proposedDate);
        setProposedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        setProposedTime(data.offer.proposedTime || "");
        setDateDraft(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        setTimeDraft(data.offer.proposedTime || "09:00");
        setLabourCharges(String(data.offer.labourCharges ?? 0));
        setInstallationMaterial(String(data.offer.installationMaterial ?? 0));
        setTravelCharges(String(data.offer.travelCharges ?? 0));
        setOtherCharges(String(data.offer.otherCharges ?? 0));
        setGstPercentage(String(data.offer.gstPercentage ?? 18));
        setNotes(data.offer.notes || "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load request.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (id) void load(); }, [id]);

  const subtotal = [labourCharges, installationMaterial, travelCharges, otherCharges].reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const gstAmount = subtotal * Math.max(0, Number(gstPercentage) || 0) / 100;
  const total = subtotal + gstAmount;
  const canSendOffer = !!record && ["submitted", "under_review", "quote_sent", "customer_action_required"].includes(record.status);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/service-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedDate, proposedTime, labourCharges: Number(labourCharges),
          installationMaterial: Number(installationMaterial), travelCharges: Number(travelCharges),
          otherCharges: Number(otherCharges), gstPercentage: Number(gstPercentage), notes,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not send offer.");
      setNotice(data.message || "Offer saved.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send offer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <header className="top">
        <a href="/dashboard/admin" className="back">← Admin Dashboard</a>
        <span className="brand">AEROSPACE OS · ADMIN</span>
      </header>
      {loading ? <div className="state">Loading service request…</div> : !record ? <div className="state error">{error || "Request not found."}</div> : (
        <>
          <section className="heading">
            <div><p className="eyebrow">SERVICE REQUEST REVIEW</p><h1>{record.requestNumber}</h1><p className="muted">Review customer details and prepare the proposed service offer.</p></div>
            <span className="status">{record.status.replace(/_/g, " ")}</span>
          </section>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}
          <div className="columns">
            <div className="left">
              <section className="card">
                <h2>Request details</h2>
                <h3>{record.subject}</h3>
                <p className="description">{record.description}</p>
                <div className="details">
                  <div><span>Service type</span><strong>{record.serviceType || "General support"}</strong></div>
                  <div><span>Received</span><strong>{dateText(record.createdAt)}</strong></div>
                  <div><span>Customer preferred date</span><strong>{dateText(record.preferredDate)}</strong></div>
                  <div><span>Preferred time</span><strong>{record.preferredTime || "Not specified"}</strong></div>
                </div>
                {record.adminNotes && <div className="notes"><strong>Existing admin notes</strong><p>{record.adminNotes}</p></div>}
              </section>
              <section className="card">
                <h2>Customer</h2>
                <div className="customerName">{customer?.name || "Customer"}</div>
                <div className="customerLine">{customer?.email || "Email not available"}</div>
                <div className="customerLine">{customer?.phone || "Phone not available"}</div>
                <span className="customerType">{customer?.customerType === "business" ? "Business customer" : "Individual / home customer"}</span>
              </section>
              {offer && <section className="card">
                <h2>Latest offer</h2>
                <div className="details">
                  <div><span>Status</span><strong>{offer.status.replace(/_/g, " ")}</strong></div>
                  <div><span>Proposed date</span><strong>{dateText(offer.proposedDate)}</strong></div>
                  <div><span>Proposed time</span><strong>{offer.proposedTime}</strong></div>
                  <div><span>Total amount</span><strong>{money(offer.totalAmount)}</strong></div>
                </div>
                <p className="muted small">Sending a revised offer creates a new offer record. Customer acceptance will not automatically create a ticket.</p>
              </section>}
            </div>
            <section className="card offerCard">
              <div className="formHeading"><div><p className="eyebrow">ADMIN ACTION</p><h2>{offer ? "Prepare revised offer" : "Prepare service offer"}</h2></div><span className="lock">Admin only</span></div>
              {!canSendOffer ? <div className="noticeBox">This request is currently <strong>{record.status.replace(/_/g, " ")}</strong> and cannot receive a new offer from this screen.</div> : (
                <form onSubmit={handleSubmit}>
                  <div className="fieldGrid">
                    <label>Proposed service date
                      <div className="pickerField">
                        <input className="pickerDisplay" type="text" value={proposedDate ? new Date(`${proposedDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""} placeholder="dd/mm/yyyy" readOnly onClick={() => { setDateDraft(proposedDate); setShowDatePicker(true); setShowTimePicker(false); }} required />
                        {showDatePicker && <div className="inlinePicker" onClick={event => event.stopPropagation()}>
                          <div className="inlinePickerTitle">Select proposed service date</div>
                          <input type="date" value={dateDraft} min={new Date().toLocaleDateString("en-CA")} onClick={event => event.currentTarget.showPicker?.()} onChange={event => setDateDraft(event.target.value)} />
                          <button type="button" className="inlinePickerOk" onClick={() => { setProposedDate(dateDraft); setShowDatePicker(false); }}>OK</button>
                        </div>}
                      </div>
                    </label>
                    <label>Proposed time
                      <div className="pickerField">
                        <input className="pickerDisplay" type="text" value={proposedTime ? proposedTime.slice(0, 5) : ""} placeholder="Select time" readOnly onClick={() => { setTimeDraft(proposedTime || "09:00"); setShowTimePicker(true); setShowDatePicker(false); }} required />
                        {showTimePicker && <div className="inlinePicker" onClick={event => event.stopPropagation()}>
                          <div className="inlinePickerTitle">Select proposed time</div>
                          <input type="time" value={timeDraft} onClick={event => event.currentTarget.showPicker?.()} onChange={event => setTimeDraft(event.target.value)} />
                          <button type="button" className="inlinePickerOk" onClick={() => { setProposedTime(timeDraft); setShowTimePicker(false); }}>OK</button>
                        </div>}
                      </div>
                    </label>
                  </div>
                  <label>Labour charges (₹)<input type="number" min="0" step="0.01" value={labourCharges} onChange={e => setLabourCharges(e.target.value)} required /></label>
                  <label>Installation / material (₹)<input type="number" min="0" step="0.01" value={installationMaterial} onChange={e => setInstallationMaterial(e.target.value)} required /></label>
                  <div className="fieldGrid">
                    <label>Travel charges (₹)<input type="number" min="0" step="0.01" value={travelCharges} onChange={e => setTravelCharges(e.target.value)} required /></label>
                    <label>Other charges (₹)<input type="number" min="0" step="0.01" value={otherCharges} onChange={e => setOtherCharges(e.target.value)} required /></label>
                  </div>
                  <label>GST (%)<input type="number" min="0" max="100" step="0.01" value={gstPercentage} onChange={e => setGstPercentage(e.target.value)} required /></label>
                  <label>Offer notes for customer<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Scope of work, preparation required, or other details" /></label>
                  <div className="totals">
                    <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                    <div><span>GST ({Number(gstPercentage) || 0}%)</span><strong>{money(gstAmount)}</strong></div>
                    <div className="grand"><span>Total offer</span><strong>{money(total)}</strong></div>
                  </div>
                  <button className="send" type="submit" disabled={saving}>{saving ? "Sending offer…" : offer ? "Send Revised Offer" : "Send Offer to Customer"}</button>
                  <p className="hint">The customer must review and respond to the exact date, time and price. Ticket creation and engineer assignment remain separate admin actions.</p>
                </form>
              )}
            </section>
          </div>
        </>
      )}
      <style jsx>{`
        * { box-sizing:border-box; }
        .page { min-height:100vh; background:#f3f7fb; padding:0 30px 45px; color:#16324e; font-family:Arial,Helvetica,sans-serif; }
        .top { height:70px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e0e8f0; }
        .back { color:#0879bd; text-decoration:none; font-size:12px; font-weight:700; }.brand { color:#56728d; font-size:10px; font-weight:800; letter-spacing:1.4px; }
        .heading { max-width:1300px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; gap:20px; padding:30px 0 22px; }
        .eyebrow { margin:0 0 8px; color:#0b81c8; font-size:9px; letter-spacing:1.7px; font-weight:800; }h1 { margin:0 0 8px; font-size:27px; letter-spacing:-.6px; color:#102b47; }.muted { color:#778ba0; font-size:12px; line-height:1.6; margin:0; }.small { font-size:11px; margin-top:14px; }
        .status,.customerType,.lock { display:inline-flex; align-items:center; padding:8px 10px; border-radius:7px; background:#e5f2ff; color:#176da9; font-size:10px; font-weight:700; text-transform:capitalize; white-space:nowrap; }
        .columns { max-width:1300px; margin:0 auto; display:grid; grid-template-columns:minmax(0,1fr) minmax(340px,.9fr); gap:20px; align-items:start; }.left { display:grid; gap:17px; }
        .card { background:white; border:1px solid #e0e8f0; border-radius:13px; padding:22px; box-shadow:0 5px 18px #173b5b06; min-width:0; }.card h2 { margin:0 0 17px; color:#183b5a; font-size:16px; }.card h3 { margin:0 0 10px; color:#1b3d5c; font-size:15px; }.description { white-space:pre-wrap; color:#5f758c; font-size:12px; line-height:1.75; }
        .details { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:17px; margin-top:21px; }.details div { display:flex; flex-direction:column; gap:6px; min-width:0; }.details span,.totals span { color:#8394a6; font-size:10px; }.details strong { color:#294762; font-size:11px; overflow-wrap:anywhere; text-transform:capitalize; }.notes { margin-top:20px; padding:13px; background:#f6f9fc; border-radius:8px; font-size:11px; }.notes p { color:#647b92; white-space:pre-wrap; }
        .customerName { color:#1b3d5c; font-weight:700; font-size:14px; margin-bottom:9px; }.customerLine { color:#607991; font-size:12px; margin:7px 0; }.customerType { margin-top:10px; background:#f1f6fb; color:#627b93; }
        .offerCard { padding:24px; }.formHeading { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:18px; }.formHeading h2 { margin:0; }.lock { font-size:9px; background:#f0f6fb; color:#6c8399; }
        form label { display:block; margin-bottom:15px; color:#425d77; font-size:11px; font-weight:700; }input,textarea { display:block; width:100%; margin-top:7px; padding:11px 12px; border:1px solid #d5e0ea; border-radius:8px; background:#fff; color:#173650; font:12px Arial,sans-serif; outline-color:#0b81c8; }textarea { resize:vertical; line-height:1.6; }.fieldGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .totals { padding:15px; background:#f5f9fc; border:1px solid #e5edf4; border-radius:9px; }.totals div { display:flex; justify-content:space-between; gap:15px; padding:6px 0; }.totals strong { color:#36536e; font-size:11px; }.totals .grand { margin-top:7px; padding-top:13px; border-top:1px solid #dce7f0; }.totals .grand span { color:#1a4263; font-size:12px; font-weight:800; }.totals .grand strong { color:#0878bc; font-size:18px; }
        .send { width:100%; margin-top:17px; padding:13px; border:0; border-radius:8px; background:#087bc6; color:white; font-size:12px; font-weight:800; cursor:pointer; }.send:disabled { opacity:.6; cursor:wait; }.hint { margin:12px 0 0; color:#8093a7; font-size:10px; line-height:1.6; }.noticeBox { padding:15px; border-radius:9px; background:#fff7e8; color:#8b651f; font-size:12px; line-height:1.6; }
        .alert { max-width:1300px; margin:0 auto 15px; padding:12px 14px; border-radius:8px; font-size:12px; }.error { background:#fff0ef; color:#b42318; }.success { background:#ecfbf2; color:#176b3a; }.state { max-width:1300px; margin:40px auto; padding:30px; background:#fff; border-radius:12px; color:#657c93; }.state.error { color:#b42318; }
        @media(max-width:900px) { .columns { grid-template-columns:1fr; }.page { padding:0 17px 30px; } }
        @media(max-width:480px) { .heading { align-items:flex-start; flex-direction:column; }.fieldGrid,.details { grid-template-columns:1fr; }.card,.offerCard { padding:17px; }.brand { font-size:8px; }.top { height:60px; } }
      `}</style>
    </main>
  );
}
