import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, RefreshCw, ArrowLeft, User, Clock } from "lucide-react";
import { API_BASE_URL } from "../config/apiClient";

export function AdminApprovalPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(null);
  const navigate = useNavigate();

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/pending-users`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch pending users");
      setPendingUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (email) => {
    setApproving(email);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/approve-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to approve user");
      setPendingUsers(pendingUsers.filter((user) => user.email !== email));
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2.5 hover:bg-white rounded-lg transition-all duration-200"
              style={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <ArrowLeft
                className="w-5 h-5"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{
                  color: "var(--primary)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                User Approvals
              </h1>
              <p
                className="text-sm mt-1"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Manage pending user registrations
              </p>
            </div>
          </div>
          <button
            onClick={fetchPendingUsers}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "var(--radius-md)",
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: "var(--error-bg)",
              border: "1px solid var(--error)",
              color: "var(--error)",
              fontFamily: "var(--font-sans)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div
            className="text-center py-24"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <RefreshCw
              className="w-10 h-10 mx-auto mb-4 animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-lg">Loading pending users...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div
            className="text-center py-24 rounded-lg"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-header)" }}
            >
              <User
                className="w-10 h-10"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
            <h3
              className="text-xl font-semibold mb-3"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              No pending approvals
            </h3>
            <p
              className="text-base"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              All user registrations have been processed
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              boxShadow:
                "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className="grid grid-cols-12 gap-6 px-6 py-4 font-medium"
              style={{
                backgroundColor: "var(--bg-header)",
                borderBottom: "2px solid var(--border-color)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: "600",
              }}
            >
              <div className="col-span-5">User Details</div>
              <div className="col-span-4">Registration Date</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            {pendingUsers.map((user, index) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-6 px-6 py-5 transition-all duration-200 items-center"
                style={{
                  borderBottom:
                    index !== pendingUsers.length - 1
                      ? "1px solid var(--border-color)"
                      : "none",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-header)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--bg-header)" }}
                  >
                    <User
                      className="w-6 h-6"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate font-medium"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {user.email}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {user.role}
                    </div>
                  </div>
                </div>
                <div
                  className="col-span-4 flex items-center gap-3"
                  style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                >
                  <Clock
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <span
                    className="truncate"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {formatDate(user.created_at)}
                  </span>
                </div>
                <div className="col-span-3 text-right flex justify-end">
                  <button
                    onClick={() => approveUser(user.email)}
                    disabled={approving === user.email}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold hover:shadow-md"
                    style={{
                      backgroundColor: "var(--primary)",
                      border: "1px solid var(--primary)",
                      color: "#ffffff",
                      fontFamily: "var(--font-sans)",
                      fontSize: "13px",
                      fontWeight: "600",
                      borderRadius: "var(--radius-md)",
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => {
                      if (approving !== user.email) {
                        e.currentTarget.style.backgroundColor =
                          "var(--primary-dark)";
                        e.currentTarget.style.borderColor =
                          "var(--primary-dark)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(30, 77, 59, 0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--primary)";
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {approving === user.email ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
