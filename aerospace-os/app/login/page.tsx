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
    <main className="loginPage">
      <div className="loginWindow">

        {/* LEFT BRANDING PANEL */}
        <section className="brandPanel">
          <div className="brandContent">

            <img
              src="https://aerospacecomputers.in/images/logo.svg"
              alt="Aerospace Computers"
              className="companyLogo"
            />

            <div className="brandLine" />

            <div className="portalLabel">
              SERVICE OPERATIONS PORTAL
            </div>

            <h2>
              Smarter IT.
              <span>Better Support.</span>
            </h2>

            <p>
              Manage your IT service requests, support operations,
              tickets and infrastructure through one professional
              service portal.
            </p>

          </div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="loginPanel">
          <div className="loginContent">

            <div className="osBadge">
              AEROSPACE OS
            </div>

            <h1>
              Welcome to
              <span>Aerospace OS</span>
            </h1>

            <p className="loginSubtitle">
              Sign in to access your service operations portal.
            </p>

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="inputWrapper">

                  <span className="inputIcon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />

                </div>
              </div>

              {/* PASSWORD */}
              <div className="field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="inputWrapper">

                  <span className="inputIcon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 018 0v3" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />

                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="errorBox">
                  {error}
                </div>
              )}

              {/* SIGN IN */}
              <button
                type="submit"
                className="signInButton"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}

                {!loading && (
                  <span className="arrow">
                    →
                  </span>
                )}
              </button>

            </form>

            {/* REGISTER DIVIDER */}
            <div className="divider">
              <div />

              <span>
                NEW CUSTOMER?
              </span>

              <div />
            </div>

            {/* CREATE ACCOUNT */}
            <button
              type="button"
              className="registerButton"
              onClick={() => router.push("/register")}
            >
              Create an Account
            </button>

            {/* FOOTER */}
            <div className="loginFooter">
              Aerospace Computers · Aerospace OS
              <br />
              Secure Service Management Portal
            </div>

          </div>
        </section>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        /* ================================
           PAGE BACKGROUND
           ================================ */

        .loginPage {
          min-height: 100vh;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 45px 30px;

          position: relative;
          overflow: hidden;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          background:
            radial-gradient(
              circle at 18% 20%,
              rgba(255, 255, 255, 0.95) 0%,
              rgba(255, 255, 255, 0) 32%
            ),
            radial-gradient(
              circle at 85% 75%,
              rgba(255, 255, 255, 0.7) 0%,
              rgba(255, 255, 255, 0) 30%
            ),
            linear-gradient(
              135deg,
              #e7f7ff 0%,
              #bdeafa 48%,
              #eaf8ff 100%
            );
        }

        /* Very subtle background glow */

        .loginPage::before {
          content: "";

          position: absolute;

          width: 650px;
          height: 650px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,0.45) 0%,
              rgba(255,255,255,0) 70%
            );

          top: -300px;
          left: -250px;

          pointer-events: none;
        }

        .loginPage::after {
          content: "";

          position: absolute;

          width: 600px;
          height: 600px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,0.4) 0%,
              rgba(255,255,255,0) 70%
            );

          bottom: -300px;
          right: -250px;

          pointer-events: none;
        }

        /* ================================
           MAIN LOGIN WINDOW
           ================================ */

        .loginWindow {
          width: 100%;
          max-width: 1100px;

          min-height: 680px;

          position: relative;
          z-index: 5;

          display: grid;

          grid-template-columns: 50% 50%;

          overflow: hidden;

          border-radius: 24px;

          background: rgba(255, 255, 255, 0.97);

          border: 1px solid rgba(255, 255, 255, 0.95);

          box-shadow:
            0 30px 80px rgba(28, 79, 111, 0.16),
            0 8px 25px rgba(28, 79, 111, 0.08);
        }

        /* ================================
           LEFT BRAND PANEL
           ================================ */

        .brandPanel {
          display: flex;

          align-items: center;

          justify-content: center;

          padding: 55px;

          background:
            radial-gradient(
              circle at 50% 20%,
              #ffffff 0%,
              #f5fbff 52%,
              #e4f5fc 100%
            );

          border-right: 1px solid #e2edf4;
        }

        .brandContent {
          width: 100%;

          max-width: 480px;

          text-align: center;
        }

        .companyLogo {
          width: 230px;

          max-width: 75%;

          height: auto;

          display: block;

          margin: 0 auto;
        }

        .brandLine {
          width: 48px;

          height: 3px;

          margin: 24px auto 20px;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #0a9bdd,
              #0874bd
            );
        }

        .portalLabel {
          color: #0783ca;

          font-size: 12px;

          font-weight: 700;

          letter-spacing: 3px;

          margin-bottom: 22px;
        }

        .brandContent h2 {
          margin: 0;

          color: #09294e;

          font-size: 43px;

          line-height: 1.12;

          font-weight: 700;

          letter-spacing: -1.5px;
        }

        .brandContent h2 span {
          display: block;

          color: #087dca;
        }

        .brandContent p {
          max-width: 410px;

          margin: 24px auto 0;

          color: #526b83;

          font-size: 15px;

          line-height: 1.7;
        }

        /* ================================
           RIGHT LOGIN PANEL
           ================================ */

        .loginPanel {
          display: flex;

          align-items: center;

          justify-content: center;

          padding: 55px 65px;

          background: #ffffff;
        }

        .loginContent {
          width: 100%;

          max-width: 430px;
        }

        .osBadge {
          display: inline-block;

          padding: 8px 15px;

          border-radius: 30px;

          background: #e6f4ff;

          color: #0879c2;

          font-size: 11px;

          font-weight: 700;

          letter-spacing: 1px;
        }

        .loginContent h1 {
          margin: 22px 0 0;

          color: #08264a;

          font-size: 40px;

          line-height: 1.1;

          font-weight: 700;

          letter-spacing: -1.3px;
        }

        .loginContent h1 span {
          display: block;

          margin-top: 5px;

          color: #087cca;
        }

        .loginSubtitle {
          margin: 15px 0 32px;

          color: #71859b;

          font-size: 14px;

          line-height: 1.6;
        }

        /* ================================
           FORM FIELDS
           ================================ */

        .field {
          margin-bottom: 19px;
        }

        .field label {
          display: block;

          margin-bottom: 8px;

          color: #203650;

          font-size: 12px;

          font-weight: 700;
        }

        .inputWrapper {
          position: relative;
        }

        .inputIcon {
          position: absolute;

          left: 15px;

          top: 50%;

          transform: translateY(-50%);

          color: #6c8298;

          width: 20px;

          height: 20px;

          pointer-events: none;
        }

        .inputIcon svg {
          width: 20px;

          height: 20px;
        }

        .inputWrapper input {
          width: 100%;

          height: 53px;

          border: 1px solid #d5e1eb;

          border-radius: 10px;

          background: #fbfdff;

          padding:
            0
            15px
            0
            48px;

          outline: none;

          color: #18314c;

          font-size: 14px;

          transition: all 0.2s ease;
        }

        .inputWrapper input::placeholder {
          color: #9aaaba;
        }

        .inputWrapper input:focus {
          border-color: #0788d2;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
            rgba(8, 137, 210, 0.09);
        }

        /* ================================
           ERROR
           ================================ */

        .errorBox {
          margin-bottom: 16px;

          padding: 11px 13px;

          border-radius: 9px;

          border: 1px solid #f0c8c8;

          background: #fff4f4;

          color: #c52e2e;

          font-size: 13px;
        }

        /* ================================
           SIGN IN BUTTON
           ================================ */

        .signInButton {
          width: 100%;

          height: 53px;

          border: none;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #0b9ddd,
              #0871c2
            );

          color: #ffffff;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 9px 22px
            rgba(8, 120, 194, 0.22);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .signInButton:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 12px 28px
            rgba(8, 120, 194, 0.28);
        }

        .signInButton:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .arrow {
          margin-left: 9px;

          font-size: 18px;
        }

        /* ================================
           REGISTER DIVIDER
           ================================ */

        .divider {
          display: flex;

          align-items: center;

          gap: 12px;

          margin: 27px 0 20px;
        }

        .divider div {
          height: 1px;

          background: #e1e8ef;

          flex: 1;
        }

        .divider span {
          color: #94a2af;

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 1.3px;
        }

        /* ================================
           REGISTER BUTTON
           ================================ */

        .registerButton {
          width: 100%;

          height: 52px;

          border: 1.5px solid #087cca;

          border-radius: 10px;

          background: #ffffff;

          color: #0875bf;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .registerButton:hover {
          background: #eef8ff;

          transform: translateY(-1px);
        }

        /* ================================
           FOOTER
           ================================ */

        .loginFooter {
          margin-top: 24px;

          text-align: center;

          color: #91a0af;

          font-size: 10px;

          line-height: 1.7;
        }

        /* ================================
           TABLET
           ================================ */

        @media (max-width: 900px) {

          .loginPage {
            padding: 25px 18px;
          }

          .loginWindow {
            min-height: 620px;
          }

          .brandPanel {
            padding: 35px;
          }

          .loginPanel {
            padding: 35px;
          }

          .brandContent h2 {
            font-size: 34px;
          }

          .loginContent h1 {
            font-size: 34px;
          }
        }

        /* ================================
           MOBILE
           ================================ */

        @media (max-width: 700px) {

          .loginPage {
            padding: 15px;
          }

          .loginWindow {
            display: block;

            min-height: auto;

            border-radius: 20px;
          }

          .brandPanel {
            padding: 40px 25px;

            border-right: none;

            border-bottom: 1px solid #e2edf4;
          }

          .companyLogo {
            width: 190px;
          }

          .brandContent h2 {
            font-size: 32px;
          }

          .brandContent p {
            font-size: 14px;
          }

          .loginPanel {
            padding: 40px 25px;
          }

          .loginContent h1 {
            font-size: 34px;
          }
        }

      `}</style>
    </main>
  );
}
