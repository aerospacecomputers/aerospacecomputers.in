"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerType, setCustomerType] = useState<
    "individual" | "business"
  >("individual");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          customerType,
          companyName:
            customerType === "business" ? companyName : "",
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to create account");
        setLoading(false);
        return;
      }

      setSuccess(
        "Account created successfully. Redirecting to Sign In..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Unable to connect to the server");
      setLoading(false);
    }
  }

  return (
    <main className="registerPage">

      {/* MAIN WINDOW */}
      <div className="registerWindow">

        {/* LEFT BRANDING */}
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
              Create your Aerospace OS account and manage your
              IT service requests, support operations and tickets
              through one professional service portal.
            </p>

          </div>

        </section>

        {/* RIGHT REGISTER */}
        <section className="registerPanel">

          <div className="registerContent">

            <div className="osBadge">
              AEROSPACE OS
            </div>

            <h1>
              Create your
              <span>Account</span>
            </h1>

            <p className="registerSubtitle">
              Register to access your Aerospace OS service portal.
            </p>

            <form onSubmit={handleSubmit}>

              {/* FULL NAME */}
              <div className="field">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                />
              </div>

              {/* EMAIL */}
              <div className="field">
                <label htmlFor="email">
                  Email Address
                </label>

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

              {/* PHONE */}
              <div className="field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your phone number"
                  required
                  autoComplete="tel"
                />
              </div>

              {/* CUSTOMER TYPE */}
              <div className="field">
                <label>
                  Customer Type
                </label>

                <div className="customerType">

                  <button
                    type="button"
                    className={
                      customerType === "individual"
                        ? "typeButton active"
                        : "typeButton"
                    }
                    onClick={() =>
                      setCustomerType("individual")
                    }
                  >
                    <span className="typeTitle">
                      Individual
                    </span>

                    <span className="typeDescription">
                      Home / personal
                    </span>
                  </button>

                  <button
                    type="button"
                    className={
                      customerType === "business"
                        ? "typeButton active"
                        : "typeButton"
                    }
                    onClick={() =>
                      setCustomerType("business")
                    }
                  >
                    <span className="typeTitle">
                      Business
                    </span>

                    <span className="typeDescription">
                      Company / organization
                    </span>
                  </button>

                </div>
              </div>

              {/* COMPANY NAME */}
              {customerType === "business" && (
                <div className="field">
                  <label htmlFor="companyName">
                    Company Name
                  </label>

                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(event.target.value)
                    }
                    placeholder="Enter company name"
                    required
                  />
                </div>
              )}

              {/* PASSWORD */}
              <div className="field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />

                <div className="passwordHint">
                  Minimum 6 characters
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="errorBox">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="successBox">
                  {success}
                </div>
              )}

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                className="createButton"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}

                {!loading && (
                  <span className="arrow">
                    →
                  </span>
                )}
              </button>

            </form>

            {/* LOGIN LINK */}
            <div className="backToLogin">
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() => router.push("/login")}
              >
                Sign In
              </button>
            </div>

            <div className="registerFooter">
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
           PAGE
           ================================ */

        .registerPage {
          min-height: 100vh;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 35px 25px;

          position: relative;
          overflow: hidden;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          background:
            radial-gradient(
              circle at 18% 20%,
              rgba(255,255,255,0.95) 0%,
              rgba(255,255,255,0) 32%
            ),
            radial-gradient(
              circle at 85% 75%,
              rgba(255,255,255,0.7) 0%,
              rgba(255,255,255,0) 30%
            ),
            linear-gradient(
              135deg,
              #e7f7ff 0%,
              #bdeafa 48%,
              #eaf8ff 100%
            );
        }

        .registerPage::before {
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

        .registerPage::after {
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
           WINDOW
           ================================ */

        .registerWindow {
          width: 100%;
          max-width: 1100px;

          min-height: 720px;

          position: relative;
          z-index: 5;

          display: grid;

          grid-template-columns: 50% 50%;

          overflow: hidden;

          border-radius: 24px;

          background: rgba(255,255,255,0.97);

          border: 1px solid rgba(255,255,255,0.95);

          box-shadow:
            0 30px 80px rgba(28,79,111,0.16),
            0 8px 25px rgba(28,79,111,0.08);
        }

        /* ================================
           LEFT PANEL
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
           RIGHT PANEL
           ================================ */

        .registerPanel {
          display: flex;

          align-items: center;

          justify-content: center;

          padding: 40px 65px;

          background: #ffffff;
        }

        .registerContent {
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

        .registerContent h1 {
          margin: 18px 0 0;

          color: #08264a;

          font-size: 38px;

          line-height: 1.1;

          font-weight: 700;

          letter-spacing: -1.3px;
        }

        .registerContent h1 span {
          display: block;

          margin-top: 4px;

          color: #087cca;
        }

        .registerSubtitle {
          margin: 12px 0 22px;

          color: #71859b;

          font-size: 14px;

          line-height: 1.6;
        }

        /* ================================
           FIELDS
           ================================ */

        .field {
          margin-bottom: 15px;
        }

        .field label {
          display: block;

          margin-bottom: 7px;

          color: #203650;

          font-size: 12px;

          font-weight: 700;
        }

        .field input {
          width: 100%;

          height: 46px;

          border: 1px solid #d5e1eb;

          border-radius: 9px;

          background: #fbfdff;

          padding: 0 14px;

          outline: none;

          color: #18314c;

          font-size: 14px;

          transition: all 0.2s ease;
        }

        .field input::placeholder {
          color: #9aaaba;
        }

        .field input:focus {
          border-color: #0788d2;

          background: #ffffff;

          box-shadow:
            0 0 0 4px
            rgba(8,137,210,0.09);
        }

        /* ================================
           CUSTOMER TYPE
           ================================ */

        .customerType {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 10px;
        }

        .typeButton {
          min-height: 60px;

          padding: 10px 12px;

          border: 1px solid #d5e1eb;

          border-radius: 9px;

          background: #fbfdff;

          text-align: left;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .typeButton:hover {
          border-color: #8fc8e8;
        }

        .typeButton.active {
          border-color: #087cca;

          background: #eef8ff;

          box-shadow:
            0 0 0 2px
            rgba(8,124,202,0.08);
        }

        .typeTitle {
          display: block;

          color: #193550;

          font-size: 13px;

          font-weight: 700;

          margin-bottom: 3px;
        }

        .typeDescription {
          display: block;

          color: #8192a3;

          font-size: 10px;
        }

        .passwordHint {
          margin-top: 5px;

          color: #9aaaba;

          font-size: 10px;
        }

        /* ================================
           MESSAGES
           ================================ */

        .errorBox {
          margin-bottom: 14px;

          padding: 10px 12px;

          border-radius: 8px;

          border: 1px solid #f0c8c8;

          background: #fff4f4;

          color: #c52e2e;

          font-size: 12px;
        }

        .successBox {
          margin-bottom: 14px;

          padding: 10px 12px;

          border-radius: 8px;

          border: 1px solid #bce4cd;

          background: #f0fff5;

          color: #168044;

          font-size: 12px;
        }

        /* ================================
           CREATE BUTTON
           ================================ */

        .createButton {
          width: 100%;

          height: 50px;

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
            rgba(8,120,194,0.22);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .createButton:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 12px 28px
            rgba(8,120,194,0.28);
        }

        .createButton:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .arrow {
          margin-left: 9px;

          font-size: 18px;
        }

        /* ================================
           BACK TO LOGIN
           ================================ */

        .backToLogin {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 5px;

          margin-top: 17px;

          font-size: 12px;

          color: #8a99a8;
        }

        .backToLogin button {
          border: none;

          background: transparent;

          color: #0878c3;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          padding: 0;
        }

        .backToLogin button:hover {
          text-decoration: underline;
        }

        /* ================================
           FOOTER
           ================================ */

        .registerFooter {
          margin-top: 15px;

          text-align: center;

          color: #91a0af;

          font-size: 9px;

          line-height: 1.6;
        }

        /* ================================
           TABLET
           ================================ */

        @media (max-width: 900px) {

          .registerPage {
            padding: 20px 15px;
          }

          .registerWindow {
            min-height: 650px;
          }

          .brandPanel {
            padding: 35px;
          }

          .registerPanel {
            padding: 35px;
          }

          .brandContent h2 {
            font-size: 34px;
          }

          .registerContent h1 {
            font-size: 32px;
          }

        }

        /* ================================
           MOBILE
           ================================ */

        @media (max-width: 700px) {

          .registerPage {
            padding: 15px;
          }

          .registerWindow {
            display: block;

            min-height: auto;

            border-radius: 20px;
          }

          .brandPanel {
            padding: 38px 25px;

            border-right: none;

            border-bottom: 1px solid #e2edf4;
          }

          .companyLogo {
            width: 190px;
          }

          .brandContent h2 {
            font-size: 31px;
          }

          .brandContent p {
            font-size: 14px;
          }

          .registerPanel {
            padding: 35px 25px;
          }

          .registerContent h1 {
            font-size: 32px;
          }

          .customerType {
            grid-template-columns: 1fr;
          }

        }

      `}</style>
    </main>
  );
}
