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
    <div className="min-h-screen" style={{ backgroundColor: "#fcf9f8" }}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ borderRadius: "4px" }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#1c1b1b" }} />
            </button>
            <h1
              className="text-2xl font-bold"
              style={{ color: "#013626", fontFamily: "Inter" }}
            >
              User Approvals
            </h1>
          </div>
          <button
            onClick={fetchPendingUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "#f0eded",
              border: "1px solid #e5e2e1",
              color: "#1c1b1b",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "4px",
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div
            className="mb-4 p-4 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: "#ffdad6",
              border: "1px solid #ba1a1a",
              color: "#93000a",
              fontFamily: "Inter",
              borderRadius: "4px",
            }}
          >
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div
            className="text-center py-12"
            style={{ color: "#414944", fontFamily: "Inter" }}
          >
            Loading pending users...
          </div>
        ) : pendingUsers.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
            }}
          >
            <User
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "#717974" }}
            />
            <p style={{ color: "#414944", fontFamily: "Inter" }}>
              No pending user approvals
            </p>
          </div>
        ) : (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
            }}
          >
            <div
              className="grid grid-cols-12 gap-4 p-4 font-medium"
              style={{
                backgroundColor: "#f6f3f2",
                borderBottom: "1px solid #e0e0e0",
                color: "#1c1b1b",
                fontFamily: "Inter",
                fontSize: "14px",
              }}
            >
              <div className="col-span-5">Email</div>
              <div className="col-span-4">Registered</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 p-4 transition-colors items-center"
                style={{
                  borderBottom: "1px solid #f0eded",
                  fontFamily: "Inter",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f6f3f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div className="col-span-5 flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: "#717974" }} />
                  <span
                    style={{
                      color: "#1c1b1b",
                      fontFamily: "JetBrains Mono",
                      fontSize: "14px",
                    }}
                  >
                    {user.email}
                  </span>
                </div>
                <div
                  className="col-span-4 flex items-center gap-2"
                  style={{ color: "#414944", fontSize: "14px" }}
                >
                  <Clock className="w-4 h-4" style={{ color: "#717974" }} />
                  {formatDate(user.created_at)}
                </div>
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => approveUser(user.email)}
                    disabled={approving === user.email}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    style={{
                      backgroundColor: "#1e4d3b",
                      border: "1px solid #1e4d3b",
                      color: "#ffffff",
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: "500",
                      borderRadius: "4px",
                    }}
                    onMouseEnter={(e) => {
                      if (approving !== user.email) {
                        e.currentTarget.style.backgroundColor = "#013626";
                        e.currentTarget.style.borderColor = "#013626";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1e4d3b";
                      e.currentTarget.style.borderColor = "#1e4d3b";
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
