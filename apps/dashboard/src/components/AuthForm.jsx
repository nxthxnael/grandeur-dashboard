import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "nxthxnael@gmail.com";

export function AuthForm({ type, onSubmit, error, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "signup" && password !== confirmPassword) {
      return;
    }
    onSubmit({ email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {type === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="auth-subtitle">
          {type === "login"
            ? "Welcome back to Grandeur Dashboard"
            : "Join Grandeur Dashboard"}
        </p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
          </div>

          {type === "signup" && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              {password !== confirmPassword && confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={
              loading || (type === "signup" && password !== confirmPassword)
            }
          >
            {loading
              ? "Loading..."
              : type === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          {type === "login" ? (
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          ) : (
            <>
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
              <p className="auth-contact">
                Contact admin at{" "}
                <a href={`mailto:${ADMIN_EMAIL}`} className="auth-link">
                  {ADMIN_EMAIL}
                </a>{" "}
                for approval
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
