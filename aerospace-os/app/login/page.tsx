"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef7fc 0%, #f8fbfe 50%, #eaf5fb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 20px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1080px",
    minHeight: "650px",
    display: "grid",
    gridTemplateColumns: "45% 55%",
    background: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 25px 70px rgba(7, 36, 70, 0.13)",
    border: "1px solid #dbe8f3",
  },

  /* CLEAN LEFT PANEL */
  left: {
    background:
      "linear-gradient(145deg, #ffffff 0%, #f5fbff 55%, #e9f6fc 100%)",
    padding: "52px",
    color: "#071b35",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    position: "relative" as const,
    overflow: "hidden",
  },

  blueShape: {
    position: "absolute" as const,
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(8,123,193,0.13) 0%, rgba(8,123,193,0) 70%)",
    top: "-150px",
    right: "-150px",
  },

  blueShapeBottom: {
    position: "absolute" as const,
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(45,169,235,0.10) 0%, rgba(45,169,235,0) 70%)",
    bottom: "-150px",
    left: "-130px",
  },

  logo: {
    width: "250px",
    height: "auto",
    display: "block",
    position: "relative" as const,
    zIndex: 2,
  },

  leftContent: {
    position: "relative" as const,
    zIndex: 2,
    marginTop: "40px",
  },

  smallTitle: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color: "#087bc1",
    marginBottom: "18px",
  },

  leftHeading: {
    fontSize: "42px",
    lineHeight: 1.15,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-1px",
    color: "#071b35",
  },

  leftBlueText: {
    color: "#087bc1",
  },

  leftText: {
    marginTop: "22px",
    color: "#52677d",
    fontSize: "16px",
    lineHeight: 1.7,
    maxWidth: "390px",
  },

  accentLine: {
    width: "60px",
    height: "4px",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #087bc1, #45b7e8)",
    marginTop: "28px",
  },

  copyright: {
    position: "relative" as const,
    zIndex: 2,
    fontSize: "12px",
    color: "#8295a8",
  },

  right: {
    background: "#ffffff",
    padding: "48px 58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formContainer: {
    width: "100%",
    maxWidth: "430px",
  },

  mobileLogo: {
    width: "210px",
    height: "auto",
    margin: "0 auto 30px",
    display: "block",
  },

  welcomeLabel: {
    display: "inline-block",
    background: "#e9f5ff",
    color: "#0765b5",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    padding: "8px 14px",
    borderRadius: "30px",
    marginBottom: "16px",
  },

  heading: {
    fontSize: "38px",
    lineHeight: 1.15,
    fontWeight: 700,
    color: "#071b35",
    margin: 0,
    letterSpacing: "-1px",
  },

  headingBlue: {
    color: "#087bc1",
    display: "block",
    marginTop: "4px",
  },

  subtitle: {
    color: "#718096",
    fontSize: "15px",
    lineHeight: 1.6,
    marginTop: "14px",
    marginBottom: "30px",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#26384d",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    height: "52px",
    border: "1px solid #d2deea",
    borderRadius: "10px",
    background: "#f9fbfd",
    padding: "0 15px",
    fontSize: "15px",
    color: "#14283f",
    outline: "none",
    boxSizing: "border-box" as const,
  },

  error: {
    background: "#fff1f1",
    border: "1px solid #f3caca",
    color: "#c62828",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "13px",
    marginBottom: "18px",
  },

  signIn: {
    width: "100%",
    height: "52px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #087bc1, #0759a2)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(8, 123, 193, 0.22)",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "25px 0",
  },

  dividerLine: {
    height: "1px",
    background: "#e2e8f0",
    flex: 1,
  },

  dividerText: {
    color: "#9aa8b6",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
  },

  register: {
    width: "100%",
    height: "52px",
    border: "1.5px solid #087bc1",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#0870b5",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  footer: {
    textAlign: "center" as const,
    color: "#a0adba",
    fontSize: "11px",
    lineHeight: 1.6,
    marginTop: "22px",
  },
};

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
    <main style={styles.page}>
      <div style={styles.container}>

        {/* LEFT BRAND SECTION */}
        <section style={styles.left}>
          <div style={styles.blueShape} />
          <div style={styles.blueShapeBottom} />

          <div>
            <img
              src="https://aerospacecomputers.in/images/logo.svg"
              alt="Aerospace Computers"
              style={styles.logo}
            />

            <div style={styles.leftContent}>
              <div style={styles.smallTitle}>
                Service Operations Portal
              </div>

              <h2 style={styles.leftHeading}>
                Smarter IT.
                <br />
                <span style={styles.leftBlueText}>
                  Better Support.
                </span>
              </h2>

              <p style={styles.leftText}>
                Manage your IT service requests, support operations,
                tickets and infrastructure through one professional
                service portal.
              </p>

              <div style={styles.accentLine} />
            </div>
          </div>

          <div style={styles.copyright}>
            © {new Date().getFullYear()} Aerospace Computers
          </div>
        </section>

        {/* RIGHT LOGIN SECTION */}
        <section style={styles.right}>
          <div style={styles.formContainer}>

            <img
              src="https://aerospacecomputers.in/images/logo.svg"
              alt="Aerospace Computers"
              style={styles.mobileLogo}
            />

            <div style={styles.welcomeLabel}>
              Aerospace OS
            </div>

            <h1 style={styles.heading}>
              Welcome to
              <span style={styles.headingBlue}>
                Aerospace OS
              </span>
            </h1>

            <p style={styles.subtitle}>
              Sign in to access your service operations portal.
            </p>

            <form onSubmit={handleSubmit}>

              <div style={styles.field}>
                <label htmlFor="email" style={styles.label}>
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
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="password" style={styles.label}>
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
                  style={styles.input}
                />
              </div>

              {error && (
                <div style={styles.error}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.signIn,
                  opacity: loading ? 0.65 : 1,
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />

              <span style={styles.dividerText}>
                New Customer?
              </span>

              <div style={styles.dividerLine} />
            </div>

            <button
              type="button"
              onClick={() => router.push("/register")}
              style={styles.register}
            >
              Create an Account
            </button>

            <div style={styles.footer}>
              Aerospace Computers · Aerospace OS
              <br />
              Secure Service Management Portal
            </div>

          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          main {
            padding: 20px !important;
          }

          main > div {
            display: block !important;
            min-height: auto !important;
          }

          main > div > section:first-child {
            display: none !important;
          }

          main > div > section:last-child {
            padding: 40px 24px !important;
          }
        }

        input:focus {
          border-color: #087bc1 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(8, 123, 193, 0.1);
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button {
          transition: all 0.2s ease;
        }
      `}</style>
    </main>
  );
}
