"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify those credentials.");
      }

      // Store token in cookies
      document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax;`;

      // Redirect to target path or dashboard
      window.location.href = redirectPath;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unable to verify those credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        :root {
          --ink: #0a0c11;
          --panel: #12151c;
          --parchment: #f4efe4;
          --brass: #a97a2e;
          --brass-light: #c9a25a;
          --line: rgba(201,162,90,0.16);
          --text-dim: rgba(244,239,228,0.55);
          --text-dimmer: rgba(244,239,228,0.30);
        }

        .login-page-container {
          height: 100vh;
          width: 100%;
          font-family: 'Inter', sans-serif;
          color: var(--parchment);
          background: var(--ink);
          overflow: hidden;
        }

        .stage {
          height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
        }

        @media (max-width: 900px) {
          .stage {
            grid-template-columns: 1fr;
            overflow-y: auto;
            height: auto;
            min-height: 100vh;
          }
          .showcase {
            display: none !important;
          }
          .form-side {
            height: 100vh;
            padding: 36px 20px;
          }
        }

        /* ---------- LEFT: showcase panel, its own bounded space, scale is the hero ---------- */
        .showcase {
          position: relative;
          background:
            radial-gradient(700px 600px at 50% 46%, rgba(169,122,46,0.20), transparent 62%),
            linear-gradient(160deg, #0d1016 0%, var(--ink) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-right: 1px solid var(--line);
          height: 100%;
        }

        .showcase .grain {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .brand {
          position: absolute;
          top: 44px;
          left: 56px;
          z-index: 3;
        }
        .brand .name {
          font-family: 'Fraunces', serif;
          font-size: 19px;
          letter-spacing: 0.08em;
        }
        .brand .sub {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: var(--text-dimmer);
          margin-top: 4px;
        }

        .scale-figure {
          filter: drop-shadow(0 0 50px rgba(169,122,46,0.35));
        }

        /* pivot the beam+pans gently around the fulcrum to feel alive, like it's finding balance */
        .beam-group {
          transform-origin: 130px 55px;
          animation: tilt 6s ease-in-out infinite;
        }

        @keyframes tilt {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(2.2deg); }
          50%  { transform: rotate(0deg); }
          75%  { transform: rotate(-2.2deg); }
          100% { transform: rotate(0deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .beam-group {
            animation: none;
          }
        }

        .showcase-caption {
          margin-top: 28px;
          text-align: center;
          max-width: 340px;
          z-index: 3;
        }
        .showcase-caption .kicker {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--parchment);
        }
        .showcase-caption .sub {
          margin-top: 8px;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--text-dimmer);
          line-height: 1.7;
        }

        .stat-row {
          position: absolute;
          bottom: 44px;
          left: 56px;
          right: 56px;
          display: flex;
          justify-content: space-between;
          z-index: 3;
          border-top: 1px solid var(--line);
          padding-top: 16px;
        }
        .stat .num {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          color: var(--brass-light);
        }
        .stat .label {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: var(--text-dimmer);
          margin-top: 3px;
        }

        /* ---------- RIGHT: form panel ---------- */
        .form-side {
          background: var(--panel);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .card {
          width: 380px;
        }

        .eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: var(--brass-light);
          font-weight: 600;
          margin-bottom: 14px;
        }
        .card h1 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 30px;
          margin-bottom: 10px;
          color: var(--parchment);
        }
        .desc {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-dim);
          margin-bottom: 30px;
        }
        .field label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--text-dimmer);
          margin-bottom: 8px;
          font-weight: 600;
        }
        .field {
          margin-bottom: 20px;
        }
        .form-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--line);
          color: var(--parchment);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 6px 2px 10px;
          outline: none;
          transition: border-color .2s ease;
        }
        .form-input::placeholder {
          color: var(--text-dimmer);
        }
        .form-input:focus {
          border-bottom-color: var(--brass-light);
        }

        .signin {
          width: 100%;
          margin-top: 8px;
          padding: 13px;
          background: linear-gradient(180deg, var(--brass-light), var(--brass));
          border: none;
          border-radius: 4px;
          color: #1a1305;
          font-weight: 600;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 26px -8px rgba(169,122,46,0.5);
          transition: all 0.2s ease;
        }
        .signin:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .signin:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .links {
          display: flex;
          justify-content: space-between;
          margin-top: 18px;
          font-size: 12px;
        }
        .links a {
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .links a:hover {
          color: var(--parchment);
        }
        .links a.right {
          color: var(--brass-light);
        }
        .links a.right:hover {
          color: var(--parchment);
        }

        .divider {
          height: 1px;
          background: var(--line);
          margin: 24px 0 18px;
        }
        .note {
          display: flex;
          gap: 8px;
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-dimmer);
        }
      ` }} />

      <div className="login-page-container">
        <div className="stage">
          {/* LEFT: showcase panel, its own bounded space, scale is the hero */}
          <div className="showcase">
            <div className="grain"></div>
            <div className="brand">
              <div className="name">LEGALFLOW</div>
              <div className="sub">COMMAND CENTER</div>
            </div>

            <svg className="scale-figure" width="300" height="250" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="130" y1="55" x2="130" y2="190" stroke="#c9a25a" stroke-width="2.2"/>
              <rect x="96" y="190" width="68" height="11" rx="2" stroke="#c9a25a" stroke-width="1.6"/>
              <circle cx="130" cy="55" r="6" fill="#c9a25a"/>

              <g className="beam-group">
                <line x1="40" y1="55" x2="220" y2="55" stroke="#c9a25a" stroke-width="2.2"/>
                <circle cx="40" cy="55" r="8" stroke="#c9a25a" stroke-width="1.6"/>
                <circle cx="220" cy="55" r="8" stroke="#c9a25a" stroke-width="1.6"/>
                <line x1="40" y1="63" x2="10" y2="118" stroke="#c9a25a" stroke-width="1.3"/>
                <line x1="40" y1="63" x2="70" y2="118" stroke="#c9a25a" stroke-width="1.3"/>
                <path d="M6 118 Q40 148 74 118" stroke="#c9a25a" stroke-width="1.6"/>
                <line x1="220" y1="63" x2="190" y2="118" stroke="#c9a25a" stroke-width="1.3"/>
                <line x1="220" y1="63" x2="250" y2="118" stroke="#c9a25a" stroke-width="1.3"/>
                <path d="M186 118 Q220 148 254 118" stroke="#c9a25a" stroke-width="1.6"/>
              </g>
            </svg>

            <div className="showcase-caption">
              <div className="kicker">"Weighed with care — every matter, every time"</div>
              <div className="sub">AI-ASSISTED ROUTING · SECURE CLIENT RECORDS · REAL-TIME MATTER TRACKING</div>
            </div>

            <div className="stat-row">
              <div className="stat">
                <div className="num">1,240+</div>
                <div className="label">MATTERS ROUTED</div>
              </div>
              <div className="stat">
                <div className="num">98.6%</div>
                <div className="label">ON-TIME INTAKE</div>
              </div>
              <div className="stat">
                <div className="num">312</div>
                <div className="label">FIRMS ONBOARD</div>
              </div>
            </div>
          </div>

          {/* RIGHT: form panel */}
          <div className="form-side">
            <div className="card">
              <div className="eyebrow">SECURE WORKSPACE ACCESS</div>
              <h1>Welcome back</h1>
              <div className="desc">Sign in to your firm's workspace to manage client records, attorney routing, and AI notes.</div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email">EMAIL</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@firm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">PASSWORD</label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="form-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-800/30 p-3 rounded mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" stroke="#ef4444" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="signin">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#1a1305]" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in →
                    </>
                  )}
                </button>
              </form>

              <div className="links">
                <a href="#">Forgot password?</a>
                <a href="/" className="right">Client Intake Portal →</a>
              </div>

              <div className="divider"></div>
              <div className="note">
                <span>🛡️</span>
                <span>Private workspace. All connections are encrypted, and access is monitored and logged for security auditing.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

