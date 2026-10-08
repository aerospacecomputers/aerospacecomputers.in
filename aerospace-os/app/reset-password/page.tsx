"use client";

import { FormEvent, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to reset your password.");
        return;
      }

      setMessage("Your password has been reset successfully.");
      setTimeout(() => router.push("/login"), 1600);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <div className="brand">
          <img
            src="https://aerospacecomputers.in/images/logo.svg"
            alt="Aerospace Computers"
          />
        </div>

        <div className="content">
          <div className="eyebrow">AEROSPACE OS</div>
          <h1>Reset Password</h1>
          <p className="intro">
            Create a new password for your Aerospace OS account.
          </p>

          <form onSubmit={submit}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading}
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={loading}
            />

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button type="submit" disabled={loading || !token}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>

          <button className="back" type="button" onClick={() => router.push("/login")}>
            ← Back to Sign In
          </button>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: linear-gradient(135deg, #eef7fd 0%, #ffffff 55%, #f5f9fc 100%);
          font-family: Arial, sans-serif;
          color: #173a5b;
        }

        .card {
          width: min(440px, 100%);
          background: #fff;
          border: 1px solid #dce8f1;
          border-radius: 16px;
          box-shadow: 0 18px 50px rgba(24, 74, 110, 0.12);
          overflow: hidden;
        }

        .brand {
          padding: 24px 28px 16px;
          border-bottom: 1px solid #edf2f6;
          text-align: center;
        }

        .brand img {
          width: 190px;
          height: auto;
        }

        .content {
          padding: 30px;
        }

        .eyebrow {
          color: #0875bf;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }

        h1 {
          margin: 0 0 10px;
          font-size: 28px;
          color: #123b5c;
        }

        .intro {
          margin: 0 0 25px;
          color: #718499;
          font-size: 13px;
          line-height: 1.6;
        }

        label {
          display: block;
          margin: 0 0 7px;
          font-size: 12px;
          font-weight: 700;
          color: #31536d;
        }

        label + input {
          margin-bottom: 17px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          height: 46px;
          border: 1px solid #cddce7;
          border-radius: 8px;
          padding: 0 13px;
          font-size: 14px;
          color: #173a5b;
          outline: none;
        }

        input:focus {
          border-color: #0875bf;
          box-shadow: 0 0 0 3px rgba(8, 117, 191, 0.1);
        }

        button[type="submit"] {
          width: 100%;
          height: 46px;
          margin-top: 3px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #0875bf, #075f9b);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        button[type="submit"]:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .error,
        .success {
          margin-top: 3px;
          padding: 11px 12px;
          border-radius: 7px;
          font-size: 12px;
          line-height: 1.45;
        }

        .error {
          color: #a43b3b;
          background: #fff3f3;
          border: 1px solid #f1cccc;
        }

        .success {
          color: #27663e;
          background: #effaf3;
          border: 1px solid #ccebd5;
        }

        .back {
          width: 100%;
          margin-top: 20px;
          border: 0;
          background: transparent;
          color: #0875bf;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .back:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}
