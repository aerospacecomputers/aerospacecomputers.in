"use client";

import { FormEvent, useEffect, useState } from "react";

interface ServiceRequest {
  _id: string;
  requestNumber: string;
  subject: string;
  description: string;
  serviceType?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  status: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  async function loadRequests() {
    try {
      const response = await fetch("/api/service-requests", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load requests");
        return;
      }

      setRequests(data.requests || []);
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          description,
          serviceType,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to submit request");
        return;
      }

      setMessage(
        `Request submitted successfully. Request ID: ${data.request.requestNumber}`
      );

      setSubject("");
      setDescription("");
      setServiceType("");
      setPreferredDate("");
      setPreferredTime("");

      await loadRequests();
    } catch {
      setError("Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  function statusLabel(status: string) {
    return status.replaceAll("_", " ");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Aerospace OS
            </h1>

            <p className="text-sm text-slate-400">
              Customer Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold">
            IT Service Center
          </h2>

          <p className="mt-2 text-slate-400">
            Submit a service request and track its progress from here.
          </p>
        </section>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-700 bg-green-950/40 p-4 text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Submit Request */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">
              Submit IT Service Request
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Tell us what you need help with.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Example: Laptop not starting"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Service Type
                </label>

                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select service</option>
                  <option value="Computer / Laptop">
                    Computer / Laptop
                  </option>
                  <option value="Server">
                    Server
                  </option>
                  <option value="Networking">
                    Networking
                  </option>
                  <option value="CCTV">
                    CCTV
                  </option>
                  <option value="Printer">
                    Printer
                  </option>
                  <option value="UPS">
                    UPS
                  </option>
                  <option value="Software">
                    Software
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Describe the Problem
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue or service you require..."
                  required
                  rows={5}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Preferred Date
                  </label>

                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) =>
                      setPreferredDate(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Preferred Time
                  </label>

                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) =>
                      setPreferredTime(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Service Request"}
              </button>
            </form>
          </section>

          {/* Request Status */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  My Service Requests
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Track requests submitted by you.
                </p>
              </div>

              <button
                onClick={loadRequests}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-lg border border-slate-800 p-5 text-center text-slate-400">
                  Loading requests...
                </div>
              ) : requests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
                  No service requests yet.
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-blue-400">
                          {request.requestNumber}
                        </p>

                        <h4 className="mt-1 font-semibold">
                          {request.subject}
                        </h4>
                      </div>

                      <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-medium capitalize text-blue-300">
                        {statusLabel(request.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-400">
                      {request.description}
                    </p>

                    {request.serviceType && (
                      <p className="mt-3 text-xs text-slate-500">
                        Service: {request.serviceType}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-500">
                      Submitted:{" "}
                      {new Date(
                        request.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
