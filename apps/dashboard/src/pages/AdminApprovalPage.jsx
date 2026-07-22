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
      if (!response.ok) throw new Error(data.message || "Failed to fetch pending users");
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
      if (!response.ok) throw new Error(data.message || "Failed to approve user");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">User Approvals</h1>
          </div>
          <button
            onClick={fetchPendingUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading pending users...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No pending user approvals</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm">
              <div className="col-span-5">Email</div>
              <div className="col-span-4">Registered</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center"
              >
                <div className="col-span-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{user.email}</span>
                </div>
                <div className="col-span-4 flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(user.created_at)}
                </div>
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => approveUser(user.email)}
                    disabled={approving === user.email}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
