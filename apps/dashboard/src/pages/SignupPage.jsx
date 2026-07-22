import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async ({ email, password }) => {
    setError("");
    setLoading(true);

    try {
      const data = await register(email, password);

      if (!data.approved) {
        setError("Registration successful. Please wait for admin approval.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="signup"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
    />
  );
}
