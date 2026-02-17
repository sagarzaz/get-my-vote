import React from "react";
import AdminSidebar from "../components/AdminSidebar";


const Dashboard = () => {
  return (
    <div className="page-container">
      <AdminSidebar />

      <div className="page-container">
        <h1>Admin Dashboard</h1>

        <div className="cards">
          <div className="card">
            <h3>Total Voters</h3>
            <p>120</p>
          </div>

          <div className="card">
            <h3>Candidates</h3>
            <p>8</p>
          </div>

          <div className="card">
            <h3>Votes Cast</h3>
            <p>95</p>
          </div>

          <div className="card">
            <h3>Status</h3>
            <p>Ongoing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;