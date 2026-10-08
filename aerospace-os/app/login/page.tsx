"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (data.user.role === "engineer") {
        router.push("/dashboard/engineer");
      } else {
        router.push("/dashboard/customer");
      }
    } catch {
      setError("Unable to connect to the server");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="grid min-h-[650px] md:grid-cols-2">

          {/* LEFT BRAND PANEL */}
          <div className="relative hidden md:flex flex-col justify-between overflow-hidden bg-[#071a36] p-12 text-white">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative z-10">
              <img
                src="https://aerospacecomputers.in/images/logo.svg"
                alt="Aerospace Computers"
                className="h-16 w-auto object-contain object-left brightness-0 invert"
              />
            </div>

            <div className="relative z-10 max-w-md">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                Service Operations Portal
              </p>

              <h2 className="text-5xl font-bold leading-tight">
                Manage your IT
                <span className="block text-blue-300">
                  with confidence.
                </span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                A professional service portal for managing requests,
                support operations, tickets and IT infrastructure.
              </p>
            </div>

            <div className="relative z-10 text-sm text-slate-400">
              © {new Date().getFullYear()} Aerospace Computers
            </div>
          </div>

          {/* RIGHT LOGIN PANEL */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-md">

              {/* MOBILE LOGO */}
              <div className="mb-8 flex justify-center md:hidden">
                <img
                  src="https://aerospacecomputers.in/images/logo.svg"
                  alt="Aerospace Computers"
                  className="h-14 w-auto object-contain"
                />
              </div>

              {/* HEADING */}
              <div className="mb-8 text-center">
                <div className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Aerospace OS
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-[#071a36] sm:text-5xl">
                  Welcome to
                  <span className="block text-blue-600">
                    Aerospace OS
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Sign in to access your service operations portal.
                </p>
              </div>

              {/* LOGIN CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                    </div>
                  )}

                  {/* SIGN IN */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0757b8] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#064b9d] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                {/* REGISTER */}
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    New customer?
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="w-full rounded-xl border-2 border-[#0757b8] bg-white px-5 py-3.5 text-sm font-bold text-[#0757b8] transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Create an Account
                </button>
              </div>

              {/* FOOTER */}
              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Aerospace Computers · Aerospace OS
                <br />
                Secure Service Management Portal
              </p>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
