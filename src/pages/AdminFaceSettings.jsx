import React, { useState } from "react";
import AdminNavbar from "../components/AdminSidebar";
import AdminSidebar from "../components/AdminSidebar";

const AdminFaceSettings = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <>
      <AdminSidebar />
      <div className="page-container">
        <h2>Face Recognition Control</h2>

        <div className="card">
          <p><b>Status:</b> {enabled ? "Enabled" : "Disabled"}</p>

          <button onClick={() => setEnabled(!enabled)}>
            {enabled ? "Disable Face Recognition" : "Enable Face Recognition"}
          </button>
        </div>

        <br />

        <div className="card">
          <h3>Statistics</h3>
          <p>Total Verified Users: 82</p>
          <p>Failed Attempts: 5</p>
        </div>
      </div>
    </>
  );
};

export default AdminFaceSettings;