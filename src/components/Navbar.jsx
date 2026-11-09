import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ title, showBack = false, backPath = "" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: "#14b1e0",
        color: "white",
        borderRadius: "6px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {showBack && (
          <button
            onClick={() => navigate(backPath || -1)}
            style={{
              background: "#8d99ae",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        )}
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "tomato",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "8px 14px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
