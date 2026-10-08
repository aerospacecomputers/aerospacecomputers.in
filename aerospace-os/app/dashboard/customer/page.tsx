import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default async function CustomerDashboard() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "customer") {
    redirect("/login");
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

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome to Aerospace OS
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your services, devices, requests and support.
          </p>
        </section>

        {/* Quick Actions */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <DashboardCard
            title="Service Requests"
            description="Submit and track IT service requests."
            value="0"
          />

          <DashboardCard
            title="Devices & Assets"
            description="View your registered devices and equipment."
            value="0"
          />

          <DashboardCard
            title="Upcoming Service"
            description="View your upcoming scheduled services."
            value="0"
          />

          <DashboardCard
            title="Open Tickets"
            description="Track active service tickets."
            value="0"
          />

        </section>

        {/* Customer Information */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Customer Information
            </h3>

            <div className="mt-5 space-y-4 text-sm">

              <InfoRow
                label="Account Type"
                value="Customer"
              />

              <InfoRow
                label="Customer ID"
                value={session.userId}
              />

              <InfoRow
                label="Company"
                value="Not assigned"
              />

              <InfoRow
                label="Status"
                value="Active"
              />

            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Quick Actions
            </h3>

            <div className="mt-5 grid gap-3">

              <a
                href="/service-requests/new"
                className="rounded-xl bg-blue-600 px-5 py-4 font-semibold hover:bg-blue-500"
              >
                + Submit Service Request
              </a>

              <a
                href="/service-requests"
                className="rounded-xl border border-slate-700 px-5 py-4 font-semibold hover:bg-slate-800"
              >
                View My Requests
              </a>

              <a
                href="/assets"
                className="rounded-xl border border-slate-700 px-5 py-4 font-semibold hover:bg-slate-800"
              >
                View Devices & Assets
              </a>

            </div>
          </div>

        </section>

        {/* Recent Requests */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Recent Service Requests
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Your latest service requests will appear here.
              </p>
            </div>

            <a
              href="/service-requests"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View all
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">

            <p className="text-slate-400">
              No service requests yet.
            </p>

            <a
              href="/service-requests/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              Submit your first request
            </a>

          </div>

        </section>

      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-3xl font-bold text-blue-400">
        {value}
      </div>

      <h3 className="mt-3 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-slate-200">
        {value}
      </span>
    </div>
  );
}
