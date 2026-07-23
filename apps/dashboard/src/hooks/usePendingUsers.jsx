import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiClient";

export function usePendingUsers() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(null);
  const navigate = useNavigate();

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/pending-users`, {
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pending users");
      setPendingUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const approveUser = useCallback(async (email) => {
    setApproving(email);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/approve-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve user");
      setPendingUsers((prev) => prev.filter((user) => user.email !== email));
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(null);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  return { pendingUsers, loading, error, approving, fetchPendingUsers, approveUser };
}
